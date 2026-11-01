import test from 'node:test';
import assert from 'node:assert/strict';
import {render} from './pages.mjs';
test('partner playbook renders at /partners/prospect, noindex, with its assets and no rates',()=>{
 const html=render('/partners/prospect');
 assert.match(html,/<title>Prospect Marketing partner playbook \| Guided Payments<\/title>/);
 assert.match(html,/name="robots" content="noindex"/);
 assert.match(html,/href="\/playbook\.css"/);assert.match(html,/src="\/playbook\.js"/);
 for(const id of ['pb-start','pb-spot','pb-introduce','pb-handoff','pb-problems','pb-offer','pb-contact'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(html,/sean@guidedpayments\.com/);assert.match(html,/\(239\) 297-1703/);
 assert.match(html,/href="\/statement-analyzer"/);assert.match(html,/href="\/partners"/);
 assert.doesNotMatch(html,/\$\d|\d+(\.\d+)?% residual|guaranteed savings/i);
 assert.ok(!html.includes("pb-fill"),"no unfilled placeholders ship");
 assert.ok((html.match(/class="pb-ask"/g)||[]).length>=6,"ask-Sean callout appears in every section");
});
