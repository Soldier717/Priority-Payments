// Referral partner playbook for the Prospect Marketing team. Served at /partners/prospect (noindex).
// Content is intentionally free of rates, fees, and timelines so partners can't misquote.
const copyBtn=id=>`<button class="pb-copy" type="button" data-copy="${id}">Copy</button>`;
const PHONE='(239) 297-1703',EMAIL='sean@guidedpayments.com';
// Reusable "ask Sean" callout. Drop it anywhere a question is likely to come up.
const ask=(lead='Need more info?')=>`<aside class="pb-ask"><strong>${lead}</strong> Call or text Sean at <a href="tel:+12392971703">${PHONE}</a>, or email <a href="mailto:${EMAIL}">${EMAIL}</a>. No question is too small.</aside>`;

const nav=`<nav class="pb-nav" aria-label="Playbook sections">
<a href="#start" data-v="start">Start here</a>
<a href="#spot" data-v="spot">Spot it</a>
<a href="#introduce" data-v="introduce">Introduce</a>
<a href="#handoff" data-v="handoff">Hand it off</a>
<a href="#problems" data-v="problems">Client questions</a>
<a href="#offer" data-v="offer">What we offer</a>
<a href="#contact" data-v="contact">Contact &amp; credit</a>
</nav>`;

const start=`<section class="pb-view" id="pb-start">
<h2>Welcome aboard</h2>
<p class="pb-lede">Your clients already pay to accept money. A lot of them pay more than they should, or wrestle with tools that don't fit. You're in the room when that comes up, and that's a great spot to be. This page is the three-minute version of how to turn those moments into a win for the client, for Prospect, and for you.</p>
<div class="pb-rule"><strong>The whole job in one line:</strong> notice a payments headache, mention Sean once, send him the contact. He takes it from there.</div>
<h3>Meet Sean</h3>
<p>Sean Russ leads Guided Payments, powered by Priority Business Solutions, helping businesses of all sizes simplify payments, improve operations, and find technology that fits how they actually work. He's based in Cape Coral, Florida, and he builds relationships on a simple belief: a handshake matters. Show up, keep your word, and stand behind the people who trust you with their business.</p>
<p>His focus is pricing, technology, and support. From card and ACH processing to point-of-sale systems, online payments, invoicing, and custom software integrations, Sean brings the pieces together around what each business needs. He looks past the transaction for ways to cut manual work, connect systems, and make the day-to-day easier. When it makes sense, he also connects clients with payroll, funding, and financing resources.</p>
<p>Sean stays involved after the setup. His clients have a direct line to someone who knows their business and takes ownership of helping them move forward. Same goes for you: there's no call center between you and him, so if something on this page isn't clear, just ask.</p>
${ask('Questions about any of this?')}
<h3>What's on your plate (and what isn't)</h3>
<p>Your part is noticing and introducing. Everything below is Sean's, so you never have to carry it:</p>
<ul><li>Quoting rates, fees, or savings. Sean works those out from the client's real statement.</li><li>Recommending specific hardware or software.</li><li>Troubleshooting a live payments problem. Route it; don't fix it.</li><li>Promises about approval, timing, or contract terms.</li></ul>
<h3>What a great referral looks like</h3>
<div class="pb-grid">
<div class="pb-tile"><h4>Warm, not sold</h4><p>The client knows a call is coming and why. That's it. Sean handles the rest.</p></div>
<div class="pb-tile"><h4>One trigger named</h4><p>“They just launched an online store” beats “they might need payments.” Tell Sean what you heard.</p></div>
<div class="pb-tile"><h4>Sent the same day</h4><p>Referrals cool fast. Send it while the conversation is fresh. Hand it off takes under two minutes.</p></div>
</div>
<h3>How to use this page</h3>
<p>Read Spot it, Introduce, and Hand it off once; that's the core. Client questions is a lookup table for when someone asks you something specific. What we offer is background. Contact &amp; credit is how to reach Sean and how your referrals are tracked.</p>
</section>`;

