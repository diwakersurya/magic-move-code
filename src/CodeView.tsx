import { forwardRef, type CSSProperties } from 'react';
import { Highlight, themes, type PrismTheme } from 'prism-react-renderer';
import type { Range } from './match.js';
import { groupLines } from './parse.js';

export type CodeViewProps = {
  code: string;
  /** Any language bundled with prism-react-renderer. */
  language?: string;
  theme?: PrismTheme;
  /** Line ranges to render as movable groups; `ranges[i]` gets `data-moveid="i"`. */
  ranges?: (Range | undefined)[];
  className?: string;
  style?: CSSProperties;
};

/** Highlighted code with each range rendered as a `[data-moveid]` element. */
export const CodeView = forwardRef<HTMLPreElement, CodeViewProps>(function CodeView(
  { code, language = 'jsx', theme = themes.dracula, ranges, className, style },
  ref,
) {
  return (
    <Highlight code={code} language={language} theme={theme}>
      {({ className: prismClass, style: prismStyle, tokens, getLineProps, getTokenProps }) => (
        <pre
          ref={ref}
          className={className ? `${prismClass} ${className}` : prismClass}
          style={{ margin: 0, padding: '1em', ...prismStyle, ...style, overflow: 'visible' }}
        >
          {groupLines(tokens, ranges).map((group, i) => (
            <div key={i} data-moveid={group.id}>
              {group.lines.map((line, j) => (
                <div key={j} {...getLineProps({ line })}>
                  {line.map((token, k) => (
                    <span key={k} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
});
