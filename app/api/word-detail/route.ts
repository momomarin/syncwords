import { NextRequest, NextResponse } from 'next/server'
import { anthropic, CLAUDE_MODEL } from '@/lib/claude'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { word, meaning, pos, jobType } = await req.json()
    const msg = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Create learning content for the English word "${word}" (${pos}: ${meaning}) for a ${jobType} professional.
Return JSON only — no extra text:
{"sentence":"a natural business English sentence using ${word}","tip":"語源や連想を使った日本語の記憶ヒント（20文字以内）"}`
      }]
    })
    const text = (msg.content[0] as { type: string; text: string }).text
    const match = text.match(/\{[\s\S]*?\}/)
    return NextResponse.json(match ? JSON.parse(match[0]) : { sentence: '', tip: '' })
  } catch {
    return NextResponse.json({ sentence: '', tip: '' }, { status: 500 })
  }
}
