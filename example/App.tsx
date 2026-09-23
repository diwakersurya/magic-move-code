import { useRef } from 'react';
import { CodeView, MagicMove, type MagicMoveHandle } from '../src/index.js';
import play from './play.png';
import next from './next.png';
import refresh from './refresh.png';

const from = `/* This is how a module looks like*/
/* dependencies*/
/*mid-1*/ import add from "./add";
/* body */
/*mid-bulk-3*/ const add5 = x => {
    return add(x, 5);
/*mid-bulk-3*/ };
/* output*/
/*mid-bulk-2*/ export { add5 };
/*mid-bulk-2*/
`;

const to = `/* This is what your sandbox
 * understands and executes */
/*mid-1*/const dependencies = ["add"];

function  fn(dependencies) {
/*mid-bulk-3*/  const add5 = x => {
          return add(x, 5);
/*mid-bulk-3*/  };
/*mid-bulk-2*/  const output = {"add5":add5};
/*mid-bulk-2*/  return output;
}`;

const usage = `import { useRef } from 'react';
import { MagicMove, type MagicMoveHandle } from 'magic-move-code';

export function Demo() {
  const ref = useRef<MagicMoveHandle>(null);
  return (
    <>
      <MagicMove ref={ref} from={from} to={to} language="jsx" duration={1000} />
      <button onClick={() => ref.current?.start()}>Play</button>
      <button onClick={() => ref.current?.next()}>Next</button>
      <button onClick={() => ref.current?.reset()}>Reset</button>
    </>
  );
}`;

const markers = `/*mid-1*/ const a = 1;      // single line, id "mid-1"
/*mid-bulk-2*/ function f() {  // block starts, id "mid-bulk-2"
  return a;
/*mid-bulk-2*/ }               // same marker closes the block`;

export function App() {
  const ref = useRef<MagicMoveHandle>(null);
  return (
    <main>
      <h1>Magic Move Code</h1>
      <p>Animate code from one snippet to another, Keynote magic-move style. Press play, then next.</p>
      <div className="links">
        <a href="https://github.com/diwakersurya/magic-move-code">GitHub</a>
        <a href="https://www.npmjs.com/package/magic-move-code">npm</a>
      </div>

      <section className="demo">
        <MagicMove ref={ref} from={from} to={to} style={{ marginTop: 32 }} />
        <div className="controls">
          <button aria-label="Reset" onClick={() => ref.current?.reset()}>
            <img src={refresh} alt="" />
          </button>
          <button aria-label="Play" onClick={() => ref.current?.start()}>
            <img src={play} alt="" />
          </button>
          <button aria-label="Next" onClick={() => ref.current?.next()}>
            <img src={next} alt="" />
          </button>
        </div>
      </section>

      <section className="snippet">
        <h2>Install</h2>
        <CodeView code="npm install magic-move-code" language="bash" />
        <h2>Use</h2>
        <CodeView code={usage} language="tsx" />
        <h2>Mark what moves</h2>
        <p>
          Start a line with a marker comment in both snippets. Lines with the same marker move onto each other, in
          the order they appear in <code>from</code>. Markers are hidden when rendered. Change the prefix with{' '}
          <code>markerPrefix</code> (default <code>mid</code>).
        </p>
        <CodeView code={markers} markerPrefix="none" />
      </section>
    </main>
  );
}
