import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {equipmentOptions,volumeOptions,equipmentPrices} from './funnel.mjs';
const json=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const destination='sean@guidedpayments.com';
const role='Guided Payments inquiry';
const ready=env=>env.RESEND_API_KEY&&env.MAIL_FROM&&env.SUPABASE_URL&&env.SUPABASE_SERVICE_ROLE_KEY;
const unavailable='Online submission is temporarily unavailable. Please call 239-297-1703 or email sean@guidedpayments.com.';
const signature=(text,env)=>createHmac('sha256',env.FORM_SECRET||env.RESEND_API_KEY).update(text).digest('hex');
export function issueToken(env,now=Date.now()){
 if(!ready(env))return json(503,{error:unavailable});
 const payload=`${now}.${randomUUID()}`;
 return json(200,{token:`${payload}.${signature(payload,env)}`});
}
function validToken(token,env,now){
 if(typeof token!=='string'||token.length>200)return false;
 const [time,nonce,sig]=token.split('.');if(!time||!nonce||!/^[a-f0-9]{64}$/.test(sig||''))return false;
 const age=now-Number(time);if(!Number.isFinite(age)||age<1500||age>2*60*60*1000)return false;
 const expected=signature(`${time}.${nonce}`,env);return timingSafeEqual(Buffer.from(sig),Buffer.from(expected));
}
export function createLeadHandler({send=fetch,now=Date.now}={}){
 const limits=new Map(),pending=new Map();
 return async function handle(request,env){
  if(request.method!=='POST')return json(405,{error:'Method not allowed.'});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json(415,{error:'Use JSON.'});
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return json(403,{error:'Invalid origin.'});
  const ip=request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'unknown';
  const clock=now();for(const [key,value] of limits)if(clock>value.until)limits.delete(key);
  const limit=limits.get(ip)||{count:0,until:clock+60000};limits.set(ip,limit);if(++limit.count>8)return json(429,{error:'Please wait a minute before trying again, or call 239-297-1703.'});
  let data;try{const text=await request.text();if(Buffer.byteLength(text)>12000)return json(413,{error:'Your message is too long.'});data=JSON.parse(text);}catch{return json(400,{error:'Invalid inquiry.'});}
  if(!data||typeof data!=='object'||data.website)return json(400,{error:'Unable to submit. Please call 239-297-1703.'});
  const fields={};
  for(const [key,max] of Object.entries({name:100,email:254,phone:30,organization:150,message:2000,cardVolume:40,equipment:50,submissionId:36})){
   if(data[key]!==undefined&&typeof data[key]!=='string')return json(400,{error:'Invalid fields.'});
   fields[key]=(data[key]||'').trim();if(fields[key].length>max)return json(400,{error:'One of your fields is too long.'});
  }
  fields.email=fields.email.toLowerCase();
  if(!fields.name||!fields.organization||!/^\S+@[^\s@]+\.[^\s@]+$/.test(fields.email)||/[\r\n]/.test(fields.email)||fields.phone.replace(/\D/g,'').length<7||!/^[+()\d.\s-]+$/.test(fields.phone)||!volumeOptions.includes(fields.cardVolume)||!equipmentOptions.includes(fields.equipment)||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(fields.submissionId))return json(400,{error:'Please provide your name, business, valid contact details, monthly card sales, and equipment interest.'});
  if(!ready(env))return json(503,{error:unavailable});
  if(!validToken(data.token,env,clock))return json(400,{code:'TOKEN_EXPIRED',error:'Please wait a moment and submit again. Your form verification has been refreshed.'});
  const message=`Source: https://guidedpayments.com\nMonthly card sales: ${fields.cardVolume}\nEquipment: ${fields.equipment}\nSupplied equipment pricing: ${equipmentPrices[fields.equipment]||'To be discussed'}\nNotes: ${fields.message||'None'}\nRequested phone/email follow-up. No automated outreach consent.`;
  const row={id:fields.submissionId,full_name:fields.name,email:fields.email,company:fields.organization,phone:fields.phone,role,message};
  const key=signature(JSON.stringify(row),env);
  if(pending.has(key))return (await pending.get(key)).clone();
  const task=(async()=>{
   const dbHeaders={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'};
   const dbBase=`${env.SUPABASE_URL.replace(/\/$/,'')}/rest/v1/demo_requests`;
   async function db(suffix,init={}){const response=await send(dbBase+suffix,{...init,headers:{...dbHeaders,...init.headers},signal:AbortSignal.timeout(7000)});if(!response.ok)throw new Error('storage');return response;}
   let stored;
   try{
    stored=(await (await db(`?id=eq.${fields.submissionId}&select=id,full_name,email,company,phone,role,message`)).json())[0];
    if(stored){
     const delivered=/\n\[GP notification:[a-zA-Z0-9-]+\]$/.test(stored.message||'');
     const baseMessage=stored.message?.replace(/\n\[GP notification:[a-zA-Z0-9-]+\]$/,'');
     if(stored.role!==role||stored.full_name!==row.full_name||stored.email!==row.email||stored.company!==row.company||stored.phone!==row.phone||baseMessage!==message)return json(409,{error:'This submission reference is already in use. Refresh the page to send a new inquiry.'});
     if(delivered)return json(200,{ok:true,reference:fields.submissionId});
    }else{
     const since=new Date(clock-10*60000).toISOString();
     const recent=await (await db(`?email=eq.${encodeURIComponent(fields.email)}&role=eq.${encodeURIComponent(role)}&created_at=gte.${since}&select=id&limit=3`)).json();
     if(recent.length>=3)return json(429,{error:'We already have recent inquiries from this email. Please wait or call 239-297-1703.'});
     await db('?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(row)});
    }
   }catch{return json(503,{error:'We could not save your inquiry. Please try again or contact sean@guidedpayments.com.'});}
   try{
    const email=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`guided-inquiry-${fields.submissionId}`},body:JSON.stringify({from:env.MAIL_FROM,to:[destination],reply_to:fields.email,subject:`Guided Payments inquiry — ${fields.organization.replace(/[\r\n]/g,' ')}`,text:`New Guided Payments inquiry\nPowered by Priority Business Solutions\n\nName: ${fields.name}\nBusiness: ${fields.organization}\nEmail: ${fields.email}\nPhone: ${fields.phone}\n\n${message}\n\nReference: ${fields.submissionId}`}),signal:AbortSignal.timeout(10000)});
    if(!email.ok)throw new Error('email');const receipt=await email.json();if(!receipt.id)throw new Error('receipt');
    await db(`?id=eq.${fields.submissionId}`,{method:'PATCH',body:JSON.stringify({message:`${message}\n[GP notification:${receipt.id}]`})});
    return json(200,{ok:true,reference:fields.submissionId});
   }catch{return json(502,{error:'Your inquiry is saved, but we could not confirm the email notification. Please retry or call 239-297-1703; retrying will not create another inquiry.'});}
  })();pending.set(key,task);
  try{return (await task).clone();}finally{pending.delete(key);}
 };
}
