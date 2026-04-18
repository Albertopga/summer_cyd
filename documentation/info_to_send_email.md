❯ I need free tier email sending tool that I can connect with Vue via Vercel. What is the easiest

⏺ Resend - easiest for Vercel + Vue.

┌──────────┬──────────────────────┬─────────────────────────────┬──────────────┐
│ Service │ Free tier │ Vercel integration │ Setup effort │
├──────────┼──────────────────────┼─────────────────────────────┼──────────────┤
│ Resend │ 3k emails/mo │ native Vercel integration │ lowest │
├──────────┼──────────────────────┼─────────────────────────────┼──────────────┤
│ Mailgun │ 1k emails/mo (trial) │ API call from serverless fn │ low │
├──────────┼──────────────────────┼─────────────────────────────┼──────────────┤
│ SendGrid │ 100 emails/day │ API call from serverless fn │ low │
├──────────┼──────────────────────┼─────────────────────────────┼──────────────┤
│ Postmark │ 100 emails/mo │ API call from serverless fn │ low │
└──────────┴──────────────────────┴─────────────────────────────┴──────────────┘

Resend recommended bc:

- first-class Vercel integration (one-click in Vercel marketplace)
- simple API, modern DX, good docs
- 3k/mo free generous enough for most side projects
- works with React Email templates (reusable in Vue via HTML output)

Setup (2 steps):

1. Vercel serverless function (api/send.ts):
   import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
const { to, subject, html } = req.body
const { data, error } = await resend.emails.send({
from: 'you@yourdomain.com',
to,
subject,
html,
})
if (error) return res.status(400).json(error)
return res.status(200).json(data)
}

2. Vue component calls /api/send via fetch.

One caveat: need verified domain for production (all services require this). Resend gives onboarding@resend.dev for testing immediately.

If no custom domain available & need zero-config: EmailJS (client-side, no serverless fn needed, 200 emails/mo free) - but less control & exposes service config to client.
