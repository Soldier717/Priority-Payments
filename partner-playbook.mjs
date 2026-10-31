// Referral partner playbook for the Prospect Marketing team. Served at /partners/prospect (noindex).
// Content is intentionally free of rates, fees, and timelines so partners can't misquote.
const copyBtn=id=>`<button class="pb-copy" type="button" data-copy="${id}">Copy</button>`;
const fill=text=>`<span class="pb-fill">${text}</span>`;

const nav=`<nav class="pb-nav" aria-label="Playbook sections">
<a href="#start" data-v="start">Start here</a>
<a href="#spot" data-v="spot">Spot it</a>
<a href="#introduce" data-v="introduce">Introduce</a>
<a href="#handoff" data-v="handoff">Hand it off</a>
<a href="#problems" data-v="problems">Common problems</a>
<a href="#offer" data-v="offer">What we offer</a>
<a href="#contact" data-v="contact">Contact &amp; credit</a>
</nav>`;

const start=`<section class="pb-view" id="pb-start">
<h2>Start here</h2>
<p class="pb-lede">Your clients already pay to accept money. Most of them pay too much, use the wrong tool, or have a checkout that quietly leaks sales. You are in the room when that comes up. This playbook is the three-minute version of what to do about it.</p>
<div class="pb-rule"><strong>The whole job in one line:</strong> notice a payments pain, mention Sean once, send him the contact. Nothing else is on you.</div>
<h3>Who you're referring to</h3>
<p>Sean Russ runs Guided Payments, powered by Priority Business Solutions, in Cape Coral, Florida. He sets up card and ACH acceptance for small businesses: online checkout, countertop and restaurant POS, invoicing, and the pricing programs that let a merchant stop eating card fees. He also connects clients to payroll, funding, and financing. Sean works directly with each client; there is no call center between you and him.</p>
<h3>What you are not responsible for</h3>
<ul><li>Quoting rates, fees, or savings. Sean does that from the client's actual statement.</li><li>Recommending specific hardware or software.</li><li>Troubleshooting a live payments problem. Route it; don't fix it.</li><li>Making promises about approval, timing, or contract terms.</li></ul>
<h3>What a good referral looks like</h3>
<div class="pb-grid">
<div class="pb-tile"><h4>Warm, not sold</h4><p>The client knows a call is coming and why. That's it. Sean handles the rest.</p></div>
<div class="pb-tile"><h4>One trigger named</h4><p>"They just launched an online store" beats "they might need payments." Tell Sean what you heard.</p></div>
<div class="pb-tile"><h4>Sent the same day</h4><p>Referrals cool fast. Submit it while the conversation is fresh. Section 4 takes under two minutes.</p></div>
</div>
<h3>How to use this page</h3>
<p>Read Spot it, Introduce, and Hand it off once; that's the core. Common problems is a lookup table for when a client asks you something specific. What we offer is background. Contact &amp; credit is where to reach Sean and how your referrals are tracked.</p>
</section>`;

