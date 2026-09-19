import {render,pages} from './pages.mjs';
import {equipmentOptions,businessTypes,volumeOptions,equipmentPrices} from './funnel.mjs';
import {assets} from './assets.mjs';
const limits=new Map();
const json=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export default {async fetch(request,env){
 const url=new URL(request.url);const path=url.pathname.replace(/\/$/,'')||'/';
 if(path==='/api/lead'){
  if(request.method!=='POST')return json(405,{error:'Method not allowed.'});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json(415,{error:'Use JSON.'});
  if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json(403,{error:'Invalid origin.'});
  const now=Date.now();for(const [ip,item] of limits)if(now>item.until)limits.delete(ip);
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';const item=limits.get(ip)||{count:0,until:now+60000};limits.set(ip,item);if(++item.count>10)return json(429,{error:'Please wait a minute, or call (239) 297-1703.'});
  let raw='';const reader=request.body?.getReader();if(!reader)return json(400,{error:'Missing inquiry.'});let size=0;const decoder=new TextDecoder();
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>12000){await reader.cancel();return json(413,{error:'Your message is too long.'});}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();
  let data;try{data=JSON.parse(raw);}catch{return json(400,{error:'Invalid inquiry.'});}if(!data||typeof data!=='object'||data.website)return json(400,{error:'Unable to submit. Please call us.'});
  const fields={};for(const [key,max] of Object.entries({name:100,email:254,phone:30,organization:150,message:2000,submissionId:36,businessType:50,zip:10,cardVolume:40,equipment:50})){if(data[key]!==undefined&&typeof data[key]!=='string')return json(400,{error:'Invalid fields.'});fields[key]=(data[key]||'').trim();if(fields[key].length>max)return json(400,{error:'One of your fields is too long.'});}
  if(!fields.organization||!businessTypes.includes(fields.businessType)||!volumeOptions.includes(fields.cardVolume)||!equipmentOptions.includes(fields.equipment)||!/^\d{5}(-\d{4})?$/.test(fields.zip))return json(400,{error:'Please complete your business details with a valid ZIP code.'});
  if(!fields.name||!/^\S+@[^\s@]+\.[^\s@]+$/.test(fields.email)||/[\r\n]/.test(fields.email)||fields.phone.replace(/\D/g,'').length<7||!/^[-+()\d.\s]+$/.test(fields.phone)||!/^[0-9a-f-]{36}$/i.test(fields.submissionId))return json(400,{error:'Please provide your name, a valid email, and a valid phone number.'});
  if(!env.RESEND_API_KEY||!env.MAIL_FROM)return json(503,{error:'Please call (239) 297-1703 or email sean@ppssfl.com to request your estimate.'});
  try{
   const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`lead-${fields.submissionId}`},body:JSON.stringify({from:env.MAIL_FROM,to:['sean@ppssfl.com'],reply_to:fields.email,subject:'New zero-fee processing inquiry',text:`New Priority inquiry\n\nName: ${fields.name}\nBusiness: ${fields.organization}\nBusiness type: ${fields.businessType}\nZIP: ${fields.zip}\nMonthly card sales: ${fields.cardVolume}\nEquipment: ${fields.equipment}\nAdvertised equipment price: ${equipmentPrices[fields.equipment]||'To be discussed'}\nEmail: ${fields.email}\nPhone: ${fields.phone}\n\n${fields.message}\n\nRequested phone/email follow-up. No automated SMS consent collected.`}),signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw new Error('Delivery rejected');const receipt=await response.json();if(!receipt.id)throw new Error('No receipt');return json(200,{ok:true});
  }catch{return json(502,{error:'We could not confirm your inquiry. Please try again or call (239) 297-1703.'});}
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(path==='/')return Response.redirect(new URL('/home-page',url),302);
 const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"};
 if(pages[path]){
  let html=render(path);
  if(path==='/zero-fee-inquiry'&&(!env.RESEND_API_KEY||!env.MAIL_FROM)){
   html=html.replace(/<form id="lead-form"[\s\S]*?<\/form>/,`<div class="direct-inquiry"><p class="eyebrow">LET’S TALK</p><h2>Get your personal estimate.</h2><p>Tell us about your business, monthly card sales, and the equipment you’re interested in. We’ll help you compare your options.</p><a class="button" href="mailto:sean@ppssfl.com?subject=Zero-fee%20processing%20inquiry">Email Sean ↗</a><a class="back-link" href="tel:+12392971703">Call (239) 297-1703</a></div>`)
    .replace(/<details class="equipment-picker"[\s\S]*?<\/details>/,'<a class="button small" href="tel:+12392971703">Call us ↗</a>')
    .replace(/<ol class="form-progress"[\s\S]*?<\/ol>/,'');
  }
  return new Response(request.method==='HEAD'?null:html,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
 }
 if(assets[path]){const asset=assets[path];const bytes=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));return new Response(request.method==='HEAD'?null:bytes,{headers:{...headers,'Content-Type':asset.type,'Cache-Control':'public, max-age=3600'}});}
 return new Response('Page not found.',{status:404});
}};
