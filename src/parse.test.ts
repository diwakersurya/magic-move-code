import { expect, test } from 'vitest';
import { groupLines } from './parse.js';

const comment = (content: string) => ({ types: ['comment'], content });
const plain = (content: string) => ({ types: ['plain'], content });

test('groups single and bulk markers, strips them, leaves other lines alone', () => {
  const groups = groupLines([
    [comment('/* header */')],
    [comment('/*mid-1*/'), plain(' import a')],
    [comment('/*mid-bulk-2*/'), plain('fn {')],
    [plain('  body'), plain('')],
    [comment('/*mid-bulk-2*/'), plain('}')],
    [comment('/*other-3*/'), plain('x')],
  ]);
  expect(groups.map((g) => [g.id, g.lines.length])).toEqual([
    [undefined, 1],
    ['mid-1', 1],
    ['mid-bulk-2', 3],
    [undefined, 1],
  ]);
  expect(groups[1].lines[0]).toEqual([plain(' import a')]);
  expect(groups[2].lines[1]).toEqual([plain('  body')]);
});

test('custom prefix, and marker-only lines keep their height', () => {
  const groups = groupLines([[comment('/* mm-a */')], [comment('/*mid-b*/'), plain('y')]], 'mm');
  expect(groups[0]).toEqual({ id: 'mm-a', lines: [[{ types: ['plain'], content: '\n', empty: true }]] });
  expect(groups[1].id).toBeUndefined();
});
