import { useRef } from 'react';
import { MagicMove, matchLines, type MagicMoveHandle, type Matcher } from '../src/index.js';
import { Controls } from './Controls.js';
import css from './App.module.css';

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

export const plainFrom = `function greet(name) {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}`;

export const plainTo = `const greet = (name) => {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}

greet("world");`;

// Stands in for a real LLM call: same contract, answer arrives later.
const slowMatcher: Matcher = (from, to) =>
  new Promise((resolve) => setTimeout(() => resolve(matchLines(from, to)), 1500));

export function Demos() {
  const ref = useRef<MagicMoveHandle>(null);
  const plainRef = useRef<MagicMoveHandle>(null);
  const asyncRef = useRef<MagicMoveHandle>(null);
  return (
    <>
      <section className={css.demo}>
        <h2>With markers</h2>
        <p>
          Press play, then next. Each marked block moves onto its match. Try your own in the{' '}
          <a href="#playground">playground</a>.
        </p>
        <MagicMove ref={ref} from={from} to={to} />
        <Controls handle={ref} />
      </section>

      <section className={css.demo}>
        <h2>Without markers</h2>
        <p>
          Pass <code>{'matcher={matchLines}'}</code> and identical lines pair up automatically. <code>playAll()</code>{' '}
          moves them all at once.
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
    </>
  );
}
