import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { CodeView, MagicMove, matchMarkers, type MagicMoveHandle, type Plan, type Range } from '../src/index.js';
import { Controls } from './Controls.js';
import { plainFrom, plainTo } from './Demos.js';
import { autoLink, link, links, stripAll, templateLiteral, unlink } from './markers.js';
import css from './Playground.module.css';

type State = { from: string; to: string; language: string };
type Side = 'from' | 'to';

const languages = [
  'jsx',
  'tsx',
  'typescript',
  'css',
  'markup',
  'python',
  'go',
  'rust',
  'sql',
  'json',
  'yaml',
  'kotlin',
  'swift',
  'cpp',
  'markdown',
];
const palette = ['#ff79c6', '#8be9fd', '#50fa7b', '#ffb86c', '#bd93f9', '#f1fa8c'];
const markers = matchMarkers();
const [defaultFrom, defaultTo] = autoLink(plainFrom, plainTo);
const defaults: State = { from: defaultFrom, to: defaultTo, language: 'jsx' };

// ponytail: whole state in the URL hash; very large snippets make long URLs, move to a share service if that bites.
export function encodeState(state: State) {
  let binary = '';
  for (const byte of new TextEncoder().encode(JSON.stringify(state))) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeState(data: string | undefined): State | undefined {
  if (!data) return undefined;
  try {
    const binary = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))));
    if (typeof parsed?.from !== 'string' || typeof parsed?.to !== 'string') return undefined;
    return {
      from: parsed.from,
      to: parsed.to,
      language: languages.includes(parsed.language) ? parsed.language : 'jsx',
    };
  } catch {
    return undefined;
  }
}

const describe = ([start, end]: Range) => (start === end ? `line ${start + 1}` : `lines ${start + 1}–${end + 1}`);
const within = (i: number, [start, end]: Range) => start <= i && i <= end;

function snippet({ from, to, language }: State) {
  const lang = language === 'jsx' ? '' : ` language="${language}"`;
  return `const from = ${templateLiteral(from)};\n\nconst to = ${templateLiteral(to)};\n\n<MagicMove from={from} to={to}${lang} />`;
}

