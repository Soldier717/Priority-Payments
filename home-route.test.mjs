import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServer} from './server.mjs';
test('root serves homepage and legacy redirects preserve campaign and equipment queries',async()=>{
 const server=createServer();server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const r=await fetch(base+'/',{redirect:'manual'});assert.equal(r.status,200);const html=await r.text();
  assert.match(html,/<link rel="canonical" href="https:\/\/guidedpayments.com\/">/);assert.match(html,/<meta property="og:url" content="https:\/\/guidedpayments.com\/">/);assert.doesNotMatch(html,/href="\/home-page/);assert.match(html,/id="lead-form"/);
  for(const url of ['/home-page?utm_source=social&equipment=Clover','/home-page/?utm_source=social&equipment=Clover','/api/site?route=%2Fhome-page&utm_source=social&equipment=Clover']){
   const old=await fetch(base+url,{redirect:'manual'});assert.equal(old.status,308);assert.equal(old.headers.get('location'),base+'/?utm_source=social&equipment=Clover');
  }
  assert.equal((await fetch(base+'/',{method:'HEAD'})).status,200);
  for(const path of ['/zerofee','/zerofee/inquiry','/pos-center','/boarding','/statement-analyzer'])assert.equal((await fetch(base+path)).status,200);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
