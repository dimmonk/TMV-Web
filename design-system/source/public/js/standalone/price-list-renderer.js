/**
 * Price List sheet renderer (vanilla JS).
 *
 * Renders the editorial OR index layouts for the price list. Reads the
 * presentation schema from price-list-layout.js and joins it with the
 * raw priceList map (keys → numeric values) coming from the public
 * Cloud Function `getPublicPriceList`.
 *
 * Used by:
 *   - public/print-price-list.html (Puppeteer-renderable PDF source)
 *   - public/price-list-embed.html (embeddable iframe)
 *
 * Visual design will be refined when the final design lands; the
 * shape of this module stays the same — only the DOM/CSS changes.
 */

import {
  PRICE_LIST_PALETTE,
  PRICE_LIST_SECTIONS,
  PRICE_LIST_COLUMNS,
  PRICE_LIST_FOOTNOTES,
  formatPrice,
  formatEffective,
} from './price-list-layout.js';

const DEFAULT_API_URL = 'https://us-central1-tmv-management.cloudfunctions.net/getPublicPriceList';

const VALID_VARIANTS = ['editorial', 'index'];
const VALID_TITLE_SIZES = ['small', 'hidden'];

// ─────────────────────── Pure helpers ───────────────────────

function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  if (opts.style) for (const [k, v] of Object.entries(opts.style)) {
    if (k.startsWith('--')) node.style.setProperty(k, v);
    else node.style[k] = v;
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function bwPalette(palette, on) {
  if (!on) return palette;
  return {
    header: palette.header === '#111111' ? '#111111' : '#3c3c3c',
    body: '#f1f1f1',
    divider: '#cfcfcf',
  };
}

// effectiveLabel moved to price-list-layout.js as `formatEffective`
// (shared by the admin renderer + the public embed).

/**
 * Resolve a bullet entry (text-only / text-with-template / price-bearing).
 * Returns { kind: 'text' | 'price', text?, label?, price? }.
 */
function resolveBullet(b, priceList) {
  if (b.text) return { kind: 'text', text: b.text };
  if (b.textPriceKey && b.textTemplate) {
    const n = priceList[b.textPriceKey] ?? 0;
    return { kind: 'text', text: b.textTemplate.replace('{n}', String(n)) };
  }
  if (b.priceKey) {
    return {
      kind: 'price',
      label: b.label || b.priceKey,
      price: formatPrice(priceList[b.priceKey], b.suffix),
    };
  }
  return null;
}

// ─────────────────────── Editorial variant ───────────────────────

function buildEditorialCard(section, priceList, paletteOverride, about) {
  const p = paletteOverride;
  const onAccent = p.textOnHeader || '#fff';
  const card = el('div', {
    className: 'ed-card',
    style: { background: p.body, borderColor: p.header },
  });

  const hasAbout = Array.isArray(about) && about.length > 0;
  const head = el('div', { className: 'ed-head' });
  head.appendChild(el('span', { className: 'ed-title', text: section.title, style: { color: p.header } }));
  // 15% INTRO pill intentionally not rendered — user is rethinking the
  // intro-discount UX. The `section.intro` schema flag stays in place
  // so the future treatment can read it without a schema change.
  let aboutCollapse = null;
  if (hasAbout) {
    const toggle = el('button', {
      className: 'ed-info-toggle',
      attrs: { type: 'button', 'aria-label': 'Show description', 'aria-expanded': 'false' },
      // CSS custom props drive the resting color (accent) and the
      // inverted-on-hover color (textOnHeader). Inline `color` would
      // beat the hover rule's cascade; using vars keeps the hover
      // styling in CSS where it belongs.
      style: { '--pl-accent': p.header, '--pl-accent-text': p.textOnHeader || '#fff' },
    }, [el('i', { className: 'bi bi-info-circle', attrs: { 'aria-hidden': 'true' } })]);
    head.appendChild(toggle);
    // Outer collapser (grid 0fr↔1fr trick for smooth open/close)
    // wraps the actual <ul>. The wrapper is always in the DOM; only
    // `.is-open` on the wrapper changes.
    aboutCollapse = el('div', { className: 'ed-about-collapse' });
    const aboutPanel = el('ul', { className: 'ed-about', style: { borderColor: p.header } });
    for (const line of about) aboutPanel.appendChild(el('li', { text: line }));
    aboutCollapse.appendChild(aboutPanel);
    toggle.addEventListener('click', () => {
      const open = !aboutCollapse.classList.contains('is-open');
      aboutCollapse.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  card.appendChild(head);
  if (aboutCollapse) card.appendChild(aboutCollapse);

  const body = el('div', { className: 'ed-body' });
  if (section.groups) {
    for (const g of section.groups) {
      const wrap = el('div', { className: 'ed-group' }, [
        el('div', { className: 'ed-glabel', text: g.label, style: { background: p.header, color: onAccent } }),
        buildEditorialItems(g.items, priceList, p.header),
      ]);
      body.appendChild(wrap);
    }
  } else if (section.items) {
    body.appendChild(buildEditorialItems(section.items, priceList, p.header));
  }
  card.appendChild(body);
  return card;
}

// Build the [suffix?] [price] right-side cluster of a price row. The
// suffix renders BEFORE the price (small, muted) so the $ digits
// right-align cleanly across rows, regardless of which rows have a
// suffix and which don't.
function priceCluster(value, suffix, accent) {
  const cluster = el('span', { className: 'ed-price-cluster' });
  if (suffix) cluster.appendChild(el('span', { className: 'ed-suffix', text: suffix }));
  cluster.appendChild(el('span', { className: 'ed-price', text: formatPrice(value), style: { color: accent } }));
  return cluster;
}

function bulletPriceCluster(value, suffix) {
  const cluster = el('span', { className: 'ed-price-cluster' });
  if (suffix) cluster.appendChild(el('span', { className: 'ed-suffix', text: suffix }));
  cluster.appendChild(el('span', { className: 'ed-bprice', text: formatPrice(value) }));
  return cluster;
}

function buildEditorialItems(items, priceList, accent) {
  const ul = el('ul', { className: 'ed-items' });
  for (const it of items) {
    const cls = it.separated ? 'ed-item ed-item-separated' : 'ed-item';
    const li = el('li', { className: cls });
    // An item with no priceKey is a label-only header whose prices live
    // in the bullets below (e.g. Late Pickup → Per day / 4-5 days).
    // Skip the price cluster in that case.
    const rowChildren = [el('span', { className: 'ed-label', text: it.label })];
    if (it.priceKey !== undefined) {
      rowChildren.push(priceCluster(priceList[it.priceKey], it.suffix, accent));
    }
    li.appendChild(el('div', { className: 'ed-row' }, rowChildren));
    if (Array.isArray(it.bullets) && it.bullets.length > 0) {
      const bullets = el('ul', { className: 'ed-bullets' });
      for (const b of it.bullets) {
        if (b.text) {
          bullets.appendChild(el('li', { text: b.text }));
          continue;
        }
        if (b.priceKey) {
          bullets.appendChild(el('li', { className: 'ed-brow' }, [
            el('span', { text: b.label || b.priceKey }),
            bulletPriceCluster(priceList[b.priceKey], b.suffix),
          ]));
        }
      }
      li.appendChild(bullets);
    }
    ul.appendChild(li);
  }
  return ul;
}

function resolveAbout(section, aboutOverrides) {
  const override = aboutOverrides?.[section.id];
  if (Array.isArray(override) && override.length > 0) return override;
  return section.about || [];
}

function buildEditorialPage({ priceList, bwMode, titleSize, effective, aboutOverrides }) {
  const cls = ['pl-page', 'pl-editorial', `ed-title-${titleSize}`];
  const page = el('div', { className: cls.join(' ') });

  // Masthead — 3-column grid keeps the title centered. Left column
  // shows the last-edited date (from the priceListMetadata trigger,
  // bumped when the admin saves changes to the priceList field).
  // Right column shows the ⓘ hint. Both eyebrows pin to the bottom
  // of their column near the masthead border-bottom.
  const effectiveLabelText = effective ? `Last edited ${effective}` : '';
  if (titleSize !== 'hidden') {
    page.appendChild(el('header', { className: 'ed-masthead' }, [
      el('div', { className: 'ed-mast-left' },
        effectiveLabelText
          ? [el('div', { className: 'ed-eyebrow', text: effectiveLabelText })]
          : [],
      ),
      el('h1', { className: 'ed-title-big', text: 'Prices' }),
      el('div', { className: 'ed-mast-right' }, [
        el('div', { className: 'ed-eyebrow ed-eyebrow-right' }, [
          'Tap ',
          el('i', { className: 'bi bi-info-circle', attrs: { 'aria-hidden': 'true' } }),
          ' for details',
        ]),
      ]),
    ]));
  } else {
    page.appendChild(el('header', { className: 'ed-masthead ed-masthead-min' }, [
      el('div', { className: 'ed-eyebrow', text: effectiveLabelText }),
      el('div', { className: 'ed-eyebrow ed-eyebrow-right' }, [
        'Tap ',
        el('i', { className: 'bi bi-info-circle', attrs: { 'aria-hidden': 'true' } }),
        ' for details',
      ]),
    ]));
  }

  // 3-column grid
  const grid = el('div', { className: 'ed-grid' });
  for (const colIds of PRICE_LIST_COLUMNS) {
    const colEl = el('div', { className: 'ed-col' });
    for (const id of colIds) {
      const section = PRICE_LIST_SECTIONS.find(s => s.id === id);
      if (!section) continue;
      const palette = bwPalette(PRICE_LIST_PALETTE[section.color] || PRICE_LIST_PALETTE.gray, bwMode);
      colEl.appendChild(buildEditorialCard(section, priceList, palette, resolveAbout(section, aboutOverrides)));
    }
    grid.appendChild(colEl);
  }
  page.appendChild(grid);

  // Footnotes
  const foot = el('footer', { className: 'ed-foot' });
  for (const f of PRICE_LIST_FOOTNOTES) {
    foot.appendChild(el('div', { className: 'ed-foot-item', text: f }));
  }
  page.appendChild(foot);
  return page;
}

// ─────────────────────── Index variant ───────────────────────

function buildIndexCard(section, priceList, paletteOverride, about) {
  const p = paletteOverride;
  const card = el('div', { className: 'ix-card' });
  card.appendChild(el('div', { className: 'ix-tab', style: { background: p.header } }));

  const content = el('div', { className: 'ix-content' });
  const head = el('div', { className: 'ix-head' });
  head.appendChild(el('span', { className: 'ix-title', text: section.title }));
  // 15% intro star marker removed per user request — schema flag stays
  // for the future replacement.

  let aboutCollapse = null;
  const hasAbout = Array.isArray(about) && about.length > 0;
  if (hasAbout) {
    const toggle = el('button', {
      className: 'ix-info-toggle',
      attrs: { type: 'button', 'aria-label': 'Show description', 'aria-expanded': 'false' },
      style: { '--pl-accent': p.header, '--pl-accent-text': p.textOnHeader || '#fff' },
    }, [el('i', { className: 'bi bi-info-circle', attrs: { 'aria-hidden': 'true' } })]);
    head.appendChild(toggle);
    aboutCollapse = el('div', { className: 'ix-about-collapse' });
    const aboutPanel = el('ul', { className: 'ix-about', style: { borderColor: p.header } });
    for (const line of about) aboutPanel.appendChild(el('li', { text: line }));
    aboutCollapse.appendChild(aboutPanel);
    toggle.addEventListener('click', () => {
      const open = !aboutCollapse.classList.contains('is-open');
      aboutCollapse.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  content.appendChild(head);
  if (aboutCollapse) content.appendChild(aboutCollapse);

  if (section.groups) {
    for (const g of section.groups) {
      content.appendChild(el('div', { className: 'ix-group' }, [
        el('div', { className: 'ix-glabel', text: g.label, style: { color: p.header } }),
        buildIndexItems(g.items, priceList),
      ]));
    }
  } else if (section.items) {
    content.appendChild(buildIndexItems(section.items, priceList));
  }

  card.appendChild(content);
  return card;
}

function indexPriceCluster(value, suffix) {
  const cluster = el('span', { className: 'ix-price-cluster' });
  if (suffix) cluster.appendChild(el('span', { className: 'ix-suffix', text: suffix }));
  cluster.appendChild(el('span', { className: 'ix-price', text: formatPrice(value) }));
  return cluster;
}

function indexBulletCluster(value, suffix) {
  const cluster = el('span', { className: 'ix-price-cluster' });
  if (suffix) cluster.appendChild(el('span', { className: 'ix-suffix', text: suffix }));
  cluster.appendChild(el('span', { className: 'ix-bprice', text: formatPrice(value) }));
  return cluster;
}

function buildIndexItems(items, priceList) {
  const ul = el('ul', { className: 'ix-items' });
  for (const it of items) {
    const cls = it.separated ? 'ix-item ix-item-separated' : 'ix-item';
    const li = el('li', { className: cls });
    const rowChildren = [el('span', { className: 'ix-label', text: it.label })];
    if (it.priceKey !== undefined) {
      rowChildren.push(indexPriceCluster(priceList[it.priceKey], it.suffix));
    }
    li.appendChild(el('div', { className: 'ix-row' }, rowChildren));
    if (Array.isArray(it.bullets) && it.bullets.length > 0) {
      const bullets = el('ul', { className: 'ix-bullets' });
      for (const b of it.bullets) {
        if (b.text) {
          bullets.appendChild(el('li', { text: b.text }));
          continue;
        }
        if (b.priceKey) {
          bullets.appendChild(el('li', { className: 'ix-brow' }, [
            el('span', { text: b.label || b.priceKey }),
            indexBulletCluster(priceList[b.priceKey], b.suffix),
          ]));
        }
      }
      li.appendChild(bullets);
    }
    ul.appendChild(li);
  }
  return ul;
}

function buildIndexPage({ priceList, bwMode, titleSize, effective, aboutOverrides }) {
  const cls = ['pl-page', 'pl-index', `ix-title-${titleSize}`];
  const page = el('div', { className: cls.join(' ') });

  if (titleSize !== 'hidden') {
    const title = el('h1', { className: 'ix-title-big' }, [
      document.createTextNode('Prices'),
      el('sup', { text: new Date().getFullYear().toString() }),
    ]);
    page.appendChild(el('header', { className: 'ix-masthead' }, [
      title,
      el('div', { className: 'ix-mast-meta' }, [
        el('span', { text: `Updated ${effective}` }),
        el('span', { className: 'ix-dot' }),
        el('span', { text: 'All-incl.' }),
      ]),
    ]));
  } else {
    page.appendChild(el('header', { className: 'ix-masthead ix-masthead-min' }, [
      el('div', { className: 'ix-mast-meta' }, [
        el('span', { text: `Updated ${effective}` }),
      ]),
    ]));
  }

  const grid = el('div', { className: 'ix-grid' });
  for (const colIds of PRICE_LIST_COLUMNS) {
    const colEl = el('div', { className: 'ix-col' });
    for (const id of colIds) {
      const section = PRICE_LIST_SECTIONS.find(s => s.id === id);
      if (!section) continue;
      const palette = bwPalette(PRICE_LIST_PALETTE[section.color] || PRICE_LIST_PALETTE.gray, bwMode);
      colEl.appendChild(buildIndexCard(section, priceList, palette, resolveAbout(section, aboutOverrides)));
    }
    grid.appendChild(colEl);
  }
  page.appendChild(grid);

  const foot = el('footer', { className: 'ix-foot' });
  for (const f of PRICE_LIST_FOOTNOTES) {
    foot.appendChild(el('span', { text: f }));
  }
  page.appendChild(foot);
  return page;
}

// ─────────────────────── Public API ───────────────────────

/**
 * @param {HTMLElement} root - Container to render into.
 * @param {Object} [opts]
 * @param {'editorial'|'index'} [opts.variant]
 *   When omitted, falls back to the persisted `priceListDisplay.variant`
 *   from the fetched data; if that's also missing, defaults to 'editorial'.
 * @param {boolean} [opts.bwMode]
 *   When omitted, falls back to `priceListDisplay.bwMode`, then `false`.
 * @param {'small'|'hidden'} [opts.titleSize]
 *   When omitted, falls back to `priceListDisplay.titleSize`, then 'small'.
 * @param {{width:number,height:number}} [opts.canvasPx]
 * @param {Object} [opts.data] - Pre-fetched data { priceList, priceListAbout,
 *   priceListDisplay, lastModifiedAt }
 * @param {string} [opts.apiUrl]
 */
export async function renderPriceListSheet(root, opts = {}) {
  if (!root) throw new Error('renderPriceListSheet: root element required');

  root.innerHTML = '';
  root.appendChild(el('div', {
    className: 'pl-loading',
    text: 'Loading price list…',
    style: { padding: '40px', textAlign: 'center', fontFamily: 'Mulish, sans-serif' },
  }));

  let data = opts.data;
  if (!data) {
    try {
      const res = await fetch(opts.apiUrl || DEFAULT_API_URL);
      if (!res.ok) throw new Error('Failed to fetch price list');
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Unknown error');
      data = result.data;
    } catch (err) {
      console.error('[price-list] fetch failed', err);
      root.innerHTML = '';
      root.appendChild(el('div', {
        className: 'pl-error',
        text: 'Unable to load price list. Please refresh.',
        style: { padding: '40px', textAlign: 'center', color: '#b03030', fontFamily: 'Mulish, sans-serif' },
      }));
      throw err;
    }
  }

  // Display state precedence: explicit opt (URL param) > persisted
  // `priceListDisplay` from settings/app > hard default. This way the
  // admin's saved choice becomes the default for every embed without
  // breaking ad-hoc URL-param previews.
  const display = data?.priceListDisplay || {};
  const variant = VALID_VARIANTS.includes(opts.variant) ? opts.variant
    : VALID_VARIANTS.includes(display.variant) ? display.variant
    : 'editorial';
  const titleSize = VALID_TITLE_SIZES.includes(opts.titleSize) ? opts.titleSize
    : VALID_TITLE_SIZES.includes(display.titleSize) ? display.titleSize
    : 'small';
  const bwMode = (opts.bwMode !== undefined && opts.bwMode !== null)
    ? !!opts.bwMode
    : !!display.bwMode;

  const priceList = data?.priceList || {};
  const aboutOverrides = data?.priceListAbout || {};
  // Effective date — null when the metadata trigger hasn't fired yet
  // (e.g. fresh install before any save). Don't fabricate a fake "now"
  // date that drifts during a render session — leave it blank instead.
  const effective = formatEffective(data?.lastModifiedAt) || '';

  const page = variant === 'index'
    ? buildIndexPage({ priceList, bwMode, titleSize, effective, aboutOverrides })
    : buildEditorialPage({ priceList, bwMode, titleSize, effective, aboutOverrides });

  if (opts.canvasPx) {
    // Caller supplied a fixed canvas (Puppeteer PDF generation passes
    // Letter / A4 / etc.). Mark the page so the print-only positioning
    // rules (.ed-foot absolute, .ed-grid fixed height) kick in. Without
    // this class the page flows naturally — used by the embed page and
    // the admin tab.
    page.classList.add('pl-page--canvas');
    page.style.width = `${opts.canvasPx.width}px`;
    page.style.height = `${opts.canvasPx.height}px`;
  }

  root.innerHTML = '';
  root.appendChild(page);
  return data;
}
