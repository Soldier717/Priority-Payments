import {terminalCatalog} from './terminal-catalog.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import handler from './api/site.js';
const publicFiles=new Set([...terminalCatalog.flatMap(t=>[t.image.slice(1),t.largeImage.slice(1)]),'terminal-gallery.js','centers.css','terminal-p1.webp','terminal-vl550.webp','partners.js','referral-program.pdf','quantic-pos-official.png','quantic-dual-pricing-receipt.png','pos-quantic-reference.png','pos-square-reference.png','pos-tonic-photo.jpeg','terminal-evolution.png','boarding.css','boarding.js','statement.js','style.css','funnel.css','guided.css','app.js','gp-brand.png','guided-social-split-v1.png','priority-brand.jpeg','og.png','favicon.svg','clover-flex.png','clover-mini.png','clover-station.png','clover-duo.png']);
export function createServer(){
 return http.createServer(async(req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.slice(1);
  try{
   if(publicFiles.has(name)&&['GET','HEAD'].includes(req.method)){
    const bytes=await readFile(new URL('./public/'+name,import.meta.url));
    const ext=name.split('.').pop();res.setHeader('Content-Type',{webp:'image/webp',pdf:'application/pdf',css:'text/css',js:'text/javascript',png:'image/png',jpeg:'image/jpeg',svg:'image/svg+xml'}[ext]);res.end(req.method==='HEAD'?undefined:bytes);return;
   }
   await handler(req,res);
  }catch{res.statusCode=500;res.end('Unable to complete request.');}
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url))createServer().listen(Number(process.env.PORT)||4174,'127.0.0.1',()=>console.log('Guided Payments preview ready'));
