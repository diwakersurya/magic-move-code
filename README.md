# Magic Move Code

React component that animates code from one snippet to another, Keynote magic-move style. ✌️

**[Live demo](https://diwakersurya.github.io/magic-move-code/)**

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

### Markers

Start a line with a marker comment in both snippets. Lines with the same marker move onto each other, in the order they appear in `from`. Markers are stripped when rendered.

- `/*mid-<name>*/` marks one line.
- `/*mid-bulk-<name>*/` opens a block that ends at the next line starting with the same marker.

Change `mid` with the `markerPrefix` prop.

### `<MagicMove>` props

| Prop           | Type          | Default          |                                                  |
| -------------- | ------------- | ---------------- | ------------------------------------------------ |
| `from`, `to`   | `string`      | —                | Code for the left and right panes                |
| `language`     | `string`      | `'jsx'`          | Any language bundled with prism-react-renderer   |
| `theme`        | `PrismTheme`  | `themes.dracula` | `themes` is re-exported                          |
| `markerPrefix` | `string`      | `'mid'`          |                                                  |
| `duration`     | `number`      | `1000`           | ms per move (0 under `prefers-reduced-motion`)   |
| `className`, `style` |         |                  | Applied to the wrapper                           |

Ref methods: `start()` plays the first move, `next()` plays the next one (returns `false` when done), `reset()` puts everything back.

### Custom layouts

`CodeView` renders one pane and `useMagicMove(fromRef, toRef, duration)` returns the same `{ start, next, reset }`, so you can place the panes wherever you like.

## Develop

```sh
npm install
npm run dev          # example site at http://localhost:5173/magic-move-code/
npm test
npm run build        # library → dist/
npm run build:site   # example site → site/
```

The example in `example/` is deployed to [GitHub Pages](https://diwakersurya.github.io/magic-move-code/) on every push to `master`.
