import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {statementPage} from './statement-page.mjs';
test('shared classic scripts coexist and analyzer registers its submit handler',async()=>{
 const handlers={},button={disabled:true},status={};
 const form={addEventListener:(name,handler)=>handlers[name]=handler};
 const nodes={'#statement-form':form,'#statement-submit':button,'#statement-status':status};
 const context=vm.createContext({document:{querySelector:s=>nodes[s]||null,querySelectorAll:()=>[]},window:{addEventListener(){}},crypto:globalThis.crypto,Uint8Array,fetch:async()=>({ok:true,json:async()=>({token:'test'})})});
 for(const file of ['app.js','boarding.js','statement.js'])vm.runInContext(await readFile(new URL('./public/'+file,import.meta.url),'utf8'),context,{filename:file});
 assert.equal(typeof handlers.submit,'function');assert.equal(button.disabled,false);assert.match(status.textContent,/Ready/);
 assert.match(statementPage,/id="statement-submit" type="submit" disabled/);assert.match(statementPage,/<form[^>]+method="post"/);
});
