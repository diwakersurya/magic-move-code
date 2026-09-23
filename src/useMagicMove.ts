import { useCallback, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';

export type MagicMoveHandle = {
  /** Plays the first move if nothing has moved yet. */
  start(): void;
  /** Moves the next marked group; returns false when there is nothing left. */
  next(): boolean;
  /** Puts everything back to the initial state. */
  reset(): void;
};

const movables = (root: HTMLElement | null) =>
  Array.from(root?.querySelectorAll<HTMLElement>('[data-moveid]') ?? []);

/**
 * Animates each `[data-moveid]` element under `fromRef`, in document order, onto the element
 * with the same id under `toRef`. Targets stay hidden until their source lands on them.
 */
export function useMagicMove(
  fromRef: RefObject<HTMLElement | null>,
  toRef: RefObject<HTMLElement | null>,
  duration = 1000,
): MagicMoveHandle {
  const step = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    step.current = 0;
    for (const el of movables(fromRef.current)) {
      Object.assign(el.style, { transition: '', transform: '', opacity: '', visibility: '' });
    }
    for (const el of movables(toRef.current)) el.style.opacity = '0';
  }, [fromRef, toRef]);

  const next = useCallback(() => {
    const source = movables(fromRef.current)[step.current];
    if (!source) return false;
    step.current++;
    const target = movables(toRef.current).find((el) => el.dataset.moveid === source.dataset.moveid);
    const ms = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration;
    source.style.transition = `transform ${ms}ms ease-in-out, opacity ${ms}ms ease-in-out`;
    if (target) {
      const a = source.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      source.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px)`;
    } else {
      source.style.opacity = '0';
    }
    timers.current.push(
      setTimeout(() => {
        source.style.visibility = 'hidden';
        if (target) target.style.opacity = '1';
      }, ms),
    );
    return true;
  }, [fromRef, toRef, duration]);

  const start = useCallback(() => {
    if (step.current === 0) next();
  }, [next]);

  useLayoutEffect(() => {
    reset();
    return () => timers.current.forEach(clearTimeout);
  }, [reset]);

  return useMemo(() => ({ start, next, reset }), [start, next, reset]);
}
