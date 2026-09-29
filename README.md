# Guided Payments production funnel

Existing Vercel project: `merchantlens/guidedpayments`.
Production domain: https://guidedpayments.com
Connected repository: Soldier717/Priority-Payments, production branch main.

This deploys the approved Priority Business Solutions funnel with its logo, equipment photography, prices, and social sharing image. `npm run build` copies public assets; a Vercel Node function serves pages and the inquiry endpoint. No DNS changes are required.

The on-page inquiry and standalone inquiry page use the same server-side handler. It saves to the existing Supabase `demo_requests` table with role `Guided Payments inquiry`, then sends one Resend notification to `sean@guidedpayments.com`. Customer email is reply-to. No customer confirmation email, automated prospect outreach, or SMS is enabled.

Required server-side variables: `RESEND_API_KEY`, `MAIL_FROM`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`. These reuse existing MerchantLens services. The verified sender is `Guided Payments <noreply@merchantlens.ai>`; the destination is fixed to Sean's Guided Payments mailbox. No DNS changes were made. Changing the sender to guidedpayments.com would require separate Resend verification; ordinary mailbox operation alone does not verify a Resend sending domain.

The form uses native and server-side validation, a honeypot, short-lived signed verification tokens, request limits, an email-based limit in shared storage, disabled duplicate submission controls, a durable submission UUID, and Resend idempotency keys. A delivered-to-provider marker is saved in the lead record to prevent repeat notifications. Per-instance IP limits are best-effort, supplemented by the database email limit. Supabase or email failures produce explicit error states; email failures retain the stored inquiry for follow-up. The browser reports success only after storage and provider acceptance. Receipt status should be checked separately for delivery verification.

The Claude HTML supplied on September 19 informed the receipt calculator and on-page inquiry. Existing routes, product photographs, pricing qualifications, equipment prices, FAQ, and accessibility behavior were retained. The unapproved Jonathan/Kristin testimonial is omitted. Branding uses the supplied GP image without altering the original file. Compact navigation and favicon use a readable GP text treatment.

Run `npm test` for server tests. Do not commit credentials.

## Referral partner tracking

- `/referrals`: program information and partner-interest form.
- `/partners`: email-link sign-in. Sean (`sean@guidedpayments.com`) can register partners, copy their links, review referred inquiries, and set Submitted / Contacted / Signed up.
- `/refer?partner=<id>`: personal share link. The business owner submits their own contact details, consent, and notes. Sean receives a referral email identifying the partner.
- Partners sign in with their registered email. They see only their own business names, dates, and statuses; contact details and notes are admin-only. Statuses are manually maintained by Sean, not inferred from boarding or payouts.
- Reuses the existing Resend variables and the private Supabase storage bucket `guided-boarding-private` with `BOARDING_ENCRYPTION_KEY`. No schema migration or new credentials are required if boarding is already configured. Do not rotate that key: it protects existing records and stable partner identifiers.
- Records use separate `partners/production` and `partners/testing` prefixes based on `VERCEL_ENV`. Shared links and emailed sign-in links target the production domain. Preview tests must use simulated email/storage; they do not create production partners.
- Registering a partner does not automatically email them. Give them their share link and the `/partners` sign-in address. Login requests send a one-time link to the registered address. Login links expire in 15 minutes; private sessions last one hour.
- Pagination loads 25 partners/referrals at a time. Invalid or missing partner links do not silently create uncredited inquiries. Referral notification retries reuse the submission reference and email idempotency key.
