import test from 'node:test';
import assert from 'node:assert/strict';
import {createGraph,categories} from '../public/payments-map-data.js';
import {render} from '../pages.mjs';
import {createServer} from '../server.mjs';
test('payments graph has valid connections, all offerings reachable, and reset creates fresh positions',()=>{
 const {nodes,edges}=createGraph(),ids=new Set(nodes.map(n=>n.id));assert.equal(ids.size,nodes.length);
 for(const n of nodes){assert.ok(Number.isFinite(n.x)&&Number.isFinite(n.y));assert.ok(n.description);if(n.url)assert.match(n.url,/^(\/|tel:)/);}
 for(const e of edges){assert.ok(ids.has(e.source)&&ids.has(e.target));assert.notEqual(e.source,e.target);}
 const visited=new Set(['guided']);let changed=true;while(changed){changed=false;for(const e of edges)if(visited.has(e.source)&&!visited.has(e.target)){visited.add(e.target);changed=true;}}assert.equal(visited.size,nodes.length);
 assert.equal(categories.length,6);nodes[0].x=9999;assert.equal(createGraph().nodes[0].x,750);
 assert.ok(edges.some(e=>e.source==='pay-center'&&e.target==='quickbooks'));
});
test('map route serves graph and resources; boarding stays last in navigation',async()=>{
 const html=render('/payments-map');assert.match(html,/id="payments-graph"/);assert.match(html,/id="map-find"/);assert.match(html,/type="module" src="\/payments-map.js"/);assert.doesNotMatch(html,/noindex/);
 for(const route of ['/','/pos-center','/terminal-center','/payments-center','/payments-map']){const nav=render(route).match(/<nav class="boarding-nav[\s\S]*?<\/nav>/)[0];assert.ok(nav.indexOf('Payments Map')<nav.indexOf('Customer Boarding'));assert.match(nav,/Customer Boarding<\/span><\/a><\/nav>$/);}
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));try{for(const path of ['/payments-map','/payments-map.js','/payments-map-data.js','/payments-map.css']){const r=await fetch(`http://127.0.0.1:${server.address().port}${path}`);assert.equal(r.status,200,path);assert.ok((await r.text()).length>100);}}finally{await new Promise(r=>server.close(r));}
});
