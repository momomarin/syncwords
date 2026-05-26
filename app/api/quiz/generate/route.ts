import { NextResponse } from 'next/server'
import { anthropic, CLAUDE_MODEL } from '@/lib/claude'
import { buildQuizGenerationPrompt } from '@/lib/prompts'
import { getRandomWords } from '@/lib/words'
import type { QuizQuestion } from '@/types'

export async function POST(request: Request) {
  try {
    const { jobType } = await request.json()
    const words = getRandomWords(10)

    const prompt = buildQuizGenerationPrompt(words, jobType)

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Invalid response from Claude' }, { status: 500 })
    }

    let questions: QuizQuestion[]
    try {
      questions = JSON.parse(content.text)
    } catch {
      const match = content.text.match(/\[[\s\S]*\]/)
      if (!match) {
        return NextResponse.json({ error: 'Failed to parse quiz questions' }, { status: 500 })
      }
      questions = JSON.parse(match[0])
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}