const tile=(h,p,say)=>`<div class="pb-tile"><h4>${h}</h4><p>${p}</p>${say?`<p class="pb-say">Say: <em>“${say}”</em></p>`:''}</div>`;
const spot=`<section class="pb-view" id="pb-spot">
<h2>Spot the opportunity</h2>
<p class="pb-lede">Payments come up in your work more than you'd think. Here are the moments that matter, grouped by the kind of project you're on.</p>
<h3>During a website or ecommerce build</h3>
<div class="pb-grid">
${tile('New online store','Any WooCommerce or custom ecommerce build needs a payment gateway. Whoever sets it up first usually keeps the account for years.','Before we wire up checkout, do you want Sean to look at your processing? It\'s a one-call thing.')}
${tile('“Just use Stripe / PayPal / Square”','Fine for a hobby shop. For real volume it\'s often the most expensive option, and holds or sudden account closures are common.','Those work, but at your volume there\'s usually a cheaper, more stable option. Worth a 15-minute look.')}
${tile('Adding invoicing or a client portal','Service businesses that invoice need card and ACH on the invoice itself, ideally tied to their accounting software.','Do you want clients to pay those invoices online? Sean sets that up with QuickBooks.')}
${tile('Donations, dues, or fees on a site','Nonprofits, associations, and municipalities take recurring payments and fees and rarely shop their rate.','Who handles your payment processing now? Sean works with organizations like yours.')}
</div>
<h3>In any client conversation</h3>
<div class="pb-grid">
${tile('Complaints about fees','“Processing is killing us,” “the fees keep going up,” “I don\'t understand my statement.”','Upload one statement at guidedpayments.com/statement-analyzer. It\'s free and shows you exactly what you\'re paying.')}
${tile('Opening or expanding a physical location','A new restaurant, retail store, salon, or second location needs a POS and a processor, and usually gets whatever the first salesperson offered.','Have you picked a POS yet? Sean can quote one with the processing built in.')}
${tile('“Can I pass the fee to the customer?”','Yes, if it\'s done right. Done wrong, it violates card-brand rules. This is one of Sean\'s core programs.','Yes, there\'s a compliant way. Sean sets that up all the time.')}
${tile('Cash-flow talk','Slow deposits, held funds, waiting days to get paid, chargebacks they didn\'t understand.','A lot of that is fixable. Let me connect you with Sean.')}
${tile('Switching accounting software','QuickBooks migrations are the moment to connect payments so deposits reconcile automatically.','While you\'re moving books, Sean can tie payments in so deposits match your ledger.')}
${tile('They mention a contract or lease','Long processing contracts and terminal leases with early-termination fees. Sean can read the contract and tell them what it actually costs to leave.','Before you renew anything, let Sean read it. No charge.')}
${tile('Payroll, funding, or financing comes up','“We\'re hiring our first employee,” “we need equipment money,” “cash is tight before the season.” Sean has partners for all three and you get credit for the intro.','Sean handles payroll and small-business funding too. Want the intro?')}
</div>
<h3>Not a fit</h3>
<ul><li>Very low card volume. Stripe or Square is fine for them.</li><li>CBD, firearms, adult content, crypto, or other high-risk categories. Sean may still have an option; flag it as high-risk in the handoff.</li><li>Clients outside the United States.</li></ul>
</section>`;

const introEmail=`Hi [Client first name],

Looping in Sean Russ from Guided Payments (Priority Business Solutions). Sean handles payment processing and point-of-sale for a lot of the businesses we work with.

You mentioned [the trigger: e.g. wanting to pass card fees to customers / setting up checkout on the new site / fees going up]. That's exactly what Sean does. He'll take a look, tell you what you're paying now versus what it should be, and whether it's worth changing anything. No cost, no obligation.

Sean, [Client first name] runs [business name] in [city]. [One line of context.]

I'll let you two take it from here.

[Your name]
Prospect Marketing`;

