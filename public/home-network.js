const svg=document.querySelector('#home-network');
if(svg){
 const elements=[...svg.querySelectorAll('[data-node]')],edges=[...svg.querySelectorAll('[data-edge]')],motion=document.querySelector('#network-motion'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const nodes=elements.map((el,i)=>({el,id:el.dataset.node,i,x:Number(el.dataset.x),y:Number(el.dataset.y),pinned:false,hover:false}));
 let paused=reduce.matches,visible=false,drag=null,frame=0,start=performance.now(),mobile=false,center={x:600,y:240};
 function draw(){for(const n of nodes){n.el.setAttribute('transform',`translate(${n.x},${n.y})`);const side=n.x<center.x?-1:1;edges[n.i].setAttribute('d',`M${center.x} ${center.y} Q${center.x+side*150} ${center.y} ${n.x} ${n.y}`);}}
 function layout(){mobile=svg.getBoundingClientRect().width<700;center=mobile?{x:270,y:100}:{x:600,y:240};svg.setAttribute('viewBox',mobile?'0 0 540 730':'0 0 1200 480');svg.querySelector('.network-core').setAttribute('transform',`translate(${center.x},${center.y})`);const halo=svg.querySelector('.network-halo');halo.setAttribute('cx',center.x);halo.setAttribute('cy',center.y);for(const n of nodes){const left=n.i<3,index=n.i%3;n.baseX=mobile?(left?145:395):(left?220:980);n.baseY=mobile?270+index*180:90+index*150;n.x=n.baseX;n.y=n.baseY;n.pinned=false;const rect=n.el.querySelector('rect');rect.setAttribute('x',mobile?-120:-167);rect.setAttribute('width',mobile?240:334);n.el.querySelector('circle').setAttribute('cx',mobile?-104:-143);n.el.querySelector('.network-label').setAttribute('x',mobile?-88:-128);n.el.querySelector('.network-sub').setAttribute('x',mobile?-104:-143);n.el.querySelector('.network-arrow').setAttribute('x',mobile?104:139);}draw();}
 function sync(){motion.textContent=paused?'Resume motion':'Pause motion';motion.setAttribute('aria-pressed',String(paused));cancelAnimationFrame(frame);frame=0;if(!paused&&visible&&!document.hidden)frame=requestAnimationFrame(animate);}
 function animate(now){if(paused||!visible||document.hidden)return;const t=(now-start)/1000;for(const n of nodes)if(!n.pinned&&!n.hover&&drag?.node!==n){n.x=n.baseX+Math.sin(t*.65+n.i)*7;n.y=n.baseY+Math.cos(t*.5+n.i*1.7)*9;}draw();frame=requestAnimationFrame(animate);}
 function point(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());}
 for(const n of nodes){const highlight=on=>{n.hover=on;edges[n.i].classList.toggle('active',on);};n.el.addEventListener('pointerenter',()=>highlight(true));n.el.addEventListener('pointerleave',()=>highlight(false));n.el.addEventListener('focus',()=>highlight(true));n.el.addEventListener('blur',()=>highlight(false));
  n.el.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;const p=point(e);drag={node:n,pointer:e.pointerId,x:n.x,y:n.y,start:p,cx:e.clientX,cy:e.clientY,moved:false};n.el.setPointerCapture(e.pointerId);});
  n.el.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId||drag.node!==n)return;const p=point(e);if(Math.hypot(e.clientX-drag.cx,e.clientY-drag.cy)>5){drag.moved=true;n.pinned=true;n.el.classList.add('dragging');}if(drag.moved){const box=svg.viewBox.baseVal;n.x=Math.max(mobile?125:170,Math.min(box.width-(mobile?125:170),drag.x+p.x-drag.start.x));n.y=Math.max(45,Math.min(box.height-45,drag.y+p.y-drag.start.y));draw();}});
  const finish=e=>{if(!drag||drag.pointer!==e.pointerId)return;n.suppress=drag.moved;drag=null;n.el.classList.remove('dragging');if(n.el.hasPointerCapture(e.pointerId))n.el.releasePointerCapture(e.pointerId);};
  n.el.addEventListener('pointerup',finish);n.el.addEventListener('pointercancel',finish);n.el.addEventListener('click',e=>{if(n.suppress){e.preventDefault();n.suppress=false;}});
  n.el.addEventListener('keydown',e=>{const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(d){e.preventDefault();n.pinned=true;n.x+=d[0];n.y+=d[1];draw();}});
 }
 motion.addEventListener('click',()=>{paused=!paused;sync();});document.querySelector('#network-reset').addEventListener('click',layout);
 reduce.addEventListener('change',e=>{paused=e.matches;sync();});document.addEventListener('visibilitychange',sync);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(svg);
 new ResizeObserver(()=>{const next=svg.getBoundingClientRect().width<700;if(next!==mobile)layout();}).observe(svg);
 layout();sync();
}
