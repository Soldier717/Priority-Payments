(()=>{
 const $=s=>document.querySelector(s);
 const login=$('#partner-login-form'),referred=$('#referred-form');
 if(!login&&!referred)return;
 let token='',tokenRequest;
 async function formToken(){if(tokenRequest)return tokenRequest;tokenRequest=(async()=>{const r=await fetch('/api/form-token',{cache:'no-store'}),d=await r.json();if(!r.ok||!d.token)throw Error(d.error||'Forms are temporarily unavailable. Contact Sean.');token=d.token;})();try{await tokenRequest;}finally{tokenRequest=null;}}
 async function api(action,data={}){const r=await fetch('/api/partners/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),cache:'no-store',signal:AbortSignal.timeout(55000)});const d=await r.json();if(!r.ok){const e=Error(d.error||'Please try again.');e.status=r.status;throw e;}return d;}
 async function verified(action,data){if(!token){await formToken();throw Error('Verification refreshed. Please wait a moment and try again.');}try{return await api(action,{...data,token});}catch(e){if(e.status===400)await formToken().catch(()=>{});throw e;}}
 function message(node,value,error=false){node.textContent=value;node.dataset.state=error?'error':'success';}
 formToken().catch(()=>{});
 if(referred){
  const partnerId=new URLSearchParams(location.search).get('partner'),button=$('#referred-submit'),status=$('#referred-status');
  let id=crypto.randomUUID(),snapshot='',pending=false,complete=false;
  if(!/^[a-f0-9]{64}$/.test(partnerId||'')){message(status,'This referral link is incomplete. Ask your referral partner for their full link, or contact Sean.',true);return;}
  button.disabled=false;
  referred.addEventListener('submit',async event=>{event.preventDefault();if(pending||complete||!referred.reportValidity())return;
   const f=new FormData(referred),data=Object.fromEntries(f);data.consent=f.get('consent')==='on';const serialized=JSON.stringify(data);if(snapshot&&snapshot!==serialized)id=crypto.randomUUID();snapshot=serialized;
   pending=true;button.disabled=true;referred.setAttribute('aria-busy','true');message(status,'Sending your introduction…');
   try{const result=await verified('submit',{...data,id,partnerId});if(!result.ok)throw Error('We could not confirm your referral. Please retry.');complete=true;message(status,'Thank you—your referral was saved and Sean was notified. He’ll follow up with you. Your reference is '+result.reference+'.');button.textContent='Referral received ✓';}
   catch(e){message(status,e.name==='TimeoutError'?'Delivery is not yet confirmed. Retry safely using the same form.':e.message,true);}
   finally{pending=false;button.disabled=complete;referred.removeAttribute('aria-busy');status.focus();}
  });return;
 }
 const status=$('#partner-status'),dashboard=$('#partner-dashboard'),loginPanel=$('#partner-login');
 let selected='',recordsOffset=0,directoryOffset=0,busy=false;
 function node(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
 function showError(e){message(status,e.name==='TimeoutError'?'This request timed out. Please retry.':e.message,true);if(e.status===401){dashboard.hidden=true;loginPanel.hidden=false;$('#partner-records').replaceChildren();$('#partner-directory').replaceChildren();$('#partner-share-link').value='';}status.focus();}
 async function load(more=false,directory=false){
  const offset=more?(directory?directoryOffset:recordsOffset):0,d=await api('dashboard',{...(selected?{partnerId:selected}:{}),offset});
  dashboard.hidden=false;loginPanel.hidden=true;$('#partner-admin').hidden=!d.admin||!!d.partner;$('#partner-referrals').hidden=!d.partner;
  if(d.partners){selected='';$('#partner-welcome').textContent='Partner management';const list=$('#partner-directory');if(!more)list.replaceChildren();
   for(const p of d.partners){const b=node('button',p.name+' · '+p.email,'partner-directory-item');b.type='button';b.addEventListener('click',()=>{selected=p.id;load().catch(showError);});list.append(b);}
   directoryOffset=offset+25;$('#partner-directory-more').hidden=!d.more;
   if(!more&&!d.partners.length)list.append(node('p','No partners yet. Register your first partner above.'));
  }else{
   selected=d.partner.id;$('#partner-welcome').textContent=d.partner.name+' — referrals';$('#partner-back').hidden=!d.admin;$('#partner-share-link').value=d.shareUrl;
   const list=$('#partner-records');if(!more)list.replaceChildren();$('#partner-empty').hidden=more||d.records.length>0;
   for(const r of d.records){const card=node('article',undefined,'form-card partner-record');card.append(node('h3',r.business),node('p','Submitted '+new Date(r.createdAt).toLocaleDateString()),node('span',r.status,'partner-badge'));if(d.admin){
    card.append(node('p',r.details.name+' · '+r.details.email+' · '+r.details.phone),node('p',r.details.message||'No notes.'));
    const label=node('label','Referral status'),select=node('select');for(const value of ['Submitted','Contacted','Signed up']){const option=node('option',value);option.value=value;option.selected=value===r.status;select.append(option);}label.append(select);const save=node('button','Save status','button small');save.type='button';save.addEventListener('click',async()=>{save.disabled=true;try{await api('status',{partnerId:selected,id:r.id,status:select.value});card.querySelector('.partner-badge').textContent=select.value;message(status,'Referral status updated.');}catch(e){showError(e);}finally{save.disabled=false;}});card.append(label,save);
   }list.append(card);}
   recordsOffset=offset+25;$('#partner-records-more').hidden=!d.more;
  }
 }
 login.addEventListener('submit',async e=>{e.preventDefault();if(busy||!login.reportValidity())return;busy=true;const b=login.querySelector('button');b.disabled=true;try{const d=await verified('login',Object.fromEntries(new FormData(login)));message(status,d.message);}catch(e){showError(e);}finally{busy=false;b.disabled=false;status.focus();}});
 $('#partner-invite-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;if(busy||!form.reportValidity())return;busy=true;const b=form.querySelector('button');b.disabled=true;try{const d=await api('invite',Object.fromEntries(new FormData(form)));form.reset();selected=d.partner.id;await load();message(status,'Partner registered. Copy their personal link below and share the dashboard address: '+location.origin+'/partners');}catch(e){showError(e);}finally{busy=false;b.disabled=false;}});
 $('#partner-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#partner-share-link').value);message(status,'Referral link copied.');}catch{$('#partner-share-link').select();message(status,'Select and copy the link above.');}});
 $('#partner-back').addEventListener('click',()=>{selected='';load().catch(showError);});
 $('#partner-refresh').addEventListener('click',()=>load().catch(showError));
 $('#partner-directory-more').addEventListener('click',()=>load(true,true).catch(showError));
 $('#partner-records-more').addEventListener('click',()=>load(true).catch(showError));
 $('#partner-logout').addEventListener('click',async()=>{try{await api('logout');location.replace('/partners');}catch(e){showError(e);}});
 let signingIn=false;
 async function boot(){if(signingIn)return;signingIn=true;try{const signIn=new URLSearchParams(location.hash.slice(1)).get('sign-in');if(signIn){history.replaceState(null,'',location.pathname);await api('session',{token:signIn});}try{await load();if(signIn)message(status,'Signed in. Your referral dashboard is ready.');}catch(e){if(e.status!==401||signIn)throw e;}}finally{signingIn=false;}}
 window.addEventListener('hashchange',()=>boot().catch(showError));
 boot().catch(showError);
})();
