import { forwardRef, type CSSProperties } from 'react';
import { Highlight, themes, type PrismTheme } from 'prism-react-renderer';
import { groupLines } from './parse.js';

export type CodeViewProps = {
  code: string;
  /** Any language bundled with prism-react-renderer. */
  language?: string;
  theme?: PrismTheme;
  /** Marker comment prefix: `/*mid-1*\/` links single lines, `/*mid-bulk-1*\/` wraps blocks. */
  markerPrefix?: string;
  className?: string;
  style?: CSSProperties;
};

/** Highlighted code with marked groups rendered as `[data-moveid]` elements. */
export const CodeView = forwardRef<HTMLPreElement, CodeViewProps>(function CodeView(
  { code, language = 'jsx', theme = themes.dracula, markerPrefix = 'mid', className, style },
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
          {groupLines(tokens, markerPrefix).map((group, i) => (
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
