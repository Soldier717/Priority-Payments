import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('./public/boarding.js',import.meta.url),'utf8');
function harness({missing=false,fail=false,defer=false}={}){
 const nodes={},timers=new Map(),events={},calls=[];let complete;
 class Element{
  constructor(tag='div'){this.tagName=tag;this.children=[];this.handlers={};this.dataset={};this.hidden=false;this.disabled=false;this.textContent='';}
  set id(id){this._id=id;nodes['#'+id]=this;}get id(){return this._id;}
  append(...children){for(const child of children){this.children.push(child);child.parentNode=this;}}
  prepend(child){this.children.unshift(child);child.parentNode=this;}
  replaceChildren(...children){this.children=[];this.append(...children);}
  setAttribute(){}addEventListener(name,fn){this.handlers[name]=fn;}focus(){}scrollIntoView(){}
 }
 for(const id of ['review-login','review-status','review-content','review-detail','review-list','review-more','review-confirm','review-send','review-refresh','review-logout']){const el=new Element();el.id=id;}
 const context=vm.createContext({document:{hidden:false,querySelector:s=>nodes[s]||null,createElement:tag=>new Element(tag),addEventListener:(event,fn)=>events[event]=fn},window:{addEventListener:(event,fn)=>events[event]=fn},location:{hash:'',pathname:'/boarding/review'},history:{replaceState(){}},URLSearchParams,AbortSignal,URL,console,setTimeout:(fn,ms)=>{const id=Symbol();timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),fetch:async(path,init)=>{calls.push(path);if(path==='/api/form-token')return Response.json({token:'test'});const action=path.split('/').pop();if(action==='list')return Response.json({records:[{id:'test-record',dba:'Test only',submittedAt:'2026-09-30'}],more:false});if(action==='metrics')return Response.json({counts:Object.fromEntries(['inquiry_completed','analysis_completed','report_emailed','boarding_completed'].map(k=>[k,{last30Days:0,total:0}]))});if(action==='detail')return Response.json({details:{dba:'Test only',ssn:missing?'Not provided':'•••-••-0000'},documents:[]});if(action==='reveal'){if(defer)return new Promise(resolve=>complete=()=>resolve(Response.json({ssn:'000000000'})));return fail?Response.json({error:'Test storage failure'},{status:503}):Response.json({ssn:'000000000'});}return Response.json({ok:true});}});
 vm.runInContext(source,context);
 const settle=()=>new Promise(resolve=>setImmediate(resolve));
 return {nodes,timers,events,calls,context,settle,complete:()=>complete(),open:async()=>{await settle();await nodes['#review-list'].children[0].handlers.click();}};
}
test('SSN reveal updates beside its control, formats the value and automatically remasks',async()=>{const h=harness();await h.open();const value=h.nodes['#review-ssn-value'],button=h.nodes['#review-reveal'];assert.equal(value.parentNode,button.parentNode);assert.equal(value.textContent,'•••-••-0000');await button.handlers.click();assert.equal(value.textContent,'000-00-0000');assert.equal(button.textContent,'Hide SSN');assert.match(h.nodes['#review-reveal-status'].textContent,/30 seconds/);const timer=[...h.timers.values()].find(t=>t.ms===30000);assert.ok(timer);timer.fn();assert.equal(value.textContent,'•••-••-0000');assert.equal(button.disabled,false);});
test('reveal errors appear next to the control and missing SSNs cannot be revealed',async()=>{const h=harness({fail:true});await h.open();await h.nodes['#review-reveal'].handlers.click();assert.equal(h.nodes['#review-ssn-value'].textContent,'•••-••-0000');assert.equal(h.nodes['#review-reveal-status'].textContent,'Test storage failure');assert.equal(h.nodes['#review-reveal'].disabled,false);const empty=harness({missing:true});await empty.open();assert.equal(empty.nodes['#review-reveal'].disabled,true);assert.match(empty.nodes['#review-reveal-status'].textContent,/No Social Security/);});
test('hiding the page cancels a pending reveal and manual hide clears the value',async()=>{const h=harness({defer:true});await h.open();const pending=h.nodes['#review-reveal'].handlers.click();assert.equal(h.nodes['#review-reveal'].textContent,'Revealing…');h.context.document.hidden=true;h.events.visibilitychange();h.complete();await pending;assert.equal(h.nodes['#review-ssn-value'].textContent,'•••-••-0000');const manual=harness();await manual.open();await manual.nodes['#review-reveal'].handlers.click();await manual.nodes['#review-reveal'].handlers.click();assert.equal(manual.nodes['#review-ssn-value'].textContent,'•••-••-0000');});
