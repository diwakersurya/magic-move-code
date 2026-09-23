import type { Token } from 'prism-react-renderer';
import type { Range } from './match.js';

export type Group = { id?: string; lines: Token[][] };

const emptyLine: Token[] = [{ types: ['plain'], content: '\n', empty: true }];

const clean = (line: Token[]) => {
  const tokens = line.filter((t) => t.content !== '');
  return tokens.length ? tokens : emptyLine;
};

/** Splits highlighted lines into groups; `ranges[i]` becomes the group with id `String(i)`. */
export function groupLines(tokens: Token[][], ranges: (Range | undefined)[] = []): Group[] {
  const starts = new Map<number, [end: number, id: number]>();
  ranges.forEach((r, id) => r && starts.set(r[0], [r[1], id]));
  const groups: Group[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const hit = starts.get(i);
    if (hit) {
      groups.push({ id: String(hit[1]), lines: tokens.slice(i, hit[0] + 1).map(clean) });
      i = hit[0];
    } else {
      groups.push({ lines: [clean(tokens[i])] });
    }
  }
  return groups;
}
