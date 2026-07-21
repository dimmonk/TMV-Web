/**
 * Invitation maker — the interactive logic for the shared <InvitationMaker />
 * markup, mounted by BOTH shells:
 *   - desktop: src/pages/make-invitation.astro (inside BaseLayout's chrome)
 *   - mobile:  the /m/ app's "invitation" screen (inside the app shell)
 *
 * Call mountInvitationMaker(root, opts) once per rendered <InvitationMaker />.
 * Every query is scoped to `root` and all state lives in the closure, so the
 * module carries no assumption about which shell it is running in — the shell
 * owns the header/footer/nav, this owns the feature.
 *
 * Styles ship with the component (src/components/InvitationMaker.astro).
 */

export interface InvitationMakerOptions {
  /** Venue name printed on the cards. */
  venue: string;
  /** Single-line address printed on the cards. */
  address: string;
  /** Photo used until the user replaces it. */
  defaultPhoto: string;
  /** URL the card's QR code points at. */
  waiverUrl: string;
}

const HTML_TO_IMAGE_SRC = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';
let htmlToImagePromise: Promise<any> | null = null;

/** Load the PNG exporter on demand (first download), once per document. */
function ensureHtmlToImage(): Promise<any> {
  if (htmlToImagePromise) return htmlToImagePromise;
  htmlToImagePromise = new Promise<any>((resolve, reject) => {
    const w = window as any;
    if (w.htmlToImage) { resolve(w.htmlToImage); return; }
    const s = document.createElement('script');
    s.src = HTML_TO_IMAGE_SRC;
    s.onload = () => (w.htmlToImage ? resolve(w.htmlToImage) : reject(new Error('html-to-image unavailable')));
    s.onerror = () => reject(new Error('html-to-image failed to load'));
    document.head.appendChild(s);
  }).catch((err) => { htmlToImagePromise = null; throw err; });
  return htmlToImagePromise;
}

