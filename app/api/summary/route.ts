import { NextResponse } from 'next/server'
import { anthropic, CLAUDE_MODEL } from '@/lib/claude'
import { buildSummaryPrompt } from '@/lib/prompts'
import type { QuizAnswer } from '@/types'

export async function POST(request: Request) {
  try {
    const { answers, jobType }: { answers: QuizAnswer[]; jobType: string } =
      await request.json()

    const prompt = buildSummaryPrompt(answers, jobType)

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Invalid response' }, { status: 500 })
    }

    const emailMatch = content.text.match(/<email>([\s\S]*?)<\/email>/)
    const encouragementMatch = content.text.match(
      /<encouragement>([\s\S]*?)<\/encouragement>/
    )

    return NextResponse.json({
      email: emailMatch?.[1]?.trim() ?? content.text,
      encouragement: encouragementMatch?.[1]?.trim() ?? '',
    })
  } catch (error) {
    console.error('Summary error:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