const tile=(h,p,say)=>`<div class="pb-tile"><h4>${h}</h4><p>${p}</p>${say?`<p class="pb-say">Try: <em>“${say}”</em></p>`:''}</div>`;
const spot=`<section class="pb-view" id="pb-spot">
<h2>Spot the opportunity</h2>
<p class="pb-lede">Payments come up in your work more often than you'd think. Here are the moments to listen for, grouped by the kind of project you're on. You don't need to catch all of them. One good one is a great start.</p>
<h3>During a website or ecommerce build</h3>
<div class="pb-grid">
${tile('New online store','Any WooCommerce or custom ecommerce build needs a payment gateway, and whoever sets it up first usually keeps the account for years. Might as well be someone who\'ll take care of your client.','Before we wire up checkout, want Sean to take a look at your processing? It\'s one quick call.')}
${tile('“Just use Stripe / PayPal / Square”','Great for a hobby shop. For real volume it\'s often the priciest option, and holds or sudden account closures happen more than people expect.','Those work, but at your volume there\'s usually a better fit. Worth a 15-minute look.')}
${tile('Adding invoicing or a client portal','Service businesses that invoice want card and ACH right on the invoice, ideally tied to their accounting software.','Want your clients to pay those invoices online? Sean sets that up with QuickBooks.')}
${tile('Donations, dues, or fees on a site','Nonprofits, associations, and municipalities take recurring payments and fees, and almost never shop their rate.','Who handles your payment processing now? Sean works with organizations like yours.')}
</div>
<h3>In any client conversation</h3>
<div class="pb-grid">
${tile('Complaints about fees','“Processing is killing us,” “the fees keep going up,” “I don\'t understand my statement.” Music to your ears.','Upload one statement at guidedpayments.com/statement-analyzer. It\'s free and shows exactly what you\'re paying.')}
${tile('Opening or expanding a location','A new restaurant, shop, salon, or second location needs a POS and a processor, and usually ends up with whatever the first salesperson offered.','Picked a POS yet? Sean can quote one with the processing built in.')}
${tile('“Can I pass the fee to the customer?”','Yes, when it\'s done right. Done wrong, it breaks card-brand rules. This is one of Sean\'s favorite things to set up.','Yes, there\'s a compliant way. Sean does this all the time.')}
${tile('Cash-flow talk','Slow deposits, held funds, waiting days to get paid, a chargeback nobody understood.','A lot of that is fixable. Let me connect you with Sean.')}
${tile('Switching accounting software','A QuickBooks migration is the perfect moment to connect payments so deposits reconcile on their own.','While you\'re moving books, Sean can tie payments in so deposits match your ledger.')}
${tile('They mention a contract or lease','Long processing contracts and terminal leases with early-termination fees. Sean will read the fine print and tell them what leaving really costs.','Before you renew anything, let Sean read it. No charge.')}
${tile('Payroll, funding, or financing comes up','“We\'re hiring our first employee,” “we need equipment money,” “cash is tight before the season.” Sean has partners for all three, and you get credit for the intro.','Sean handles payroll and small-business funding too. Want the intro?')}
</div>
<h3>Probably not a fit</h3>
<ul><li>Very low card volume. Stripe or Square is fine for them, and Sean will say so.</li><li>CBD, firearms, adult content, crypto, or other high-risk categories. Sean may still have an option; just flag it as high-risk in the handoff.</li><li>Clients outside the United States.</li></ul>
${ask('Not sure if something counts?')}
</section>`;

const introEmail=`Hi [Client first name],

Looping in Sean Russ from Guided Payments (Priority Business Solutions). Sean handles payment processing and point-of-sale for a lot of the businesses we work with, and he's great to deal with.

You mentioned [the trigger: e.g. wanting to pass card fees to customers / setting up checkout on the new site / fees going up]. That's right in Sean's lane. He'll take a look, show you what you're paying now versus what it could be, and tell you whether it's worth changing anything. No cost, no obligation.

Sean, [Client first name] runs [business name] in [city]. [One line of context.]

I'll let you two take it from here.

[Your name]
Prospect Marketing`;

