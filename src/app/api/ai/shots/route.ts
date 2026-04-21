import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { title, script, pillar } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a TikTok video director. A creator is making a video titled "${title}" in the "${pillar ?? 'General'}" content pillar.

${script?.trim() ? `Their script/notes: ${script}` : ''}

Generate a shot list of 5-7 specific shots for this TikTok video. Each shot should be a brief, concrete description of what to film (angle, subject, action).

Return ONLY a JSON array of strings, nothing else. Example:
["Wide shot of desk setup with good lighting", "Close-up of hands on keyboard", "Face cam with animated reaction"]`,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') return NextResponse.json({ error: 'No response' }, { status: 500 })

    const text = content.text.trim()
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return NextResponse.json({ error: 'Parse error' }, { status: 500 })

    const shots: string[] = JSON.parse(match[0])
    return NextResponse.json({ shots })
  } catch (err) {
    console.error('AI shots error:', err)
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
  }
}
