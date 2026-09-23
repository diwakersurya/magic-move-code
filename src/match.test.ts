import { expect, test } from 'vitest';
import { groupLines } from './parse.js';
import { matchLines, matchMarkers, validMoves, type Plan } from './match.js';

test('matchMarkers pairs single and bulk markers and strips them', () => {
  const from = '/* header */\n/*mid-1*/ import a\n/*mid-bulk-2*/fn {\n  body\n/*mid-bulk-2*/}\n/*other-3*/x';
  const to = '/*mid-bulk-2*/fn {\n/*mid-bulk-2*/}\n/*mid-1*/import a';
  expect(matchMarkers()(from, to) as Plan).toEqual({
    from: '/* header */\n import a\nfn {\n  body\n}\n/*other-3*/x',
    to: 'fn {\n}\nimport a',
    moves: [
      { from: [1, 1], to: [2, 2] },
      { from: [2, 4], to: [0, 1] },
    ],
  });
  expect((matchMarkers('mm')('/* mm-a */y', 'z') as Plan).moves).toEqual([{ from: [0, 0], to: undefined }]);
});

test('matchLines pairs by trimmed text and occurrence', () => {
  expect((matchLines('a\n  }\n\n}\nb', '}\nb\n}') as Plan).moves).toEqual([
    { from: [0, 0], to: undefined },
    { from: [1, 1], to: [0, 0] },
    { from: [3, 3], to: [2, 2] },
    { from: [4, 4], to: [1, 1] },
  ]);
});

test('validMoves drops malformed, out-of-bounds and overlapping moves', () => {
  const moves = [
    { from: [0, 1], to: [0, 0] },
    { from: [1, 1], to: [2, 2] }, // overlaps from
    { from: [2, 2], to: [0, 0] }, // overlaps to
    { from: [3, 9] }, // out of bounds
    { from: [2, 'x'] },
    null,
    { from: [3, 3] },
  ];
  expect(validMoves(moves, 4, 3)).toEqual([{ from: [0, 1], to: [0, 0] }, { from: [3, 3] }]);
  expect(validMoves('nope', 4, 3)).toEqual([]);
});

test('groupLines groups ranges by move index', () => {
  const line = (content: string) => [{ types: ['plain'], content }];
  const groups = groupLines([line('a'), line('b'), line('c'), line('')], [undefined, [1, 2]]);
  expect(groups.map((g) => [g.id, g.lines.length])).toEqual([
    [undefined, 1],
    ['1', 2],
    [undefined, 1],
  ]);
  expect(groups[2].lines[0][0].content).toBe('\n');
});
