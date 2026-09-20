import test from 'node:test';
import assert from 'node:assert/strict';
import {render} from './pages.mjs';
test('three-step funnel keeps sales separate and carries equipment to page two',()=>{
 const sales=render('/zerofee'),inquiry=render('/zerofee/inquiry'),thanks=render('/zerofee/thank-you');
 assert.doesNotMatch(sales,/id="lead-form"|id="equipment-picker"|href="#inquiry"/);
 for(const equipment of ['Clover Flex','Clover Mini','Clover Station','Clover Station Duo'])assert.ok(sales.includes('/zerofee/inquiry?equipment='+encodeURIComponent(equipment)));
 assert.match(inquiry,/id="equipment-picker"/);assert.match(inquiry,/data-success-url="\/zerofee\/thank-you"/);
 assert.match(inquiry,/Help me choose/);assert.match(thanks,/Your inquiry has been received/);
 assert.match(sales,/rel="canonical" href="https:\/\/guidedpayments.com\/zerofee"/);
 assert.doesNotMatch(sales,/name="robots" content="noindex"/);
 assert.match(inquiry,/name="robots" content="noindex"/);
});
test('main website retains on-page form and inline success flow',()=>{
 const home=render('/home-page');assert.match(home,/id="lead-form"/);assert.match(home,/href="#inquiry"/);assert.doesNotMatch(home,/data-success-url|funnel-steps/);
});
