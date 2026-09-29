import test from 'node:test';
import assert from 'node:assert/strict';
import {recordConversion} from './conversions.mjs';
import {unseal} from './boarding-crypto.mjs';
const env={SUPABASE_URL:'https://storage.test',SUPABASE_SERVICE_ROLE_KEY:'test',BOARDING_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64'),VERCEL_ENV:'production'};
const reference='11111111-1111-4111-8111-111111111111';
test('conversion records are private, contain no contact data, and retry paths stay identical',async()=>{
 const calls=[];const send=async(url,init)=>{calls.push({url,init});return Response.json({}, {status:calls.length===1?200:409});};
 for(let i=0;i<2;i++)await recordConversion('/api/lead',Response.json({ok:true,reference,email:'private@example.test'}),env,{send});
 assert.equal(calls[0].url,calls[1].url);assert.equal(calls[0].init.headers['x-upsert'],'false');assert.ok(!calls[0].url.includes(reference));
 const path=calls[0].url.split('/guided-boarding-private/')[1];const record=JSON.parse(unseal(calls[0].init.body,env,path));assert.deepEqual(Object.keys(record),['event','at']);assert.equal(record.event,'inquiry_completed');
});
test('only completed actions count and analytics failure never blocks a successful form',async()=>{
 const urls=[];const send=async url=>{urls.push(url);return Response.json({});};
 for(const response of [Response.json({ok:true,pending:true}),Response.json({error:'failed'},{status:500})])await recordConversion('/api/statement/analyze',response,env,{send});
 await recordConversion('/api/statement/email',Response.json({ok:true,reference,emailed:false}),env,{send});assert.equal(urls.length,0);
 await recordConversion('/api/statement/analyze',Response.json({ok:true,reference,brief:{},emailed:true}),env,{send});assert.equal(urls.length,2);
 const original=Response.json({ok:true,reference});assert.equal(await recordConversion('/api/boarding/submit',original,env,{send:async()=>{throw Error('down');}}),original);
});
