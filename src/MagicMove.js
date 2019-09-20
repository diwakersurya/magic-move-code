import React from 'react';

/** from Kent. C. Dodds dev tips */
function makeChildrenAbsolute(el) {
  const rect = el.getBoundingClientRect()
  Object.assign(el.style, {
    position: 'relative',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    padding:'0px',
    margin:'0px',
    border:'0px'
  })


  const allEls =Array.from(el.querySelectorAll('pre > div'))
  allEls.forEach(child => {
    const {top, left,height} = child.getBoundingClientRect()
    child.positionStyles = {
        position: 'absolute',
        top: `${top - rect.top}px`,
        left: `${left - rect.left}px`,
        width: `${rect.width}px`,
        height: `${height}px`
    }
  })
  allEls.forEach(node => {
    Object.assign(node.style, node.positionStyles)
  })
}
function getPositionProps(element){
const {top,left}=element.getBoundingClientRect();
return {top,left};
}

function findRecieverElement(moveId,element){
    console.log(`[data-moveId="${moveId}"]`)
    return element.querySelector(`[data-moveid="${moveId}"]`)
}
export default function useMagicMove(componentRef1,componentRef2){
    const [styleMap,setStyleMap]=React.useState({});
    const [moveIndex,setMoveIndex]=React.useState(null);

    const next=React.useCallback(()=>{
        setMoveIndex(moveIndex+1)
    },[moveIndex])
    const start=React.useCallback(()=>{
        setMoveIndex(0)
    },[])
    React.useEffect(()=>{
        if(componentRef1 && componentRef1.current){
        //first of all .. make everything absolute
        makeChildrenAbsolute(componentRef1.current)
        makeChildrenAbsolute(componentRef2.current)
        }
    },[componentRef1,componentRef2])

    React.useEffect(()=>{
        if(componentRef2 && componentRef2.current){
            //componentRef2.current.style.display="none";
            //create map of styles for each child
            const parentElement=componentRef2.current.querySelector("pre");
              const initialStyleMap=[...parentElement.children].reduce((accumulator,child,index)=>{
                  //check for moveId
                  const moveId=child.dataset.moveid;
                  if(typeof moveId !== "undefined"){
                    accumulator[moveId]=getPositionProps(child);

                  }
                   return accumulator;
         },{})
         setStyleMap(initialStyleMap)
        }
    },[componentRef2])

    React.useEffect(()=>{
        if(moveIndex===null){
            return;
        }
        if(componentRef1 && componentRef1.current){
         //forEach child in react component 1,
         //find the style in react component 2 and
         //set the style with transition
         const parentElement=componentRef1.current.querySelector("pre");
         const magicElements=parentElement.querySelectorAll("[data-moveid]");
         if(moveIndex>=magicElements.length){
             return;
         }
         const currentMagicElement=magicElements[moveIndex];

            const moveId=currentMagicElement.dataset.moveid;
             if(typeof moveId !=="undefined" && styleMap[moveId]){
                const currentRecieverElement=findRecieverElement(moveId,componentRef2.current);
                 currentRecieverElement.style.transition="all 1s ease-in-out";
                currentRecieverElement.style.opacity=0;
                currentMagicElement.style.transition="all 1s ease-in-out";
               for (let [key, value] of Object.entries(styleMap[moveId])) {
                    currentMagicElement.style[key]=`${value}px`;
                }
                // remove the existing reciever element from dom.
                currentMagicElement.addEventListener('transitionend', () => {
                    if(currentRecieverElement){
                        currentRecieverElement.style.opacity="1";}
                    currentMagicElement.style.opacity=0;
                });

             }
         }
        },[componentRef1,styleMap,moveIndex,componentRef2])
        return[start,next]
}
