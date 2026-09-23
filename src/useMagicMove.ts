import { useCallback, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';

export type MagicMoveHandle = {
  /** Plays the first move if nothing has moved yet. */
  start(): void;
  /** Moves the next marked group; returns false when there is nothing left. */
  next(): boolean;
  /** Moves everything that is left at once. */
  playAll(): void;
  /** Puts everything back to the initial state. */
  reset(): void;
};

/** `[data-moveid]` elements, in play order: numeric ids ascending, then document order. */
const movables = (root: HTMLElement | null) =>
  Array.from(root?.querySelectorAll<HTMLElement>('[data-moveid]') ?? []).sort(
    (a, b) => (Number(a.dataset.moveid) || 0) - (Number(b.dataset.moveid) || 0),
  );

/**
 * Animates each `[data-moveid]` element under `fromRef`, in play order, onto the element
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
    const ids = new Set<string | undefined>();
    for (const el of movables(fromRef.current)) {
      ids.add(el.dataset.moveid);
      Object.assign(el.style, { transition: '', transform: '', opacity: '', visibility: '' });
    }
    // Targets nothing moves onto stay visible.
    for (const el of movables(toRef.current)) el.style.opacity = ids.has(el.dataset.moveid) ? '0' : '';
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

  const playAll = useCallback(() => {
    while (next());
  }, [next]);

  useLayoutEffect(() => {
    reset();
    return () => timers.current.forEach(clearTimeout);
  }, [reset]);

  return useMemo(() => ({ start, next, playAll, reset }), [start, next, playAll, reset]);
}
