import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Haiku は Sonnet の約25分の1のコスト
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? 'claude-haiku-4-5-20251001'
