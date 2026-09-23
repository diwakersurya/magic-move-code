import { forwardRef, useImperativeHandle, useRef, type CSSProperties } from 'react';
import { CodeView, type CodeViewProps } from './CodeView.js';
import { useMagicMove, type MagicMoveHandle } from './useMagicMove.js';

export type MagicMoveProps = Omit<CodeViewProps, 'code' | 'className' | 'style'> & {
  from: string;
  to: string;
  /** Duration of each move in ms. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
};

const Panes = forwardRef<MagicMoveHandle, MagicMoveProps>(function Panes(
  { from, to, duration, className, style, ...view },
  ref,
) {
  const fromRef = useRef<HTMLPreElement>(null);
  const toRef = useRef<HTMLPreElement>(null);
  const handle = useMagicMove(fromRef, toRef, duration);
  useImperativeHandle(ref, () => handle, [handle]);
  return (
    <div className={className} style={{ display: 'flex', ...style }}>
      <CodeView ref={fromRef} code={from} {...view} style={{ flex: 1 }} />
      <CodeView ref={toRef} code={to} {...view} style={{ flex: 1 }} />
    </div>
  );
});

/** Two code panes side by side; drive the animation through the ref. */
export const MagicMove = forwardRef<MagicMoveHandle, MagicMoveProps>(function MagicMove(props, ref) {
  // Remount on content change so the animation state never points at stale DOM.
  const key = [props.from, props.to, props.language, props.markerPrefix].join('\0');
  return <Panes key={key} ref={ref} {...props} />;
});
