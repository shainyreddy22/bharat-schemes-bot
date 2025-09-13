import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createConversation = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Mark other conversations as inactive
    const existingConversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const conv of existingConversations) {
      await ctx.db.patch(conv._id, { isActive: false });
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      userId: user._id,
      title: args.title,
      isActive: true,
    });

    return conversationId;
  },
});

export const getUserConversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getActiveConversation = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return conversations[0] || null;
  },
});

export const setActiveConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Mark all conversations as inactive
    const allConversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const conv of allConversations) {
      await ctx.db.patch(conv._id, { isActive: false });
    }

    // Mark selected conversation as active
    await ctx.db.patch(args.conversationId, { isActive: true });
  },
});
