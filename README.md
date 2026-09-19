# Guided Payments production funnel

Existing Vercel project: `merchantlens/guidedpayments`.
Production domain: https://guidedpayments.com
Connected repository: Soldier717/Priority-Payments, production branch main.

This deploys the approved Priority Business Solutions funnel with its logo, equipment photography, prices, and social sharing image. `npm run build` copies public assets; a Vercel Node function serves pages and the inquiry endpoint. No DNS changes are required.

Without RESEND_API_KEY and MAIL_FROM, the inquiry page offers direct email and phone contact. With both configured it displays the guided inquiry form and sends the owner notification. Supabase persistence and customer confirmation email are not yet implemented. Do not treat them as active.

Run `npm test` for server tests. Do not commit credentials.
