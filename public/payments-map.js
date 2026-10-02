import {createGraph} from './payments-map-data.js';
const svg=document.querySelector('#payments-graph');
if(svg){
 const {nodes,edges}=createGraph(), byId=new Map(nodes.map(n=>[n.id,n])), elements=new Map(), ns='http://www.w3.org/2000/svg';
 let selected='guided',view={x:0,y:0,w:1500,h:1150},gesture=null;
 const make=(tag,attrs,parent)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);parent.append(el);return el;};
 const edgeLayer=make('g',{'aria-hidden':'true'},svg),nodeLayer=make('g',{},svg);
 const lines=edges.map(e=>({...e,el:make('line',{class:'map-edge'},edgeLayer)}));
 for(const n of nodes){
  const g=make('g',{class:`map-node ${n.kind}`,tabindex:'0',role:'button','aria-label':n.label,'data-id':n.id},nodeLayer);
  make('circle',{r:n.kind==='root'?59:n.kind==='category'?36:14,fill:n.color},g);
  const label=make('text',{y:n.kind==='root'?83:n.kind==='category'?59:35,'text-anchor':'middle'},g);if(n.kind==='service'){const words=n.label.split(' ');let line='',row=0;for(const word of words){if(line.length+word.length>18&&line){const span=make('tspan',{x:0,dy:row?21:0},label);span.textContent=line;row++;line='';}line+=(line?' ':'')+word;}const span=make('tspan',{x:0,dy:row?21:0},label);span.textContent=line;}else label.textContent=n.label;
  if(n.kind==='root'){const monogram=make('text',{y:9,'text-anchor':'middle',class:'map-monogram'},g);monogram.textContent='GP';}
  g.addEventListener('click',()=>select(n.id));
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(n.id);}const delta={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key];if(delta){e.preventDefault();n.x+=delta[0];n.y+=delta[1];draw();}});
  elements.set(n.id,g);
 }
 function draw(){for(const n of nodes)elements.get(n.id).setAttribute('transform',`translate(${n.x},${n.y})`);for(const e of lines){const a=byId.get(e.source),b=byId.get(e.target);for(const [k,v] of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))e.el.setAttribute(k,v);}svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);}
 function select(id){
  const n=byId.get(id);if(!n)return;selected=id;
  document.querySelector('#map-find').value=id;document.querySelector('#map-title').textContent=n.label;document.querySelector('#map-description').textContent=n.description;
  const link=document.querySelector('#map-link');link.hidden=!n.url;if(n.url){link.href=n.url;link.textContent=n.url.startsWith('tel:')?'Call Sean →':'Explore this service →';}
  const connected=new Set(edges.filter(e=>e.source===id||e.target===id).map(e=>e.source===id?e.target:e.source));
  for(const other of nodes){const el=elements.get(other.id);el.classList.toggle('selected',other.id===id);el.classList.toggle('related',connected.has(other.id));el.setAttribute('aria-pressed',String(other.id===id));}
  for(const e of lines)e.el.classList.toggle('active',e.source===id||e.target===id);
  const list=document.querySelector('#map-connections');list.replaceChildren();for(const key of connected){const b=document.createElement('button');b.textContent=byId.get(key).label;b.addEventListener('click',()=>{select(key);reveal(byId.get(key));});list.append(b);}
  document.querySelector('#map-status').textContent=`Selected ${n.label}. ${connected.size} connected services.`;
 }
 function point(e){const matrix=svg.getScreenCTM();return new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());}
 function reveal(n){if(n.x<view.x+60||n.x>view.x+view.w-60||n.y<view.y+60||n.y>view.y+view.h-60){view.x=n.x-view.w/2;view.y=n.y-view.h/2;draw();}}
 function fit(){const minX=Math.min(...nodes.map(n=>n.x))-135,minY=Math.min(...nodes.map(n=>n.y))-90,maxX=Math.max(...nodes.map(n=>n.x))+135,maxY=Math.max(...nodes.map(n=>n.y))+90;view={x:minX,y:minY,w:maxX-minX,h:maxY-minY};draw();}
 function zoom(factor,anchor={x:view.x+view.w/2,y:view.y+view.h/2}){const w=Math.max(300,Math.min(3600,view.w*factor)),ratio=w/view.w;view={x:anchor.x-(anchor.x-view.x)*ratio,y:anchor.y-(anchor.y-view.y)*ratio,w,h:view.h*ratio};draw();}
 svg.addEventListener('pointerdown',e=>{if(e.button!==0||gesture)return;const target=e.target.closest('[data-id]'),p=point(e);gesture={pointer:e.pointerId,id:target?.dataset.id,start:p,clientX:e.clientX,clientY:e.clientY,moved:false,view:{...view},node:target?{...byId.get(target.dataset.id)}:null};svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');});
 svg.addEventListener('pointermove',e=>{if(!gesture||gesture.pointer!==e.pointerId)return;const p=point(e);if(Math.hypot(e.clientX-gesture.clientX,e.clientY-gesture.clientY)>4)gesture.moved=true;if(gesture.id){const n=byId.get(gesture.id);n.x=gesture.node.x+p.x-gesture.start.x;n.y=gesture.node.y+p.y-gesture.start.y;}else{const matrix=svg.getScreenCTM();view.x-= (e.clientX-gesture.clientX)/matrix.a;view.y-= (e.clientY-gesture.clientY)/matrix.d;gesture.clientX=e.clientX;gesture.clientY=e.clientY;}draw();});
 const finish=e=>{if(!gesture||gesture.pointer!==e.pointerId)return;if(gesture.id)select(gesture.id);gesture=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);};
 svg.addEventListener('pointerup',finish);svg.addEventListener('pointercancel',finish);
 svg.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(Math.max(-100,Math.min(100,e.deltaY))*.003),point(e));},{passive:false});
 document.querySelector('#map-find').addEventListener('change',e=>{select(e.target.value);reveal(byId.get(e.target.value));});
 document.querySelector('#map-in').addEventListener('click',()=>zoom(.8));document.querySelector('#map-out').addEventListener('click',()=>zoom(1.25));document.querySelector('#map-fit').addEventListener('click',fit);
 document.querySelector('#map-reset').addEventListener('click',()=>{for(const initial of createGraph().nodes)Object.assign(byId.get(initial.id),{x:initial.x,y:initial.y});fit();select('guided');});
 fit();select(selected);
}
