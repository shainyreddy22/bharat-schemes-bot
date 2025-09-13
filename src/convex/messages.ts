import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId: user._id,
      content: args.content,
      role: "user",
      timestamp: Date.now(),
      language: args.language || "en",
    });

    return messageId;
  },
});

export const addAssistantMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: "assistant",
      timestamp: Date.now(),
      language: args.language || "en",
    });

    return messageId;
  },
});

export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});
