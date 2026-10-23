// @ts-check
/**
 * The announcement banner's show rules, in one place, run by the build (the
 * banner is rendered or not) and by the browser (on page load it picks again,
 * so the change at the gym's midnight needs no release).
 *
 * What Settings -> Website -> Announcements promises (TMV-Members, ADR-0276):
 *   - Staff set the year's banners ahead, each with a first and a last day (gym
 *     days); one shows from the start of its first day to the end of its last.
 *   - Banners never overlap, so at most one shows on a day. If a write went
 *     around the members app and two do, the soonest wins (the reader's order).
 *   - A banner has a headline; the message and the button are optional.
 */

/**
 * The gym's calendar day in a `GymNow.wall` stamp.
 * @param {string} wall - `YYYY-MM-DDTHH:MM:SS`
 * @returns {string} `YYYY-MM-DD`
 */
export const gymDay = (wall) => wall.slice(0, 10);

/**
 * Do a banner's days include `day`?
 * @param {{from: string, to: string}} banner
 * @param {string} day - `YYYY-MM-DD`
 * @returns {boolean}
 */
export const bannerShowsOn = (banner, day) => banner.from <= day && day <= banner.to;

/**
 * The banner showing on `day`, or null.
 * @param {import('./published-config.js').Banner[]} banners - soonest first, as the reader gives them
 * @param {string} day - `YYYY-MM-DD`
 * @returns {import('./published-config.js').Banner|null}
 */
export function bannerOn(banners, day) {
  return banners.find((b) => bannerShowsOn(b, day)) ?? null;
}

/**
 * The banner's button: it needs both a label and a link; one without the other is not a button.
 * @param {import('./published-config.js').Banner} banner
 * @returns {{label: string, href: string}|null}
 */
export function bannerButton(banner) {
  return banner.ctaLabel !== '' && banner.ctaUrl !== '' ? { label: banner.ctaLabel, href: banner.ctaUrl } : null;
}
