// Supabase Edge Function: generate-hint
// Generates AI hints for Codenames using Google Gemini API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

interface Card {
  word: string;
  type: "red" | "blue" | "neutral" | "assassin";
  isRevealed: boolean;
}

interface RequestBody {
  cards: Card[];
  team: "red" | "blue";
}

interface HintResponse {
  word: string;
  count: number;
  reason: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { cards, team }: RequestBody = await req.json();

    // Filter cards by type
    const myCards = cards.filter((c) => c.type === team && !c.isRevealed);
    const enemyTeam = team === "red" ? "blue" : "red";
    const enemyCards = cards.filter((c) => c.type === enemyTeam && !c.isRevealed);
    const neutralCards = cards.filter((c) => c.type === "neutral" && !c.isRevealed);
    const assassin = cards.find((c) => c.type === "assassin" && !c.isRevealed);

    if (myCards.length === 0) {
      return new Response(
        JSON.stringify({ word: "PASS", count: 0, reason: "No cards left to guess" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a Spymaster in the board game Codenames. Your task is to give a one-word hint that connects multiple words on your team.

RULES:
1. Give exactly ONE WORD as a hint
2. The word must NOT be any word on the board
3. The word must NOT be a proper noun, foreign word, or compound word
4. The number indicates how many of your cards relate to the hint
5. Your hint should connect as many of YOUR cards as possible while avoiding DANGER cards

YOUR TEAM'S CARDS (you want your teammates to guess these):
${myCards.map((c) => c.word).join(", ")}

ENEMY TEAM'S CARDS (avoid these - if guessed, helps opponent):
${enemyCards.map((c) => c.word).join(", ")}

NEUTRAL CARDS (avoid these - ends turn if guessed):
${neutralCards.map((c) => c.word).join(", ")}

ASSASSIN (CRITICAL - if guessed, your team LOSES):
${assassin ? assassin.word : "already revealed"}

Think carefully and respond with ONLY a JSON object in this exact format:
{"word": "YOUR_HINT", "count": NUMBER, "reason": "brief explanation"}

Remember:
- The hint word must NOT appear on the board
- Avoid hints that could lead to the assassin
- Higher count = more efficient, but also riskier`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const hint: HintResponse = JSON.parse(jsonMatch[0]);

    // Validate hint is not on the board
    const allWords = cards.map((c) => c.word.toLowerCase());
    if (allWords.includes(hint.word.toLowerCase())) {
      // Regenerate or return a safe default
      return new Response(
        JSON.stringify({
          word: "THINK",
          count: 1,
          reason: "AI generated invalid hint, using fallback",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(hint), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        word: "ERROR",
        count: 0,
        reason: "Failed to generate hint",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
