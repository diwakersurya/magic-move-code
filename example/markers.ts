import { matchLines, validMoves, type Move, type Plan, type Range } from '../src/index.js';

// Mirrors matchMarkers() with the default `mid` prefix.
const marker = /^\/\*\s*mid-(?:bulk-)?(\S+?)\s*\*\//;

const lines = (code: string) => code.split('\n');
const strip = (line: string) => line.replace(marker, '');

/** Removes every marker, leaving plain code. */
export const stripAll = (code: string) => lines(code).map(strip).join('\n');

/** Next numeric marker id not used in either snippet. */
function nextId(...codes: string[]) {
  let max = 0;
  for (const line of codes.flatMap(lines)) {
    const id = Number(line.match(marker)?.[1]);
    if (id > max) max = id;
  }
  return max + 1;
}

function mark(code: string, [start, end]: Range, id: number) {
  const out = lines(code);
  const tag = start === end ? `/*mid-${id}*/` : `/*mid-bulk-${id}*/`;
  out[start] = tag + strip(out[start]);
  if (end !== start) out[end] = tag + strip(out[end]);
  return out.join('\n');
}

function unmark(code: string, range: Range | undefined) {
  if (!range) return code;
  const out = lines(code);
  out[range[0]] = strip(out[range[0]]);
  out[range[1]] = strip(out[range[1]]);
  return out.join('\n');
}

/** Links a range in `from` to a range in `to` by writing a fresh marker pair into both. */
export function link(from: string, to: string, a: Range, b: Range): [string, string] {
  const id = nextId(from, to);
  return [mark(from, a, id), mark(to, b, id)];
}

export function unlink(from: string, to: string, move: Move): [string, string] {
  return [unmark(from, move.from), unmark(to, move.to)];
}

/** Replaces all markers with ones pairing identical lines; adjacent pairs merge into blocks. */
export function autoLink(from: string, to: string): [string, string] {
  let a = stripAll(from);
  let b = stripAll(to);
  const runs: Required<Move>[] = [];
  for (const { from: f, to: t } of (matchLines(a, b) as Plan).moves) {
    if (!t) continue;
    const last = runs[runs.length - 1];
    if (last && last.from[1] + 1 === f[0] && last.to[1] + 1 === t[0]) {
      last.from[1] = f[1];
      last.to[1] = t[1];
    } else {
      runs.push({ from: [...f], to: [...t] });
    }
  }
  runs.forEach((run, i) => {
    a = mark(a, run.from, i + 1);
    b = mark(b, run.to, i + 1);
  });
  return [a, b];
}

/** Pairs currently encoded by markers, validated like MagicMove does. */
export function links(plan: Plan): Required<Move>[] {
  const from = plan.from ?? '';
  const to = plan.to ?? '';
  return validMoves(plan.moves, lines(from).length, lines(to).length).filter((m): m is Required<Move> => !!m.to);
}

/** A JS template literal that evaluates back to `code`. */
export const templateLiteral = (code: string) =>
  '`' + code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
