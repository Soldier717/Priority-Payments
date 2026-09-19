import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {pages,render} from './pages.mjs';
import {equipmentOptions,businessTypes,volumeOptions} from './funnel.mjs';
export function createServer({env=process.env,send=fetch}={}) {
 const limits=new Map();
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  const json=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  let path;try{path=new URL(req.url,'http://localhost').pathname.replace(/\/$/,'')||'/';}catch{return json(400,{error:'Invalid request.'});}
  if(path==='/api/lead'){
   if(req.method!=='POST')return json(405,{error:'Method not allowed.'});
   if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Use JSON.'});
   if(req.headers.origin){let origin;try{origin=new URL(req.headers.origin);}catch{return json(403,{error:'Invalid origin.'});}if(origin.host!==req.headers.host)return json(403,{error:'Invalid origin.'});}
   const now=Date.now();for(const [ip,value] of limits)if(now>value.until)limits.delete(ip);
   const ip=req.socket.remoteAddress;const limit=limits.get(ip)||{count:0,until:now+60000};limits.set(ip,limit);if(++limit.count>10)return json(429,{error:'Please wait a minute and try again, or call (239) 297-1703.'});
   let raw='';try{for await(const part of req){raw+=part;if(Buffer.byteLength(raw)>12000)return json(413,{error:'Your message is too long.'});}}catch{return json(400,{error:'Could not read submission.'});}
   let data;try{data=JSON.parse(raw);}catch{return json(400,{error:'Invalid submission.'});}if(!data||typeof data!=='object')return json(400,{error:'Invalid submission.'});
   if(data.website)return json(400,{error:'Unable to submit. Please call us.'});
   const fields={};for(const [key,max] of Object.entries({name:100,email:254,phone:30,organization:150,message:2000,submissionId:36,businessType:50,zip:10,cardVolume:40,equipment:50})){if(data[key]!==undefined&&typeof data[key]!=='string')return json(400,{error:'Invalid fields.'});fields[key]=(data[key]||'').trim();if(fields[key].length>max)return json(400,{error:'One of your fields is too long.'});}
   if(!fields.organization||!businessTypes.includes(fields.businessType)||!volumeOptions.includes(fields.cardVolume)||!equipmentOptions.includes(fields.equipment)||!/^\d{5}(-\d{4})?$/.test(fields.zip))return json(400,{error:'Please complete your business details with a valid ZIP code.'});
   if(!fields.name||!/^\S+@[^\s@]+\.[^\s@]+$/.test(fields.email)||/[\r\n]/.test(fields.email)||fields.phone.replace(/\D/g,'').length<7||!/^[-+()\d.\s]+$/.test(fields.phone)||!/^[0-9a-f-]{36}$/i.test(fields.submissionId))return json(400,{error:'Please provide your name, a valid email, and a valid phone number.'});
   if(!env.RESEND_API_KEY||!env.MAIL_FROM)return json(503,{error:'Online inquiries are not available yet. Please call (239) 297-1703 or email sean@ppssfl.com.'});
   try{const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`lead-${fields.submissionId}`},body:JSON.stringify({from:env.MAIL_FROM,to:['sean@ppssfl.com'],reply_to:fields.email,subject:'New zero-fee processing inquiry',text:`New inquiry from the Priority funnel\n\nName: ${fields.name}\nBusiness: ${fields.organization}\nBusiness type: ${fields.businessType}\nZIP: ${fields.zip}\nMonthly card sales: ${fields.cardVolume}\nEquipment interest: ${fields.equipment}\nEmail: ${fields.email}\nPhone: ${fields.phone}\n\nMessage:\n${fields.message||'Not provided'}\n\nRequested phone/email follow-up. No automated SMS consent collected.`}),signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error('Delivery provider rejected');const receipt=await response.json();if(!receipt.id)throw new Error('Missing receipt');return json(200,{ok:true});}catch{return json(502,{error:'We could not confirm your inquiry. Please try again or call (239) 297-1703.'});}
  }
  if(!['GET','HEAD'].includes(req.method))return json(405,{error:'Method not allowed.'});
  if(path==='/'){res.writeHead(302,{Location:'/home-page'});return res.end();}
  if(pages[path]){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(req.method==='HEAD'?'':render(path));}
  if(['/style.css','/funnel.css','/app.js','/priority-logo-updated.png','/terminal-evolution.png','/clover-flex.png','/clover-mini.png','/clover-station.png','/clover-duo.png','/og.png','/favicon.svg'].includes(path)){const bytes=await readFile(new URL(`./public${path}`,import.meta.url));res.writeHead(200,{'Content-Type':path.endsWith('.svg')?'image/svg+xml':path.endsWith('.png')?'image/png':path.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8'});return res.end(req.method==='HEAD'?'':bytes);}
  res.writeHead(404,{'Content-Type':'text/plain'});res.end('Page not found.');
 });return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url))createServer().listen(Number(process.env.PORT)||4173,process.env.HOST||'127.0.0.1',()=>console.log(`Priority funnel: http://localhost:${process.env.PORT||4173}`));
