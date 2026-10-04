import test from 'node:test';
import assert from 'node:assert/strict';
import {createGraph,categories} from '../public/payments-map-data.js';
import {render} from '../pages.mjs';
import {createServer} from '../server.mjs';
test('payments graph has valid connections, all offerings reachable, and reset creates fresh positions',()=>{
 const {nodes,edges}=createGraph(),ids=new Set(nodes.map(n=>n.id));assert.equal(ids.size,nodes.length);
 for(const n of nodes){assert.ok(Number.isFinite(n.x)&&Number.isFinite(n.y));assert.ok(n.description);if(n.url)assert.match(n.url,/^(\/|tel:|https:\/\/)/);}
 for(const e of edges){assert.ok(ids.has(e.source)&&ids.has(e.target));assert.notEqual(e.source,e.target);}
 const visited=new Set(['priority']);let changed=true;while(changed){changed=false;for(const e of edges)if(visited.has(e.source)&&!visited.has(e.target)){visited.add(e.target);changed=true;}}assert.equal(visited.size,nodes.length);
 assert.ok(edges.some(e=>e.source==='priority'&&e.target==='guided'));assert.equal(nodes.find(n=>n.id==='priority').kind,'root');assert.equal(nodes.find(n=>n.id==='guided').kind,'brand');assert.equal(categories.length,6);nodes[0].x=9999;assert.equal(createGraph().nodes[0].x,750);
 assert.ok(edges.some(e=>e.source==='pay-center'&&e.target==='quickbooks'));
});
test('map route serves graph and resources; boarding moves to the top left and brand remains centered',async()=>{
 const html=render('/payments-map');assert.match(html,/id="payments-graph"/);assert.match(html,/id="map-find"/);assert.match(html,/type="module" src="\/payments-map.js"/);assert.doesNotMatch(html,/noindex/);
 for(const route of ['/','/pos-center','/terminal-center','/payments-center','/payments-map']){const nav=render(route).match(/<nav class="boarding-nav[\s\S]*?<\/nav>/)[0];assert.ok(nav.includes('Payments Map'));assert.ok(!nav.includes('Customer Boarding'));const header=render(route).match(/<header>[\s\S]*?<\/header>/)[0];assert.match(header,/header-balanced">[\s\S]*?header-boarding[\s\S]*?Customer Boarding[\s\S]*?gp-brand[\s\S]*?header-actions/);assert.equal((header.match(/Customer Boarding/g)||[]).length,1);}
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));try{for(const path of ['/payments-map','/payments-map.js','/payments-map-data.js','/payments-map.css']){const r=await fetch(`http://127.0.0.1:${server.address().port}${path}`);assert.equal(r.status,200,path);assert.ok((await r.text()).length>100);}}finally{await new Promise(r=>server.close(r));}
});

test('graph layout separates full labels, keeps the root fixed and is stable on reset',async()=>{
 const {separateNodes}=await import('../public/payments-map-layout.js');
 const initial=createGraph().nodes;const originalRoot={x:initial[0].x,y:initial[0].y};
 // Conservative label boxes cover long names and multiple lines.
 const bounds=new Map(initial.map(n=>[n.id,{x:-130,y:n.kind==='root'?-59:n.kind==='category'?-36:-14,width:260,height:n.kind==='root'?155:n.kind==='category'?112:100}]));
 separateNodes(initial,bounds);
 assert.deepEqual({x:initial[0].x,y:initial[0].y},originalRoot);
 const overlap=(a,b)=>{const ab=bounds.get(a.id),bb=bounds.get(b.id);return a.x+ab.x<b.x+bb.x+bb.width&&a.x+ab.x+ab.width>b.x+bb.x&&a.y+ab.y<b.y+bb.y+bb.height&&a.y+ab.y+ab.height>b.y+bb.y;};
 for(let i=0;i<initial.length;i++)for(let j=i+1;j<initial.length;j++)assert.ok(!overlap(initial[i],initial[j]),`${initial[i].id} overlaps ${initial[j].id}`);
 const reset=separateNodes(createGraph().nodes,bounds);assert.deepEqual(reset,initial);
 const moved=reset.find(n=>n.id==='quickbooks');moved.x=reset[0].x;moved.y=reset[0].y;separateNodes(reset,bounds);assert.ok(!overlap(moved,reset[0]));
});
