import {render,pages} from './pages.mjs';
import {assets} from './assets.mjs';
import {createLeadHandler,issueToken} from './lead.mjs';
const handleLead=createLeadHandler();
export default {async fetch(request,env){
 const url=new URL(request.url);const path=url.pathname.replace(/\/$/,'')||'/';
 if(path==='/api/form-token')return request.method==='GET'?issueToken(env):new Response('Method not allowed',{status:405});
 if(path==='/api/lead')return handleLead(request,env);
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(path==='/')return Response.redirect(new URL('/home-page',url),302);
 const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"};
 if(pages[path]){
  let html=render(path);
  return new Response(request.method==='HEAD'?null:html,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
 }
 if(assets[path]){const asset=assets[path];const bytes=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));return new Response(request.method==='HEAD'?null:bytes,{headers:{...headers,'Content-Type':asset.type,'Cache-Control':'public, max-age=3600'}});}
 return new Response('Page not found.',{status:404});
}};
