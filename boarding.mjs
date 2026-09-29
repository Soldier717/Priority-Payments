import {conversionEvents} from './conversions.mjs';
import {randomBytes,randomUUID} from 'node:crypto';
import {validToken} from './lead.mjs';
import {BUCKET,ADMIN,UUID,Failure,fail,key,seal,unseal,digest,validateDetails,fileType} from './boarding-crypto.mjs';
const ORIGIN='https://guidedpayments.com';
const heads={'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const reply=(status,value,extra={})=>Response.json(value,{status,headers:{...heads,...extra}});
export function createBoardingHandler({send=fetch,now=Date.now}={}){
 return async function handle(req,env){
 try{
  if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY||!env.RESEND_API_KEY||!env.MAIL_FROM)fail(503,'Boarding is not available yet. Please contact Sean.');key(env);
  const url=new URL(req.url),route=url.pathname;
  if(req.method!=='POST')return reply(405,{error:'Method not allowed.'});
  if(req.headers.get('origin')!==url.origin)fail(403,'This request must come from Guided Payments.');
  if(!req.headers.get('content-type')?.startsWith('application/json'))fail(415,'Use JSON.');
  const storage=env.SUPABASE_URL+'/storage/v1',dbHeads={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY};
  async function api(path,init={}){return send(storage+path,{...init,headers:{...dbHeads,...init.headers},signal:AbortSignal.timeout(10000)});}
  async function read(path){const r=await api('/object/'+BUCKET+'/'+path);if(!r.ok){const e=await r.json().catch(()=>({}));if(r.status===404||Number(e.statusCode)===404||e.error==='not_found')return null;fail(503,'Protected storage is temporarily unavailable. Please try again.');}return unseal(await r.arrayBuffer(),env,path);}
  async function get(path){const b=await read(path);return b?JSON.parse(b.toString()):null;}
  async function put(path,bytes){const r=await api('/object/'+BUCKET+'/'+path,{method:'POST',headers:{'Content-Type':'application/octet-stream','x-upsert':'false'},body:seal(bytes,env,path)});if(r.ok)return true;const e=await r.json().catch(()=>({}));if(r.status===409||Number(e.statusCode)===409||e.error==='Duplicate')return false;fail(503,'We could not save to protected storage. Please try again.');}
  const save=(p,o)=>put(p,Buffer.from(JSON.stringify(o)));
  const ip=req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'local';
  async function limit(label,count,period){const prefix='limits/'+label+'/'+Math.floor(now()/period);for(let n=0;n<count;n++)if(await save(prefix+'-'+n,{expires:now()+period}))return;fail(429,'Too many requests. Please wait before trying again.');}
  const text=await req.text();if(Buffer.byteLength(text)>4300000)fail(413,'This file is too large. Maximum size is 3 MB.');
  let data;try{data=JSON.parse(text);}catch{fail(400,'Invalid request.');}if(!data||typeof data!=='object'||Array.isArray(data))fail(400,'Invalid request.');
  const cap=(id,hash)=>seal(Buffer.from(JSON.stringify({id,hash,expires:now()+2*3600000})),env,'upload-capability').toString('base64url');
  async function draft(){let t;try{t=JSON.parse(unseal(Buffer.from(data.capability||'','base64url'),env,'upload-capability'));}catch{fail(401,'Your form session expired. Reload the form to start again.');}if(t.expires<now()||!UUID.test(t.id))fail(401,'Your form session expired. Reload the form to start again.');const d=await get('drafts/'+t.id);if(!d||d.hash!==t.hash)fail(401,'Invalid form session.');return d;}
  async function email(subject,text,id){const r=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({from:env.MAIL_FROM,to:[ADMIN],subject,text}),signal:AbortSignal.timeout(10000)});if(!r.ok)fail(502,'Your information is saved, but the email could not be confirmed. Retry safely or contact Sean.');const v=await r.json();if(!v.id)fail(502,'Email delivery could not be confirmed.');return v.id;}
  async function session(){const cookie=req.headers.get('cookie')||'';const token=cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith('__Host-gp-review='))?.split('=')[1];if(!token||!/^[a-f0-9]{64}$/.test(token))fail(401,'Sign in to review boarding submissions.');const path='sessions/'+digest(env,token);const s=await get(path);if(!s||s.expires<now()||s.email!==ADMIN||await get(path+'-revoked'))fail(401,'Your session expired. Sign in again.');return {path,...s};}
  async function audit(action,id,s){if(!await save('audit/'+now()+'-'+randomUUID(),{action,id,reviewer:s.email,time:new Date(now()).toISOString()}))fail(503,'Could not record review access.');}
  if(route==='/api/boarding/start'){
   if(data.website||!UUID.test(data.id||'')||!validToken(data.token,env,now()))fail(400,'Form verification expired. Reload the form and try again.');
   const details=validateDetails(data.details||{}),hash=digest(env,JSON.stringify(details)),path='drafts/'+data.id;
   const old=await get(path);if(old&&old.hash!==hash)fail(409,'Details changed after uploading began. Reload the form to start a new submission.');
   if(!old){await limit('submission-'+digest(env,ip),5,3600000);await save(path,{id:data.id,hash,details,createdAt:new Date(now()).toISOString()});const stored=await get(path);if(stored?.hash!==hash)fail(409,'Submission reference conflict. Reload the form.');}
   return reply(200,{id:data.id,capability:cap(data.id,hash)});
  }
  if(route==='/api/boarding/upload'){
   const d=await draft();if(!['bank','license'].includes(data.kind))fail(400,'Invalid document type.');
   if(typeof data.file!=='string'||data.file.length>4194304||!/^[A-Za-z0-9+/]+={0,2}$/.test(data.file))fail(400,'Choose a PDF, JPG, or PNG up to 3 MB.');
   const bytes=Buffer.from(data.file,'base64');if(bytes.length<10||bytes.length>3*1024*1024)fail(413,'Choose a file up to 3 MB.');fileType(bytes);
   if(await get('submissions/'+d.id))fail(409,'This submission is already complete.');
   const path='files/'+d.id+'/'+data.kind,old=await read(path);if(old&&!old.equals(bytes))fail(409,'This document was already uploaded. Reload to start a new submission if you need to change it.');
   if(!old&&!await put(path,bytes)){const stored=await read(path);if(!stored?.equals(bytes))fail(409,'Document upload conflict. Try again.');}
   return reply(200,{ok:true});
  }
  if(route==='/api/boarding/submit'){
   const d=await draft();if(!Array.isArray(data.documents)||data.documents.some(k=>!['bank','license'].includes(k)))fail(400,'Invalid document selection.');
   const documents=[...new Set(data.documents)].sort();for(const k of documents)if(!await read('files/'+d.id+'/'+k))fail(400,'A document has not finished uploading. Try again.');
   const path='submissions/'+d.id;let record=await get(path);
   if(record&&JSON.stringify(record.documents)!==JSON.stringify(documents))fail(409,'This submission is already complete with different documents.');
   if(!record){await save(path,{...d,documents,submittedAt:new Date(now()).toISOString()});record=await get(path);if(!record||JSON.stringify(record.documents)!==JSON.stringify(documents))fail(409,'Submission conflict. Please contact Sean.');}
   if(!await get('notifications/'+d.id)){const x=d.details;const receipt=await email('Guided Payments boarding — '+(x.dba||x.legalName).replace(/[\r\n]/g,' '),`New boarding submission\n\nBusiness DBA: ${x.dba}\nLegal business name: ${x.legalName}\nBusiness phone: ${x.businessPhone}\nBusiness email: ${x.businessEmail}\nOwner: ${x.ownerName}\nOwner phone: ${x.ownerPhone}\nPayment needs: ${x.paymentNeeds}\nAcceptance: ${x.acceptance}\nDocuments received: ${documents.join(', ')||'None'}\n\nReference: ${d.id}\nReview: ${ORIGIN}/boarding/review\n\nEIN, SSN, and documents are available only after signing in. No sensitive documents are attached.`, 'boarding-'+d.id);await save('notifications/'+d.id,{receipt});}
   return reply(200,{ok:true,reference:d.id});
  }
  if(route==='/api/boarding/login'){
   if(data.website||!validToken(data.token,env,now()))fail(400,'Reload this page and try again.');await limit('login-global',3,15*60000);
   const token=randomBytes(32).toString('hex');await save('login/'+digest(env,token),{email:ADMIN,expires:now()+15*60000});
   await email('Your Guided Payments review sign-in link',`Sign in to review boarding submissions:\n${ORIGIN}/boarding/review#sign-in=${token}\n\nThis single-use link expires in 15 minutes. Only use it if you requested access.`, 'review-login-'+randomUUID());
   return reply(200,{ok:true,message:'A sign-in link was sent to sean@guidedpayments.com. It expires in 15 minutes.'});
  }
  if(route==='/api/boarding/session'){
   if(!/^[a-f0-9]{64}$/.test(data.token||''))fail(401,'Invalid sign-in link.');const path='login/'+digest(env,data.token),login=await get(path);
   if(!login||login.expires<now()||!await save(path+'-used',{time:now()}))fail(401,'This sign-in link expired or was already used. Request a new one.');
   const token=randomBytes(32).toString('hex');await save('sessions/'+digest(env,token),{email:ADMIN,expires:now()+30*60000});
   return reply(200,{ok:true},{'Set-Cookie':`__Host-gp-review=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=1800`});
  }
  const s=await session();
  if(route==='/api/boarding/logout'){await save(s.path+'-revoked',{time:now()});return reply(200,{ok:true},{'Set-Cookie':'__Host-gp-review=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0'});}
  if(route==='/api/boarding/metrics'){
   const counts={};let capped=false;
   for(const event of conversionEvents){let total=0,recent=0;for(let offset=0;offset<10000;offset+=1000){
    const r=await api('/object/list/'+BUCKET,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefix:'metrics/'+(env.VERCEL_ENV==='production'?'production':'testing')+'/'+event,limit:1000,offset,sortBy:{column:'created_at',order:'desc'}})});if(!r.ok)fail(503,'Conversion counts are temporarily unavailable.');const rows=await r.json();
    for(const row of rows)if(/^[a-f0-9]{64}$/.test(row.name)){total++;if(Date.parse(row.created_at)>=now()-30*86400000)recent++;}if(rows.length<1000)break;if(offset===9000)capped=true;
   }counts[event]={total,last30Days:recent};}
   return reply(200,{counts,capped});
  }
  if(route==='/api/boarding/list'){

   const offset=Number.isInteger(data.offset)&&data.offset>=0&&data.offset<=10000?data.offset:0;
   const r=await api('/object/list/'+BUCKET,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefix:'submissions',limit:25,offset,sortBy:{column:'created_at',order:'desc'}})});if(!r.ok)fail(503,'Could not load submissions.');const objects=await r.json();
   const records=await Promise.all(objects.filter(o=>UUID.test(o.name)).map(async o=>{const d=await get('submissions/'+o.name);return {id:d.id,dba:d.details.dba,legalName:d.details.legalName,submittedAt:d.submittedAt};}));await audit('list',null,s);return reply(200,{records,more:objects.length===25});
  }
  if(!UUID.test(data.id||''))fail(400,'Invalid submission reference.');const d=await get('submissions/'+data.id);if(!d)fail(404,'Submission not found.');
  if(route==='/api/boarding/detail'){await audit('view',d.id,s);return reply(200,{...d,hash:undefined,details:{...d.details,ssn:d.details.ssn?'•••-••-'+d.details.ssn.slice(-4):'Not provided'}});}
  if(route==='/api/boarding/reveal'){await audit('reveal-ssn',d.id,s);return reply(200,{ssn:d.details.ssn||'Not provided'});}
  if(route==='/api/boarding/document'){
   if(!d.documents.includes(data.kind))fail(404,'Document not found.');const bytes=await read('files/'+d.id+'/'+data.kind);if(!bytes)fail(404,'Document not found.');const t=fileType(bytes);await audit('download-'+data.kind,d.id,s);
   return new Response(bytes,{headers:{...heads,'Content-Type':t.type,'Content-Disposition':`attachment; filename="${data.kind}-${d.id}.${t.extension}"`,'Content-Security-Policy':"sandbox; default-src 'none'"}});
  }
  return reply(404,{error:'Not found.'});
 }catch(e){return reply(e instanceof Failure?e.status:503,{error:e instanceof Failure?e.message:'We could not complete this request. Please try again or contact Sean.'});}
 };
}
