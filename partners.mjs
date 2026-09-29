import {randomBytes,randomUUID} from 'node:crypto';
import {validToken} from './lead.mjs';
import {ADMIN,UUID,Failure,fail,key,digest} from './boarding-crypto.mjs';
import {siteOrigin} from './site-config.mjs';
import {partnerStorage} from './partner-storage.mjs';
const ID=/^[a-f0-9]{64}$/;
const headers={'Cache-Control':'no-store, private','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
const reply=(status,data,extra={})=>Response.json(data,{status,headers:{...headers,...extra}});
export const partnerStatuses=['Submitted','Contacted','Signed up'];
export function createPartnerHandler({send=fetch,now=Date.now}={}){
 return async function handle(req,env){try{
  const url=new URL(req.url),action=url.pathname.split('/').pop();
  if(req.method!=='POST')return reply(405,{error:'Method not allowed.'});
  if(req.headers.get('origin')!==url.origin)fail(403,'Please use the Guided Payments website.');
  if(!req.headers.get('content-type')?.startsWith('application/json'))fail(415,'Use JSON.');
  if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY||!env.RESEND_API_KEY||!env.MAIL_FROM)fail(503,'Partner access is temporarily unavailable. Contact sean@guidedpayments.com.');
  key(env);
  const raw=await req.text();if(Buffer.byteLength(raw)>12000)fail(413,'Your message is too long.');
  let data;try{data=JSON.parse(raw);}catch{fail(400,'Invalid request.');}
  if(!data||typeof data!=='object'||Array.isArray(data))fail(400,'Invalid request.');
  const {get,save,list,limit}=partnerStorage(env,send,now);
  const ip=req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'unknown';
  function field(name,max,required=true){const v=data[name];if(v!==undefined&&typeof v!=='string')fail(400,'Check your form fields.');const s=(v||'').trim();if(s.length>max||(required&&!s))fail(400,'Complete the required fields.');return s;}
  const normalizeEmail=v=>{const email=v.toLowerCase();if(!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email))fail(400,'Enter a valid email address.');return email;};
  function verifyForm(){if(data.website||!validToken(data.token,env,now()))fail(400,'Form verification expired. Refresh the page and try again.');}
  async function email(to,subject,text,id,replyTo){const r=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({from:env.MAIL_FROM,to:[to],subject,text,...(replyTo?{reply_to:replyTo}:{})}),signal:AbortSignal.timeout(10000)});if(!r.ok)fail(502,'Email delivery could not be confirmed. Please retry or contact Sean.');const receipt=await r.json();if(!receipt.id)fail(502,'Email delivery could not be confirmed.');return receipt.id;}
  if(action==='login'){
   verifyForm();const address=normalizeEmail(field('email',254));
   await limit('login-ip:'+ip,12,15*60000);await limit('login-email:'+address,3,15*60000);
   const id=digest(env,'partner:'+address),profile=await get('profiles/'+id);
   if(address===ADMIN||profile){
    const token=randomBytes(32).toString('hex');await save('login/'+digest(env,token),{email:address,partnerId:id,expires:now()+15*60000});
    await email(address,'Your Guided Payments partner sign-in link',`Sign in to your private referral dashboard:\n${siteOrigin}/partners#sign-in=${token}\n\nThis single-use link expires in 15 minutes. Request a new link if it expires. If you did not request this, you can ignore it.`, 'partner-login-'+randomUUID());
   }
   return reply(200,{ok:true,message:'If your email is registered, a sign-in link is on its way. New partners can contact Sean to get started.'});
  }
  if(action==='session'){
   if(!ID.test(data.token||''))fail(401,'Invalid sign-in link.');const path='login/'+digest(env,data.token),login=await get(path);
   if(!login||login.expires<=now()||!await save(path+'-used',{at:now()}))fail(401,'This sign-in link expired or was already used. Request a new one.');
   const token=randomBytes(32).toString('hex');await save('sessions/'+digest(env,token),{email:login.email,partnerId:login.partnerId,expires:now()+3600000});
   return reply(200,{ok:true},{'Set-Cookie':`__Host-gp-partner=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=3600`});
  }
  if(action==='submit'){
   verifyForm();if(!ID.test(data.partnerId||'')||!UUID.test(data.id||''))fail(400,'This referral link is invalid. Contact Sean for help.');
   const profile=await get('profiles/'+data.partnerId);if(!profile)fail(404,'This referral link is unavailable. Contact Sean.');
   const details={name:field('name',100),business:field('business',150),email:normalizeEmail(field('email',254)),phone:field('phone',30),message:field('message',2000,false)};
   if(!/^[+()\d.\s-]+$/.test(details.phone)||details.phone.replace(/\D/g,'').length<7)fail(400,'Enter a valid phone number.');
   if(data.consent!==true)fail(400,'Confirm that Sean can contact you and share your referral status with the referring partner.');
   const hash=digest(env,JSON.stringify(details)),path='referrals/'+profile.id+'/'+data.id;
   let record=await get(path);
   if(!record){await limit('submit-ip:'+ip,10,3600000);await limit('submit-email:'+details.email,3,3600000);await save(path,{id:data.id,partnerId:profile.id,details,hash,createdAt:new Date(now()).toISOString()});record=await get(path);}
   if(record?.hash!==hash)fail(409,'This reference is already used. Reload the page to start a new referral.');
   const notification='notifications/'+profile.id+'/'+data.id;
   if(!await get(notification)){
    const receipt=await email(ADMIN,'New partner referral — '+details.business.replace(/[\r\n]/g,' '),`New business inquiry from a partner referral\n\nPartner: ${profile.name}\nPartner email: ${profile.email}\nBusiness: ${details.business}\nContact: ${details.name}\nEmail: ${details.email}\nPhone: ${details.phone}\nNotes: ${details.message||'None'}\n\nReference: ${data.id}\nReview and update status: ${siteOrigin}/partners`, 'partner-referral-'+profile.id+'-'+data.id,details.email);
    await save(notification,{receipt});
   }
   return reply(200,{ok:true,reference:data.id});
  }
  const cookie=req.headers.get('cookie')||'',token=cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith('__Host-gp-partner='))?.split('=')[1];
  if(!ID.test(token||''))fail(401,'Sign in to your referral dashboard.');
  const sessionPath='sessions/'+digest(env,token),session=await get(sessionPath);
  if(!session||session.expires<=now()||await get(sessionPath+'-revoked'))fail(401,'Your session expired. Sign in again.');
  const admin=session.email===ADMIN;
  if(!admin&&!await get('profiles/'+session.partnerId))fail(401,'Partner access is unavailable. Contact Sean.');
  if(action==='logout'){await save(sessionPath+'-revoked',{at:now()});return reply(200,{ok:true},{'Set-Cookie':'__Host-gp-partner=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0'});}
  const offset=data.offset??0;if(!Number.isInteger(offset)||offset<0||offset>100000)fail(400,'Invalid page.');
  if(action==='invite'){
   if(!admin)fail(403,'Only Sean can register partners.');const address=normalizeEmail(field('email',254)),name=field('name',100),id=digest(env,'partner:'+address);
   if(address===ADMIN)fail(400,'Use the partner’s email, not the administrator email.');
   await limit('invite:'+session.email,30,3600000);
   await save('profiles/'+id,{id,name,email:address,createdAt:new Date(now()).toISOString()});
   const profile=await get('profiles/'+id);
   return reply(200,{ok:true,partner:profile,shareUrl:siteOrigin+'/refer?partner='+id});
  }
  if(action==='dashboard'){
   if(admin&&!data.partnerId){const rows=await list('profiles',offset);const partners=await Promise.all(rows.filter(r=>ID.test(r.name)).map(r=>get('profiles/'+r.name)));return reply(200,{admin:true,partners:partners.filter(Boolean),more:rows.length===25});}
   const id=admin?data.partnerId:session.partnerId;if(!ID.test(id||''))fail(400,'Invalid partner.');
   if(!admin&&data.partnerId&&data.partnerId!==id)fail(403,'You can only view your own referrals.');
   const profile=await get('profiles/'+id);if(!profile)fail(404,'Partner not found.');
   const rows=await list('referrals/'+id,offset),records=[];
   for(const row of rows){if(!UUID.test(row.name))continue;const record=await get('referrals/'+id+'/'+row.name);if(!record)continue;const status=await get('statuses/'+id+'/'+record.id);records.push({id:record.id,business:record.details.business,createdAt:record.createdAt,status:status?.status||'Submitted',updatedAt:status?.updatedAt||record.createdAt,...(admin?{details:record.details}:{})});}
   return reply(200,{admin,partner:profile,shareUrl:siteOrigin+'/refer?partner='+id,records,more:rows.length===25});
  }
  if(action==='status'){
   if(!admin)fail(403,'Only Sean can update referral status.');
   if(!ID.test(data.partnerId||'')||!UUID.test(data.id||'')||!partnerStatuses.includes(data.status))fail(400,'Invalid status update.');
   if(!await get('referrals/'+data.partnerId+'/'+data.id))fail(404,'Referral not found.');
   const update={status:data.status,updatedAt:new Date(now()).toISOString(),by:ADMIN};
   await save('audit/'+now()+'-'+randomUUID(),{...update,partnerId:data.partnerId,referralId:data.id});
   await save('statuses/'+data.partnerId+'/'+data.id,update,true);return reply(200,{ok:true});
  }
  return reply(404,{error:'Not found.'});
 }catch(e){return reply(e instanceof Failure?e.status:503,{error:e instanceof Failure?e.message:'Could not complete this request. Please retry or contact Sean.'});}};
}