export function mountInvitationMaker(root: HTMLElement, opts: InvitationMakerOptions): void {
  const $ = (id: string) => root.querySelector<any>('#' + id);

  const state = {
    style: 'portrait',
    ink: false,
    accent: '#ffd400',
    photoSrc: opts.defaultPhoto,
    photoPos: { x: 50, y: 50 }, // object-position %, draggable to frame the photo
  };

  function qrUrl(data: string) {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&data=' +
      encodeURIComponent(data) + '&color=211f1b&bgcolor=ffffff';
  }

  // ---- Icon font embedding for PNG export ----
  // html-to-image inlines web fonts by reading document.styleSheets, but the
  // Bootstrap Icons sheet is served cross-origin from jsdelivr with no
  // `crossorigin` attribute, so the CSSOM throws when it reads those rules and
  // the icon @font-face is silently skipped — every `bi-*` glyph exports as an
  // empty box. We sidestep the scan entirely by handing toPng an explicit
  // `fontEmbedCSS` string with the woff2 inlined as a data URI plus the glyph
  // rules for exactly the icons the card renders. Built once, then cached.
  // Version pinned to BaseLayout.astro's Bootstrap Icons stylesheet (1.11.3).
  const ICON_FONT_WOFF2 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff2';
  const ICON_GLYPHS = {
    'calendar-event': '\\f1e8',
    'geo-alt': '\\f3e8',
    'qr-code-scan': '\\f6ad',
    'check2': '\\f272',
    'clock': '\\f293',
    'bag-check': '\\f171',
  };
  let iconFontCssPromise = null;
  function iconFontEmbedCss() {
    if (iconFontCssPromise) return iconFontCssPromise;
    iconFontCssPromise = fetch(ICON_FONT_WOFF2)
      .then((r) => {
        if (!r.ok) throw new Error(`icon font ${r.status}`);
        return r.blob();
      })
      .then((blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result)); // "data:font/woff2;base64,…"
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      }))
      .then((dataUri) => {
        const glyphs = Object.entries(ICON_GLYPHS)
          .map(([name, code]) => `.bi-${name}::before{content:"${code}";}`)
          .join('');
        return `@font-face{font-family:"bootstrap-icons";font-display:block;src:url("${dataUri}") format("woff2");}` +
          `[class^="bi-"]::before,[class*=" bi-"]::before{display:inline-block;font-family:"bootstrap-icons"!important;font-style:normal;font-weight:normal!important;line-height:1;vertical-align:-.125em;}` +
          glyphs;
      })
      .catch((err) => {
        // Reset so a later download can retry; return null → export without the
        // embedded font rather than failing the whole download.
        iconFontCssPromise = null;
        console.warn('Icon font embed failed; PNG icons may be missing', err);
        return null;
      });
    return iconFontCssPromise;
  }

  function applyQr() {
    const qrTarget = qrUrl(opts.waiverUrl);
    root.querySelectorAll('#inv-live-card img[data-qr]').forEach((img) => {
      if (img.src !== qrTarget) img.src = qrTarget;
    });
  }

  function fieldVal(id: string) {
    return $(id)?.value ?? '';
  }

  function bringList() {
    return fieldVal('inv-bring').split(',').map((s) => s.trim()).filter(Boolean);
  }

  function formatDate(iso: string) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function formatTimeLabel(hhmm: string) {
    const [h, m] = hhmm.split(':').map(Number);
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  function formatTimeRange(startVal: string, endVal: string) {
    if (!startVal || !endVal) return '';
    const startAmpm = Number(startVal.split(':')[0]) < 12 ? 'AM' : 'PM';
    const endAmpm = Number(endVal.split(':')[0]) < 12 ? 'AM' : 'PM';
    const startLabel = formatTimeLabel(startVal);
    const endLabel = formatTimeLabel(endVal);
    return startAmpm === endAmpm
      ? `${startLabel.replace(/ (AM|PM)$/, '')} – ${endLabel}`
      : `${startLabel} – ${endLabel}`;
  }

  function nextSaturdayISO() {
    const d = new Date();
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function render() {
    const name = fieldVal('inv-name') || 'Maya';
    const age = fieldVal('inv-age') || '8';
    const date = formatDate(fieldVal('inv-date'));
    const time = formatTimeRange(fieldVal('inv-time-start'), fieldVal('inv-time-end'));
    const venue = opts.venue;
    const address = opts.address;
    const rsvp = fieldVal('inv-rsvp');
    const hype = fieldVal('inv-hype');
    const bring = bringList();
    const bringLine = bring.join(', ');

    root.style.setProperty('--inv-accent', state.accent);
    $('inv-p-photo').src = state.photoSrc;
    applyPhotoPos();

    // Portrait
    $('inv-p-name').textContent = name;
    $('inv-p-age').textContent = age;
    $('inv-p-hype').textContent = `"${hype}"`;
    $('inv-p-date').textContent = date;
    $('inv-p-time').textContent = time;
    $('inv-p-rsvp').textContent = rsvp;
    $('inv-p-bringlist').innerHTML = bring.map((b) => `<span class="inv-p-bringitem"><i class="bi bi-check2"></i>${b}</span>`).join('');

    // Ticket
    $('inv-t-name').textContent = name;
    $('inv-t-turns').textContent = `turns ${age} — ${hype}`;
    $('inv-t-date').textContent = date;
    $('inv-t-time').textContent = time;
    $('inv-t-bringline').textContent = bringLine;
    $('inv-t-rsvp').textContent = rsvp;

    // Square
    $('inv-sq-age').textContent = age;
    $('inv-sq-hype').textContent = hype;
    $('inv-sq-datetime').textContent = `${date} · ${time}`;
    $('inv-sq-venueaddr').textContent = `${venue} · ${address}`;
    $('inv-sq-bring').textContent = `Bring ${bringLine}`;
    $('inv-sq-rsvp').textContent = rsvp;
    $('inv-sq-agebg').textContent = age;
    const sqNameH2 = root.querySelector<HTMLElement>('.inv-sq-name');
    if (sqNameH2) sqNameH2.innerHTML = `${name}<br>turns <span id="inv-sq-age">${age}</span>`;

    applyQr();
    applyFinish();
    applyStyle();
    fitScale();
  }

  function applyStyle() {
    $('inv-card-portrait').hidden = state.style !== 'portrait';
    $('inv-card-ticket').hidden = state.style !== 'ticket';
    $('inv-card-square').hidden = state.style !== 'square';
    $('inv-bg-col').hidden = state.style !== 'portrait';
    $('inv-photo-col').hidden = state.style !== 'portrait';
    root.querySelectorAll('.inv-style').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.style === state.style);
    });
  }

  function applyFinish() {
    const ink = state.ink;
    const accent = state.accent;
    root.querySelectorAll('.inv-fin').forEach((btn) => {
      btn.classList.toggle('active', (btn.dataset.finish === 'ink') === ink);
    });
    $('inv-finish-label').textContent = ink ? '· Ink-friendly' : '· Full colour';
    $('inv-hint-text').textContent = ink
      ? 'Ink-friendly swaps the heavy backgrounds for white with accent detailing — far less ink at home. Download a PNG to text or post, or print and arrange as many per page as you like in your print dialog.'
      : 'Download a high-res PNG to text or post to your story, or print it. In the print dialog you can scale it or fit several per page. Drop a photo into the Invite style first.';

    // portrait
    $('inv-p-photohead').hidden = ink;
    $('inv-p-inkhead').hidden = !ink;
    $('inv-card-portrait').style.border = ink ? '1px solid #e6e4dd' : '0';

    // ticket
    const tkBodyBg = ink ? '#ffffff' : '#211f1b';
    const tkBodyText = ink ? '#211f1b' : '#ffffff';
    const tkEyebrow = ink ? '#211f1b' : accent;
    const tkMuted = ink ? '#a29e95' : 'rgba(255,255,255,.5)';
    const tkChipBg = ink ? '#f3f2ee' : 'rgba(255,255,255,.09)';
    const tkChipBorder = ink ? '#e6e4dd' : 'rgba(255,255,255,.14)';
    const tkIcon = ink ? '#211f1b' : accent;
    const tkBring = ink ? '#6a6760' : 'rgba(255,255,255,.6)';
    const tkStubBg = ink ? '#ffffff' : accent;

    const tBody = $('inv-t-body');
    tBody.style.background = tkBodyBg;
    tBody.style.color = tkBodyText;
    tBody.style.border = ink ? '1px solid #e0ddd5' : '0';
    tBody.style.borderRight = ink ? '0' : '';
    $('inv-t-glow').style.background = ink ? 'transparent'
      : `radial-gradient(460px 220px at 100% -20%, color-mix(in srgb, ${accent} 22%, transparent), transparent 70%)`;
    $('inv-t-eyebrow').style.color = tkEyebrow;
    $('inv-t-of').style.color = tkMuted;
    $('inv-t-name').style.color = tkBodyText;
    $('inv-t-turns').style.color = tkBodyText;
    $('inv-t-bringlabel').style.color = tkBodyText;
    $('inv-t-bring').style.color = tkBring;
    root.querySelectorAll('.inv-t-chip').forEach((chip) => {
      chip.style.color = tkBodyText;
      chip.style.background = tkChipBg;
      chip.style.borderColor = tkChipBorder;
      chip.style.borderWidth = '1px';
      chip.style.borderStyle = 'solid';
    });
    root.querySelectorAll('.inv-t-chip i').forEach((ic) => { ic.style.color = tkIcon; });
    const stub = $('inv-t-stub');
    stub.style.background = tkStubBg;
    stub.style.border = ink ? '1px solid #e0ddd5' : '0';
    stub.style.borderLeft = ink ? `3px solid ${accent}` : '';
    stub.querySelector('.inv-t-qrbox').style.boxShadow = ink ? 'none' : '0 8px 18px -10px rgba(0,0,0,.4)';
    stub.querySelector('.inv-t-qrbox').style.border = ink ? '1px solid #e6e4dd' : '0';

    // square
    const sqCard = $('inv-card-square');
    sqCard.style.background = ink ? '#ffffff' : accent;
    sqCard.style.border = ink ? '1px solid #e6e4dd' : '0';
    $('inv-sq-stripe').hidden = !ink;
  }

  // Scale the preview card down to fit the stage without ever needing
  // horizontal scroll (the ticket layout, at 660px, is wider than the available
  // column on laptop-size viewports; on phones every layout is wider than the
  // screen). We measure the card's natural width against the room actually
  // available to it, then size the wrap's box to the scaled result so it
  // occupies exactly what it draws.
  function fitScale() {
    const stageRow = $('inv-stage-row');
    const wrap = $('inv-scale-wrap');
    const card = $('inv-live-card');
    if (!stageRow || !wrap || !card) return;

    // Reset to natural size before measuring.
    wrap.style.width = '';
    wrap.style.height = '';
    wrap.style.setProperty('--inv-scale', '1');

    const cardW = card.offsetWidth;
    const cardH = card.offsetHeight;
    if (!cardW || !cardH) return;

    const rs = getComputedStyle(stageRow);
    const stacked = rs.flexDirection.startsWith('column');

    // When stacked (phones) the card owns the full row width. When the side
    // columns sit beside it (desktop) they keep their natural size — only the
    // card scales — so subtract them and the gaps between.
    let available = stageRow.clientWidth;
    if (!stacked) {
      const gapX = parseFloat(rs.columnGap) || 0;
      let siblings = 0;
      let visibleSiblings = 0;
      Array.from(stageRow.children).forEach((child) => {
        if (child === wrap) return;
        const w = child.offsetWidth;
        if (w > 0) { siblings += w; visibleSiblings += 1; }
      });
      available -= siblings + gapX * visibleSiblings;
    }

    const scale = Math.min(1, Math.max(0.2, available / cardW));
    wrap.style.setProperty('--inv-scale', String(scale));
    wrap.style.width = `${cardW * scale}px`;
    wrap.style.height = `${cardH * scale}px`;
  }

  // ---- wiring ----
  root.querySelectorAll('.inv-style').forEach((btn) => {
    btn.addEventListener('click', () => { state.style = btn.dataset.style || 'portrait'; render(); });
  });
  root.querySelectorAll('.inv-sw').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.accent = btn.dataset.color || '#ffd400';
      root.querySelectorAll('.inv-sw').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });
  root.querySelectorAll('.inv-fin').forEach((btn) => {
    btn.addEventListener('click', () => { state.ink = btn.dataset.finish === 'ink'; render(); });
  });
  ['inv-name', 'inv-age', 'inv-hype', 'inv-bring', 'inv-rsvp'].forEach((id) => {
    $(id)?.addEventListener('input', render);
  });
  ['inv-date', 'inv-time-start', 'inv-time-end'].forEach((id) => {
    $(id)?.addEventListener('change', render);
  });

  if (!$('inv-date').value) $('inv-date').value = nextSaturdayISO();

  // Photo replace / remove. A new/removed photo resets the framing to centred.
  $('inv-replace-photo')?.addEventListener('click', () => $('inv-photo-input')?.click());
  $('inv-photo-input')?.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { state.photoSrc = String(reader.result); state.photoPos = { x: 50, y: 50 }; render(); };
    reader.readAsDataURL(file);
  });
  $('inv-remove-photo')?.addEventListener('click', () => { state.photoSrc = opts.defaultPhoto; state.photoPos = { x: 50, y: 50 }; render(); });

  // ---- Drag the Invite photo to frame it ----
  // object-fit:cover crops the photo to the header box and centres it; there's
  // no way to choose WHICH part shows. Dragging pans object-position so the user
  // frames the shot, and the chosen position is inline on the <img>, so it's
  // captured in the PNG export too. Panning only exists on the axis that
  // actually overflows the box (the cropped one).
  const photoImg = $('inv-p-photo');
  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  function applyPhotoPos() {
    if (photoImg) photoImg.style.objectPosition = `${state.photoPos.x}% ${state.photoPos.y}%`;
  }

  // How many box-pixels the cover-scaled image overflows the header on each
  // axis. object-position 0..100% maps across exactly that overflow.
  function photoOverflow() {
    const box = $('inv-p-photohead');
    if (!photoImg || !box) return { x: 0, y: 0 };
    const bw = box.clientWidth, bh = box.clientHeight;
    const nw = photoImg.naturalWidth, nh = photoImg.naturalHeight;
    if (!bw || !bh || !nw || !nh) return { x: 0, y: 0 };
    const scale = Math.max(bw / nw, bh / nh);
    return { x: nw * scale - bw, y: nh * scale - bh };
  }

  let photoDrag = null;
  photoImg?.addEventListener('pointerdown', (e) => {
    if (state.style !== 'portrait' || state.ink) return;
    const overflow = photoOverflow();
    if (overflow.x <= 1 && overflow.y <= 1) return; // photo already fits — nothing to pan
    photoDrag = { px: e.clientX, py: e.clientY, x: state.photoPos.x, y: state.photoPos.y, overflow };
    photoImg.setPointerCapture(e.pointerId);
    photoImg.classList.add('inv-p-dragging');
    e.preventDefault();
  });
  photoImg?.addEventListener('pointermove', (e) => {
    if (!photoDrag) return;
    // Screen px → card-layout px (the preview card is transform-scaled to fit).
    const wrapScale = parseFloat($('inv-scale-wrap').style.getPropertyValue('--inv-scale')) || 1;
    const dx = (e.clientX - photoDrag.px) / wrapScale;
    const dy = (e.clientY - photoDrag.py) / wrapScale;
    // Direct manipulation: dragging the image down reveals more of its top, i.e.
    // object-position moves toward 0% — so subtract the drag delta.
    const nextX = photoDrag.overflow.x > 0 ? photoDrag.x - (dx / photoDrag.overflow.x) * 100 : photoDrag.x;
    const nextY = photoDrag.overflow.y > 0 ? photoDrag.y - (dy / photoDrag.overflow.y) * 100 : photoDrag.y;
    state.photoPos = { x: clamp(nextX), y: clamp(nextY) };
    applyPhotoPos();
  });
  const endPhotoDrag = () => {
    if (!photoDrag) return;
    photoDrag = null;
    photoImg.classList.remove('inv-p-dragging');
  };
  photoImg?.addEventListener('pointerup', endPhotoDrag);
  photoImg?.addEventListener('pointercancel', endPhotoDrag);

  window.addEventListener('resize', fitScale);

  const CARD_ID: Record<string, string> = { portrait: 'inv-card-portrait', ticket: 'inv-card-ticket', square: 'inv-card-square' };

  $('inv-download')?.addEventListener('click', async () => {
    // Capture the active card element directly. Its width is explicit
    // (440/660/470), so html-to-image measures it at full design size even
    // while the preview wrapper is scaled down to fit the screen — no need to
    // resize the live card first (which used to make it visibly zoom in before
    // the capture). The transform on the ancestor wrap doesn't affect the
    // cloned card, so nothing on screen changes.
    const card = $(CARD_ID[state.style] || 'inv-card-portrait');
    if (!card) return;
    try {
      // The exporter is fetched on first download, so neither shell has to ship
      // a CDN <script> tag just to host this feature.
      const [htmlToImage, fontEmbedCSS] = await Promise.all([ensureHtmlToImage(), iconFontEmbedCss()]);
      const pngOpts: any = { pixelRatio: 2, cacheBust: true };
      if (fontEmbedCSS) pngOpts.fontEmbedCSS = fontEmbedCSS;
      const dataUrl = await htmlToImage.toPng(card, pngOpts);
      const a = document.createElement('a');
      a.download = 'monkey-vault-invitation.png';
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.warn('PNG export failed', err);
    }
  });

  render();
}
