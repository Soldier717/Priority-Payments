(()=>{
const form=document.querySelector('#statement-form');
if(form){
 const button=document.querySelector('#statement-submit'),status=document.querySelector('#statement-status'),fields=document.querySelector('#statement-fields'),result=document.querySelector('#statement-result');
 let token='',pending=false,uploaded=false,complete=false,id=crypto.randomUUID(),access=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
 const loadToken=async()=>{const r=await fetch('/api/form-token',{cache:'no-store'});if(!r.ok)throw Error('The analyzer is temporarily unavailable. Please contact Sean.');token=(await r.json()).token;};loadToken().catch(()=>{});
 async function call(path,data){const r=await fetch('/api/statement/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,id,access}),cache:'no-store',signal:AbortSignal.timeout(165000)});const d=await r.json();if(!r.ok)throw Error(d.error||'We could not complete your analysis. Please retry.');return d;}
 const encode=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=()=>reject(Error('Could not read this file. Please choose it again.'));r.readAsDataURL(file);});
 function show(d){result.replaceChildren();const h=document.createElement('h2');h.textContent='Your statement at a glance';result.append(h);const p=document.createElement('p');p.textContent=d.brief.summary;result.append(p);const dl=document.createElement('dl');for(const [label,value] of [['Statement period',d.brief.period],['Card sales',d.brief.volume],['Card fees',d.brief.fees],['Effective card cost',d.brief.rate]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;dl.append(dt,dd);}result.append(dl);for(const line of [...d.brief.highlights,...d.brief.limitations]){const item=document.createElement('p');item.textContent='• '+line;result.append(item);}const note=document.createElement('p');note.className='micro';note.textContent=d.brief.disclaimer;result.append(note);addEmailCapture();result.hidden=false;result.focus();}

 function addEmailCapture(){
  const emailForm=document.createElement('form');emailForm.method='post';
  const title=document.createElement('h3');title.textContent='Want the full breakdown?';
  const intro=document.createElement('p');intro.textContent='Get the fee breakdown, observations, and questions to review—sent straight to your inbox.';
  const label=document.createElement('label');label.textContent='Email address';
  const input=document.createElement('input');input.type='email';input.name='email';input.autocomplete='email';input.required=true;input.maxLength=254;label.append(input);
  const sendButton=document.createElement('button');sendButton.type='submit';sendButton.className='button';sendButton.textContent='Email Me Full Report';
  const note=document.createElement('p');note.className='micro';note.textContent='By requesting your report, you agree to receive it at this address, with a copy to Sean at Guided Payments. No account or marketing subscription required.';
  const feedback=document.createElement('p');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  emailForm.append(title,intro,label,note,sendButton,feedback);result.append(emailForm);
  let sending=false,sent=false,boundEmail='';
  emailForm.addEventListener('submit',async event=>{
   event.preventDefault();if(sending||sent||!emailForm.reportValidity())return;
   sending=true;sendButton.disabled=true;input.readOnly=true;sendButton.textContent='Sending your report…';feedback.textContent='';
   if(!boundEmail)boundEmail=input.value.trim().toLowerCase();
   try{await loadToken();await new Promise(r=>setTimeout(r,1600));const response=await call('email',{email:boundEmail,consent:true,token,website:''});
    if(!response.emailed)throw Error(response.message||'Delivery could not be confirmed. Please retry.');
    sent=true;feedback.textContent='Full report sent to '+boundEmail+'. Sean received a copy too.';sendButton.textContent='Report sent ✓';
    const restart=document.createElement('a');restart.href='/statement-analyzer';restart.className='button';restart.textContent='Upload another statement';emailForm.append(restart);
   }catch(e){feedback.textContent=e.message;sendButton.textContent='Retry sending full report';}
   finally{sending=false;sendButton.disabled=sent;}
  });
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(pending||complete)return;if(!uploaded&&!form.reportValidity())return;
  pending=true;button.disabled=true;form.setAttribute('aria-busy','true');status.dataset.state='loading';
  try{
   if(!uploaded){const data=Object.fromEntries(new FormData(form)),file=data.statement;delete data.statement;if(file.size>3*1024*1024||!['application/pdf','image/jpeg','image/png'].includes(file.type))throw Error('Choose a PDF, JPG, or PNG up to 3 MB.');if(!token){await loadToken();throw Error('Form verification refreshed. Wait a moment and try again.');}status.textContent='Uploading your statement securely…';await call('upload',{...data,flow:'summary-first',consent:data.consent==='on',file:await encode(file),token});uploaded=true;fields.disabled=true;}
   status.textContent='Reading your statement and checking the figures. This can take a minute or two…';button.textContent='Analyzing…';
   let d=await call('analyze',{});for(let i=0;d.pending&&i<24;i++){await new Promise(r=>setTimeout(r,5000));d=await call('analyze',{});}if(d.pending)throw Error('The review is still processing. Please retry shortly without reloading this page.');if(!d.ok||!d.brief)throw Error('We could not confirm the analysis. Please retry.');show(d);status.textContent=d.message+' Reference: '+d.reference;status.dataset.state='success';complete=true;button.textContent='Analysis complete ✓';form.reset();
  }catch(e){status.dataset.state='error';status.textContent=e.name==='TimeoutError'?'The analysis is taking longer than expected. Retry without reloading; your existing submission will be reused.':e.message;button.textContent=uploaded?'Retry analysis ↗':'Analyze my statement ↗';if(!uploaded)await loadToken().catch(()=>{});status.focus();}
  finally{pending=false;button.disabled=complete;form.removeAttribute('aria-busy');}
 });
 button.disabled=false;
 status.textContent='Ready to upload your statement.';
 window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
}
})();
