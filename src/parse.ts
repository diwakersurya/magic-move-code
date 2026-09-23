import type { Token } from 'prism-react-renderer';

export type Group = { id?: string; lines: Token[][] };

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const emptyLine: Token[] = [{ types: ['plain'], content: '\n', empty: true }];

/**
 * Splits highlighted lines into groups. A line starting with a `/*<prefix>-<name>*\/`
 * comment is its own movable group; `/*<prefix>-bulk-<name>*\/` opens a group that
 * runs until the next line starting with the same marker. Markers are stripped.
 */
export function groupLines(tokens: Token[][], prefix = 'mid'): Group[] {
  const marker = new RegExp(`^/\\*\\s*(${escapeRegExp(prefix)}-(bulk-)?\\S+?)\\s*\\*/$`);
  const groups: Group[] = [];
  let open: Group | undefined;
  for (const raw of tokens) {
    const line = raw.filter((t) => t.content !== '');
    const match = line[0]?.types.includes('comment') ? line[0].content.match(marker) : null;
    const rest = match ? line.slice(1) : line;
    const content = rest.length ? rest : emptyLine;
    if (open) {
      open.lines.push(content);
      if (match?.[1] === open.id) open = undefined;
    } else if (match) {
      const group = { id: match[1], lines: [content] };
      groups.push(group);
      if (match[2]) open = group;
    } else {
      groups.push({ lines: [content] });
    }
  }
  return groups;
}
