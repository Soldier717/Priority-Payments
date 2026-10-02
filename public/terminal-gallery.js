{
 const dialog=document.querySelector('#terminal-photo-dialog');
 if(dialog&&typeof dialog.showModal==='function'){
  const photo=dialog.querySelector('#terminal-photo-large');
  const title=dialog.querySelector('#terminal-photo-title');
  const info=dialog.querySelector('#terminal-photo-info');
  const status=dialog.querySelector('#terminal-photo-status');
  let opener;
  document.querySelectorAll('[data-terminal-photo]').forEach(link=>{
   link.addEventListener('click',event=>{
    event.preventDefault();opener=link;
    title.textContent=link.dataset.terminalPhoto;
    photo.alt=link.dataset.terminalPhoto+' enlarged product photo';
    photo.src=link.href;
    info.dataset.equipment=link.dataset.terminalPhoto;
    status.textContent='';
    document.documentElement.classList.add('terminal-view-open');
    dialog.showModal();
   });
  });
  photo.addEventListener('error',()=>{
   if(!opener||photo.getAttribute('src')===opener.dataset.thumbnail)return;
   photo.src=opener.dataset.thumbnail;
   status.textContent='Showing the standard photo. The larger image is temporarily unavailable.';
  });
  dialog.querySelector('.terminal-photo-close').addEventListener('click',()=>dialog.close());
  info.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
   if(event.target!==dialog)return;
   const bounds=dialog.getBoundingClientRect();
   if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();
  });
  dialog.addEventListener('close',()=>{
   document.documentElement.classList.remove('terminal-view-open');
   opener?.focus({preventScroll:true});
  });
 }
}