const introduce=`<section class="pb-view" id="pb-introduce">
<h2>Introduce Sean</h2>
<p class="pb-lede">You're not pitching. You're making an introduction the way you'd recommend a good accountant. Keep it short, keep it specific, and let Sean do the explaining.</p>
<h3>The 20-second version</h3>
<div class="pb-rule">“We work with a payments guy named Sean. He sets up card processing and point-of-sale for small businesses, and he usually saves people money or fixes something that's been annoying them. It's one short call, no obligation. Want me to connect you?”</div>
<h3>Four things that make the intro land</h3>
<ol class="pb-steps">
<li><b>Name the thing you noticed.</b><small>“You mentioned the fees on the new site” or “since you're opening the second location.” Generic intros get ignored.</small></li>
<li><b>Say what the first step is.</b><small>One call, or one statement uploaded. Never “a demo” or “a proposal.”</small></li>
<li><b>Say what it costs.</b><small>Nothing. The review is free. Switching only happens if it makes sense for them.</small></li>
<li><b>Ask for permission to connect.</b><small>A yes means you can send Sean their info. A “maybe later” goes in your notes, not to Sean.</small></li>
</ol>
<h3>Email intro</h3>
<div class="pb-script"><div class="pb-bar"><span>Subject: Quick intro — Sean at Guided Payments</span>${copyBtn('pb-intro-email')}</div><pre id="pb-intro-email">${introEmail}</pre></div>
<h3>If they ask you questions</h3>
<div class="pb-grid">
${tile('“How much will I save?”','',`Depends on your statement. Upload one at guidedpayments.com/statement-analyzer and you'll get a free breakdown in a few minutes. Then Sean confirms the numbers and tells you if the answer is 'nothing.'`)}
${tile('“Is this a sales pitch?”','',`It's a review. Sean works with us because our clients keep needing this. If you're already in good shape, he'll say so.`)}
${tile('“I\'m under contract.”','',`Send Sean the contract. He'll tell you what leaving actually costs and whether it's worth it.`)}
${tile('“Does Prospect get paid for this?”','',`We're a referral partner, yes. It doesn't change your pricing; Sean's program is public at guidedpayments.com/referrals.`)}
</div>
<h3>Things to avoid saying</h3>
<ul><li>Any rate, percentage, or dollar figure.</li><li>“Guaranteed,” “lowest,” “cheapest.”</li><li>“Zero fee” without the qualifier. Other charges can still apply, and equipment or software costs depend on the quote.</li><li>“Next-day funding” or any timeline. Sean sets expectations after underwriting.</li><li>Naming a specific POS or gateway as the recommendation.</li></ul>
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
<p class="pb-lede">Once the client says yes, get it to Sean the same day. Here's what he needs and what happens next.</p>
<h3>What to send</h3>
<div class="pb-tbl"><table>
<tr><th>Field</th><th>Why it matters</th><th>Required?</th></tr>
<tr><td>Business name &amp; city</td><td>Sean looks them up before the call.</td><td>Yes</td></tr>
<tr><td>Contact name, email, phone</td><td>Who Sean calls, and how.</td><td>Yes</td></tr>
<tr><td>The trigger</td><td>“Launching WooCommerce store Nov 15” or “wants to pass fees to customers.” Sets the whole first call.</td><td>Yes</td></tr>
<tr><td>Best way / time to reach them</td><td>Avoids three days of phone tag.</td><td>Yes</td></tr>
<tr><td>Current processor, if known</td><td>Square, Stripe, a bank, a terminal lease. Even “not sure” is useful.</td><td>Nice to have</td></tr>
<tr><td>Rough monthly card volume</td><td>Any ballpark. Shapes which program fits.</td><td>Nice to have</td></tr>
<tr><td>Website / POS situation</td><td>Online only, storefront, restaurant, invoicing, mix.</td><td>Nice to have</td></tr>
<tr><td>Anything sensitive</td><td>Under contract, high-risk category, previous account shut down, in a hurry.</td><td>If applicable</td></tr>
</table></div>
<h3>How to send it</h3>
<div class="pb-grid">
<div class="pb-tile"><h4>Option A: the Prospect referral link</h4><p>Prospect has one partner account (Bailey has the sign-in at <a href="/partners">guidedpayments.com/partners</a>). Copy the referral link from the dashboard and send it to the client. When they fill it out, the form asks who introduced them, so put your name in the message you send them and credit lands on you. Status shows on the dashboard.</p></div>
<div class="pb-tile"><h4>Option B: email Sean</h4><p>Send the handoff message below to <strong>sean@guidedpayments.com</strong> with the business name in the subject. Use this when the client gave you their info verbally and you want Sean to make first contact.</p></div>
<div class="pb-tile"><h4>Option C: point them to the site</h4><p>Client prefers to self-serve? Send them to <a href="/#inquiry">guidedpayments.com</a> and tell them to mention Prospect Marketing and your name in the notes field. Then email Sean so he's watching for it.</p></div>
</div>
<div class="pb-rule"><strong>Either way, keep customer financial details out of what you send.</strong> No statements, account numbers, or card data in a form or email. Sean collects those from the client directly.</div>
<h3>Handoff message</h3>
<div class="pb-script"><div class="pb-bar"><span>Subject: Referral — [Business name], [City]</span>${copyBtn('pb-handoff-msg')}</div><pre id="pb-handoff-msg">${handoffMsg}</pre></div>
<h3>What happens after you hit send</h3>
<ol class="pb-steps">
<li><b>Sean confirms receipt</b><small>You get a reply so you know it landed.</small></li>
<li><b>Sean reaches out to the client</b><small>Call or email, their preference. He references you and the trigger.</small></li>
<li><b>Statement review</b><small>Client uploads a statement to the <a href="/statement-analyzer">statement analyzer</a> or sends it to Sean. He shows them current cost vs. proposed, line by line.</small></li>
<li><b>Decision</b><small>Client chooses to move forward, stay put, or revisit later. You get a one-line update either way.</small></li>
<li><b>Setup</b><small>Application, approval, then gateway or equipment setup. If it touches a site you built, Sean coordinates with you on the gateway keys before anything goes live.</small></li>
<li><b>Credit</b><small>Your referral shows on the Prospect partner dashboard the day it comes in.</small></li>
</ol>
<h3>If the client comes back to you instead of Sean</h3>
<p>Forward it to Sean and reply to the client with “Looping Sean in.” Don't try to answer the payments question yourself, even if you think you know. One wrong number costs more goodwill than a two-hour delay.</p>
</section>`;

const q=(title,tag,body)=>`<details class="pb-q"><summary>${title} <span class="pb-tag">${tag}</span></summary><div class="pb-a">${body}</div></details>`;
const problems=`<section class="pb-view" id="pb-problems">
<h2>Common payment problems</h2>
<p class="pb-lede">What clients actually say, what it usually means, and what you can tell them before Sean takes over. Each one ends with who handles it.</p>
<h3>Cost</h3>
${q('“My processing fees are too high.”','Sean',`<p><strong>What's usually going on:</strong> they're on a flat rate (2.9% + 30¢ style) or a tiered plan, which pads every transaction. Or they have junk monthly fees stacked on a bank-sold account.</p><p><strong>What you can say:</strong> “There's a pricing model called interchange-plus that shows you the real card cost plus a fixed markup. Upload one statement at guidedpayments.com/statement-analyzer and you'll see your effective rate and every fee in a few minutes.”</p><p><strong>Hand off with:</strong> the trigger. The client sends the statement to Sean or the analyzer directly; it doesn't go through you.</p>`)}
${q('“I want to pass the card fee on to customers.”','Sean',`<p><strong>What's usually going on:</strong> they want to stop eating card fees. The compliant way is a dual-pricing or cash-discount program where the customer sees a cash price and a card price before paying. Surcharging is also possible but has stricter rules.</p><p><strong>What you can say:</strong> “Yes, it's allowed if it's set up correctly, with the right signage and receipts. Sean does this as a core program.” The explainer is at <a href="/zerofee">guidedpayments.com/zerofee</a>.</p><p><strong>Watch for:</strong> clients who already started doing it informally. That's a compliance risk and a good reason to call Sean this week.</p>`)}
${q('“Is Square / Stripe really more expensive?”','Sean',`<p><strong>What's usually going on:</strong> flat-rate pricing is simple but it's the ceiling, not the floor. The gap grows with volume and with debit cards, which cost very little at interchange.</p><p><strong>What you can say:</strong> “For small volume they're fine. Past a certain point you're overpaying, and the analyzer will show you the exact number.”</p>`)}
${q('“I\'m locked into a contract / terminal lease.”','Sean',`<p><strong>What's usually going on:</strong> a multi-year processing agreement with an early-termination fee, or a long equipment lease that costs far more than the hardware.</p><p><strong>What you can say:</strong> “Send Sean the contract. Sometimes the savings cover the exit cost; sometimes the right move is to wait. He'll tell you which.”</p>`)}
<h3>Online checkout</h3>
${q('“Which gateway do I use on my WooCommerce / WordPress site?”','Sean + you',`<p><strong>What's usually going on:</strong> a gateway is the plugin-side connection; the processor is the account behind it. Sean provides both so the merchant isn't paying two companies.</p><p><strong>What you can say:</strong> “We'll build checkout against whatever gateway Sean sets you up on.”</p><p><strong>Your part:</strong> install and configure the plugin once Sean sends gateway credentials. Don't request credentials from the processor yourself; go through Sean.</p>`)}
${q('“My Stripe / PayPal account got shut down or funds are held.”','Sean, urgent',`<p><strong>What's usually going on:</strong> aggregators close accounts for chargeback spikes, category mismatches, or risk-model flags, often with little explanation. A direct merchant account with underwriting up front is far more stable.</p><p><strong>What you can say:</strong> “That happens a lot with those platforms. Sean can get you on a real merchant account. Mark it urgent when you send it.”</p>`)}
${q('“I need recurring billing / subscriptions / memberships.”','Sean',`<p><strong>What you can say:</strong> “Card-on-file and recurring billing are standard. Sean will match the gateway to whatever membership or subscription plugin we're using.”</p>`)}
${q('“Do I need to worry about PCI compliance?”','Sean',`<p><strong>What's usually going on:</strong> every merchant has to attest annually; most are small enough for a self-assessment questionnaire. Non-compliance fees on statements are common and avoidable.</p><p><strong>What you can say:</strong> “Yes, but it's mostly a yearly questionnaire. Sean walks clients through it and makes sure there's no monthly non-compliance fee.”</p><p><strong>Your part:</strong> hosted or tokenized checkout fields keep card data off the client's server, which keeps their PCI scope small. Sean will tell you which option the gateway supports.</p>`)}
<h3>In-person and POS</h3>
${q('“I need a POS for my restaurant / store / salon.”','Sean',`<p><strong>What's usually going on:</strong> they're about to buy whatever the first vendor demos. POS choice and processing are tied together, and the wrong pairing locks them into high rates to keep the software.</p><p><strong>What you can say:</strong> “Sean quotes POS systems with the processing included so you see the whole monthly cost. Hold off signing anything until he's looked.” The lineup is at <a href="/pos-center">guidedpayments.com/pos-center</a>.</p><p><strong>Already have a POS they like?</strong> Sean reviews compatibility first; switching POS isn't a requirement.</p>`)}
${q('“Can my POS and my website share inventory / customers?”','Sean + you',`<p><strong>What you can say:</strong> “Sometimes, depending on the POS. Tell Sean what you need to sync and he'll say what's realistic.” Loop yourself in on that conversation since it touches the site.</p>`)}
${q('“I just want to take cards on my phone sometimes.”','Sean',`<p><strong>What you can say:</strong> “Mobile readers and tap-to-pay are easy. If it's occasional and low volume, Sean may just tell you to keep what you have.”</p>`)}
<h3>Invoicing and cash flow</h3>
${q('“I want clients to pay invoices online, by card or bank.”','Sean',`<p><strong>What's usually going on:</strong> service businesses chasing checks. A pay link on the invoice with card and ACH options gets them paid faster, and ACH is far cheaper than cards for large invoices.</p><p><strong>What you can say:</strong> “Sean sets up invoice payments with card and ACH through Priority Pay Center, and can connect it to QuickBooks so deposits reconcile.” Details at <a href="/payments-center">guidedpayments.com/payments-center</a>.</p>`)}
${q('“My deposits don\'t match my sales / my books are a mess.”','Sean',`<p><strong>What's usually going on:</strong> processors deduct fees before depositing, or batch on a different schedule than the accounting software expects.</p><p><strong>What you can say:</strong> “That's a known headache. Sean can set it up so the invoice amount and the fee post separately and the deposit matches.”</p>`)}
${q('“How fast do I get my money?”','Sean',`<p><strong>What you can say:</strong> “Sean will confirm funding timing for your setup.” Don't quote a timeline yourself.</p>`)}
${q('“I got a chargeback and don\'t know what to do.”','Sean, time-sensitive',`<p><strong>What's usually going on:</strong> a customer disputed a charge with their bank. There's a response window, usually measured in days.</p><p><strong>What you can say:</strong> “Send it to Sean today. There's a deadline to respond and he'll tell you what evidence to gather.”</p>`)}
<h3>Something's broken right now</h3>
${q('“Checkout is failing / terminal is down / payments stopped working.”','Sean, same day',`<p><strong>If it's a site you built:</strong> check the obvious plugin-side things first (plugin update, expired API key, test mode left on). If it's not that, send it to Sean with the error message and the time it started.</p><p><strong>If it's hardware or the processor:</strong> straight to Sean. Don't have the client call the processor's 800 number first; Sean gets faster answers through partner support.</p>`)}
</section>`;

const offer=`<section class="pb-view" id="pb-offer">
<h2>What Guided Payments offers</h2>
<p class="pb-lede">Background only. You don't need to sell any of this; it helps to recognize it when a client describes what they want.</p>
<div class="pb-tbl"><table>
<tr><th>Need</th><th>What Sean sets up</th><th>Who it's for</th></tr>
<tr><td>Lower cost</td><td>Interchange-plus pricing: real card cost plus a fixed, disclosed markup.</td><td>Anyone on flat-rate or tiered pricing with steady volume.</td></tr>
<tr><td>Stop paying fees</td><td>Dual pricing, cash discount, or surcharge program, set up to card-brand rules with signage and receipt language.</td><td>Restaurants, retail, service businesses.</td></tr>
<tr><td>Online checkout</td><td>A merchant account plus a gateway that plugs into WooCommerce and most WordPress ecommerce builds.</td><td>Ecommerce and donation sites.</td></tr>
<tr><td>Point of sale</td><td>Clover, Quantic, Tonic, and Square, quoted with processing included. Compatibility review if they want to keep their current POS.</td><td>Storefronts, restaurants, multi-location.</td></tr>
<tr><td>Terminals</td><td>Dejavoo, Valor, and Clover Flex families, plus mobile readers and tap-to-pay.</td><td>Countertop, mobile, and backup acceptance.</td></tr>
<tr><td>Invoicing &amp; ACH</td><td>Priority Pay Center: invoices, payment links, recurring billing, card and ACH, with QuickBooks integration.</td><td>Contractors, agencies, professional services, anyone chasing checks.</td></tr>
<tr><td>Payroll, funding, financing</td><td>Referred to Sean's partners; he coordinates the intro.</td><td>Growing businesses and seasonal cash-flow gaps.</td></tr>
<tr><td>Contract review</td><td>Reads existing agreements and leases and tells the client what leaving actually costs.</td><td>Anyone who signed something they don't understand.</td></tr>
</table></div>
<h3>What makes this different from the processor your client has now</h3>
<ul><li><strong>One person, not a queue.</strong> Sean sets up the account and stays the contact afterward.</li><li><strong>Pricing shown before anything is signed.</strong> Current cost vs. proposed, from the client's own statement.</li><li><strong>Software and processing quoted together.</strong> No surprise monthly fees appearing after the POS is installed.</li><li><strong>Clients usually keep their bank.</strong> Switching processors rarely means switching bank accounts.</li></ul>
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
</section>`;

const contact=`<section class="pb-view" id="pb-contact">
<h2>Contact &amp; referral credit</h2>
<p class="pb-lede">How to reach Sean and how your referrals are tracked.</p>
<h3>Reach Sean</h3>
<div class="pb-grid">
<div class="pb-tile pb-contact"><dl><dt>Name</dt><dd>Sean Russ</dd><dt>Company</dt><dd>Guided Payments · Priority Business Solutions</dd><dt>Location</dt><dd>Cape Coral, FL (Eastern time)</dd></dl></div>
<div class="pb-tile pb-contact"><dl><dt>Email</dt><dd>sean@guidedpayments.com</dd><dt>Phone / text</dt><dd>(239) 297-1703</dd><dt>Partner dashboard</dt><dd><a href="/partners">guidedpayments.com/partners</a></dd><dt>Program brochure</dt><dd><a href="/referral-program.pdf">referral-program.pdf</a></dd></dl></div>
</div>
<h3>Which channel</h3>
<div class="pb-tbl"><table>
<tr><th>Situation</th><th>Best channel</th></tr>
<tr><td>New referral</td><td>Your partner link, or email</td></tr>
<tr><td>Client question</td><td>Email</td></tr>
<tr><td>Payments down / chargeback deadline</td><td>Text, then email with details</td></tr>
</table></div>
<h3>How you get credit</h3>
<ol class="pb-steps">
<li><b>Every referral is tracked on the Prospect partner dashboard</b><small>Referrals through the link are credited to Prospect automatically, and the client's form asks who introduced them. For email handoffs, put your name in the message. Individual team logins can be added later if Bailey wants them.</small></li>
<li><b>You see status as it changes</b><small>Submitted, Contacted, Signed up. Business name and status only; the client's contact details stay private to Sean.</small></li>
<li><b>Compensation is paid once the referral becomes a customer</b><small>Structured as a lump sum or ongoing residuals over the life of the account, per the terms agreed between Sean and Prospect Marketing.</small></li>
</ol>
<h3>Your point person</h3>
<p>Bailey Peer owns the Prospect side of this partnership and holds the partner dashboard sign-in. Program questions and comp go through Bailey; client-specific questions go straight to Sean.</p>
<h3>Questions about this playbook</h3>
<p>If a client asks something that isn't covered in Common problems, send the question to Sean and he'll add the answer here so the whole team has it next time.</p>
</section>`;

export const partnerPlaybook=`<section class="wrap section pb-head"><p class="eyebrow"><span></span> REFERRAL PARTNER PLAYBOOK · PROSPECT MARKETING</p><h1>You spot it.<br><em>Sean closes it.</em></h1><p class="lead">For the Prospect Marketing team. Everything you need to recognize a payments opportunity, bring it up with a client, and hand it off without becoming a payments expert.</p></section>
<div class="wrap pb-shell">${nav}<div class="pb-main">${start}${spot}${introduce}${handoff}${problems}${offer}${contact}</div></div>`;
