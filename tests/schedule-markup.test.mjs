// The phone Schedule screen (src/lib/mobile-schedule.ts) builds each class row as
// markup in an innerHTML template. The class colour is staff-typed data from the
// public schedule projection, so it is escaped at the sink even though the
// publisher (TMV-Members functions/schedule-publish.js, `safeColor`) already gates
// it: a colour that reached the template raw could close the `style` attribute
// and run script on themonkeyvault.com. TMV-Members' member-account.js mirrors
// this template line for line and carries the same pin
// (tests/unit/public-schedule-color-sink-drift.test.js). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SOURCE = readFileSync(resolve(import.meta.dirname, '../src/lib/mobile-schedule.ts'), 'utf8');
/** `renderSchedule`'s body: from its declaration to the next function in the mount. */
const RENDER = SOURCE.slice(SOURCE.indexOf('function renderSchedule('), SOURCE.indexOf('function loadSchedule('));

test('the class colour bar interpolates the colour through escapeHtml', () => {
  assert.ok(RENDER.length > 0, 'renderSchedule not found');
  const bars = RENDER.match(/<span class="m-sess-bar" style="background:\$\{[^}]*\}"><\/span>/g) ?? [];
  assert.equal(bars.length, 1);
  assert.ok(bars[0].includes('${escapeHtml(s.color)}'), bars[0]);
});

test('no session field is interpolated raw into the schedule markup', () => {
  // `s.isEnding` / `s.isNew` only pick between literals; every string field goes through escapeHtml.
  assert.deepEqual(RENDER.match(/\$\{s\.(?!isEnding\b|isNew\b)\w+\}/g) ?? [], []);
});
