import React from 'react';
import logo from './logo.svg';
import { highlight, languages } from 'prismjs/components/prism-core';
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
/*mid-bulk-3*/};
/* output*/
/*mid-2*/ export { add5 };`

const codeFragmentTwo=`/* This is what your sandbox
 * understands and executes */
/*mid-1*/const dependencies = ["add"];
/*mid-2*/const output = ["add5"];
function  fn(dependencies) {
/*mid-bulk-3*/  const add5 = x => {
          return add(x, 5);
/*mid-bulk-3*/  };
  return output;
}`

function App() {
  const componentRef1=React.useRef(null);
  const componentRef2=React.useRef(null);
  const [start,next]=useMagicMove(componentRef1,componentRef2);
  return (
    <div className="App">
    <div className='components'>
    <div className="component-one" ref={componentRef1}>
      <CodeView code={codeFragmentOne}/>
      {/* <div className="token" data-moveid='1'>code 1</div>
      <div className="token" data-moveid="2">code 2</div> */}
    </div>
    <div className="component-two" ref={componentRef2}>
      {/* <div className="token" data-moveid='2'>code 1</div>
      <div className="token" data-moveid="1">code 2</div> */}
       <CodeView code={codeFragmentTwo}/>
    </div>
    </div>
 <div className="controls">
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
