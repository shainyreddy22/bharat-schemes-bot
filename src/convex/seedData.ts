import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Add sample schemes
    await ctx.runMutation(api.schemes.addSampleSchemes, {});
    
    return "Database seeded successfully";
  },
});
