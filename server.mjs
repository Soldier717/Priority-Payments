import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import handler from './api/site.js';
const publicFiles=new Set(['style.css','funnel.css','guided.css','app.js','gp-brand.png','og.png','favicon.svg','clover-flex.png','clover-mini.png','clover-station.png','clover-duo.png']);
export function createServer(){
 return http.createServer(async(req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.slice(1);
  try{
   if(publicFiles.has(name)&&['GET','HEAD'].includes(req.method)){
    const bytes=await readFile(new URL('./public/'+name,import.meta.url));
    const ext=name.split('.').pop();res.setHeader('Content-Type',{css:'text/css',js:'text/javascript',png:'image/png',svg:'image/svg+xml'}[ext]);res.end(req.method==='HEAD'?undefined:bytes);return;
   }
   await handler(req,res);
  }catch{res.statusCode=500;res.end('Unable to complete request.');}
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url))createServer().listen(Number(process.env.PORT)||4174,'127.0.0.1',()=>console.log('Guided Payments preview ready'));
