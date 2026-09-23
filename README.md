# Magic Move Code

React component that animates code from one snippet to another, Keynote magic-move style. ✌️

**[Live demo](https://diwakersurya.github.io/magic-move-code/)** · **[Playground](https://diwakersurya.github.io/magic-move-code/#playground)**: paste two snippets, click to link lines, copy the marked-up props.

## Install

```sh
npm install magic-move-code
```

## Use

```tsx
import { useRef } from 'react';
import { MagicMove, type MagicMoveHandle } from 'magic-move-code';

const from = `/*mid-1*/ import add from "./add";
/*mid-bulk-2*/ const add5 = x => {
  return add(x, 5);
/*mid-bulk-2*/ };`;

const to = `/*mid-1*/const dependencies = ["add"];
function fn(dependencies) {
/*mid-bulk-2*/  const add5 = x => {
    return add(x, 5);
/*mid-bulk-2*/  };
}`;

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
}
```

### Markers (default)

Start a line with a marker comment in both snippets. Lines with the same marker name move onto each other, in the order they appear in `from`. Markers are stripped when rendered.

- `/*mid-<name>*/` marks one line.
- `/*mid-bulk-<name>*/` opens a block that ends at the next line starting with the same marker.
- Pairing is by `<name>`, so `/*mid-2*/` in `from` can move onto a `/*mid-bulk-2*/` block in `to`.

Use another prefix with `matcher={matchMarkers('step')}` (create it once, outside the component).

### Without markers

```tsx
import { MagicMove, matchLines } from 'magic-move-code';

<MagicMove ref={ref} from={from} to={to} matcher={matchLines} />
```

Identical lines (ignoring indentation) pair up automatically; repeated lines like `}` pair by occurrence. Lines that only exist in `to` are shown from the start, lines that only exist in `from` fade out. Call `ref.current.playAll()` to move everything at once.

### Custom matchers (e.g. an LLM)

A matcher decides which lines move where. It is a plain function, sync or async:

```ts
type Range = [start: number, end: number];                 // 0-based, inclusive lines
type Move = { from: Range; to?: Range };                   // no `to` → fades out
type Plan = { from?: string; to?: string; moves: Move[] }; // from/to optionally replace the rendered code
type Matcher = (from: string, to: string) => Plan | Promise<Plan>;
```

```tsx
const llmMatcher: Matcher = async (from, to) => {
  const res = await fetch('/api/magic-move', { method: 'POST', body: JSON.stringify({ from, to }) });
  if (!res.ok) throw new Error(`match failed: ${res.status}`);
  return { moves: await res.json() }; // [{ "from": [0, 2], "to": [3, 5] }, ...]
};

<MagicMove from={from} to={to} matcher={llmMatcher} />
```

- Moves play in array order.
- Malformed, out-of-bounds or overlapping moves are dropped (`validMoves`).
- While a promise is pending, or if it rejects, the code renders without moves.
- Keep the matcher's identity stable (module scope or `useCallback`), or it re-runs on every render.

Built in: `matchMarkers(prefix = 'mid')` (default) and `matchLines`.

### `<MagicMove>` props

| Prop                 | Type         | Default          |                                                |
| -------------------- | ------------ | ---------------- | ---------------------------------------------- |
| `from`, `to`         | `string`     | —                | Code for the left and right panes              |
| `matcher`            | `Matcher`    | `matchMarkers()` | Decides which lines move where                 |
| `language`           | `string`     | `'jsx'`          | Any language bundled with prism-react-renderer |
| `theme`              | `PrismTheme` | `themes.dracula` | `themes` is re-exported                        |
| `duration`           | `number`     | `1000`           | ms per move (0 under `prefers-reduced-motion`) |
| `className`, `style` |              |                  | Applied to the wrapper                         |

Ref methods: `start()` plays the first move, `next()` plays the next one (returns `false` when done), `playAll()` plays all remaining moves at once, `reset()` puts everything back.

### Custom layouts

`CodeView` renders one pane; pass it `ranges` (each move's `from` or `to`). `useMagicMove(fromRef, toRef, duration)` returns the same handle as the ref, so you can place the panes wherever you like.

## Develop

```sh
npm install
npm run dev          # example site at http://localhost:5173/magic-move-code/
npm test
npm run build        # library → dist/
npm run build:site   # example site → site/
```

The example in `example/` is deployed to [GitHub Pages](https://diwakersurya.github.io/magic-move-code/) on every push to `master`.
