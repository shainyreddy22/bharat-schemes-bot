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
        "You are an accurate assistant for Indian and Telangana government schemes.",
        "Output style rules:",
        "- Do NOT use markdown symbols like #, *, or code blocks.",
        "- Use clean sections with short lines. Prefer labels like: Overview:, Eligibility:, Benefits:, Required Documents:, How to Apply:, Official Links:, State-specific Notes:, Tips/Disclaimers:.",
        "- Keep answers concise but complete. Include official portals when relevant (pmjay.gov.in, pmkisan.gov.in, pmjdy.gov.in, scholarships.gov.in, nsap.nic.in, etc.).",
        "- If unsure, say so and suggest verifying on official portals.",
        "- Language: respond in the requested language if provided.",
      ].join(" "),
    };

    const languageInstruction: ChatMessage | null =
      args.language === "te"
        ? { role: "system", content: "Respond in Telugu (తెలుగు) unless the user asks for English." }
        : null;

    const finalMessages: ChatMessage[] = [systemPrompt, ...(languageInstruction ? [languageInstruction] : []), ...args.messages];

    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = "https://openrouter.ai/api/v1/chat/completions";

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
            max_tokens: 1200, // allow longer, complete answers
            temperature: 0.2,
          }),
        });

        if (!res.ok) {
          continue;
        }

        const data = await res.json();
        const content: string | undefined = data?.choices?.[0]?.message?.content;
        if (content && typeof content === "string") {
          return { success: true as const, model, content };
        }
      } catch (_) {
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