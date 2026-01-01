// Supabase Edge Function: generate-hint
// Generates AI hints for Codenames using Google Gemini API
// Fallback: gemini-2.5-flash → gemini-2.0-flash-lite → gemini-2.0-flash

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Model fallback chain (try in order if rate limited)
const MODELS = [
  "gemini-2.5-flash",       // Gemini 2.5 Flash (primary)
  "gemini-2.0-flash-lite",  // Gemini 2.0 Flash Lite (fallback 1)
  "gemini-2.0-flash",       // Gemini 2.0 Flash (fallback 2)
];

const getApiUrl = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

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

    const prompt = `Codenames Spymaster. Give ONE word hint.

YOUR CARDS: ${myCards.map((c) => c.word).join(", ")}
AVOID: ${enemyCards.map((c) => c.word).join(", ")}${assassin ? `, ASSASSIN: ${assassin.word}` : ""}

Reply JSON only: {"word":"HINT","count":N}`;

    // Try each model in order until one succeeds
    let textResponse = "";
    let lastError = "";
    let usedModel = "";

    for (const model of MODELS) {
      try {
        console.log(`Trying model: ${model}`);

        const response = await fetch(`${getApiUrl(model)}?key=${GEMINI_API_KEY}`, {
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
              temperature: 0.5,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (response.status === 429) {
          // Rate limited - try next model
          console.log(`Model ${model} rate limited (429), trying next...`);
          lastError = `${model}: rate limited`;
          continue;
        }

        if (!response.ok) {
          const error = await response.text();
          console.error(`Model ${model} error:`, error);
          lastError = `${model}: ${response.status}`;
          continue;
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const finishReason = candidate?.finishReason;
        textResponse = candidate?.content?.parts?.[0]?.text || "";

        console.log(`Model ${model}: finishReason=${finishReason}, len=${textResponse.length}`);
        console.log(`Text: ${textResponse}`);

        // If response is truncated, try next model
        if (finishReason !== "STOP" || !textResponse) {
          console.log(`Model ${model} incomplete: ${finishReason}`);
          lastError = `${model}: ${finishReason || "empty response"}`;
          continue;
        }

        usedModel = model;
        break;
      } catch (e) {
        console.error(`Model ${model} exception:`, e);
        lastError = `${model}: ${e instanceof Error ? e.message : "unknown"}`;
        continue;
      }
    }

    if (!textResponse) {
      throw new Error(`All models failed. Last error: ${lastError}`);
    }

    // Extract JSON from response
    console.log("AI raw response:", textResponse);
    console.log("Response length:", textResponse.length);

    // Clean up the response - remove code blocks
    let cleanedResponse = textResponse
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let hint: HintResponse;
    try {
      // First try: direct parse (for responseMimeType: json)
      hint = JSON.parse(cleanedResponse);
    } catch {
      // Second try: extract JSON with regex
      const jsonMatch = cleanedResponse.match(/\{[^{}]*"word"[^{}]*"count"[^{}]*"reason"[^{}]*\}/);
      if (jsonMatch) {
        try {
          hint = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Regex match parse failed:", e);
          throw new Error(`Failed to parse: ${cleanedResponse}`);
        }
      } else {
        console.error("No JSON found in:", cleanedResponse);
        throw new Error(`Failed to parse AI response: ${cleanedResponse.substring(0, 300)}`);
      }
    }

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

    return new Response(JSON.stringify({ ...hint, model: usedModel }), {
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
