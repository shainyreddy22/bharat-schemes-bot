import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllSchemes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("schemes")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getSchemesByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("schemes")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const searchSchemes = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const allSchemes = await ctx.db
      .query("schemes")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const searchLower = args.searchTerm.toLowerCase();
    
    return allSchemes.filter(scheme => 
      scheme.name.toLowerCase().includes(searchLower) ||
      scheme.description.toLowerCase().includes(searchLower) ||
      scheme.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  },
});

export const addSampleSchemes = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleSchemes = [
      {
        name: "Pradhan Mantri Jan Dhan Yojana",
        description: "Financial inclusion program to provide banking services to all households",
        category: "Financial Services",
        eligibility: ["Indian citizen", "Age 10 years and above", "Valid identity proof"],
        benefits: ["Zero balance account", "RuPay debit card", "Accident insurance", "Life insurance"],
        applicationProcess: "Visit nearest bank branch with required documents",
        requiredDocuments: ["Aadhaar card", "PAN card", "Passport size photograph"],
        officialWebsite: "https://pmjdy.gov.in/",
        contactInfo: "1800-11-0001",
        state: "All India",
        isActive: true,
        tags: ["banking", "financial inclusion", "insurance", "debit card"]
      },
      {
        name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana",
        description: "Health insurance scheme providing coverage up to Rs. 5 lakh per family per year",
        category: "Healthcare",
        eligibility: ["Families listed in SECC 2011", "Rural and urban poor families"],
        benefits: ["Free treatment up to Rs. 5 lakh", "Cashless treatment", "Pre and post hospitalization"],
        applicationProcess: "Check eligibility online and visit empanelled hospitals",
        requiredDocuments: ["Aadhaar card", "Ration card", "Family ID"],
        officialWebsite: "https://pmjay.gov.in/",
        contactInfo: "14555",
        state: "All India",
        isActive: true,
        tags: ["health", "insurance", "medical", "hospitalization"]
      },
      {
        name: "Pradhan Mantri Kisan Samman Nidhi",
        description: "Income support scheme for farmers providing Rs. 6000 per year",
        category: "Agriculture",
        eligibility: ["Small and marginal farmers", "Landholding up to 2 hectares"],
        benefits: ["Rs. 2000 every 4 months", "Direct bank transfer", "No intermediaries"],
        applicationProcess: "Register online or visit Common Service Center",
        requiredDocuments: ["Aadhaar card", "Bank account details", "Land ownership documents"],
        officialWebsite: "https://pmkisan.gov.in/",
        contactInfo: "155261",
        state: "All India",
        isActive: true,
        tags: ["farmer", "agriculture", "income support", "rural"]
      },
      {
        name: "Beti Bachao Beti Padhao",
        description: "Scheme to address declining child sex ratio and promote girl child education",
        category: "Women & Child Development",
        eligibility: ["Girl children", "Families with girl child"],
        benefits: ["Educational support", "Awareness campaigns", "Skill development"],
        applicationProcess: "Contact local authorities or visit official website",
        requiredDocuments: ["Birth certificate", "School enrollment certificate"],
        officialWebsite: "https://wcd.nic.in/bbbp-scheme",
        contactInfo: "1800-11-1111",
        state: "All India",
        isActive: true,
        tags: ["girl child", "education", "women empowerment", "awareness"]
      },
      {
        name: "Pradhan Mantri Awas Yojana",
        description: "Housing scheme to provide affordable housing to urban and rural poor",
        category: "Housing",
        eligibility: ["Economically Weaker Section", "Low Income Group", "Middle Income Group"],
        benefits: ["Subsidized home loans", "Direct subsidy", "Affordable housing"],
        applicationProcess: "Apply online through official portal",
        requiredDocuments: ["Income certificate", "Aadhaar card", "Bank statements"],
        officialWebsite: "https://pmaymis.gov.in/",
        contactInfo: "1800-11-6446",
        state: "All India",
        isActive: true,
        tags: ["housing", "loan", "subsidy", "affordable"]
      }
    ];

    for (const scheme of sampleSchemes) {
      await ctx.db.insert("schemes", scheme);
    }

    return "Sample schemes added successfully";
  },
});
