import React from 'react'
// import Prism from './moveIdAppender';
import Highlight, { defaultProps } from "prism-react-renderer";
// We don't want to track the active descendant with indexes because nothing is
// more annoying in a combobox than having it change values RIGHT AS YOU HIT
// ENTER. That only happens if you use the index as your data, rather than
// *your data as your data*. We use this to generate a unique ID based on the
// value of each item.  This function is short, sweet, and good enough™ (I also
// don't know how it works, tbqh)
// https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
const makeHash = str => {
  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};
function SingleLine({line,identifier,moveId,getTokenProps,getLineProps}){
  return moveId?<div data-moveid={moveId} {...getLineProps({ line, key: identifier })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>:
          <div {...getLineProps({ line, key: identifier })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>
}
export default function CodeView({code,language='javascript'}) {
    //console.log(Prism)
    //const html=Prism.highlight(code, Prism.languages[language], language);
    // return <pre dangerouslySetInnerHTML={{__html:html}}></pre>;
    return <Highlight {...defaultProps} code={code} language="jsx">
    {({ className, style, tokens, getLineProps, getTokenProps}) => {
      return <pre className={className} style={style}>
        {tokens.map((line, i) => {
            line=line.filter(({content})=>content!=="")
            //check if first token is comment and extract moveId from it
            let moveId=null;
            if(line[0].types.indexOf("comment")!==-1 && line[0].content.indexOf("mid")!==-1){
                const midComment=line.shift();
                //if mid-bulk-{identifier}, then bulk comment, find end
                if(line[0].content.indexOf("bulk") !== -1){
                    //find the line
                }
                moveId=makeHash(midComment.content)
            }
            return <SingleLine moveId={moveId} line={line} key={i} identifier={i} getLineProps={getLineProps} getTokenProps={getTokenProps}/>
          }
        )}
      </pre>
    }}
  </Highlight>
}