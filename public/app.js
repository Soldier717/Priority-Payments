const volume=document.querySelector('#volume');
if(volume){
 const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
 const update=()=>{const sales=Number(volume.value);document.querySelector('#monthly').textContent=money.format(sales);document.querySelector('#monthly-cost').textContent=money.format(sales*.0275);document.querySelector('#annual').textContent=money.format(sales*.0275*12);volume.setAttribute('aria-valuetext',money.format(sales)+' monthly card sales');};
 volume.addEventListener('input',update);update();
}
const form=document.querySelector('#lead-form');
if(form){
 const status=document.querySelector('#form-status'),submit=document.querySelector('#submit-lead'),equipment=form.elements.equipment,picker=document.querySelector('#equipment-picker');
 let pending=false,completed=false,requestKey=crypto.randomUUID(),lastPayload='',token='',tokenRequest;
 function syncEquipment(){if(!picker)return;document.querySelector('#picker-selected').textContent=equipment.value;const buttons=[...picker.querySelectorAll('[data-equipment]')];document.querySelector('#picker-price').textContent=buttons.find(b=>b.dataset.equipment===equipment.value)?.dataset.price||'';buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.equipment===equipment.value)));}
 function choose(value){if([...equipment.options].some(o=>o.value===value)){equipment.value=value;syncEquipment();}}
 choose(new URLSearchParams(location.search).get('equipment'));syncEquipment();equipment.addEventListener('change',syncEquipment);
 document.querySelectorAll('[data-equipment]').forEach(button=>button.addEventListener('click',()=>{choose(button.dataset.equipment);if(picker?.contains(button)){picker.open=false;picker.querySelector('summary').focus();}else{requestAnimationFrame(()=>equipment.focus({preventScroll:true}));}}));
 if(picker){document.addEventListener('click',e=>{if(!picker.contains(e.target))picker.open=false;});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&picker.open){picker.open=false;picker.querySelector('summary').focus();}});}
 async function loadToken(){if(tokenRequest)return tokenRequest;tokenRequest=(async()=>{const r=await fetch('/api/form-token',{cache:'no-store'});const result=await r.json();if(!r.ok||!result.token)throw new Error('Online submission is temporarily unavailable. Please call 239-297-1703 or email sean@guidedpayments.com.');token=result.token;})();try{await tokenRequest;}finally{tokenRequest=null;}}
 loadToken().catch(()=>{});
 form.addEventListener('input',()=>{for(const el of form.querySelectorAll('[aria-invalid=true]'))if(el.validity.valid)el.removeAttribute('aria-invalid');});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(pending||completed)return;
  if(!form.checkValidity()){for(const el of form.querySelectorAll('input,select,textarea'))if(!el.validity.valid)el.setAttribute('aria-invalid','true');form.reportValidity();return;}
  const data=Object.fromEntries(new FormData(form)),serialized=JSON.stringify(data);if(lastPayload&&lastPayload!==serialized)requestKey=crypto.randomUUID();lastPayload=serialized;
  pending=true;submit.disabled=true;submit.textContent='Sending your inquiry…';form.setAttribute('aria-busy','true');status.dataset.state='loading';status.textContent='Securely submitting your inquiry…';
  try{
   if(!token)await loadToken();
   const response=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,submissionId:requestKey,token}),signal:AbortSignal.timeout(45000)});
   const result=await response.json();if(!response.ok||result.ok!==true){if(result.code==='TOKEN_EXPIRED'){token='';await loadToken();}throw new Error(result.error||'We could not confirm your inquiry. Please try again or call 239-297-1703.');}
   completed=true;status.dataset.state='success';status.textContent='Thank you—your inquiry was saved and your notification was sent to Sean. We’ll follow up by phone or email to review your options.';submit.textContent='Inquiry received ✓';status.focus();
  }catch(error){status.dataset.state='error';status.textContent=error.name==='TimeoutError'?'We could not confirm delivery yet. Please retry; your request will not be duplicated. You can also call 239-297-1703.':error.message;submit.disabled=false;submit.textContent='Request my estimate ↗';status.focus();}
  finally{pending=false;form.removeAttribute('aria-busy');}
 });
}
