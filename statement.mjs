import {PDFDocument} from 'pdf-lib';
import {validToken} from './lead.mjs';
import {BUCKET,ADMIN,UUID,Failure,fail,key,seal,unseal,digest,fileType} from './boarding-crypto.mjs';
import {reportSchema,analysisPrompt,normalizeReport,briefReport,fullReport} from './statement-report.mjs';
const reply=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
export function createStatementHandler({send=fetch,now=Date.now}={}){return async function(req,env){try{
 if(req.method!=='POST')return reply(405,{error:'Method not allowed.'});
 if(req.headers.get('origin')!==new URL(req.url).origin)fail(403,'Please use the Guided Payments analyzer page.');
 if(!env.ANTHROPIC_API_KEY||!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY||!env.RESEND_API_KEY||!env.MAIL_FROM)fail(503,'The analyzer is temporarily unavailable. Contact Sean at 239-297-1703.');key(env);
 if(!req.headers.get('content-type')?.startsWith('application/json'))fail(415,'Use JSON.');const text=await req.text();if(Buffer.byteLength(text)>4300000)fail(413,'Choose a statement up to 3 MB.');let data;try{data=JSON.parse(text);}catch{fail(400,'Invalid request.');}
 if(!data||!UUID.test(data.id||'')||!/^[a-f0-9]{64}$/.test(data.access||''))fail(400,'Invalid submission reference.');
 const path=new URL(req.url).pathname;
 const storage=env.SUPABASE_URL+'/storage/v1/object/'+BUCKET+'/',headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY};
 async function get(p,json=true){const r=await send(storage+p,{headers,signal:AbortSignal.timeout(10000)});if(!r.ok){const e=await r.json().catch(()=>({}));if(r.status===404||Number(e.statusCode)===404)return null;fail(503,'Protected storage is unavailable. Please retry.');}const bytes=unseal(await r.arrayBuffer(),env,p);return json?JSON.parse(bytes.toString()):bytes;}
 async function put(p,value,json=true){const r=await send(storage+p,{method:'POST',headers:{...headers,'Content-Type':'application/octet-stream','x-upsert':'false'},body:seal(json?Buffer.from(JSON.stringify(value)):value,env,p),signal:AbortSignal.timeout(10000)});if(r.ok)return true;const e=await r.json().catch(()=>({}));if(r.status===409||Number(e.statusCode)===409||e.error==='Duplicate')return false;fail(503,'We could not save your analysis securely. Please retry.');}
 const configured=(name,fallback)=>{const n=Number(env[name]);return Number.isInteger(n)&&n>0&&n<=1000?n:fallback;};
 async function limit(label,count,windowMs,ticket){
  const scope=env.VERCEL_ENV==='production'?'production':'testing';
  const p='analysis/quota-v2/'+scope+'/'+label+'/'+Math.floor(now()/windowMs);
  // Atomic, immutable slots work across instances. A retry owns the same slot.
  const start=Number.parseInt(ticket.slice(0,8),16)%count;
  for(let i=0;i<count;i++){
   const slot=p+'-'+((start+i)%count),previous=await get(slot);
   if(previous?.ticket===ticket)return;
   if(previous)continue;
   if(await put(slot,{created:now(),ticket}))return;
   if((await get(slot))?.ticket===ticket)return;
  }
  const minutes=Math.max(1,Math.ceil((windowMs-now()%windowMs)/60000));
  fail(429,`This upload allowance resets in about ${minutes} minute${minutes===1?'':'s'}. Your selected file has not been submitted. Please retry then or contact Sean at 239-297-1703 for a personal review.`);
 }
 const requestPath='analysis/requests/'+data.id,filePath='analysis/files/'+data.id,resultPath='analysis/results/'+data.id,accessHash=digest(env,data.access);
 if(path==='/api/statement/upload'){
  if(data.website||!validToken(data.token,env,now()))fail(400,'Form verification expired. Reload and try again.');
  const summaryFirst=data.flow==='summary-first';
  if(summaryFirst){data.name='';data.business='';data.email='';data.confirmEmail='';data.phone='';}
  const contact={};for(const [k,max] of Object.entries({name:100,business:150,email:254,phone:30})){if(typeof data[k]!=='string'||data[k].length>max||/[\r\n]/.test(data[k]))fail(400,'Check your contact details.');contact[k]=data[k].trim();}contact.email=contact.email.toLowerCase();
  if(data.consent!==true||(!summaryFirst&&(!contact.name||!contact.business||!/^\S+@[^\s@]+\.[^\s@]+$/.test(contact.email)||contact.email!==String(data.confirmEmail||'').trim().toLowerCase())))fail(400,'Check your contact details and permission to analyze this statement.');
  if(typeof data.file!=='string'||data.file.length>4194304||!/^[A-Za-z0-9+/]+={0,2}$/.test(data.file))fail(400,'Choose a PDF, JPG, or PNG up to 3 MB.');const bytes=Buffer.from(data.file,'base64');if(bytes.length<10||bytes.length>3*1024*1024)fail(413,'Choose a file up to 3 MB.');const type=fileType(bytes);
  if(type.type==='application/pdf'){let pdf;try{pdf=await PDFDocument.load(bytes,{updateMetadata:false});}catch{fail(400,'Use a readable PDF without password protection, or upload a clear JPG/PNG.');}if(pdf.getPageCount()<1||pdf.getPageCount()>20)fail(400,'Upload a statement with 1–20 pages.');}
  const fileHash=digest(env,bytes),hash=digest(env,JSON.stringify({contact,fileHash})),old=await get(requestPath);
  if(old){if(old.accessHash!==accessHash||old.hash!==hash)fail(409,'This submission reference is already used. Reload to start a new analysis.');return reply(200,{ok:true});}
  const ip=req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'local';
  const ticket=digest(env,JSON.stringify({id:data.id,accessHash,hash}));
  if(!summaryFirst)await limit('email-'+digest(env,contact.email),configured('STATEMENT_EMAIL_DAILY_LIMIT',20),86400000,ticket);
  await limit('ip-'+digest(env,ip),configured('STATEMENT_IP_HOURLY_LIMIT',40),3600000,ticket);
  await limit('global',configured('STATEMENT_GLOBAL_HOURLY_LIMIT',100),3600000,ticket);
  if(!await put(filePath,bytes,false)){const previous=await get(filePath,false);if(digest(env,previous)!==fileHash)fail(409,'File conflict. Reload to start again.');}
  await put(requestPath,{id:data.id,accessHash,hash,contact,type:type.type,fileHash,createdAt:new Date(now()).toISOString(),expires:now()+2*3600000});const saved=await get(requestPath);if(saved?.hash!==hash||saved?.accessHash!==accessHash)fail(409,'Submission conflict. Please reload.');return reply(200,{ok:true});
 }
 if(!['/api/statement/analyze','/api/statement/email'].includes(path))return reply(404,{error:'Not found.'});
 const submission=await get(requestPath);if(!submission||submission.accessHash!==accessHash||submission.expires<now())fail(401,'Your analysis session expired. Start a new upload or contact Sean.');
 let result=await get(resultPath);
 if(path==='/api/statement/email'&&!result)fail(409,'Finish the statement analysis before requesting the full report.');
 if(!result){
  let attempt=-1;for(let n=0;n<3;n++){const p='analysis/attempts/'+data.id+'/'+n,lock=await get(p);if(lock){if(await get(p+'-failed'))continue;if(lock.expires>now())return reply(202,{pending:true});continue;}if(await put(p,{expires:now()+140000})){attempt=n;break;}return reply(202,{pending:true});}
  if(attempt===-1)fail(503,'We could not finish this statement after several attempts. Please contact Sean for a personal review.');
  try{
   const bytes=await get(filePath,false);if(!bytes)fail(503,'The statement upload could not be retrieved.');
   const response=await send('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:env.STATEMENT_MODEL||'claude-sonnet-4-6',max_tokens:6500,system:analysisPrompt,output_config:{format:{type:'json_schema',schema:reportSchema}},messages:[{role:'user',content:[{type:submission.type==='application/pdf'?'document':'image',source:{type:'base64',media_type:submission.type,data:bytes.toString('base64')}},{type:'text',text:'Extract the processing statement facts using the required schema. Return null for unsupported figures. No account identifiers.'}]}]}),signal:AbortSignal.timeout(105000)});
   if(!response.ok)fail(503,'The analysis service could not complete this request. Please retry or contact Sean.');const output=await response.json();if(output.stop_reason!=='end_turn')fail(502,'The analysis was incomplete. Please retry or use a shorter statement.');
   let parsed;try{parsed=JSON.parse(output.content?.filter(x=>x.type==='text').map(x=>x.text).join('')||'');}catch{fail(502,'The analysis response could not be read. Please retry.');}
   const report=normalizeReport(parsed);await put(resultPath,{report,createdAt:new Date(now()).toISOString(),model:env.STATEMENT_MODEL||'claude-sonnet-4-6'});result=await get(resultPath);
  }catch(e){await put('analysis/attempts/'+data.id+'/'+attempt+'-failed',{failedAt:now(),status:e instanceof Failure?e.status:503,reason:e instanceof Failure?e.message:e.name==='TimeoutError'?'Provider timeout':'Provider or storage request failed'});throw e;}
 }
 const report=result.report;
 if(!submission.contact.email&&path==='/api/statement/analyze')return reply(200,{ok:true,reference:data.id,brief:briefReport(report),emailed:false,message:'Your summary is ready. Enter your email below for the full report.'});
 if(path==='/api/statement/email'){
  const email=typeof data.email==='string'?data.email.trim().toLowerCase():'';
  if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email)||data.consent!==true)fail(400,'Enter a valid email address to receive your report.');
  if(data.website||!validToken(data.token,env,now()))fail(400,'Form verification expired. Please refresh and try again.');
  const recipientPath='analysis/recipients/'+data.id;
  const bound=await get(recipientPath);
  if((bound&&bound.email!==email)||(submission.contact.email&&submission.contact.email!==email))fail(409,'This report is already addressed to another email. Use the same email to retry delivery.');
  await limit('email-'+digest(env,email),configured('STATEMENT_EMAIL_DAILY_LIMIT',20),86400000,digest(env,data.id+accessHash));
  if(!bound)await put(recipientPath,{email,consentedAt:new Date(now()).toISOString()});
  if((await get(recipientPath))?.email!==email)fail(409,'The report recipient has already been set. Retry with the original email.');
  submission.contact.email=email;
 }
 const full=fullReport(report,data.id),delivery={};
 for(const recipient of [...new Set([ADMIN,submission.contact.email])]){
  const role=recipient===ADMIN?'owner':'customer',receiptPath='analysis/notifications/'+data.id+'/'+role;
  if(await get(receiptPath)){delivery[role]=true;continue;}
  const ownerNote=role==='owner'?`Requested by: ${submission.contact.name}\nBusiness: ${submission.contact.business}\nEmail: ${submission.contact.email}\nPhone: ${submission.contact.phone||'Not provided'}\n\n`:'';
  const r=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'statement-'+data.id+'-'+role},body:JSON.stringify({from:env.MAIL_FROM,to:[recipient],reply_to:role==='owner'?submission.contact.email:ADMIN,subject:'Your Guided Payments statement review',text:ownerNote+full}),signal:AbortSignal.timeout(10000)});
  if(!r.ok){delivery[role]=false;continue;}const receipt=await r.json();if(!receipt.id){delivery[role]=false;continue;}await put(receiptPath,{receipt:receipt.id});delivery[role]=true;
 }
 const emailed=Object.values(delivery).every(Boolean);
 return reply(200,{ok:true,reference:data.id,brief:briefReport(report),emailed,message:emailed?'The full analysis was sent to your email and Sean.':'Your analysis is ready, but one or more emails could not be confirmed. Retry sending below; your statement will not be analyzed again.'});
 }catch(e){return reply(e instanceof Failure?e.status:503,{error:e instanceof Failure?e.message:'The analysis could not be completed. Please retry or contact Sean at 239-297-1703.'});}};}
