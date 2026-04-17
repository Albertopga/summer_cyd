# Email Setup Plan: castillaydragon.com

## Goal

Send transactional emails from `info@castillaydragon.com` via the website, and have replies forwarded to `castillaydragon@gmail.com`. Also redirect `castillaydragon.com` to `retiroludico.castillaydragon.com`.

## Current State

- Domain `castillaydragon.com` registered via GoDaddy (Mesh Digital/Domains By Proxy)
- Nameservers: `NS01.DOMAINCONTROL.COM`, `NS02.DOMAINCONTROL.COM` (GoDaddy DNS)
- No email service configured
- Vue app deployed on Vercel at `retiroludico.castillaydragon.com`
- Personal email: `castillaydragon@gmail.com`

---

## The Plan (3 steps)

### Step 1: Add domain to Resend (sending + receiving)

**Why Resend:** single service handles both sending (transactional) and receiving (forwarding to Gmail). Free tier: 3,000 emails/month, 100/day, 1 custom domain. More than enough.

1. Create account at https://resend.com
2. Go to **Domains** > **Add Domain** > enter `castillaydragon.com`
3. Resend will give you DNS records to add. Typically:

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | `@` or `castillaydragon.com` | `v=spf1 include:resend.com ~all` | SPF (authorizes Resend to send) |
| CNAME | `resend._domainkey` | *(Resend provides this)* | DKIM (email authentication) |
| MX | `@` or `castillaydragon.com` | *(Resend provides this)* | Inbound email receiving |

4. Add these records in **GoDaddy DNS** (Mis dominios > castillaydragon.com > DNS > Administrar DNS)
5. Back in Resend, click **Verify**. Can take minutes to 72 hours (usually minutes).

**Important:** If GoDaddy already has MX records, remove them before adding Resend's. You have no existing email service so this should be safe.

### Step 2: Set up email forwarding in Resend

Once domain is verified and receiving is enabled:

1. Go to **Webhooks** > **Add Webhook**
2. Select `email.received` event
3. Point it to a Vercel serverless function (see code below) OR use Resend's built-in forwarding helper

**Option A - Simple serverless function on your Vercel app:**

Create `api/forward-email.ts` (or `.js`) in your Vue project:

```ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const event = req.body

  if (event.type !== 'email.received') return res.status(200).end()

  const emailId = event.data.email_id

  // Fetch full email content (webhooks only send metadata)
  const email = await resend.emails.get(emailId)

  // Forward to Gmail
  await resend.emails.send({
    from: 'info@castillaydragon.com',
    to: 'castillaydragon@gmail.com',
    subject: `[FWD] ${email.subject}`,
    html: email.html_body || email.text_body || '(empty)',
    replyTo: email.from,
  })

  return res.status(200).json({ ok: true })
}
```

Install the SDK in your Vue project: `npm install resend`

Add `RESEND_API_KEY` to Vercel environment variables (Settings > Environment Variables).

**Option B - Resend's forward() helper (simpler):**

```ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const event = req.body
  if (event.type !== 'email.received') return res.status(200).end()

  // forward() handles fetching content + attachments automatically
  await resend.emails.forward(event.data.email_id, {
    to: 'castillaydragon@gmail.com',
    from: 'info@castillaydragon.com',
  })

  return res.status(200).json({ ok: true })
}
```

See: https://resend.com/docs/dashboard/receiving/forward-emails

**Webhook URL to configure in Resend:** `https://retiroludico.castillaydragon.com/api/forward-email`

### Step 3: Redirect castillaydragon.com to Vercel app

**In Vercel** (project settings > Domains):
1. Add `castillaydragon.com` as a domain
2. Vercel will tell you to add an A record. Add it in GoDaddy:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |

3. In Vercel, set `castillaydragon.com` to redirect (301) to `retiroludico.castillaydragon.com`
   - Or if you prefer: make `castillaydragon.com` the primary and have the subdomain redirect to it

---

## Complete DNS records summary (all in GoDaddy)

After all steps, your GoDaddy DNS should have:

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A | `@` | `76.76.21.21` | Root domain -> Vercel |
| CNAME | `retiroludico` | `cname.vercel-dns.com` | *(likely already exists)* |
| TXT | `@` | `v=spf1 include:resend.com ~all` | SPF for Resend |
| CNAME | `resend._domainkey` | *(from Resend dashboard)* | DKIM for Resend |
| MX | `@` | *(from Resend dashboard)* | Inbound email to Resend |

**Note:** Remove any conflicting MX, SPF, or A records that GoDaddy may have by default.

---

## Alternatives considered

| Alternative | Pros | Cons | Verdict |
|-------------|------|------|---------|
| **Cloudflare Email Routing + Resend** | Free forwarding, no webhook needed | Requires changing nameservers (more DNS migration work, propagation delay) | Better long-term but slower to set up |
| **GoDaddy email forwarding** | No extra service | GoDaddy charges for it now (not free) | Rejected |
| **SendGrid / Mailgun** | Mature platforms | No built-in receiving/forwarding, need separate inbound service | More moving parts |
| **Gmail alias only** | Zero cost | Can't send transactional emails from the website programmatically | Only solves half the problem |
| **Resend (chosen)** | Single service for send + receive + forward, free tier, good DX, fast setup | 100 emails/day limit on free tier, webhook-based forwarding needs a serverless function | Best balance of speed and simplicity |

---

## Cost

$0 (Resend free tier: 3,000 emails/month, 100/day, 1 domain)

## Timeline

- Step 1 (Resend + DNS): ~15 minutes of work + DNS propagation (minutes to hours)
- Step 2 (Forwarding function): ~15 minutes
- Step 3 (Domain redirect): ~5 minutes (if done alongside Step 1 DNS changes)

Total active work: ~35 minutes. DNS propagation: up to a few hours (usually faster).

---

## Optional later improvements

- Add DMARC record (`_dmarc.castillaydragon.com` TXT `v=DMARC1; p=none; rua=mailto:castillaydragon@gmail.com`) for better deliverability
- Move DNS to Cloudflare for better management and free email routing (eliminates the webhook forwarding function)
- Set up Gmail "Send mail as" alias so you can reply from Gmail as `info@castillaydragon.com`
