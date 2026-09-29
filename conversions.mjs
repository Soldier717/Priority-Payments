import {BUCKET,UUID,digest,seal} from './boarding-crypto.mjs';
export const conversionEvents=['inquiry_completed','analysis_completed','report_emailed','boarding_completed'];
export async function recordConversion(path,response,env,{send=fetch,now=Date.now}={}){
 if(!response.ok)return response;
 try{
  const d=await response.clone().json();
  if(d.ok!==true||!UUID.test(d.reference||''))return response;
  const events=[];
  if(path==='/api/lead')events.push('inquiry_completed');
  if(path==='/api/statement/analyze'&&d.brief)events.push('analysis_completed');
  if(['/api/statement/email','/api/statement/analyze'].includes(path)&&d.emailed===true)events.push('report_emailed');
  if(path==='/api/boarding/submit')events.push('boarding_completed');
  for(const event of events){
   const scope=env.VERCEL_ENV==='production'?'production':'testing';
   const object=`metrics/${scope}/${event}/${digest(env,event+':'+d.reference)}`;
   const r=await send(env.SUPABASE_URL+'/storage/v1/object/'+BUCKET+'/'+object,{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/octet-stream','x-upsert':'false'},body:seal(Buffer.from(JSON.stringify({event,at:new Date(now()).toISOString()})),env,object),signal:AbortSignal.timeout(2500)});
   if(!r.ok){const e=await r.json().catch(()=>({}));if(r.status!==409&&Number(e.statusCode)!==409&&e.error!=='Duplicate')console.error('conversion_record_failed',event);}
  }
 }catch{console.error('conversion_record_failed');}
 return response;
}