const introduce=`<section class="pb-view" id="pb-introduce">
<h2>Introduce Sean</h2>
<p class="pb-lede">You're not pitching. You're making an introduction the way you'd recommend a good accountant or a great electrician. Keep it short, keep it specific, and let Sean do the explaining.</p>
<h3>The 20-second version</h3>
<div class="pb-rule">“We work with a payments guy named Sean. He sets up card processing and point-of-sale for small businesses, and he usually saves people money or fixes something that's been bugging them. It's one short call, no obligation. Want me to connect you?”</div>
<h3>Four things that make the intro land</h3>
<ol class="pb-steps">
<li><b>Name the thing you noticed.</b><small>“You mentioned the fees on the new site” or “since you're opening the second location.” Specific intros get a yes.</small></li>
<li><b>Say what the first step is.</b><small>One call, or one statement uploaded. Never “a demo” or “a proposal.”</small></li>
<li><b>Say what it costs.</b><small>Nothing. The review is free. Switching only happens if it makes sense for them.</small></li>
<li><b>Ask for permission to connect.</b><small>A yes means you can send Sean their info. A “maybe later” goes in your notes for next time.</small></li>
</ol>
<h3>Email intro</h3>
<div class="pb-script"><div class="pb-bar"><span>Subject: Quick intro — Sean at Guided Payments</span>${copyBtn('pb-intro-email')}</div><pre id="pb-intro-email">${introEmail}</pre></div>
<h3>If they ask you questions</h3>
<p>Good sign. Here's a comfortable answer for the common ones. For anything else, “Great question, let me get Sean to answer that” is a perfect response.</p>
<div class="pb-grid">
${tile('“How much will I save?”','',`Depends on your statement. Upload one at guidedpayments.com/statement-analyzer and you\'ll get a free breakdown in a few minutes. Then Sean confirms the numbers, and he\'ll tell you if the answer is “nothing.”`)}
${tile('“Is this a sales pitch?”','',`It\'s a review. Sean works with us because our clients keep needing this. If you\'re already in good shape, he\'ll say so.`)}
${tile('“I\'m under contract.”','',`Send Sean the contract. He\'ll tell you what leaving actually costs and whether it\'s worth it.`)}
${tile('“Does Prospect get paid for this?”','',`We\'re a referral partner, yes. It doesn\'t change your pricing, and Sean\'s program is public at guidedpayments.com/referrals.`)}
</div>
<h3>A few things to leave to Sean</h3>
<p>These aren't rules so much as ways to keep you out of awkward spots. If a client pushes on any of them, hand it to Sean and you're covered.</p>
<ul><li>Rates, percentages, or dollar figures.</li><li>“Guaranteed,” “lowest,” “cheapest.”</li><li>“Zero fee” on its own. Other charges can still apply, and equipment or software costs depend on the quote.</li><li>Funding timelines. Sean sets expectations after underwriting.</li><li>Naming a specific POS or gateway as the recommendation.</li></ul>
${ask('Want to practice the intro or run a situation by someone first?')}
</section>`;

const handoffMsg=`Business: [name], [city]
Contact: [name] — [email] — [phone]
Best way/time to reach: [e.g. mornings, text first]
Trigger: [what they said or what we're building]
Current processor: [if known]
Monthly card volume: [ballpark or "unknown"]
Setup: [online / storefront / restaurant / invoicing / mix]
Notes: [contract, high-risk, urgency, anything else]
Referred by: [your name], Prospect Marketing`;

const handoff=`<section class="pb-view" id="pb-handoff">
<h2>Hand it off</h2>
<p class="pb-lede">The client said yes. Nice work. Get it to Sean the same day and you're done. Here's what he needs and what happens next.</p>
<h3>What to send</h3>
<div class="pb-tbl"><table>
<tr><th>Field</th><th>Why it helps</th><th>Required?</th></tr>
<tr><td>Business name &amp; city</td><td>Sean looks them up before the call.</td><td>Yes</td></tr>
<tr><td>Contact name, email, phone</td><td>Who Sean calls, and how.</td><td>Yes</td></tr>
<tr><td>The trigger</td><td>“Launching WooCommerce store Nov 15” or “wants to pass fees to customers.” Sets up the whole first call.</td><td>Yes</td></tr>
<tr><td>Best way / time to reach them</td><td>Skips three days of phone tag.</td><td>Yes</td></tr>
<tr><td>Current processor, if known</td><td>Square, Stripe, a bank, a terminal lease. Even “not sure” is useful.</td><td>Nice to have</td></tr>
<tr><td>Rough monthly card volume</td><td>Any ballpark. Shapes which program fits.</td><td>Nice to have</td></tr>
<tr><td>Website / POS situation</td><td>Online only, storefront, restaurant, invoicing, mix.</td><td>Nice to have</td></tr>
<tr><td>Anything sensitive</td><td>Under contract, high-risk category, previous account shut down, in a hurry.</td><td>If applicable</td></tr>
</table></div>
<h3>Three ways to send it (pick whichever is easiest)</h3>
<div class="pb-grid">
<div class="pb-tile"><h4>Option A: the Prospect referral link</h4><p>Prospect has one partner account (Bailey has the sign-in at <a href="/partners">guidedpayments.com/partners</a>). Grab the referral link from the dashboard and send it to the client. The form asks who introduced them, so mention your name when you send it and the credit lands on you. Status shows up on the dashboard.</p></div>
<div class="pb-tile"><h4>Option B: email Sean</h4><p>Send the handoff message below to <strong>${EMAIL}</strong> with the business name in the subject. Best when the client gave you their info in conversation and you'd like Sean to make first contact.</p></div>
<div class="pb-tile"><h4>Option C: point them to the site</h4><p>Client prefers to self-serve? Send them to <a href="/#inquiry">guidedpayments.com</a> and ask them to mention Prospect Marketing and your name in the notes. Then shoot Sean a quick heads-up so he's watching for it.</p></div>
</div>
<div class="pb-rule"><strong>One ask: keep customer financial details out of what you send.</strong> No statements, account numbers, or card data in a form or email. Sean collects those from the client directly, and it keeps everyone safe.</div>
<h3>Handoff message</h3>
<div class="pb-script"><div class="pb-bar"><span>Subject: Referral — [Business name], [City]</span>${copyBtn('pb-handoff-msg')}</div><pre id="pb-handoff-msg">${handoffMsg}</pre></div>
<h3>What happens after you hit send</h3>
<ol class="pb-steps">
<li><b>Sean confirms receipt</b><small>You'll get a reply so you know it landed.</small></li>
<li><b>Sean reaches out to the client</b><small>Call or email, their preference. He mentions you and the trigger.</small></li>
<li><b>Statement review</b><small>Client uploads a statement to the <a href="/statement-analyzer">statement analyzer</a> or sends it to Sean. He walks them through current cost vs. proposed, line by line.</small></li>
<li><b>Decision</b><small>Client moves forward, stays put, or revisits later. You get a one-line update either way.</small></li>
<li><b>Setup</b><small>Application, approval, then gateway or equipment setup. If it touches a site you built, Sean coordinates with you on the gateway keys before anything goes live.</small></li>
<li><b>Credit</b><small>Your referral shows on the Prospect partner dashboard the day it comes in.</small></li>
</ol>
<h3>If the client comes back to you instead of Sean</h3>
<p>Totally normal. Forward it to Sean and reply to the client with “Looping Sean in.” No need to answer the payments question yourself, even if you're pretty sure. Sean would rather answer twice than have anyone guess once.</p>
${ask('Stuck on a handoff, or not sure which option fits?')}
</section>`;

const q=(title,tag,body)=>`<details class="pb-q"><summary>${title} <span class="pb-tag">${tag}</span></summary><div class="pb-a">${body}</div></details>`;
const problems=`<section class="pb-view" id="pb-problems">
<h2>Client questions, answered</h2>
<p class="pb-lede">What clients actually say, what's usually behind it, and a comfortable thing to say before Sean takes over. The tag on each one tells you who owns it. When in doubt, the answer is always “let me get Sean on that.”</p>
<h3>Cost</h3>
${q('“My processing fees are too high.”','Sean',`<p><strong>What's usually going on:</strong> they're on a flat rate (2.9% + 30¢ style) or a tiered plan that pads every transaction, or junk monthly fees stacked on a bank-sold account.</p><p><strong>What you can say:</strong> “There's a pricing model called interchange-plus that shows you the real card cost plus a fixed markup. Upload one statement at guidedpayments.com/statement-analyzer and you'll see your effective rate and every fee in a few minutes.”</p><p><strong>Hand off with:</strong> the trigger. The client sends the statement to Sean or the analyzer directly; it never has to go through you.</p>`)}
${q('“I want to pass the card fee on to customers.”','Sean',`<p><strong>What's usually going on:</strong> they want to stop eating card fees. The compliant way is a dual-pricing or cash-discount program where the customer sees a cash price and a card price before paying. Surcharging is also possible, with stricter rules.</p><p><strong>What you can say:</strong> “Yes, it's allowed when it's set up correctly, with the right signage and receipts. Sean does this as a core program.” The explainer is at <a href="/zerofee">guidedpayments.com/zerofee</a>.</p><p><strong>Watch for:</strong> clients who already started doing it informally. That's a compliance risk and a great reason to get Sean on the phone this week.</p>`)}
${q('“Is Square / Stripe really more expensive?”','Sean',`<p><strong>What's usually going on:</strong> flat-rate pricing is simple, but it's the ceiling, not the floor. The gap grows with volume and with debit cards, which cost very little at interchange.</p><p><strong>What you can say:</strong> “For small volume they're fine. Past a certain point you're overpaying, and the analyzer will show you the exact number.”</p>`)}
${q('“I\'m locked into a contract / terminal lease.”','Sean',`<p><strong>What's usually going on:</strong> a multi-year processing agreement with an early-termination fee, or a long equipment lease that costs far more than the hardware.</p><p><strong>What you can say:</strong> “Send Sean the contract. Sometimes the savings cover the exit cost; sometimes the smart move is to wait. He'll tell you which.”</p>`)}
<h3>Online checkout</h3>
${q('“Which gateway do I use on my WooCommerce / WordPress site?”','Sean + you',`<p><strong>What's usually going on:</strong> a gateway is the plugin-side connection; the processor is the account behind it. Sean provides both so the merchant isn't paying two companies.</p><p><strong>What you can say:</strong> “We'll build checkout against whatever gateway Sean sets you up on.”</p><p><strong>Your part:</strong> install and configure the plugin once Sean sends gateway credentials. Go through Sean for credentials rather than the processor directly; it's faster.</p>`)}
${q('“My Stripe / PayPal account got shut down or funds are held.”','Sean, urgent',`<p><strong>What's usually going on:</strong> aggregators close accounts for chargeback spikes, category mismatches, or risk-model flags, often with little explanation. A direct merchant account with underwriting up front is far more stable.</p><p><strong>What you can say:</strong> “That happens a lot with those platforms. Sean can get you on a real merchant account. Let's get him on it today.” Mark it urgent when you send it.</p>`)}
${q('“I need recurring billing / subscriptions / memberships.”','Sean',`<p><strong>What you can say:</strong> “Card-on-file and recurring billing are standard. Sean will match the gateway to whatever membership or subscription plugin we're using.”</p>`)}
${q('“Do I need to worry about PCI compliance?”','Sean',`<p><strong>What's usually going on:</strong> every merchant attests annually; most are small enough for a self-assessment questionnaire. Non-compliance fees on statements are common and avoidable.</p><p><strong>What you can say:</strong> “Yes, but it's mostly a yearly questionnaire. Sean walks clients through it and makes sure there's no monthly non-compliance fee sneaking onto the bill.”</p><p><strong>Your part:</strong> hosted or tokenized checkout fields keep card data off the client's server, which keeps their PCI scope small. Sean will tell you which option the gateway supports.</p>`)}
<h3>In-person and POS</h3>
${q('“I need a POS for my restaurant / store / salon.”','Sean',`<p><strong>What's usually going on:</strong> they're about to buy whatever the first vendor demos. POS choice and processing are tied together, and the wrong pairing locks them into high rates just to keep the software.</p><p><strong>What you can say:</strong> “Sean quotes POS systems with the processing included so you see the whole monthly picture. Hold off signing anything until he's looked.” The lineup is at <a href="/pos-center">guidedpayments.com/pos-center</a>.</p><p><strong>Already have a POS they love?</strong> Sean checks compatibility first. Switching POS is never a requirement.</p>`)}
${q('“Can my POS and my website share inventory / customers?”','Sean + you',`<p><strong>What you can say:</strong> “Sometimes, depending on the POS. Tell Sean what you need to sync and he'll say what's realistic.” Loop yourself in on that one since it touches the site.</p>`)}
${q('“I just want to take cards on my phone sometimes.”','Sean',`<p><strong>What you can say:</strong> “Mobile readers and tap-to-pay are easy. If it's occasional and low volume, Sean may just tell you to keep what you have.”</p>`)}
<h3>Invoicing and cash flow</h3>
${q('“I want clients to pay invoices online, by card or bank.”','Sean',`<p><strong>What's usually going on:</strong> service businesses chasing checks. A pay link on the invoice with card and ACH options gets them paid faster, and ACH is far cheaper than cards for big invoices.</p><p><strong>What you can say:</strong> “Sean sets up invoice payments with card and ACH through Priority Pay Center, and can connect it to QuickBooks so deposits reconcile.” Details at <a href="/payments-center">guidedpayments.com/payments-center</a>.</p>`)}
${q('“My deposits don\'t match my sales / my books are a mess.”','Sean',`<p><strong>What's usually going on:</strong> processors deduct fees before depositing, or batch on a different schedule than the accounting software expects.</p><p><strong>What you can say:</strong> “That's a known headache, and it's fixable. Sean can set it up so the invoice amount and the fee post separately and the deposit matches.”</p>`)}
${q('“How fast do I get my money?”','Sean',`<p><strong>What you can say:</strong> “Sean will confirm funding timing for your setup.” Leave the timeline to him.</p>`)}
${q('“I got a chargeback and don\'t know what to do.”','Sean, time-sensitive',`<p><strong>What's usually going on:</strong> a customer disputed a charge with their bank. There's a response window, usually measured in days.</p><p><strong>What you can say:</strong> “Send it to Sean today. There's a deadline to respond and he'll tell you exactly what to gather.”</p>`)}
<h3>Something's broken right now</h3>
${q('“Checkout is failing / terminal is down / payments stopped working.”','Sean, same day',`<p><strong>If it's a site you built:</strong> check the obvious plugin-side things first (plugin update, expired API key, test mode left on). If it's not that, send it to Sean with the error message and the time it started.</p><p><strong>If it's hardware or the processor:</strong> straight to Sean. Skip the processor's 800 number; Sean gets faster answers through partner support.</p>`)}
${ask('Client asked something that isn\'t here?')}
<p>Send the question to Sean. He'll answer it for the client and add it to this page so the whole team has it next time.</p>
</section>`;

const offer=`<section class="pb-view" id="pb-offer">
<h2>What Guided Payments offers</h2>
<p class="pb-lede">Background only. You don't need to sell any of this. It just helps to recognize it when a client describes what they want.</p>
<div class="pb-tbl"><table>
<tr><th>Need</th><th>What Sean sets up</th><th>Who it's for</th></tr>
<tr><td>Lower cost</td><td>Interchange-plus pricing: real card cost plus a fixed, disclosed markup.</td><td>Anyone on flat-rate or tiered pricing with steady volume.</td></tr>
<tr><td>Stop paying fees</td><td>Dual pricing, cash discount, or surcharge program, set up to card-brand rules with signage and receipt language.</td><td>Restaurants, retail, service businesses.</td></tr>
<tr><td>Online checkout</td><td>A merchant account plus a gateway that plugs into WooCommerce and most WordPress ecommerce builds.</td><td>Ecommerce and donation sites.</td></tr>
<tr><td>Point of sale</td><td>Clover, Quantic, Tonic, and Square, quoted with processing included. Compatibility review if they want to keep their current POS.</td><td>Storefronts, restaurants, multi-location.</td></tr>
<tr><td>Terminals</td><td>Dejavoo, Valor, and Clover Flex families, plus mobile readers and tap-to-pay.</td><td>Countertop, mobile, and backup acceptance.</td></tr>
<tr><td>Invoicing &amp; ACH</td><td>Priority Pay Center: invoices, payment links, recurring billing, card and ACH, with QuickBooks integration.</td><td>Contractors, agencies, professional services, anyone chasing checks.</td></tr>
<tr><td>Payroll, funding, financing</td><td>Referred to Sean's partners; he coordinates the intro.</td><td>Growing businesses and seasonal cash-flow gaps.</td></tr>
<tr><td>Contract review</td><td>Reads existing agreements and leases and tells the client what leaving actually costs.</td><td>Anyone who signed something they don't fully understand.</td></tr>
</table></div>
<h3>Why clients like working with Sean</h3>
<ul><li><strong>One person, not a queue.</strong> Sean sets up the account and stays the contact afterward.</li><li><strong>Pricing shown before anything is signed.</strong> Current cost vs. proposed, from the client's own statement.</li><li><strong>Software and processing quoted together.</strong> No surprise monthly fees after the POS is installed.</li><li><strong>Clients usually keep their bank.</strong> Switching processors rarely means switching bank accounts.</li></ul>
<h3>Pages you can send a client to</h3>
<div class="pb-tbl"><table>
<tr><th>Link</th><th>Send it when</th></tr>
<tr><td><a href="/">guidedpayments.com</a></td><td>They want to see who Sean is before a call. The inquiry form is on the home page.</td></tr>
<tr><td><a href="/statement-analyzer">/statement-analyzer</a></td><td>They say “my fees are too high.” Free, no account, upload one statement.</td></tr>
<tr><td><a href="/zerofee">/zerofee</a></td><td>They want to pass card fees to customers. Shows what the customer sees.</td></tr>
<tr><td><a href="/pos-center">/pos-center</a></td><td>They're shopping for a POS.</td></tr>
<tr><td><a href="/terminal-center">/terminal-center</a></td><td>They need a countertop or mobile terminal.</td></tr>
<tr><td><a href="/payments-center">/payments-center</a></td><td>They invoice clients or want recurring billing.</td></tr>
<tr><td><a href="/boarding">/boarding</a></td><td>They've said yes and Sean has told them to start the application.</td></tr>
</table></div>
${ask('Curious how any of this works under the hood?')}
</section>`;

const contact=`<section class="pb-view" id="pb-contact">
<h2>Contact &amp; referral credit</h2>
<p class="pb-lede">How to reach Sean, and how your referrals are tracked. Sean would much rather hear from you early than have you wonder.</p>
<h3>Reach Sean</h3>
<div class="pb-grid">
<div class="pb-tile pb-contact"><dl><dt>Name</dt><dd>Sean Russ</dd><dt>Company</dt><dd>Guided Payments · Priority Business Solutions</dd><dt>Location</dt><dd>Cape Coral, FL (Eastern time)</dd></dl></div>
<div class="pb-tile pb-contact"><dl><dt>Call or text</dt><dd>${PHONE}</dd><dt>Email</dt><dd>${EMAIL}</dd><dt>Partner dashboard</dt><dd><a href="/partners">guidedpayments.com/partners</a></dd><dt>Program brochure</dt><dd><a href="/referral-program.pdf">referral-program.pdf</a></dd></dl></div>
</div>
<h3>Which channel</h3>
<div class="pb-tbl"><table>
<tr><th>Situation</th><th>Best channel</th></tr>
<tr><td>New referral</td><td>The Prospect partner link, or email</td></tr>
<tr><td>Client question, or a question of your own</td><td>Text or email, whichever you prefer</td></tr>
<tr><td>Payments down / chargeback deadline</td><td>Text first, then email with details</td></tr>
</table></div>
<h3>How you get credit</h3>
<ol class="pb-steps">
<li><b>Every referral is tracked on the Prospect partner dashboard</b><small>Referrals through the link are credited to Prospect automatically, and the client's form asks who introduced them. For email handoffs, put your name in the message. Individual team logins can be added anytime Bailey wants them.</small></li>
<li><b>You see status as it changes</b><small>Submitted, Contacted, Signed up. Business name and status only; the client's contact details stay private with Sean.</small></li>
<li><b>Compensation is paid once the referral becomes a customer</b><small>Structured as a lump sum or ongoing residuals over the life of the account, per the terms agreed between Sean and Prospect Marketing.</small></li>
</ol>
<h3>Your point person</h3>
<p>Bailey Peer owns the Prospect side of this partnership and holds the partner dashboard sign-in. Program questions and comp go through Bailey. Anything about a client, a situation, or this page goes straight to Sean.</p>
${ask('Anything at all?')}
</section>`;

export const partnerPlaybook=`<section class="wrap section pb-head"><p class="eyebrow"><span></span> REFERRAL PARTNER PLAYBOOK · PROSPECT MARKETING</p><h1>You spot it.<br><em>Sean closes it.</em></h1><p class="lead">Welcome, Prospect team. This is everything you need to recognize a payments opportunity, bring it up with a client, and hand it off, without becoming a payments expert. And if you ever get stuck, Sean is one text away.</p></section>
<div class="wrap pb-shell">${nav}<div class="pb-main">${start}${spot}${introduce}${handoff}${problems}${offer}${contact}</div></div>`;
