import React from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-dark.css';
import './App.css';
import useMagicMove from './MagicMove';
import CodeView from "./CodeView";

const codeFragmentOne=`/* This is how a module looks like*/
/* dependencies*/
/*mid-1*/ import add from "./add";
/* body */
/*mid-bulk-3*/ const add5 = x => {
    return add(x, 5);
/*mid-bulk-3*/ };
/* output*/
/*mid-bulk-2*/ export { add5 };
/*mid-bulk-2*/
`

const codeFragmentTwo=`/* This is what your sandbox
 * understands and executes */
/*mid-1*/const dependencies = ["add"];

function  fn(dependencies) {
/*mid-bulk-3*/  const add5 = x => {
          return add(x, 5);
/*mid-bulk-3*/  };
/*mid-bulk-2*/  const output = {"add5":add5};
/*mid-bulk-2*/  return output;
}`

function App() {
  const componentRef1=React.useRef(null);
  const componentRef2=React.useRef(null);
  const [start,next,reload]=useMagicMove(componentRef1,componentRef2);
  return (
    <div className="App">
    <div className='components'>
    <div className="component-one" ref={componentRef1}>
      <CodeView code={codeFragmentOne}/>
    </div>
    <div className="component-two" ref={componentRef2}>
       <CodeView code={codeFragmentTwo}/>
    </div>
    </div>
 <div className="controls">
                         <div
                            className="controls__item controls__item--reset"
                            onClick={reload}></div>
                        <div
                            className="controls__item controls__item--start"
                            onClick={start}></div>
                        <div
                            className="controls__item controls__item--next"
                            onClick={next}></div>
                    </div>
    </div>
  );
}

export default App;
