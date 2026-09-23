import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties } from 'react';
import { CodeView, type CodeViewProps } from './CodeView.js';
import { matchMarkers, validMoves, type Matcher, type Move, type Plan } from './match.js';
import { useMagicMove, type MagicMoveHandle } from './useMagicMove.js';

export type MagicMoveProps = Omit<CodeViewProps, 'code' | 'ranges' | 'className' | 'style'> & {
  from: string;
  to: string;
  /** Decides which lines move where. Defaults to `matchMarkers()`; may be async. */
  matcher?: Matcher;
  /** Duration of each move in ms. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
};

const defaultMatcher = matchMarkers();

type Resolved = { from: string; to: string; moves: Move[] };

/** Runs the matcher; renders the raw code with no moves while an async matcher is pending or if it fails. */
function usePlan(from: string, to: string, matcher: Matcher): Resolved {
  const result = useMemo(() => {
    try {
      return matcher(from, to);
    } catch (error) {
      console.error('magic-move-code: matcher failed', error);
      return undefined;
    }
  }, [from, to, matcher]);
  const [settled, setSettled] = useState<{ result: unknown; plan?: Plan }>();
  const pending = result instanceof Promise ? result : undefined;
  useEffect(() => {
    if (!pending) return;
    let live = true;
    pending.then(
      (plan) => live && setSettled({ result: pending, plan }),
      (error) => console.error('magic-move-code: matcher failed', error),
    );
    return () => {
      live = false;
    };
  }, [pending]);
  const plan = pending ? (settled?.result === pending ? settled.plan : undefined) : (result as Plan | undefined);
  return useMemo(() => {
    const a = typeof plan?.from === 'string' ? plan.from : from;
    const b = typeof plan?.to === 'string' ? plan.to : to;
    return { from: a, to: b, moves: validMoves(plan?.moves, a.split('\n').length, b.split('\n').length) };
  }, [plan, from, to]);
}

const Panes = forwardRef<MagicMoveHandle, Omit<MagicMoveProps, 'matcher'> & { moves: Move[] }>(function Panes(
  { from, to, moves, duration, className, style, ...view },
  ref,
) {
  const fromRef = useRef<HTMLPreElement>(null);
  const toRef = useRef<HTMLPreElement>(null);
  const handle = useMagicMove(fromRef, toRef, duration);
  useImperativeHandle(ref, () => handle, [handle]);
  return (
    <div className={className} style={{ display: 'flex', ...style }}>
      <CodeView ref={fromRef} code={from} ranges={moves.map((m) => m.from)} {...view} style={{ flex: 1 }} />
      <CodeView ref={toRef} code={to} ranges={moves.map((m) => m.to)} {...view} style={{ flex: 1 }} />
    </div>
  );
});

/** Two code panes side by side; drive the animation through the ref. */
export const MagicMove = forwardRef<MagicMoveHandle, MagicMoveProps>(function MagicMove(
  { from, to, matcher = defaultMatcher, ...rest },
  ref,
) {
  const plan = usePlan(from, to, matcher);
  // Remount when the plan changes so the animation state never points at stale DOM.
  const key = JSON.stringify([plan, rest.language]);
  return <Panes key={key} ref={ref} {...rest} {...plan} />;
});
