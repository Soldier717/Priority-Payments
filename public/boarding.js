async function request(path,data={}){const r=await fetch('/api/boarding/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),cache:'no-store',signal:AbortSignal.timeout(55000)});if(!r.ok){const d=await r.json().catch(()=>({}));const e=new Error(d.error||'The request could not be completed. Please try again.');e.status=r.status;throw e;}return r;}
async function formToken(){const r=await fetch('/api/form-token',{cache:'no-store'});const d=await r.json();if(!r.ok||!d.token)throw Error('Online boarding is temporarily unavailable. Contact Sean at 239-297-1703.');return d.token;}
const boarding=document.querySelector('#boarding-form');
if(boarding){
 const button=document.querySelector('#boarding-submit'),status=document.querySelector('#boarding-status'),fields=document.querySelector('#boarding-fields');
 let pending=false,complete=false,capability='',snapshot,files=[],id=crypto.randomUUID(),token='';
 formToken().then(t=>token=t).catch(()=>{});
 const encode=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(Error('Could not read this file. Please choose it again.'));reader.readAsDataURL(file);});
 boarding.addEventListener('submit',async event=>{
  event.preventDefault();if(pending||complete)return;
  if(!snapshot){if(!boarding.reportValidity())return;const f=new FormData(boarding);const details=Object.fromEntries(['dba','legalName','businessPhone','businessEmail','ein','ownerName','ownerPhone','ssn','paymentNeeds','acceptance'].map(n=>[n,String(f.get(n)||'').trim()]));details.consent=f.get('consent')==='on';
   if(!details.dba&&!details.legalName){status.textContent='Enter your business DBA or legal name.';status.focus();return;}
   files=['bank','license'].map(kind=>({kind,file:f.get(kind)})).filter(x=>x.file?.size);
   if(files.some(x=>x.file.size>3*1024*1024||!['application/pdf','image/png','image/jpeg'].includes(x.file.type))){status.textContent='Choose PDF, JPG, or PNG files up to 3 MB each.';status.focus();return;}
   snapshot={details,website:String(f.get('website')||'')};
  }
  pending=true;button.disabled=true;boarding.setAttribute('aria-busy','true');status.dataset.state='loading';
  try{
   if(!capability){status.textContent='Saving your details securely…';if(!token){token=await formToken();throw Error('Form verification refreshed. Please wait a moment, then submit again.');}const d=await (await request('start',{...snapshot,id,token})).json();capability=d.capability;fields.disabled=true;}
   for(const entry of files){if(entry.uploaded)continue;status.textContent=entry.kind==='bank'?'Uploading your bank document…':'Uploading your driver’s license…';await request('upload',{capability,kind:entry.kind,file:await encode(entry.file)});entry.uploaded=true;}
   status.textContent='Finishing your submission and notifying Sean…';const d=await (await request('submit',{capability,documents:files.map(x=>x.kind)})).json();
   if(d.ok!==true)throw Error('We could not confirm your submission. Please retry.');complete=true;boarding.reset();snapshot=null;files=[];capability='';status.dataset.state='success';status.textContent='Thank you. Your boarding details were saved and Sean was notified. Your reference is '+d.reference+'. Sean will follow up about the next steps.';button.textContent='Boarding details received ✓';status.focus();
  }catch(e){status.dataset.state='error';status.textContent=e.name==='TimeoutError'?'We could not confirm completion yet. Retry without reloading; your submission reference will stay the same.':e.message;button.disabled=false;button.textContent='Retry submission ↗';if(!capability){snapshot=null;token=await formToken().catch(()=>'');}status.focus();}
  finally{pending=false;boarding.removeAttribute('aria-busy');}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hideSsn();});
 window.addEventListener('pagehide',()=>hideSsn());
 window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
}
const login=document.querySelector('#review-login');
if(login){
 const status=document.querySelector('#review-status'),content=document.querySelector('#review-content'),detail=document.querySelector('#review-detail'),list=document.querySelector('#review-list'),more=document.querySelector('#review-more');
 let signInToken=new URLSearchParams(location.hash.slice(1)).get('sign-in'),offset=0,token='',expiry,detailVersion=0,hideSsn=()=>{};
 if(signInToken){history.replaceState(null,'',location.pathname);document.querySelector('#review-confirm').hidden=false;document.querySelector('#review-send').hidden=true;}
 formToken().then(t=>token=t).catch(()=>{});
 const clear=()=>{detailVersion++;hideSsn();content.hidden=true;detail.replaceChildren();detail.hidden=true;list.replaceChildren();login.hidden=false;clearTimeout(expiry);};
 const error=e=>{status.textContent=e.message;if(e.status===401)clear();status.focus();};
 async function load(reset=true){const data=await (await request('list',{offset:reset?0:offset})).json();login.hidden=true;content.hidden=false;if(reset)loadMetrics();if(reset){list.replaceChildren();offset=0;}for(const d of data.records){const button=document.createElement('button');button.type='button';button.className='review-record';button.textContent=(d.dba||d.legalName)+' · '+new Date(d.submittedAt).toLocaleString();button.addEventListener('click',()=>show(d.id).catch(error));list.append(button);}offset+=data.records.length;more.hidden=!data.more;status.textContent=offset?'Select a submission to review.':'No completed boarding submissions yet.';}
 async function loadMetrics(){let panel=document.querySelector('#conversion-counts');if(!panel){panel=document.createElement('section');panel.id='conversion-counts';content.prepend(panel);}panel.textContent='Loading conversion counts…';try{const d=await (await request('metrics',{})).json();panel.replaceChildren();const h=document.createElement('h2');h.textContent='Completed actions';panel.append(h);const labels={inquiry_completed:'Inquiries',analysis_completed:'Statement analyses',report_emailed:'Full reports emailed',boarding_completed:'Boarding submissions'};for(const [event,label] of Object.entries(labels)){const p=document.createElement('p');p.textContent=label+': '+d.counts[event].last30Days+' in the last 30 days · '+d.counts[event].total+' since tracking began';panel.append(p);}const note=document.createElement('p');note.className='micro';note.textContent='Tracking starts September 20, 2026. Retries count once. Emails count when the email service accepts them, not when opened.'+(d.capped?' Counts capped at 10,000 per action.':'');panel.append(note);}catch{panel.textContent='Conversion counts are temporarily unavailable. Your boarding records remain available below.';}}
 const labels={dba:'Business DBA',legalName:'Legal name',businessPhone:'Business phone',businessEmail:'Business email',ein:'EIN',ownerName:'Owner name',ownerPhone:'Owner phone',ssn:'Social Security number',paymentNeeds:'Payment needs',acceptance:'Acceptance method'};
 async function show(id){const version=++detailVersion;hideSsn();const d=await (await request('detail',{id})).json();if(version!==detailVersion)return;detail.replaceChildren();const h=document.createElement('h2');h.textContent=d.details.dba||d.details.legalName;detail.append(h);const ref=document.createElement('p');ref.textContent='Reference: '+id;detail.append(ref);const dl=document.createElement('dl');let ssn;
  for(const [k,label] of Object.entries(labels)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=d.details[k]||'Not provided';dl.append(dt,dd);if(k==='ssn'){ssn=document.createElement('span');ssn.id='review-ssn-value';ssn.textContent=dd.textContent;dd.replaceChildren(ssn);dd.className='review-ssn';}}detail.append(dl);
  const reveal=document.createElement('button'),revealStatus=document.createElement('p');
  reveal.type='button';reveal.id='review-reveal';reveal.textContent='Reveal SSN';reveal.setAttribute('aria-controls','review-ssn-value');
  revealStatus.id='review-reveal-status';revealStatus.className='micro';revealStatus.setAttribute('role','status');revealStatus.setAttribute('aria-live','polite');
  ssn.parentNode.append(reveal,revealStatus);
  let timer,revealed=false,attempt=0;
  const mask=()=>{attempt++;clearTimeout(timer);ssn.textContent=d.details.ssn||'Not provided';revealed=false;reveal.disabled=d.details.ssn==='Not provided';reveal.textContent='Reveal SSN';revealStatus.textContent=reveal.disabled?'No Social Security number was included with this submission.':'';};
  hideSsn=mask;mask();
  reveal.addEventListener('click',async()=>{
   if(revealed){mask();return;}
   const currentAttempt=++attempt;reveal.disabled=true;reveal.textContent='Revealing…';revealStatus.textContent='Checking your secure review session…';
   try{
    const x=await (await request('reveal',{id})).json();if(version!==detailVersion||currentAttempt!==attempt)return;
    if(x.ssn==='Not provided'){ssn.textContent=x.ssn;reveal.textContent='SSN not provided';revealStatus.textContent='No Social Security number was included with this submission.';return;}
    if(typeof x.ssn!=='string'||!/^\d{9}$/.test(x.ssn))throw Error('The Social Security number could not be displayed. Please retry.');
    ssn.textContent=x.ssn.replace(/^(\d{3})(\d{2})(\d{4})$/,'$1-$2-$3');revealed=true;reveal.disabled=false;reveal.textContent='Hide SSN';revealStatus.textContent='Visible for 30 seconds. You can hide it now.';timer=setTimeout(mask,30000);
   }catch(e){if(version!==detailVersion||currentAttempt!==attempt)return;mask();revealStatus.textContent=e.message;revealStatus.dataset.state='error';if(e.status===401)error(e);}
  });
  for(const kind of d.documents){const b=document.createElement('button');b.type='button';b.textContent='Download '+(kind==='bank'?'bank document':'driver’s license');b.addEventListener('click',async()=>{b.disabled=true;try{const r=await request('document',{id,kind}),blob=await r.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=kind+'-'+id+'.'+({'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg'}[blob.type]||'bin');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){error(e);}finally{b.disabled=false;}});detail.append(b);}
  const note=document.createElement('p');note.className='micro';note.textContent='Access and downloads are recorded. Uploaded documents are customer-supplied; they have not been malware-scanned.';detail.append(note);detail.hidden=false;detail.scrollIntoView({behavior:'smooth',block:'start'});
 }
 document.querySelector('#review-send').addEventListener('click',async event=>{const b=event.currentTarget;b.disabled=true;try{if(!token){token=await formToken();throw Error('Please wait a moment, then request your sign-in link.');}const d=await (await request('login',{token})).json();status.textContent=d.message;}catch(e){error(e);}finally{b.disabled=false;}});
 document.querySelector('#review-confirm').addEventListener('click',async event=>{const b=event.currentTarget;b.disabled=true;try{await request('session',{token:signInToken});signInToken=null;document.querySelector('#review-send').hidden=false;b.hidden=true;expiry=setTimeout(()=>{clear();status.textContent='Your review session has expired. Sign in again.';},30*60000);await load();}catch(e){error(e);document.querySelector('#review-send').hidden=false;}finally{b.disabled=false;}});
 document.querySelector('#review-refresh').addEventListener('click',()=>load().catch(error));more.addEventListener('click',()=>load(false).catch(error));
 document.querySelector('#review-logout').addEventListener('click',async()=>{clear();try{await request('logout');status.textContent='Signed out.';}catch(e){status.textContent='The sign-out request could not be confirmed. Close this browser; the session expires automatically within 30 minutes.';}});
 if(!signInToken)load().then(()=>{expiry=setTimeout(clear,30*60000);}).catch(e=>{if(e.status!==401)error(e);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hideSsn();});
 window.addEventListener('pagehide',()=>hideSsn());
 window.addEventListener('pageshow',event=>{if(event.persisted){clear();location.reload();}});
}
