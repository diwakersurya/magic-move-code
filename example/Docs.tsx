import type { ReactNode } from 'react';
import { CodeView } from '../src/index.js';
import css from './Docs.module.css';

type Row = [name: string, type: string, fallback: string, description: ReactNode];

const magicMoveProps: Row[] = [
  ['from', 'string', 'required', 'Code shown on the left; its marked groups move.'],
  ['to', 'string', 'required', 'Code shown on the right; groups move onto matches here.'],
  ['language', 'string', "'jsx'", 'Any language bundled with prism-react-renderer (js, tsx, css, python, go, …).'],
  [
    'theme',
    'PrismTheme',
    'themes.dracula',
    <>
      Pick from the re-exported <code>themes</code> or pass your own.
    </>,
  ],
  ['matcher', 'Matcher', 'matchMarkers()', <>Decides which lines move where; sync or async. See Matchers below.</>],
  [
    'duration',
    'number',
    '1000',
    <>
      Milliseconds per move; <code>0</code> under prefers-reduced-motion.
    </>,
  ],
  ['className', 'string', '—', 'Applied to the flex wrapper around both panes.'],
  ['style', 'CSSProperties', '—', 'Applied to the flex wrapper around both panes.'],
  ['ref', 'Ref<MagicMoveHandle>', '—', 'Drives the animation, see below.'],
];

const handleMethods: Row[] = [
  ['start()', 'void', '', 'Plays the first move if nothing has moved yet.'],
  [
    'next()',
    'boolean',
    '',
    <>
      Plays the next move; returns <code>false</code> when nothing is left.
    </>,
  ],
  ['playAll()', 'void', '', 'Plays every remaining move at once.'],
  ['reset()', 'void', '', 'Puts everything back to the initial state.'],
];

const codeViewProps: Row[] = [
  ['code', 'string', 'required', 'Code to highlight.'],
  ['language', 'string', "'jsx'", ''],
  ['theme', 'PrismTheme', 'themes.dracula', ''],
  [
    'ranges',
    '(Range | undefined)[]',
    '—',
    <>
      <code>ranges[i]</code> renders as a group with <code>data-moveid="i"</code>.
    </>,
  ],
  [
    'className',
    'string',
    '—',
    <>
      Added to the <code>&lt;pre&gt;</code>.
    </>,
  ],
  [
    'style',
    'CSSProperties',
    '—',
    <>
      Merged into the <code>&lt;pre&gt;</code> style.
    </>,
  ],
  [
    'ref',
    'Ref<HTMLPreElement>',
    '—',
    <>
      Pass to <code>useMagicMove</code>.
    </>,
  ],
];

const planTypes: Row[] = [
  [
    'Matcher',
    '(from: string, to: string) => Plan | Promise<Plan>',
    '',
    'Called whenever from, to or the matcher changes. Keep it stable: define it outside the component or memoize it.',
  ],
  [
    'Plan',
    '{ from?: string; to?: string; moves: Move[] }',
    '',
    <>
      Optional <code>from</code>/<code>to</code> replace the rendered code (e.g. markers stripped). Moves play in array
      order.
    </>,
  ],
  [
    'Move',
    '{ from: Range; to?: Range }',
    '',
    <>
      Lines that move from the left pane onto the right; without <code>to</code> they fade out.
    </>,
  ],
  ['Range', '[start: number, end: number]', '', '0-based, inclusive line numbers.'],
];

const builtins: Row[] = [
  [
    'matchMarkers(prefix?)',
    'Matcher',
    '',
    <>
      Default. Pairs lines starting with the same <code>/*mid-…*/</code> marker and strips the markers.
    </>,
  ],
  ['matchLines', 'Matcher', '', 'Pairs identical lines (ignoring indentation); repeated lines pair by occurrence.'],
  [
    'validMoves(moves, fromLines, toLines)',
    'Move[]',
    '',
    'What MagicMove runs on every plan: drops malformed, out-of-bounds or overlapping moves.',
  ],
];

