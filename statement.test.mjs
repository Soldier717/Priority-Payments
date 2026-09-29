import test from 'node:test';import assert from 'node:assert/strict';import {randomBytes} from 'node:crypto';
import {createStatementHandler} from './statement.mjs';import {normalizeReport,briefReport,fullReport,cleanText} from './statement-report.mjs';import {BUCKET} from './boarding-crypto.mjs';import {issueToken} from './lead.mjs';
const submissionId=n=>`12345678-1234-4234-8234-${String(n).padStart(12,'0')}`;
const raw={isStatement:true,readable:true,processor:'TEST',period:'August 2026',currency:'USD',cardVolume:30000,cardFees:825,cardTransactions:1000,totalsComparable:true,totalsEvidence:'Page 1, card summary',fees:[{name:'Interchange',amount:600,category:'interchange',evidence:'Page 1'},{name:'Other fees',amount:225,category:'other',evidence:'Page 1'}],achVolume:10000,achFees:50,observations:['A monthly fee is listed.'],questions:['Review equipment terms.'],limitations:[]};
const env={ANTHROPIC_API_KEY:'test-ai',RESEND_API_KEY:'test-email',SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'test-role',MAIL_FROM:'test@example.com',BOARDING_ENCRYPTION_KEY:randomBytes(32).toString('base64')};
const id='12345678-1234-4234-8234-123456789abc',access='a'.repeat(64),origin='https://guidedpayments.com';
function harness(overrides={}){const testEnv={...env,...overrides};const objects=new Map(),emails=[];let aiCalls=0,failCustomer=false,response=raw,failAI=false;let now=Date.now(),failFile=false;const send=async(url,init)=>{
 if(url.includes('anthropic.com')){aiCalls++;if(failAI)return new Response('',{status:503});return Response.json({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify(response)}]});}
 if(url.includes('resend.com')){const e=JSON.parse(init.body);if(e.to[0]==='customer@example.com'&&failCustomer)return new Response('',{status:500});emails.push(e);return Response.json({id:'receipt-'+emails.length});}
 const p=url.split('/object/'+BUCKET+'/')[1];assert.ok(p);if(failFile&&p.startsWith('analysis/files/')&&init.method==='POST')return new Response('',{status:503});if(init.method==='POST'){if(objects.has(p))return Response.json({statusCode:'409'},{status:400});objects.set(p,Buffer.from(init.body));return Response.json({ok:true});}return objects.has(p)?new Response(objects.get(p)):Response.json({statusCode:'404'},{status:400});
 };const handler=createStatementHandler({send,now:()=>now});const call=async(path,data={},from=origin)=>handler(new Request(origin+'/api/statement/'+path,{method:'POST',headers:{origin:from,'Content-Type':'application/json'},body:JSON.stringify({id,access,...data})}),testEnv);
 return {objects,emails,call,testEnv,advance:ms=>now+=ms,failFile:v=>failFile=v,aiCalls:()=>aiCalls,failEmail:v=>failCustomer=v,failAI:v=>failAI=v,setResponse:v=>response=v,upload:async(extra={})=>call('upload',{name:'Test Owner',business:'Test Business',email:'customer@example.com',confirmEmail:'customer@example.com',phone:'',consent:true,token:(await issueToken(testEnv,now-2000).json()).token,file:Buffer.from([137,80,78,71,13,10,26,10,0,0,0]).toString('base64'),...extra})};
}
test('statement rate is calculated from card-only figures; unknown and non-comparable totals stay unknown',()=>{const r=normalizeReport(raw);assert.equal(r.effectiveRate,2.75);assert.equal(r.achFees,50);assert.equal(normalizeReport({...raw,totalsComparable:false}).effectiveRate,null);assert.equal(normalizeReport({...raw,cardFees:null}).effectiveRate,null);assert.match(briefReport(r).fees,/825.00/);assert.match(fullReport(r,id),/ACH \/ CHECK ACTIVITY/);assert.ok(normalizeReport({...raw,cardFees:900}).limitations.some(x=>x.includes('reconcile')));});
test('statement output rejects unsupported figures and excludes long identifiers and links',()=>{assert.throws(()=>normalizeReport({...raw,cardVolume:'30000'}));assert.throws(()=>normalizeReport({...raw,isStatement:false}));assert.throws(()=>normalizeReport({...raw,readable:false}));assert.equal(cleanText('Account 123456789 SSN 123-45-6789').includes('123456789'),false);assert.ok(!cleanText('https://evil.example').includes('https://'));});
test('long fee breakdowns retain verified totals and explicitly disclose omitted rows',()=>{const report=normalizeReport({...raw,fees:Array.from({length:64},()=>({name:'Fee',amount:1,category:'other',evidence:'Page 2'}))});assert.equal(report.fees.length,60);assert.equal(report.effectiveRate,2.75);assert.ok(report.limitations.some(x=>x.includes('breakdown is partial')));assert.throws(()=>normalizeReport({...raw,fees:null}));});
test('brand rates use matching explicit totals; missing and partial brands are not estimated',()=>{
 const r=normalizeReport({...raw,brands:{visa:{sales:10000,fees:250,comparable:true,evidence:'Page 1',limitation:''},mastercard:{sales:5000,fees:50,comparable:false,limitation:'Interchange only'},discover:{sales:0,fees:0,comparable:true}}});
 assert.equal(r.brands[0].effectiveRate,2.5);assert.equal(r.brands[1].effectiveRate,null);assert.equal(r.brands[2].effectiveRate,null);assert.equal(r.brands[3].sales,null);
 const mail=fullReport(r,id);assert.ok(mail.indexOf('CARD BRAND SUMMARY')<mail.indexOf('FEE BREAKDOWN'));assert.match(mail,/Visa\n  Sales: 10,000.00 USD \| Brand fees: 250.00 USD \| Effective rate: 2.50%/);assert.match(mail,/Shared or unassigned fees are excluded/);
 assert.equal(normalizeReport({...raw,brands:{visa:{sales:40000,fees:300,comparable:true}}}).brands[0].effectiveRate,null);
 assert.equal(normalizeReport({...raw,brands:[{brand:'visa',sales:10000,fees:250,comparable:true}]}).brands[0].effectiveRate,2.5);
 assert.equal(normalizeReport({...raw,brands:[{brand:'amex',sales:10000,fees:13,comparable:true,coverage:'partial'}]}).brands[3].effectiveRate,null);
 assert.ok(normalizeReport({...raw,brands:[{brand:'visa',sales:10000,fees:500,comparable:true},{brand:'mastercard',sales:10000,fees:500,comparable:true}]}).brands.every(b=>b.effectiveRate===null));
});
test('analysis saves encrypted data and sends independent reports to customer and Sean; retry does not rerun AI',async()=>{const h=harness();assert.equal((await h.upload()).status,200);const result=await h.call('analyze');assert.equal(result.status,200);const data=await result.json();assert.equal(data.emailed,true);assert.equal(data.brief.rate,'2.75%');assert.deepEqual(h.emails.map(e=>e.to[0]),['sean@guidedpayments.com','customer@example.com']);assert.ok(h.emails.every(e=>!e.attachments));await h.call('analyze');assert.equal(h.aiCalls(),1);assert.equal(h.emails.length,2);for(const b of h.objects.values())assert.equal(b.includes(Buffer.from('customer@example.com')),false);});
test('partial email failure retries only the missing recipient, without repeating AI',async()=>{const h=harness();await h.upload();h.failEmail(true);const d=await(await h.call('analyze')).json();assert.equal(d.emailed,false);assert.equal(d.ok,true);h.failEmail(false);assert.equal((await(await h.call('analyze')).json()).emailed,true);assert.equal(h.aiCalls(),1);assert.equal(h.emails.length,2);});
test('invalid input, foreign origin, changed retry and wrong access token cannot analyze',async()=>{const h=harness();assert.equal((await h.upload({confirmEmail:'wrong@example.com'})).status,400);assert.equal((await h.call('analyze',{},'https://evil.example')).status,403);await h.upload();assert.equal((await h.upload({business:'Changed'})).status,409);assert.equal((await h.call('analyze',{access:'b'.repeat(64)})).status,401);assert.equal(h.aiCalls(),0);});
test('AI failures and unrelated files cannot report completed analysis or send emails',async()=>{const h=harness();await h.upload();h.failAI(true);assert.equal((await h.call('analyze')).status,503);assert.equal(h.emails.length,0);h.failAI(false);h.setResponse({...raw,isStatement:false});assert.equal((await h.call('analyze')).status,422);assert.equal(h.emails.length,0);});
test('normal use supports more than three statements and hourly limits reset with actionable feedback',async()=>{
 const h=harness({STATEMENT_IP_HOURLY_LIMIT:'5'});
 for(let n=1;n<=5;n++)assert.equal((await h.upload({id:submissionId(n)})).status,200);
 const blocked=await h.upload({id:submissionId(6)});assert.equal(blocked.status,429);assert.match((await blocked.json()).error,/resets in about \d+ minute/);
 h.advance(3600000);assert.equal((await h.upload({id:submissionId(6)})).status,200);
});
test('failed storage retries and concurrent duplicate requests consume one slot per allowance',async()=>{
 const h=harness({STATEMENT_EMAIL_DAILY_LIMIT:'1',STATEMENT_IP_HOURLY_LIMIT:'1',STATEMENT_GLOBAL_HOURLY_LIMIT:'1'});
 h.failFile(true);assert.equal((await h.upload()).status,503);assert.equal((await h.upload()).status,503);
 h.failFile(false);const results=await Promise.all([h.upload(),h.upload()]);assert.ok(results.every(r=>r.status===200));
 assert.equal([...h.objects.keys()].filter(p=>p.startsWith('analysis/quota-v2/')).length,3);
 assert.equal((await h.upload({id:submissionId(2)})).status,429);
});
test('testing and production quotas are isolated; no email address bypasses the quota',async()=>{
 const h=harness({VERCEL_ENV:'preview',STATEMENT_GLOBAL_HOURLY_LIMIT:'1'});assert.equal((await h.upload()).status,200);
 h.testEnv.VERCEL_ENV='production';assert.equal((await h.upload({id:submissionId(2)})).status,200);
 const r=await h.upload({id:submissionId(3),email:'sean@guidedpayments.com',confirmEmail:'sean@guidedpayments.com'});assert.equal(r.status,429);
});
test('summary-first flow captures one email only after analysis and sends both reports once',async()=>{
 const h=harness();assert.equal((await h.upload({flow:'summary-first'})).status,200);
 const token=(await issueToken(h.testEnv,Date.now()-2000).json()).token;
 assert.equal((await h.call('email',{email:'customer@example.com',consent:true,token})).status,409);
 const summary=await(await h.call('analyze')).json();assert.equal(summary.ok,true);assert.equal(summary.emailed,false);assert.equal(h.emails.length,0);
 const request={email:'customer@example.com',consent:true,token};
 assert.equal((await(await h.call('email',request)).json()).emailed,true);
 await h.call('email',request);assert.equal(h.aiCalls(),1);assert.equal(h.emails.length,2);
 assert.equal((await h.call('email',{...request,email:'another@example.com'})).status,409);
 assert.equal((await h.call('email',{...request,access:'b'.repeat(64)})).status,401);
});
