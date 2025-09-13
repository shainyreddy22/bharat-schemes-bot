import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      
      // User preferences for the chatbot
      preferredLanguage: v.optional(v.string()),
      location: v.optional(v.string()),
      interests: v.optional(v.array(v.string())),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Chat conversations
    conversations: defineTable({
      userId: v.id("users"),
      title: v.string(),
      isActive: v.boolean(),
    }).index("by_user", ["userId"]),

    // Chat messages
    messages: defineTable({
      conversationId: v.id("conversations"),
      userId: v.optional(v.id("users")),
      content: v.string(),
      role: v.union(v.literal("user"), v.literal("assistant")),
      timestamp: v.number(),
      language: v.optional(v.string()),
    }).index("by_conversation", ["conversationId"]),

    // Government schemes database
    schemes: defineTable({
      name: v.string(),
      description: v.string(),
      category: v.string(),
      eligibility: v.array(v.string()),
      benefits: v.array(v.string()),
      applicationProcess: v.string(),
      requiredDocuments: v.array(v.string()),
      officialWebsite: v.optional(v.string()),
      contactInfo: v.optional(v.string()),
      state: v.optional(v.string()),
      isActive: v.boolean(),
      tags: v.array(v.string()),
    }).index("by_category", ["category"])
      .index("by_state", ["state"])
      .index("by_active", ["isActive"]),

    // User notifications
    notifications: defineTable({
      userId: v.id("users"),
      title: v.string(),
      message: v.string(),
      type: v.union(
        v.literal("scheme_update"),
        v.literal("new_scheme"),
        v.literal("reminder"),
        v.literal("system")
      ),
      isRead: v.boolean(),
      schemeId: v.optional(v.id("schemes")),
    }).index("by_user", ["userId"])
      .index("by_user_unread", ["userId", "isRead"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;