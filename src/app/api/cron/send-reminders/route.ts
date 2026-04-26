import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const STAGE_MESSAGES: Record<string, string> = {
  Idea: "You haven't written your script yet. Start today.",
  Scripted: "Script done — it's time to film.",
  Filmed: "You've filmed it. All that's left is to post.",
}

const STAGE_COLORS: Record<string, string> = {
  Idea: '#2563EB',
  Scripted: '#8B5CF6',
  Filmed: '#F59E0B',
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDate(str: string): string {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, name, reminder_days')

  if (usersError || !users) {
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  let emailsSent = 0

  for (const user of users) {
    const days: number[] = user.reminder_days ?? [1]
    if (!days.length) continue

    const targetDates = days.map(d => {
      const target = new Date(today)
      target.setDate(today.getDate() + d)
      return toDateString(target)
    })

    const { data: ideas } = await supabase
      .from('ideas')
      .select('id, title, stage, scheduled_date')
      .eq('user_id', user.id)
      .neq('stage', 'Posted')
      .in('scheduled_date', targetDates)

    if (!ideas?.length) continue

    for (const idea of ideas) {
      const postDate = idea.scheduled_date as string
      const daysUntil = days.find(d => {
        const target = new Date(today)
        target.setDate(today.getDate() + d)
        return toDateString(target) === postDate
      }) ?? 1

      const stageMessage = STAGE_MESSAGES[idea.stage] ?? "Keep going — you're almost there."
      const stageColor = STAGE_COLORS[idea.stage] ?? '#64748B'
      const daysLabel = daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`
      const subject = daysUntil === 0
        ? `Your video "${idea.title}" posts today`
        : `Your video "${idea.title}" posts ${daysLabel}`

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creator-os-repo.vercel.app'

      const html = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
            <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;">
              <div style="background:#2563EB;padding:28px 32px;">
                <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">CreatorOS</p>
              </div>
              <div style="padding:32px;">
                <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.08em;">Posting reminder</p>
                <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#0F172A;line-height:1.3;">${idea.title}</h1>

                <div style="background:#F8F9FA;border-radius:12px;padding:20px;margin-bottom:24px;">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                    <span style="display:inline-block;background:${stageColor}20;color:${stageColor};font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;">${idea.stage}</span>
                    <span style="font-size:13px;color:#64748B;">Posts ${daysLabel} — ${formatDate(postDate)}</span>
                  </div>
                  <p style="margin:0;font-size:15px;color:#0F172A;font-weight:500;">${stageMessage}</p>
                </div>

                <a href="${appUrl}/dashboard/ideas/${idea.id}"
                   style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">
                  Open idea →
                </a>

                <p style="margin:32px 0 0;font-size:12px;color:#94A3B8;">
                  You're receiving this because you set a posting reminder in CreatorOS.
                  <a href="${appUrl}/dashboard/settings" style="color:#2563EB;">Manage reminders</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `

      await resend.emails.send({
        from: 'CreatorOS <onboarding@resend.dev>',
        to: user.email,
        subject,
        html,
      })

      emailsSent++
    }
  }

  return Response.json({ ok: true, emailsSent })
}
