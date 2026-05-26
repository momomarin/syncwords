import type { Word, QuizAnswer } from '@/types'

export function buildQuizGenerationPrompt(words: Word[], jobType: string): string {
  const jobLabel = jobType || 'ビジネスパーソン'
  const wordsJson = words.map(w => ({
    id: w.id,
    word: w.word,
    pos: w.pos,
    meaning: w.meaning,
    scene: w.example_scene,
    similar: w.similar,
  }))

  return `You are an expert TOEIC English quiz generator for Japanese business professionals.

Generate exactly 10 fill-in-the-blank quiz questions for a ${jobLabel} learner.

Target words:
${JSON.stringify(wordsJson, null, 2)}

Rules:
- Create one question per word
- Each sentence should relate to ${jobLabel} business context (meetings, emails, proposals, reports, etc.)
- The blank (____) represents the target word
- Provide exactly 4 choices: the correct answer + 3 plausible distractors
- Distractors should be words that Japanese learners commonly confuse (similar meaning, different part of speech, or similar spelling)
- Shuffle the choices so the correct answer is not always first
- Keep sentences natural, 15-25 words

Return ONLY a valid JSON array. No markdown, no explanation. Format:
[
  {
    "wordId": <number>,
    "word": "<target word>",
    "meaning": "<Japanese meaning>",
    "sentence": "The team will ____ the proposal by Friday.",
    "choices": ["submit", "attend", "cancel", "delay"],
    "correctAnswer": "submit"
  }
]`
}

export function buildFeedbackPrompt(
  word: string,
  meaning: string,
  sentence: string,
  correctAnswer: string,
  wrongAnswer: string,
  jobType: string,
): string {
  return `You are a warm, encouraging English language mentor for a Japanese ${jobType || 'business professional'}.

The learner answered incorrectly:
- Target word: "${word}" (${meaning})
- Sentence: "${sentence.replace('____', `[${correctAnswer}]`)}"
- Correct answer: "${correctAnswer}"
- Student chose: "${wrongAnswer}"

Write a concise feedback (60-80 words) that:
1. Starts with "惜しい！" or "なるほど、" (warm, encouraging tone)
2. Explains WHY "${wrongAnswer}" doesn't work here in simple Japanese/English mix
3. Explains what "${correctAnswer}" means in this business context
4. Gives a quick memory tip tied to ${jobType || 'business'} context

Be like a supportive senior colleague, not a textbook. Mix Japanese naturally.`
}

export function buildSummaryPrompt(
  answers: QuizAnswer[],
  jobType: string,
): string {
  const correctWords = answers.filter(a => a.isCorrect).map(a => a.word)
  const allWords = answers.map(a => a.word)
  const score = answers.filter(a => a.isCorrect).length

  return `You are a business email specialist helping a Japanese ${jobType || 'business professional'}.

Today's quiz results: ${score}/10 correct
All words studied: ${allWords.join(', ')}

Create a "Daily Executive Summary" with two parts:

PART 1 — Business Email (in English, 120-150 words):
- Write a realistic professional email appropriate for ${jobType || 'a business professional'}
- Naturally incorporate ALL ${allWords.length} words: ${allWords.join(', ')}
- Bold each target word like **word**
- Make it feel like an email they would actually send or receive tomorrow

PART 2 — Japanese Encouragement (3-4 sentences):
- Warm summary of today's learning
- Highlight ${correctWords.length > 0 ? `especially well-used words: ${correctWords.slice(0, 3).join(', ')}` : 'progress made'}
- Motivate them for tomorrow

Format your response as:
<email>
[the business email here]
</email>
<encouragement>
[Japanese encouragement here]
</encouragement>`
}
