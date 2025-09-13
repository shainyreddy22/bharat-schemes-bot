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
        "Always answer with a concise, structured Markdown format using these sections when relevant:",
        "1) Overview  2) Eligibility  3) Benefits  4) Required Documents  5) How to Apply  6) Official Links  7) State-specific Notes  8) Tips/Disclaimers.",
        "Prefer bullet points and short sentences. Include official portal links (pmjay.gov.in, pmkisan.gov.in, pmjdy.gov.in, scholarships.gov.in, nsap.nic.in, etc.) when applicable.",
        "If unsure, say so and suggest verifying on official portals. Keep temperature low and avoid repetition.",
        "You may use general knowledge beyond any local database. If the user asks about any Indian scheme, provide details even if not in the local dataset.",
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
            max_tokens: 700,
            temperature: 0.2,
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