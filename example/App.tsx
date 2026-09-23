import { useEffect, useState } from 'react';
import { Demos } from './Demos.js';
import { Api, Usage } from './Docs.js';
import { Playground } from './Playground.js';
import css from './App.module.css';

const tabs = [
  { id: 'demos', label: 'Demos' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'API' },
  { id: 'playground', label: 'Playground' },
] as const;

type Tab = (typeof tabs)[number]['id'];

/** `#<tab>` or `#<tab>/<data>`; unknown tabs fall back to the first. */
function readHash(): { tab: Tab; data?: string } {
  const [id, data] = location.hash.slice(1).split('/');
  const tab = tabs.find((t) => t.id === id)?.id ?? 'demos';
  return { tab, data };
}

export function App() {
  const [initial] = useState(readHash);
  const [tab, setTab] = useState<Tab>(initial.tab);

  useEffect(() => {
    const onHash = () => setTab(readHash().tab);
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  return (
    <main className={css.main}>
      <h1>Magic Move Code</h1>
      <p>Animate code from one snippet to another, Keynote magic-move style.</p>
      <div className={css.links}>
        <a href="https://github.com/diwakersurya/magic-move-code">GitHub</a>
        <a href="https://www.npmjs.com/package/magic-move-code">npm</a>
      </div>

      <nav className={css.tabs} role="tablist" aria-label="Sections">
        {tabs.map((t) => (
          <a
            key={t.id}
            id={`tab-${t.id}`}
            href={`#${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className={css.tab}
          >
            {t.label}
          </a>
        ))}
      </nav>

      {/* Panels stay mounted so the playground keeps its state across tab switches. */}
      {tabs.map((t) => (
        <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={tab !== t.id}>
          {t.id === 'demos' && <Demos />}
          {t.id === 'usage' && <Usage />}
          {t.id === 'api' && <Api />}
          {t.id === 'playground' && (
            <Playground
              initial={initial.tab === 'playground' ? initial.data : undefined}
              active={tab === 'playground'}
            />
          )}
        </div>
      ))}
    </main>
  );
}
