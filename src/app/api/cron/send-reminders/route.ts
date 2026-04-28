import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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
  const clean = str.substring(0, 10)
  const [y, m, d] = clean.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

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

      const stages = ['Idea', 'Scripted', 'Filmed', 'Posted']
      const stageIndex = stages.indexOf(idea.stage)
      const stageProgressDots = stages.map((s, i) => {
        const active = i === stageIndex
        const done = i < stageIndex
        const color = active ? stageColor : done ? '#10B981' : '#E2E8F0'
        const textColor = active || done ? '#ffffff' : '#94A3B8'
        return `
          <td style="text-align:center;width:25%;">
            <div style="width:32px;height:32px;border-radius:50%;background:${color};display:inline-flex;align-items:center;justify-content:center;margin-bottom:6px;">
              ${done
                ? `<span style="color:#fff;font-size:14px;">✓</span>`
                : `<span style="color:${textColor};font-size:11px;font-weight:700;">${i + 1}</span>`
              }
            </div>
            <div style="font-size:11px;font-weight:${active ? '700' : '500'};color:${active ? stageColor : done ? '#10B981' : '#94A3B8'};">${s}</div>
          </td>
        `
      }).join('')

      const html = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif;">
            <div style="max-width:540px;margin:48px auto 24px;padding:0 16px;">

              <!-- Header -->
              <div style="text-align:center;margin-bottom:24px;">
                <span style="display:inline-block;background:#2563EB;color:#fff;font-size:15px;font-weight:800;letter-spacing:-0.3px;padding:8px 20px;border-radius:10px;">CreatorOS</span>
              </div>

              <!-- Card -->
              <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.06);">

                <!-- Top accent bar -->
                <div style="height:4px;background:linear-gradient(90deg,#2563EB,#8B5CF6);"></div>

                <div style="padding:36px 36px 28px;">

                  <!-- Label + countdown -->
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                    <span style="font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.1em;">Posting Reminder</span>
                    <span style="background:${daysUntil === 0 ? '#FEF3C7' : '#EFF6FF'};color:${daysUntil === 0 ? '#92400E' : '#1D4ED8'};font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;">
                      ${daysUntil === 0 ? 'Posts today!' : daysUntil === 1 ? 'Posts tomorrow' : `${daysUntil} days away`}
                    </span>
                  </div>

                  <!-- Title -->
                  <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#0F172A;line-height:1.25;letter-spacing:-0.4px;">${idea.title}</h1>
                  <p style="margin:0 0 28px;font-size:14px;color:#94A3B8;">Scheduled for ${formatDate(postDate)}</p>

                  <!-- Stage progress -->
                  <div style="background:#F8F9FA;border-radius:14px;padding:20px;margin-bottom:28px;">
                    <table style="width:100%;border-collapse:collapse;">
                      <tr>${stageProgressDots}</tr>
                    </table>
                  </div>

                  <!-- Action message -->
                  <div style="border-left:3px solid ${stageColor};padding:14px 18px;background:${stageColor}08;border-radius:0 10px 10px 0;margin-bottom:28px;">
                    <p style="margin:0;font-size:15px;font-weight:600;color:#0F172A;line-height:1.5;">${stageMessage}</p>
                  </div>

                  <!-- CTA -->
                  <a href="${appUrl}/dashboard/ideas/${idea.id}"
                     style="display:block;text-align:center;background:#2563EB;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:15px 24px;border-radius:12px;letter-spacing:-0.1px;">
                    Open "${idea.title}" →
                  </a>

                </div>

                <!-- Footer -->
                <div style="background:#F8F9FA;border-top:1px solid #E2E8F0;padding:16px 36px;">
                  <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">
                    You're receiving this because you set a posting reminder in CreatorOS. &nbsp;
                    <a href="${appUrl}/dashboard/settings" style="color:#2563EB;text-decoration:none;font-weight:600;">Manage reminders</a>
                  </p>
                </div>

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
