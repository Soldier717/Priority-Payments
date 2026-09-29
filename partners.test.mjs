import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createPartnerHandler} from './partners.mjs';
import {issueToken} from './lead.mjs';
import {ADMIN,BUCKET} from './boarding-crypto.mjs';
import {render} from './pages.mjs';
const env={SUPABASE_URL:'https://storage.example',SUPABASE_SERVICE_ROLE_KEY:'test-only',RESEND_API_KEY:'test-only',MAIL_FROM:'test@example.com',BOARDING_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64'),VERCEL_ENV:'production'};
function fixture(){
 let clock=Date.now(),failEmail=false,failStorage=false;const objects=new Map(),emails=[],receipts=new Map();
 const send=async(url,init={})=>{
  if(url==='https://api.resend.com/emails'){if(failEmail)return new Response('',{status:500});const id=init.headers['Idempotency-Key'];if(!receipts.has(id)){emails.push(JSON.parse(init.body));receipts.set(id,randomUUID());}return Response.json({id:receipts.get(id)});}
  assert.ok(url.startsWith(env.SUPABASE_URL));if(failStorage)return new Response('',{status:500});
  if(url.endsWith('/object/list/'+BUCKET)){const {prefix,offset,limit}=JSON.parse(init.body);const rows=[...objects.keys()].filter(k=>k.startsWith(prefix+'/')&&!k.slice(prefix.length+1).includes('/')).reverse().slice(offset,offset+limit).map(k=>({name:k.slice(prefix.length+1)}));return Response.json(rows);}
  const path=url.split('/object/'+BUCKET+'/')[1];assert.ok(path);
  if(init.method==='POST'){if(objects.has(path)&&init.headers['x-upsert']!=='true')return Response.json({error:'Duplicate'},{status:409});objects.set(path,Buffer.from(init.body));return new Response(null,{status:201});}
  return objects.has(path)?new Response(objects.get(path)):Response.json({error:'not_found'},{status:404});
 };
 const handle=createPartnerHandler({send,now:()=>clock});
 const call=async(action,data={},cookie='',origin='https://guidedpayments.com',environment=env)=>{const r=await handle(new Request('https://guidedpayments.com/api/partners/'+action,{method:'POST',headers:{'Content-Type':'application/json',origin,cookie},body:JSON.stringify(data)}),environment);return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],data:await r.json(),headers:r.headers};};
 const token=async()=> (await (await issueToken(env,clock-2000)).json()).token;
 const login=async email=>{const r=await call('login',{email,token:await token()});assert.equal(r.status,200);const t=emails.at(-1).text.match(/#sign-in=([a-f0-9]{64})/)[1];const session=await call('session',{token:t});assert.equal(session.status,200);return {cookie:session.cookie,token:t};};
 const register=async(admin,email='partner@example.com')=>{const r=await call('invite',{name:'Partner One',email},admin);assert.equal(r.status,200);return r.data.partner;};
 const inquiry=async partner=>({partnerId:partner.id,id:randomUUID(),name:'Business Owner',business:'Example Shop',email:'owner@example.com',phone:'2395550100',message:'Please discuss my POS.',consent:true,token:await token()});
 return {objects,emails,call,login,register,inquiry,token,setEmailFailure:v=>failEmail=v,setStorageFailure:v=>failStorage=v,advance:ms=>clock+=ms};
}
test('admin creates stable partner links; attribution persists and partners see only their own business/status',async()=>{
 const f=fixture(),admin=await f.login(ADMIN),p=await f.register(admin.cookie),p2=await f.register(admin.cookie,'second@example.com');
 assert.equal((await f.register(admin.cookie)).id,p.id);
 const data=await f.inquiry(p);assert.equal((await f.call('submit',data)).status,200);
 const notification=f.emails.at(-1);assert.deepEqual(notification.to,[ADMIN]);assert.equal(notification.reply_to,'owner@example.com');assert.match(notification.text,/partner@example.com/);
 const count=f.emails.length;assert.equal((await f.call('submit',data)).status,200);assert.equal(f.emails.length,count);
 assert.equal((await f.call('submit',{...data,business:'Changed'})).status,409);
 const partner=await f.login(p.email),other=await f.login(p2.email);
 const dashboard=await f.call('dashboard',{},partner.cookie);assert.equal(dashboard.status,200);assert.equal(dashboard.data.records.length,1);assert.equal(dashboard.data.records[0].status,'Submitted');assert.equal(dashboard.data.records[0].business,'Example Shop');assert.equal(dashboard.data.records[0].details,undefined);assert.doesNotMatch(JSON.stringify(dashboard.data),/owner@example.com|Please discuss/);assert.ok(dashboard.data.shareUrl.endsWith(p.id));
 assert.equal((await f.call('dashboard',{},other.cookie)).data.records.length,0);
 assert.equal((await f.call('dashboard',{partnerId:p.id},other.cookie)).status,403);
 assert.equal((await f.call('dashboard',{partnerId:p.id})).status,401);
 assert.equal((await f.call('invite',{name:'Unauthorized',email:'third@example.com'},partner.cookie)).status,403);
 for(const status of ['Contacted','Signed up']){assert.equal((await f.call('status',{partnerId:p.id,id:data.id,status},partner.cookie)).status,403);assert.equal((await f.call('status',{partnerId:p.id,id:data.id,status},admin.cookie)).status,200);assert.equal((await f.call('dashboard',{},partner.cookie)).data.records[0].status,status);}
 const review=await f.call('dashboard',{partnerId:p.id},admin.cookie);assert.equal(review.data.records[0].details.email,'owner@example.com');assert.equal(review.headers.get('cache-control'),'no-store, private');
 const ciphertext=Buffer.concat([...f.objects.values()]).toString();assert.doesNotMatch(ciphertext,/Business Owner|owner@example.com/);
});
test('login links are single use, sessions expire and logout revokes access',async()=>{
 const f=fixture(),admin=await f.login(ADMIN);assert.equal((await f.call('session',{token:admin.token})).status,401);
 assert.equal((await f.call('logout',{},admin.cookie)).status,200);assert.equal((await f.call('dashboard',{},admin.cookie)).status,401);
 const again=await f.login(ADMIN);f.advance(3600001);assert.equal((await f.call('dashboard',{},again.cookie)).status,401);
 await f.call('login',{email:ADMIN,token:await f.token()});const t=f.emails.at(-1).text.match(/#sign-in=([a-f0-9]{64})/)[1];f.advance(15*60000+1);assert.equal((await f.call('session',{token:t})).status,401);
 const count=f.emails.length;const unknown=await f.call('login',{email:'unknown@example.com',token:await f.token()});assert.equal(unknown.status,200);assert.equal(f.emails.length,count);
});
test('invalid referrals, forged authentication, foreign origins and missing consent cannot create records',async()=>{
 const f=fixture(),admin=await f.login(ADMIN),p=await f.register(admin.cookie),data=await f.inquiry(p),before=f.emails.length;
 for(const patch of [{consent:false},{email:'invalid'},{phone:'1'},{token:'forged'},{website:'spam'},{partnerId:'bad'},{id:'bad'}])assert.equal((await f.call('submit',{...data,...patch})).status,400);
 assert.equal((await f.call('submit',data,'','https://foreign.example')).status,403);
 assert.equal((await f.call('submit',{...data,partnerId:'f'.repeat(64)})).status,404);
 assert.equal((await f.call('dashboard',{},'__Host-gp-partner='+'f'.repeat(64))).status,401);
 assert.equal(f.emails.length,before);
 assert.equal((await f.call('submit',data,'','https://guidedpayments.com',{})).status,503);
});
test('notification failure retains attributed record, retries once, and storage failure never reports success',async()=>{
 const f=fixture(),admin=await f.login(ADMIN),p=await f.register(admin.cookie),data=await f.inquiry(p);
 f.setEmailFailure(true);assert.equal((await f.call('submit',data)).status,502);f.setEmailFailure(false);assert.equal((await f.call('submit',data)).status,200);
 assert.equal((await f.call('dashboard',{partnerId:p.id},admin.cookie)).data.records.length,1);
 f.setStorageFailure(true);assert.equal((await f.call('submit',{...data,id:randomUUID()})).status,503);
});
test('rate limits, pagination and testing storage isolation',async()=>{
 const f=fixture(),admin=await f.login(ADMIN),p=await f.register(admin.cookie),data=await f.inquiry(p);
 for(let i=0;i<3;i++)assert.equal((await f.call('submit',{...data,id:randomUUID()})).status,200);
 assert.equal((await f.call('submit',{...data,id:randomUUID()})).status,429);
 assert.equal((await f.call('submit',data,'','https://guidedpayments.com',{...env,VERCEL_ENV:'preview'})).status,404);
 assert.equal((await f.call('dashboard',{offset:-1},admin.cookie)).status,400);
 for(let i=0;i<25;i++)await f.register(admin.cookie,`partner${i}@example.com`);
 const first=await f.call('dashboard',{},admin.cookie),second=await f.call('dashboard',{offset:25},admin.cookie);assert.equal(first.data.partners.length,25);assert.equal(first.data.more,true);assert.equal(second.data.partners.length,1);assert.equal(second.data.more,false);
});
test('public pages expose partner entry points without private data',()=>{
 assert.match(render('/referrals'),/href="\/partners"/);assert.match(render('/partners'),/id="partner-login-form"/);assert.match(render('/refer'),/id="referred-form"/);assert.match(render('/refer'),/name="consent"/);assert.match(render('/partners'),/src="\/partners.js"/);
});
