const volume = document.querySelector('#volume');
if (volume) { const money = new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}); volume.addEventListener('input',()=>{document.querySelector('#monthly').textContent=money.format(volume.value);document.querySelector('#annual').replaceChildren(document.createTextNode(money.format(Number(volume.value)*.0275*12)),Object.assign(document.createElement('span'),{textContent:'/ year'}));}); }
const form = document.querySelector('#lead-form');
if (form) {
 const first=document.querySelector('#business-step'), second=document.querySelector('#contact-step');
 const status=document.querySelector('#form-status'), submit=document.querySelector('#submit-lead');
 const equipment=form.elements.equipment;
 const chosen=new URLSearchParams(location.search).get('equipment');
 if([...equipment.options].some(option=>option.value===chosen)) equipment.value=chosen;
 const picker=document.querySelector('#equipment-picker');
 function syncEquipment(){
  document.querySelector('#picker-selected').textContent=equipment.value;
  const selected=[...picker.querySelectorAll('[data-equipment]')].find(button=>button.dataset.equipment===equipment.value);
  document.querySelector('#picker-price').textContent=selected?.dataset.price||'';
  picker.querySelectorAll('[data-equipment]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.equipment===equipment.value)));
  document.querySelector('#business-summary').textContent=`${form.elements.organization.value} · ${form.elements.cardVolume.value}/month · ${equipment.value}`;
 }
 syncEquipment();
 equipment.addEventListener('change',syncEquipment);
 picker.querySelectorAll('[data-equipment]').forEach(button=>button.addEventListener('click',()=>{
  equipment.value=button.dataset.equipment;syncEquipment();picker.open=false;picker.querySelector('summary').focus();
  const url=new URL(location.href);url.searchParams.set('equipment',equipment.value);history.replaceState(null,'',url);
 }));
 document.addEventListener('click',event=>{if(!picker.contains(event.target))picker.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&picker.open){picker.open=false;picker.querySelector('summary').focus();}});
 let requestKey=crypto.randomUUID(), lastPayload='';
 function valid(section){for(const input of section.querySelectorAll('input,select,textarea'))if(!input.reportValidity())return false;return true;}
 function step(number){
  first.hidden=number!==1;second.hidden=number!==2;
  document.querySelector('#progress-1').setAttribute('aria-current',number===1?'step':'false');
  document.querySelector('#progress-2').setAttribute('aria-current',number===2?'step':'false');
  status.textContent='';
  if(number===2)document.querySelector('#business-summary').textContent=`${form.elements.organization.value} · ${form.elements.cardVolume.value}/month · ${equipment.value}`;
  (number===1?first:second).querySelector('input').focus();
 }
 document.querySelector('#next-step').addEventListener('click',()=>{if(valid(first))step(2);});
 document.querySelector('#previous-step').addEventListener('click',()=>step(1));
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!first.hidden){if(valid(first))step(2);return;}
  if(!valid(second))return;
  submit.disabled=true;document.querySelector('#previous-step').disabled=true;submit.textContent='Sending your inquiry…';status.textContent='';
  const data=Object.fromEntries(new FormData(form));const serialized=JSON.stringify(data);
  if(lastPayload&&lastPayload!==serialized)requestKey=crypto.randomUUID();lastPayload=serialized;
  try{
   const response=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,submissionId:requestKey}),signal:AbortSignal.timeout(20000)});
   let result;try{result=await response.json();}catch{throw new Error('We could not confirm your inquiry. Please try again or call (239) 297-1703.');}
   if(!response.ok)throw new Error(result.error||'Please try again.');
   location.assign('/zero-fee-thank-you');
  }catch(error){status.textContent=error.name==='TimeoutError'?'We could not confirm submission. Please try again or call (239) 297-1703.':error.message;submit.disabled=false;document.querySelector('#previous-step').disabled=false;submit.textContent='Get my savings estimate ↗';}
 });
}