const examples: { title: string; body: ReactNode; code: string }[] = [
  {
    title: 'Basic',
    body: 'Mark matching lines in both snippets, then drive it from buttons.',
    code: `import { useRef } from 'react';
import { MagicMove, type MagicMoveHandle } from 'magic-move-code';

const from = \`/*mid-1*/ import add from "./add";
/*mid-bulk-2*/ const add5 = x => {
  return add(x, 5);
/*mid-bulk-2*/ };\`;

const to = \`/*mid-1*/const dependencies = ["add"];
function fn(dependencies) {
/*mid-bulk-2*/  const add5 = x => {
    return add(x, 5);
/*mid-bulk-2*/  };
}\`;

export function Demo() {
  const ref = useRef<MagicMoveHandle>(null);
  return (
    <>
      <MagicMove ref={ref} from={from} to={to} />
      <button onClick={() => ref.current?.start()}>Play</button>
      <button onClick={() => ref.current?.next()}>Next</button>
      <button onClick={() => ref.current?.reset()}>Reset</button>
    </>
  );
}`,
  },
  {
    title: 'Without markers',
    body: 'Identical lines pair up; lines only in `to` show from the start, lines only in `from` fade out.',
    code: `import { MagicMove, matchLines } from 'magic-move-code';

<MagicMove ref={ref} from={before} to={after} matcher={matchLines} />
<button onClick={() => ref.current?.playAll()}>Play</button>`,
  },
  {
    title: 'Language, theme and speed',
    body: 'Any prism-react-renderer language and theme; themes are re-exported.',
    code: `import { MagicMove, themes } from 'magic-move-code';

<MagicMove
  from={before}
  to={after}
  language="python"
  theme={themes.github}
  duration={600}
  style={{ fontSize: 18, borderRadius: 8 }}
/>`,
  },
  {
    title: 'Custom marker prefix',
    body: 'Use a prefix that reads better in your snippets. Create the matcher once, outside the component.',
    code: `import { MagicMove, matchMarkers } from 'magic-move-code';

const stepMarkers = matchMarkers('step');
const from = \`/*step-a*/ let x = 1;\`;
const to = \`const y = 2;
/*step-a*/ let x = 1;\`;

<MagicMove from={from} to={to} matcher={stepMarkers} />`,
  },
  {
    title: 'Async matcher (e.g. an LLM)',
    body: 'Any function returning a Plan works, including a promise. Code renders without moves until it resolves, and stays that way if it rejects.',
    code: `import { MagicMove, type Matcher } from 'magic-move-code';

// Your backend asks the model for line moves and returns
// [{ "from": [0, 2], "to": [3, 5] }, ...]
const llmMatcher: Matcher = async (from, to) => {
  const res = await fetch('/api/magic-move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to }),
  });
  if (!res.ok) throw new Error(\`match failed: \${res.status}\`);
  return { moves: await res.json() };
};

<MagicMove ref={ref} from={before} to={after} matcher={llmMatcher} />`,
  },
  {
    title: 'Combine matchers',
    body: 'Matchers are plain functions, so you can wrap one: here, markers first, falling back to line matching.',
    code: `import { matchLines, matchMarkers, type Matcher, type Plan } from 'magic-move-code';

const markers = matchMarkers();
const markersOrLines: Matcher = (from, to) => {
  const plan = markers(from, to) as Plan;
  return plan.moves.length ? plan : matchLines(from, to);
};`,
  },
  {
    title: 'Auto-play',
    body: 'next() returns false when done, so stepping on a timer is a few lines.',
    code: `useEffect(() => {
  const id = setInterval(() => {
    if (!ref.current?.next()) clearInterval(id);
  }, 1200);
  return () => clearInterval(id);
}, []);`,
  },
  {
    title: 'Custom layout',
    body: 'Place the panes anywhere, e.g. stacked, with CodeView and useMagicMove. Pass each pane its side of the moves.',
    code: `import { useRef } from 'react';
import { CodeView, matchLines, useMagicMove, type Plan } from 'magic-move-code';

export function Stacked({ from, to }: { from: string; to: string }) {
  const fromRef = useRef<HTMLPreElement>(null);
  const toRef = useRef<HTMLPreElement>(null);
  const { next, reset } = useMagicMove(fromRef, toRef, 800);
  const { moves } = matchLines(from, to) as Plan;
  return (
    <div>
      <CodeView ref={fromRef} code={from} ranges={moves.map((m) => m.from)} />
      <CodeView ref={toRef} code={to} ranges={moves.map((m) => m.to)} />
      <button onClick={next}>Next</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}`,
  },
];

const markers = `/*mid-1*/ const a = 1;      // single line, name "1"
/*mid-bulk-2*/ function f() {  // block starts, name "2"
  return a;
/*mid-bulk-2*/ }               // same marker closes the block

// A single line and a block with the same name pair up too.`;

function Table({ head, rows }: { head: string[]; rows: Row[] }) {
  return (
    <div className={css.table}>
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, fallback, description]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>
                <code>{type}</code>
              </td>
              {head.length === 4 && (
                <td>
                  <code>{fallback}</code>
                </td>
              )}
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Usage() {
  return (
    <section className={css.docs}>
      <h2>Install</h2>
      <CodeView code="npm install magic-move-code" language="bash" />
      <p>
        Requires React 16.14 or newer. The only dependency is <code>prism-react-renderer</code>.
      </p>

      <h2>Mark what moves</h2>
      <p>
        Start a line with a marker comment in both snippets. Lines with the same marker name move onto each other, in
        the order they appear in <code>from</code>. Markers are hidden when rendered. Change the prefix with{' '}
        <code>matchMarkers('step')</code>, or skip markers with <code>matchLines</code> or your own matcher. The{' '}
        <a href="#playground">playground</a> writes markers for you.
      </p>
      <CodeView code={markers} />

      <h2>Examples</h2>
      {examples.map(({ title, body, code }) => (
        <div key={title}>
          <h3>{title}</h3>
          <p>{body}</p>
          <CodeView code={code} language="tsx" />
        </div>
      ))}
    </section>
  );
}

export function Api() {
  return (
    <section className={css.docs}>
      <h2>&lt;MagicMove&gt;</h2>
      <Table head={['Prop', 'Type', 'Default', 'Description']} rows={magicMoveProps} />
      <h2>MagicMoveHandle (ref)</h2>
      <Table head={['Method', 'Returns', 'Description']} rows={handleMethods} />
      <h2 id="matchers">Matchers</h2>
      <p>
        A matcher decides which lines move where. Swap it to change the strategy, e.g. markers, line diffing or an LLM
        call.
      </p>
      <Table head={['Type', 'Shape', 'Description']} rows={planTypes} />
      <p>Built in:</p>
      <Table head={['Export', 'Returns', 'Description']} rows={builtins} />
      <h2>&lt;CodeView&gt;</h2>
      <p>One highlighted pane, for custom layouts. Same styling props as MagicMove.</p>
      <Table head={['Prop', 'Type', 'Default', 'Description']} rows={codeViewProps} />
      <h2>useMagicMove(fromRef, toRef, duration = 1000)</h2>
      <p>
        Returns a <code>MagicMoveHandle</code> that animates groups under <code>fromRef</code> onto their matches under{' '}
        <code>toRef</code>.
      </p>
    </section>
  );
}
