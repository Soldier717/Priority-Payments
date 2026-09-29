import {createPartnerHandler} from './partners.mjs';
const handlePartners=createPartnerHandler();
import {recordConversion} from './conversions.mjs';
import {createStatementHandler} from './statement.mjs';
const handleStatement=createStatementHandler();
import {createBoardingHandler} from './boarding.mjs';
const handleBoarding=createBoardingHandler();
import {render,pages} from './pages.mjs';
import {assets} from './assets.mjs';
import {createLeadHandler,issueToken} from './lead.mjs';
const handleLead=createLeadHandler();
const handleReferral=createLeadHandler({referral:true});
export default {async fetch(request,env){
 const url=new URL(request.url);const path=url.pathname.replace(/\/$/,'')||'/';
 if(path==='/api/form-token')return request.method==='GET'?issueToken(env):new Response('Method not allowed',{status:405});
 if(path.startsWith('/api/partners/'))return handlePartners(request,env);
 if(path.startsWith('/api/statement/')){const response=await handleStatement(request,env);return recordConversion(path,response,env);}
 if(path.startsWith('/api/boarding/')){const response=await handleBoarding(request,env);return recordConversion(path,response,env);}
 if(path==='/api/referral')return handleReferral(request,env);
 if(path==='/api/lead'){const response=await handleLead(request,env);return recordConversion(path,response,env);}
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(path==='/home-page'){const target=new URL(url);target.pathname='/';return Response.redirect(target,308);}
 const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"};
 if(pages[path]){
  if((path.startsWith('/boarding')||path==='/statement-analyzer'||path==='/partners'||path==='/refer')){headers['Cache-Control']='no-store, private';headers['Referrer-Policy']='no-referrer';headers['X-Robots-Tag']='noindex, nofollow';}
  let html=render(path);
  return new Response(request.method==='HEAD'?null:html,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Cache-Control':(path.startsWith('/boarding')||path==='/statement-analyzer'||path==='/partners'||path==='/refer')?'no-store, private':'no-cache'}});
 }
 if(assets[path]){const asset=assets[path];const bytes=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));return new Response(request.method==='HEAD'?null:bytes,{headers:{...headers,'Content-Type':asset.type,'Cache-Control':'public, max-age=3600'}});}
 return new Response('Page not found.',{status:404});
}};
