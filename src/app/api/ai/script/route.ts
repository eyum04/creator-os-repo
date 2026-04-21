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
        content: `You are a TikTok content strategist. A creator has a video idea titled "${title}" in the "${pillar ?? 'General'}" content pillar.

Here's their current script/notes:
${script?.trim() ? script : '(No script written yet)'}

Give them 3 specific, actionable suggestions to improve this script for TikTok. Focus on:
1. A stronger hook for the first 3 seconds
2. Better storytelling flow and pacing
3. A stronger call-to-action at the end

Keep each suggestion concise and practical (1-2 sentences max). Format as a numbered list.`,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') return NextResponse.json({ error: 'No response' }, { status: 500 })

    return NextResponse.json({ suggestions: content.text })
  } catch (err) {
    console.error('AI script error:', err)
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
  }
}
