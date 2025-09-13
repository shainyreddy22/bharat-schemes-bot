"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const FREE_MODELS: Array<string> = [
  "deepseek/deepseek-r1:free",
  "google/gemini-2.0-flash-exp:free",
  "mistralai/mistral-7b-instruct:free",
];

export const chatCompletion = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("system"), v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const systemPrompt: ChatMessage = {
      role: "system",
      content: [
        "You are an accurate, helpful assistant specializing in Indian and Telangana government schemes.",
        "Answer clearly with step-by-step guidance: eligibility, benefits, documents, how to apply, and official links if known.",
        "If unsure, say so and suggest how to verify on official portals. Keep answers concise, factual, and up to date.",
        "Respond in the user's language preference when provided (English: en, Telugu: te).",
      ].join(" "),
    };

    const languageInstruction: ChatMessage | null =
      args.language === "te"
        ? { role: "system", content: "Respond in Telugu (తెలుగు) unless the user explicitly asks for English." }
        : null;

    const finalMessages: ChatMessage[] = [systemPrompt, ...(languageInstruction ? [languageInstruction] : []), ...args.messages];

    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = "https://openrouter.ai/api/v1/chat/completions";

    // Try free models in order
    for (const model of FREE_MODELS) {
      try {
        const res = await fetch(baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            "X-Title": "Schemes Assistant",
          },
          body: JSON.stringify({
            model,
            messages: finalMessages,
            max_tokens: 600,
            temperature: 0.4,
          }),
        });

        if (!res.ok) {
          // Try next model
          continue;
        }

        const data = await res.json();
        const content: string | undefined = data?.choices?.[0]?.message?.content;
        if (content && typeof content === "string") {
          return { success: true as const, model, content };
        }
      } catch (_) {
        // Try next model silently
        continue;
      }
    }

    return {
      success: false as const,
      error:
        "AI is temporarily unavailable. Please try again in a moment or add an OpenRouter API key in Integrations.",
    };
  },
});
