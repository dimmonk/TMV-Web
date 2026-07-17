/**
 * Surface tagging for the shared data modules. Keeps ONE source-of-truth list
 * while letting an entry be desktop-only, mobile-only, or carry a
 * mobile/desktop-specific version of some fields.
 *
 *   { title: 'Day Passes', description: '<full desktop copy>',
 *     mobile: { description: '<shorter mobile copy>' } }
 *
 *   { title: 'Some desktop-only thing', only: 'desktop' }
 *
 * A page resolves its list with `forSurface(items, 'desktop' | 'mobile')`:
 * items not on that surface are dropped, and that surface's field overrides are
 * merged over the base. There's still one list to edit; the tag just says which
 * surface(s) see it and how.
 */
export type Surface = 'desktop' | 'mobile';

export interface Surfaced {
  /** Restrict this entry to one surface. Omit to show on both. */
  only?: Surface;
  /** Fields to override when rendered on mobile. */
  mobile?: Record<string, unknown>;
  /** Fields to override when rendered on desktop. */
  desktop?: Record<string, unknown>;
}

/** Resolve a list for a surface: drop off-surface entries, apply its overrides. */
export function forSurface<T extends Surfaced>(items: T[], surface: Surface): T[] {
  return items
    .filter((it) => !it.only || it.only === surface)
    .map((it) => {
      const { only: _only, mobile, desktop, ...base } = it;
      const override = (surface === 'mobile' ? mobile : desktop) ?? {};
      return { ...base, ...override } as unknown as T;
    });
}
