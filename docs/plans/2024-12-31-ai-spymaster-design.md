# AI Spymaster Design

## Overview

Add AI Spymaster functionality using Google Gemini API to enable solo/cooperative play.

## Decisions

| Item | Decision |
|------|----------|
| AI Role | Spymaster only |
| Game Mode | Cooperative (add AI to existing room) |
| API Key Management | Supabase Edge Functions |
| Opponent | Practice mode (no opponent, auto-skip) |
| API | Google Gemini 1.5 Flash (free tier: 1500 req/day) |

## Architecture

```
Client (React)
    │
    ├── LobbyPage: "Add AI Spymaster" button
    ├── GamePage: Display AI hints, handle AI turns
    └── aiService: Call Edge Function
            │
            ▼
Supabase Edge Function (generate-hint)
            │
            ▼
Google Gemini API (gemini-1.5-flash)
```

## Database Changes

```sql
ALTER TABLE players ADD COLUMN is_ai BOOLEAN DEFAULT false;
```

## Edge Function: generate-hint

**Input:**
```json
{
  "cards": [...],
  "team": "red",
  "revealedCards": [...]
}
```

**Output:**
```json
{
  "word": "hint word",
  "count": 3,
  "reason": "explanation"
}
```

## UI Changes

### LobbyPage
- Add "AI Spymaster" button for each team
- Show AI player with robot icon
- Allow removing AI player

### GamePage
- Auto-trigger AI hint generation on AI's turn
- Show loading state while generating
- Display AI's reasoning (optional)
- Auto-skip opponent team's turn in practice mode

## Implementation Steps

1. Add `is_ai` column to players table
2. Update TypeScript types
3. Create Supabase Edge Function
4. Create client-side AI service
5. Update LobbyPage with AI controls
6. Update GamePage with AI turn handling
7. Test and deploy
