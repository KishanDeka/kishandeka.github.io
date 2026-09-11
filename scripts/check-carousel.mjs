import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
function scenario(reduced=false){
 const timers=new Map();let tid=0;
 const element=()=>({handlers:{},style:{},dataset:{},textContent:'',setAttribute(){},addEventListener(k,f){this.handlers[k]=f;},querySelectorAll(){return [];}});
 const roots=[0,1].map(()=>{
  const root=element(),track=element(),play=element(),windowEl=element(),count=element(),announcement=element(),prev=element(),next=element();
  const dots=[element(),element(),element()];const slides=dots.map((_,i)=>({...element(),querySelector(){return {textContent:`Project ${i}`};}}));
  const selectors={'.slide-track':track,'[data-play]':play,'.slide-window':windowEl,'[data-count]':count,'[data-announcement]':announcement,'[data-prev]':prev,'[data-next]':next};
  root.querySelector=s=>s===':focus-visible'?(root.keyboardFocus?{}:null):selectors[s];root.querySelectorAll=s=>s==='.slide'?slides:s==='[data-slide]'?dots:[];root.contains=()=>true;
  return Object.assign(root,{track,play,next});
 });
 const context={window:{matchMedia:()=>({matches:reduced,addEventListener(){}})},document:{hidden:false,addEventListener(){},querySelectorAll:s=>s==='[data-carousel]'?roots:[]},setTimeout(fn,ms){assert.equal(ms,5500);timers.set(++tid,fn);return tid;},clearTimeout(id){timers.delete(id);}};
 vm.runInNewContext(fs.readFileSync('dist/assets/site.js','utf8'),context);
 const tick=()=>{const callbacks=[...timers.values()];timers.clear();callbacks.forEach(f=>f());};
 return {roots,timers,tick};
}
let s=scenario();assert.equal(s.timers.size,2);s.tick();s.roots.forEach(r=>assert.equal(r.track.style.transform,'translateX(-100%)'));
const r=s.roots[0];r.handlers.mouseenter();assert.equal(s.timers.size,1);s.tick();assert.equal(r.track.style.transform,'translateX(-100%)');
r.handlers.focusin();r.handlers.mouseleave();assert.equal(s.timers.size,2);s.tick();assert.equal(r.track.style.transform,'translateX(-200%)');
r.keyboardFocus=true;r.handlers.focusin();assert.equal(s.timers.size,1);r.handlers.mouseleave();assert.equal(s.timers.size,1);
r.keyboardFocus=false;r.handlers.focusout({relatedTarget:null});assert.equal(s.timers.size,2);
r.play.handlers.click();assert.equal(s.timers.size,1);r.handlers.mouseenter();r.handlers.mouseleave();assert.equal(s.timers.size,1);
r.next.handlers.click();assert.equal(r.track.style.transform,'translateX(-0%)');r.play.handlers.click();assert.equal(s.timers.size,2);
s=scenario(true);assert.equal(s.timers.size,0);assert.equal(s.roots[0].play.textContent,'Play');s.roots[0].next.handlers.click();assert.equal(s.roots[0].track.style.transform,'translateX(-100%)');
console.log('PASS: two independent 5500ms timers, hover pause/resume, mouse-focus recovery, keyboard-focus pause, manual controls, reduced motion. DOM harness; not browser QA.');
