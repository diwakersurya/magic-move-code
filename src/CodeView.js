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
  return moveId?<div data-moveid={moveId} className='absolute' {...getLineProps({ line, key: identifier })}>
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
function MultiLine({lines,identifier,moveId,getTokenProps,getLineProps}){
  return <div data-moveid={moveId} className='absolute' >
            {lines.map((line, key) => (
              <div {...getLineProps({ line, key: identifier })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>
            ))}
          </div>
}
function removeEmptyTokens(tokens){
    tokens=tokens.map(line=>{
        line=line.filter(token=>token.content!=="");
        return line
    })
    return tokens;
}
function processTokens(tokens){
    //create index of mid comments
    const accumulator={};
    let bulkIndex=null;
for (let index=0;index<tokens.length;index++){
    const line=tokens[index];
    const firstToken=line[0];
    let midObj={};
    midObj.movable=false;
    if(firstToken.types.indexOf("comment")!==-1 && firstToken.content.indexOf("mid")!==-1){
                //check if multiline moveid
                let midComment=firstToken.content;
                if(bulkIndex !== null && accumulator[bulkIndex].comment===midComment){
                    line.shift();
                    accumulator[bulkIndex].index=[accumulator[bulkIndex].index,index];
                    bulkIndex=null;
                    continue;
                }
                midObj.bulk=false;
                midObj.index=index;
                midObj.comment=midComment;
                midObj.movable=true;
                midObj.moveId=makeHash(midComment)
                line.shift();
                if(midComment.indexOf('bulk')!==-1){
                    midObj.bulk=true;
                    bulkIndex=index;
                }


    }
    else{
        if(bulkIndex !== null){
            continue;
        }
        midObj.movable=false;
        midObj.index=index;
    }
    accumulator[index]=midObj;
}
console.log("+++",accumulator)
return accumulator;

}
export default function CodeView({code,language='javascript'}) {
    //console.log(Prism)
    //const html=Prism.highlight(code, Prism.languages[language], language);
    // return <pre dangerouslySetInnerHTML={{__html:html}}></pre>;
    return <Highlight {...defaultProps} code={code} language="jsx">
    {({ className, style, tokens, getLineProps, getTokenProps}) => {
        //remove empty tokens in each line
        tokens=removeEmptyTokens(tokens);
        const midMap=processTokens(tokens)
      return <pre className={className} style={style}>
        {Object.keys(midMap).map((key, i) => {
            const moveConfig=midMap[key];
            if(moveConfig.movable){
                if(moveConfig.bulk){
                    const [start,end]=moveConfig.index;
                    return <MultiLine moveId={moveConfig.moveId} lines={tokens.slice(start,end)} key={i} identifier={i} getLineProps={getLineProps} getTokenProps={getTokenProps}/>
                }
            return <SingleLine moveId={moveConfig.moveId} line={tokens[moveConfig.index]} key={i} identifier={i} getLineProps={getLineProps} getTokenProps={getTokenProps}/>

            }
            return <SingleLine line={tokens[moveConfig.index]} key={i} identifier={i} getLineProps={getLineProps} getTokenProps={getTokenProps}/>

            }
        )}
      </pre>
    }}
  </Highlight>
}