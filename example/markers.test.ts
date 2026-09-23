import { expect, test } from 'vitest';
import { matchMarkers, type Plan } from '../src/index.js';
import { autoLink, link, links, stripAll, templateLiteral, unlink } from './markers.js';

const plan = (from: string, to: string) => matchMarkers()(from, to) as Plan;

test('link writes marker pairs that matchMarkers reads back, unlink removes them', () => {
  let [from, to] = link('a\n  b\nc', 'x\nc\n  b', [1, 1], [2, 2]);
  [from, to] = link(from, to, [2, 2], [0, 1]);
  expect(from).toBe('a\n/*mid-1*/  b\n/*mid-2*/c');
  expect(to).toBe('/*mid-bulk-2*/x\n/*mid-bulk-2*/c\n/*mid-1*/  b');
  expect(links(plan(from, to))).toEqual([
    { from: [1, 1], to: [2, 2] },
    { from: [2, 2], to: [0, 1] },
  ]);
  [from, to] = unlink(from, to, { from: [2, 2], to: [0, 1] });
  expect(to).toBe('x\nc\n/*mid-1*/  b');
  expect(stripAll(from)).toBe('a\n  b\nc');
});

test('autoLink merges adjacent identical lines into blocks', () => {
  const [from, to] = autoLink('/*mid-9*/a\nb\nz', 'q\na\nb');
  expect([from, to]).toEqual(['/*mid-bulk-1*/a\n/*mid-bulk-1*/b\nz', 'q\n/*mid-bulk-1*/a\n/*mid-bulk-1*/b']);
});

test('templateLiteral escapes backticks, ${ and backslashes', () => {
  const code = 'const s = `${a}\\n`;';
  expect(new Function(`return ${templateLiteral(code)}`)()).toBe(code);
});
