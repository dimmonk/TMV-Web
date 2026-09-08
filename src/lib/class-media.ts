/**
 * Build-time media resolution for the class catalog — shared by every surface
 * that renders a class's clip (ClassCard, ClassTabs) so they can never disagree
 * about whether an asset exists.
 *
 * Some class clips (acrodance / flexibility / handstand / …) were referenced by
 * the design but never delivered. Checking at BUILD time means a missing file
 * renders a branded placeholder instead of a <video> that 404s and shows a
 * broken box — and it auto-heals the moment the file is dropped in.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Does this media path point at a video (vs. a still)? */
export const isVideoAsset = (image: string): boolean =>
  /\.(mp4|webm|ogv|mov)(\?|$)/i.test(image);

/** True unless it's a LOCAL `assets/…` file that isn't in public/ yet. */
export const classMediaExists = (image: string): boolean =>
  !image.startsWith('assets/') ||
  existsSync(fileURLToPath(new URL(`../../public/${image}`, import.meta.url)));