export function Playground({ initial, active }: { initial?: string; active: boolean }) {
  const [state, setState] = useState<State>(() => decodeState(initial) ?? defaults);
  const [selection, setSelection] = useState<Partial<Record<Side, Range>>>({});
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const preview = useRef<MagicMoveHandle>(null);

  const { from, to, language } = state;
  const plan = markers(from, to) as Plan;
  const pairs = links(plan);
  const unpaired = plan.moves.length - pairs.length;

  useEffect(() => {
    if (!active) return;
    // Also on hashchange: re-clicking the tab resets the hash to a bare #playground.
    const write = () => {
      if (location.hash.startsWith('#playground')) history.replaceState(null, '', `#playground/${encodeState(state)}`);
    };
    write();
    addEventListener('hashchange', write);
    return () => removeEventListener('hashchange', write);
  }, [state, active]);

  const update = (patch: Partial<State>) => {
    setState((s) => ({ ...s, ...patch }));
    setSelection({});
    setCopied('idle');
  };
  const setCode = ([a, b]: [string, string]) => update({ from: a, to: b });

  const pick = (side: Side) => (event: MouseEvent) => {
    const line = (event.target as HTMLElement).closest<HTMLElement>('[data-line]');
    if (!line) return;
    const i = Number(line.dataset.line);
    const current = selection[side];
    const range: Range = event.shiftKey && current ? [Math.min(current[0], i), Math.max(current[1], i)] : [i, i];
    for (let k = range[0]; k <= range[1]; k++) if (pairs.some((m) => within(k, m[side]))) return;
    setSelection((s) => ({ ...s, [side]: range }));
  };

  const copy = () =>
    navigator.clipboard.writeText(snippet(state)).then(
      () => setCopied('done'),
      () => setCopied('failed'),
    );

  // Link colours and the current selection, keyed off the data attributes CodeView renders.
  const highlight = [
    ...pairs.map((_, i) => {
      const color = palette[i % palette.length];
      return `.${css.pane} [data-moveid="${i}"] { background: ${color}26; box-shadow: inset 4px 0 ${color}; }`;
    }),
    ...(['from', 'to'] as const).flatMap((side) => {
      const r = selection[side];
      if (!r) return [];
      const lines = Array.from({ length: r[1] - r[0] + 1 }, (_, k) => `.${css[side]} [data-line="${r[0] + k}"]`);
      return [`${lines.join(',')} { background: #ffffff26; outline: 1px dashed var(--accent); }`];
    }),
  ].join('\n');

  return (
    <section className={css.playground}>
      <style>{highlight}</style>
      <p>
        Paste your code, then link lines: click a line in <strong>From</strong> (shift-click to extend), do the same in{' '}
        <strong>To</strong>, then press <strong>Link</strong>. Markers are written into the code, so you can also type
        them directly. The state lives in the URL, so share the link to share the playground.
      </p>

      <div className={css.toolbar}>
        <label>
          Language{' '}
          <select value={language} onChange={(e) => update({ language: e.target.value })}>
            {languages.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <button onClick={() => setCode(autoLink(from, to))}>Auto-link identical lines</button>
        <button
          onClick={() => update({ from: stripAll(from), to: stripAll(to) })}
          disabled={!pairs.length && !unpaired}
        >
          Remove all links
        </button>
      </div>

      <div className={css.grid}>
        <label className={css.editor}>
          From
          <textarea
            value={from}
            spellCheck={false}
            rows={Math.max(6, from.split('\n').length + 1)}
            onChange={(e) => update({ from: e.target.value })}
          />
        </label>
        <label className={css.editor}>
          To
          <textarea
            value={to}
            spellCheck={false}
            rows={Math.max(6, to.split('\n').length + 1)}
            onChange={(e) => update({ to: e.target.value })}
          />
        </label>
      </div>

      <h2>Link lines</h2>
      <div className={css.grid}>
        <div className={`${css.pane} ${css.from}`} onClick={pick('from')}>
          <CodeView code={plan.from ?? from} language={language} ranges={pairs.map((m) => m.from)} />
        </div>
        <div className={`${css.pane} ${css.to}`} onClick={pick('to')}>
          <CodeView code={plan.to ?? to} language={language} ranges={pairs.map((m) => m.to)} />
        </div>
      </div>
      <div className={css.toolbar}>
        <button
          disabled={!selection.from || !selection.to}
          onClick={() => selection.from && selection.to && setCode(link(from, to, selection.from, selection.to))}
        >
          Link {selection.from ? describe(selection.from) : '…'} → {selection.to ? describe(selection.to) : '…'}
        </button>
        <button disabled={!selection.from && !selection.to} onClick={() => setSelection({})}>
          Clear selection
        </button>
      </div>

      {pairs.length > 0 && (
        <ol className={css.links}>
          {pairs.map((m, i) => (
            <li key={i}>
              <span className={css.swatch} style={{ background: palette[i % palette.length] }} />
              From {describe(m.from)} → To {describe(m.to)}
              <button onClick={() => setCode(unlink(from, to, m))}>Unlink</button>
            </li>
          ))}
        </ol>
      )}
      <p className={css.note}>
        Moves play in the order they appear in From.
        {unpaired > 0 &&
          ` ${unpaired} marker${unpaired > 1 ? 's' : ''} in From ${unpaired > 1 ? 'have' : 'has'} no match in To and will fade out.`}
      </p>

      <h2>Preview</h2>
      <div className={css.preview}>
        <MagicMove ref={preview} from={from} to={to} language={language} />
      </div>
      <Controls handle={preview} />

      <h2>Props</h2>
      <div className={css.toolbar}>
        <button onClick={copy}>Copy</button>
        <span role="status" className={css.note}>
          {copied === 'done' && 'Copied to clipboard.'}
          {copied === 'failed' && 'Copy failed. Select the code below and copy it manually.'}
        </span>
      </div>
      <div className={css.output}>
        <CodeView code={snippet(state)} language="tsx" />
      </div>
    </section>
  );
}
