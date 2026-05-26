import { NextResponse } from 'next/server'
import { anthropic, CLAUDE_MODEL } from '@/lib/claude'
import { buildFeedbackPrompt } from '@/lib/prompts'

export async function POST(request: Request) {
  try {
    const { word, meaning, sentence, correctAnswer, wrongAnswer, jobType } =
      await request.json()

    const prompt = buildFeedbackPrompt(
      word,
      meaning,
      sentence,
      correctAnswer,
      wrongAnswer,
      jobType,
    )

    const stream = await anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Failed to get feedback' }, { status: 500 })
  }
}
