import { useRef, type RefObject } from 'react';
import { MagicMove, matchLines, type MagicMoveHandle, type Matcher } from '../src/index.js';
import { Docs } from './Docs.js';
import css from './App.module.css';
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

const plainFrom = `function greet(name) {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}`;

const plainTo = `const greet = (name) => {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}

greet("world");`;

// Stands in for a real LLM call: same contract, answer arrives later.
const slowMatcher: Matcher = (from, to) => new Promise((resolve) => setTimeout(() => resolve(matchLines(from, to)), 1500));

function Controls({ handle, all }: { handle: RefObject<MagicMoveHandle | null>; all?: boolean }) {
  return (
    <div className={css.controls}>
      <button aria-label="Reset" onClick={() => handle.current?.reset()}>
        <img src={refresh} alt="" />
      </button>
      <button aria-label="Play" onClick={() => (all ? handle.current?.playAll() : handle.current?.start())}>
        <img src={play} alt="" />
      </button>
      {!all && (
        <button aria-label="Next" onClick={() => handle.current?.next()}>
          <img src={next} alt="" />
        </button>
      )}
    </div>
  );
}

export function App() {
  const ref = useRef<MagicMoveHandle>(null);
  const plainRef = useRef<MagicMoveHandle>(null);
  const asyncRef = useRef<MagicMoveHandle>(null);
  return (
    <main className={css.main}>
      <h1>Magic Move Code</h1>
      <p>Animate code from one snippet to another, Keynote magic-move style. Press play, then next.</p>
      <div className={css.links}>
        <a href="https://github.com/diwakersurya/magic-move-code">GitHub</a>
        <a href="https://www.npmjs.com/package/magic-move-code">npm</a>
      </div>

      <section className={css.demo}>
        <MagicMove ref={ref} from={from} to={to} style={{ marginTop: 32 }} />
        <Controls handle={ref} />
      </section>

      <section className={css.demo}>
        <h2>Without markers</h2>
        <p>
          Pass <code>{'matcher={matchLines}'}</code> and identical lines pair up automatically. <code>playAll()</code> moves them
          all at once.
        </p>
        <MagicMove ref={plainRef} from={plainFrom} to={plainTo} matcher={matchLines} />
        <Controls handle={plainRef} all />
      </section>

      <section className={css.demo}>
        <h2>Async matcher</h2>
        <p>
          A matcher can return a promise, e.g. from an LLM call. This one waits 1.5 s before answering; until then the
          code renders as-is.
        </p>
        <MagicMove ref={asyncRef} from={plainFrom} to={plainTo} matcher={slowMatcher} />
        <Controls handle={asyncRef} all />
      </section>

      <Docs />
    </main>
  );
}
