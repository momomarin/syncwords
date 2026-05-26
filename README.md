# SyncWords ⚡

TOEIC 700点レベル・ビジネス英単語300語をAIパーソナライズで習得するWebアプリ。

## 特徴

- **AIパーソナライズ問題生成** — 職種（IT営業・エンジニア等）に合わせたビジネス例文をClaude AIが動的生成
- **誤答分析フィードバック** — 間違えた理由をAIメンターがリアルタイムで解説（ストリーミング）
- **Aha-Moment Mail** — 10問完走後に学習した全単語を使ったビジネスメールをAIが生成
- **進捗ダッシュボード** — 連続学習日数・正答率・習得語数を可視化
- **ゲストモード** — ログイン不要、即プレイ可能

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local に ANTHROPIC_API_KEY を設定
npm run dev
```

## 必須環境変数

| 変数名 | 説明 |
|--------|------|
| `ANTHROPIC_API_KEY` | Anthropic API キー（必須） |
| `CLAUDE_MODEL` | 使用モデル（デフォルト: `claude-sonnet-4-5`） |

## Vercel デプロイ手順

1. リポジトリを GitHub にプッシュ
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. 環境変数を設定:
   - `ANTHROPIC_API_KEY`: Anthropic コンソールで取得
4. デプロイ実行

```bash
# Vercel CLI でのデプロイ
npm i -g vercel
vercel --prod
```

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **スタイリング**: Tailwind CSS v4
- **AI**: Claude API (@anthropic-ai/sdk) — claude-sonnet-4-5
- **状態管理**: localStorage（ゲストモード）
- **デプロイ**: Vercel (nrt1 リージョン)
- **オプション**: Supabase（永続化・認証）

## アーキテクチャ

```
ホーム（職種選択）
  ↓
/api/quiz/generate  ← Claude: 10問一括生成
  ↓
クイズ（10問）
  ↓ 誤答時
/api/feedback       ← Claude: 誤答解説（ストリーミング）
  ↓ 10問完了
/api/summary        ← Claude: Aha-Moment Mail生成
  ↓
結果画面 → ダッシュボード
```
