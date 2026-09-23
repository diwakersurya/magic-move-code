/** 0-based, inclusive line range. */
export type Range = [start: number, end: number];

/** Lines `from` in the left pane move onto lines `to` in the right pane; without `to` they fade out. */
export type Move = { from: Range; to?: Range };

/**
 * What a matcher decides. `moves` play in array order. `from`/`to` optionally replace the code
 * that gets rendered (e.g. with marker comments stripped).
 */
export type Plan = { from?: string; to?: string; moves: Move[] };

/**
 * Decides which lines move where. May be async (e.g. an LLM call); keep its identity stable
 * (define it outside the component or memoize it) or it re-runs on every render.
 */
export type Matcher = (from: string, to: string) => Plan | Promise<Plan>;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Pairs lines that start with the same marker comment: `/*<prefix>-<name>*\/` marks one line,
 * `/*<prefix>-bulk-<name>*\/` opens a block closed by the next line starting with the same marker.
 * Markers are stripped from the rendered code. Moves play in the order markers appear in `from`.
 */
export function matchMarkers(prefix = 'mid'): Matcher {
  const marker = new RegExp(`^/\\*\\s*(${escapeRegExp(prefix)}-(bulk-)?\\S+?)\\s*\\*/`);
  const scan = (code: string) => {
    const lines = code.split('\n');
    const spans = new Map<string, Range>();
    let open: string | undefined;
    lines.forEach((line, i) => {
      const m = line.match(marker);
      if (!m) return;
      lines[i] = line.slice(m[0].length);
      if (open) {
        if (m[1] === open) {
          spans.get(open)![1] = i;
          open = undefined;
        }
      } else if (!spans.has(m[1])) {
        spans.set(m[1], [i, m[2] ? lines.length - 1 : i]);
        if (m[2]) open = m[1];
      }
    });
    return { code: lines.join('\n'), spans };
  };
  return (from, to) => {
    const a = scan(from);
    const b = scan(to);
    return {
      from: a.code,
      to: b.code,
      moves: [...a.spans].map(([id, range]) => ({ from: range, to: b.spans.get(id) })),
    };
  };
}

/** Pairs identical lines (ignoring indentation); repeated lines pair by occurrence. */
export const matchLines: Matcher = (from, to) => {
  const key = (lines: string[]) => {
    const seen = new Map<string, number>();
    return lines.map((line) => {
      const text = line.trim();
      if (!text) return undefined;
      const n = seen.get(text) ?? 0;
      seen.set(text, n + 1);
      return `${text}#${n}`;
    });
  };
  const targets = new Map(key(to.split('\n')).map((k, i) => [k, i] as const));
  const moves: Move[] = [];
  key(from.split('\n')).forEach((k, i) => {
    if (!k) return;
    const j = targets.get(k);
    moves.push({ from: [i, i], to: j === undefined ? undefined : [j, j] });
  });
  return { moves };
};

/** Drops moves with malformed, out-of-bounds or overlapping ranges (matcher output is untrusted). */
export function validMoves(moves: unknown, fromLines: number, toLines: number): Move[] {
  if (!Array.isArray(moves)) return [];
  const taken = [new Set<number>(), new Set<number>()];
  const ok = (r: unknown, count: number, side: Set<number>): r is Range => {
    if (!Array.isArray(r) || r.length !== 2) return false;
    const [s, e] = r;
    if (!Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e < s || e >= count) return false;
    for (let i = s; i <= e; i++) if (side.has(i)) return false;
    return true;
  };
  const claim = ([s, e]: Range, side: Set<number>) => {
    for (let i = s; i <= e; i++) side.add(i);
  };
  return moves.filter((m): m is Move => {
    if (!m || !ok(m.from, fromLines, taken[0])) return false;
    if (m.to !== undefined && !ok(m.to, toLines, taken[1])) return false;
    claim(m.from, taken[0]);
    if (m.to) claim(m.to, taken[1]);
    return true;
  });
}
