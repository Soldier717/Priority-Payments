import {BUCKET,fail,seal,unseal,digest} from './boarding-crypto.mjs';

export function partnerStorage(env,send,now){
 const scope='partners/'+(env.VERCEL_ENV==='production'?'production':'testing')+'/';
 const storage=env.SUPABASE_URL.replace(/\/$/,'')+'/storage/v1';
 async function api(path,init={}){return send(storage+path,{...init,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,...init.headers},signal:AbortSignal.timeout(10000)});}
 async function get(path){const full=scope+path,r=await api('/object/'+BUCKET+'/'+full);if(!r.ok){const e=await r.json().catch(()=>({}));if(r.status===404||Number(e.statusCode)===404||e.error==='not_found')return null;fail(503,'Partner records are temporarily unavailable.');}return JSON.parse(unseal(await r.arrayBuffer(),env,full).toString());}
 async function save(path,value,update=false){const full=scope+path,r=await api('/object/'+BUCKET+'/'+full,{method:'POST',headers:{'Content-Type':'application/octet-stream','x-upsert':String(update)},body:seal(Buffer.from(JSON.stringify(value)),env,full)});if(r.ok)return true;const e=await r.json().catch(()=>({}));if(!update&&(r.status===409||Number(e.statusCode)===409||e.error==='Duplicate'))return false;fail(503,'Could not save this request. Please retry.');}
 async function list(prefix,offset){const r=await api('/object/list/'+BUCKET,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefix:scope+prefix,limit:25,offset,sortBy:{column:'created_at',order:'desc'}})});if(!r.ok)fail(503,'Could not load partner records.');const rows=await r.json();if(!Array.isArray(rows))fail(503,'Could not load partner records.');return rows;}
 async function limit(label,count,period){const prefix='limits/'+digest(env,label)+'/'+Math.floor(now()/period);for(let n=0;n<count;n++)if(await save(prefix+'-'+n,{expires:now()+period}))return;fail(429,'Too many requests. Please wait and try again.');}
 return {get,save,list,limit};
}
