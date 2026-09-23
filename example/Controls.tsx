import type { RefObject } from 'react';
import type { MagicMoveHandle } from '../src/index.js';
import css from './App.module.css';
import play from './play.png';
import next from './next.png';
import refresh from './refresh.png';

export function Controls({ handle, all }: { handle: RefObject<MagicMoveHandle | null>; all?: boolean }) {
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
