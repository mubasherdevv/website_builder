/**
 * Unified AI Business Analysis & SEO Keyword Research Adapter
 * Integrates directly with account-configured AI Providers (OpenAI, OpenRouter, Gemini, Custom Compatible)
 * with robust, deterministic offline fallbacks when no provider key is configured.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { AIProviderRepository } from "@/lib/database/repositories/ai-provider.repo";
import { decryptCredential } from "@/lib/security/encryption";
import { getProviderInstance } from "@/lib/ai/providers";

export interface BusinessAnalysisInput {
  businessName: string;
  niche: string;
  country: string;
  city: string;
  state?: string;
  address?: string;
  phone?: string;
  email?: string;
  secondaryKeyword?: string;
}

export interface ServiceSuggestion {
  id: string;
  name: string;
  isAiSuggested: boolean;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  strategy: "neighborhoods" | "nearby_cities" | "custom_areas";
  isAiSuggested: boolean;
}

export interface BlogTitleSuggestion {
  id: string;
  title: string;
  intent: "informational" | "commercial" | "transactional";
}

export interface PageKeywordCluster {
  pageType: "homepage" | "service" | "location" | "about" | "contact" | "blog";
  pageName: string;
  pageSlug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTailKeywords: string[];
  faqKeywords: string[];
  intent: string;
}

export interface AnalysisAdapterResponse {
  services: ServiceSuggestion[];
  locations: LocationSuggestion[];
  blogTitles: BlogTitleSuggestion[];
  keywordClusters: PageKeywordCluster[];
  providerUsed: string;
  modelUsed?: string;
}

/**
 * Heuristic generator providing smart offline fallback for any niche & location
 */
export function generateHeuristicAnalysis(
  input: BusinessAnalysisInput,
  strategy: "neighborhoods" | "nearby_cities" | "custom_areas" = "neighborhoods"
): AnalysisAdapterResponse {
  const niche = (input.niche || "Professional Services").trim();
  const city = (input.city || "Local Area").trim();
  const businessName = (input.businessName || "Our Company").trim();

  // Smart niche-based service decomposition
  const services: ServiceSuggestion[] = [
    { id: "srv_1", name: `Residential ${niche}`, isAiSuggested: true },
    { id: "srv_2", name: `Commercial ${niche}`, isAiSuggested: true },
    { id: "srv_3", name: `Emergency ${niche} Repair`, isAiSuggested: true },
    { id: "srv_4", name: `Inspection & Maintenance`, isAiSuggested: true },
    { id: "srv_5", name: `Full System Replacement & Installation`, isAiSuggested: true },
  ];

  // Strategy-based location suggestions
  const locNames =
    strategy === "neighborhoods"
      ? [`Downtown ${city}`, `North ${city}`, `West End`, `South District`, `Metro Suburbs`]
      : strategy === "nearby_cities"
      ? [`Greater ${city} Area`, `${city} Heights`, `East Valley`, `Riverside Area`, `Twin Lakes`]
      : [`Central District`, `Airport Corridor`, `Industrial Zone`, `Harbor View`];

  const locations: LocationSuggestion[] = locNames.map((name, idx) => ({
    id: `loc_${idx + 1}`,
    name,
    strategy,
    isAiSuggested: true,
  }));

  // Highly targeted blog titles
  const blogTitles: BlogTitleSuggestion[] = [
    {
      id: "blog_1",
      title: `How Much Does ${niche} Cost in ${city}? (Complete Pricing Guide)`,
      intent: "informational",
    },
    {
      id: "blog_2",
      title: `Top 5 Signs You Need Immediate ${niche} Service Before Costly Damage`,
      intent: "commercial",
    },
    {
      id: "blog_3",
      title: `How to Choose the Best Certified ${niche} Specialist in ${city}`,
      intent: "transactional",
    },
    {
      id: "blog_4",
      title: `Preventive Maintenance Checklist for ${niche} Systems in ${city}`,
      intent: "informational",
    },
  ];

  // Page-specific keyword mapping
  const keywordClusters: PageKeywordCluster[] = [
    {
      pageType: "homepage",
      pageName: "Homepage",
      pageSlug: "/",
      primaryKeyword: `${niche} in ${city}`,
      secondaryKeywords: [`best ${niche.toLowerCase()} ${city}`, `${city} ${niche.toLowerCase()} company`, `licensed ${niche.toLowerCase()}`],
      longTailKeywords: [`same day ${niche.toLowerCase()} services in ${city}`, `emergency 24/7 ${niche.toLowerCase()} near me`],
      faqKeywords: [`How much does a ${niche.toLowerCase()} service call cost in ${city}?`, `Are your technicians licensed and insured in ${input.state || city}?`],
      intent: "Commercial / Local Transactional",
    },
    {
      pageType: "service",
      pageName: services[0].name,
      pageSlug: `/services/${services[0].name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      primaryKeyword: `${services[0].name.toLowerCase()} ${city}`,
      secondaryKeywords: [`affordable ${services[0].name.toLowerCase()}`, `trusted ${services[0].name.toLowerCase()} contractor`],
      longTailKeywords: [`best rated ${services[0].name.toLowerCase()} in ${city} for residential properties`],
      faqKeywords: [`What is included in your ${services[0].name.toLowerCase()} package?`, `How long does an installation or repair take?`],
      intent: "Transactional",
    },
    {
      pageType: "service",
      pageName: services[1].name,
      pageSlug: `/services/${services[1].name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      primaryKeyword: `${services[1].name.toLowerCase()} ${city}`,
      secondaryKeywords: [`commercial ${niche.toLowerCase()} maintenance`, `business ${niche.toLowerCase()} solutions`],
      longTailKeywords: [`certified commercial ${niche.toLowerCase()} contractor near ${city}`],
      faqKeywords: [`Do you provide service contracts for commercial facilities in ${city}?`],
      intent: "B2B Transactional",
    },
    {
      pageType: "location",
      pageName: locations[0].name,
      pageSlug: `/locations/${locations[0].name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      primaryKeyword: `${niche} ${locations[0].name}`,
      secondaryKeywords: [`local ${niche.toLowerCase()} ${locations[0].name}`, `${locations[0].name} ${niche.toLowerCase()} experts`],
      longTailKeywords: [`emergency ${niche.toLowerCase()} dispatched to ${locations[0].name}`],
      faqKeywords: [`How fast can a crew reach ${locations[0].name}?`],
      intent: "Local Navigational",
    },
    {
      pageType: "about",
      pageName: "About Us",
      pageSlug: "/about",
      primaryKeyword: `About ${businessName}`,
      secondaryKeywords: [`our story ${businessName}`, `certified ${niche.toLowerCase()} team ${city}`],
      longTailKeywords: [`locally owned ${niche.toLowerCase()} business history in ${city}`],
      faqKeywords: [`How many years of experience does ${businessName} have in ${city}?`],
      intent: "Informational / Branded",
    },
    {
      pageType: "contact",
      pageName: "Contact Us",
      pageSlug: "/contact",
      primaryKeyword: `Contact ${businessName} ${city}`,
      secondaryKeywords: [`phone number for ${niche.toLowerCase()} ${city}`, `request estimate ${city}`],
      longTailKeywords: [`free quotes for ${niche.toLowerCase()} in ${city} and surrounding areas`],
      faqKeywords: [`What are your business hours?`, `Do you provide emergency response on weekends?`],
      intent: "Transactional",
    },
  ];

  return {
    services,
    locations,
    blogTitles,
    keywordClusters,
    providerUsed: "heuristic_offline",
  };
}

/**
 * Universal AI Caller with Database Provider lookup, execution & usage logging
 */
export async function runBusinessAnalysis(
  input: BusinessAnalysisInput,
  strategy: "neighborhoods" | "nearby_cities" | "custom_areas" = "neighborhoods",
  options?: { providerId?: string; userId?: string }
): Promise<AnalysisAdapterResponse> {
  const startTime = Date.now();

  try {
    const admin = createAdminClient();
    const repo = new AIProviderRepository(admin);

    // Resolve user ID
    let userId = options?.userId;
    if (!userId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: users } = await (admin as any).auth.admin.listUsers();
      userId = users?.users?.[0]?.id;
    }

    // Lookup configured provider
    let providerRow = null;
    if (userId) {
      if (options?.providerId) {
        providerRow = await repo.getProviderById(options.providerId, userId);
      } else {
        providerRow = await repo.getDefaultProvider(userId);
      }
    }

    // If an enabled provider exists in the database
    if (providerRow && providerRow.enabled && providerRow.encrypted_api_key) {
      const decryptedKey = decryptCredential(providerRow.encrypted_api_key);
      const adapter = getProviderInstance(providerRow.provider_type);

      const systemPrompt = "You are an expert SEO and local business analyst. You must respond strictly with valid JSON.";
      const userPrompt = `Analyze this business and return clean JSON strictly matching this schema:
Business: "${input.businessName}"
Niche: "${input.niche}"
Location: "${input.city}, ${input.state || ""}, ${input.country}"
Location Strategy: "${strategy}"

JSON Schema:
{
  "services": ["Service 1", "Service 2", "Service 3", "Service 4", "Service 5"],
  "locations": ["Location 1", "Location 2", "Location 3", "Location 4"],
  "blogTitles": [
    {"title": "Title 1", "intent": "informational"},
    {"title": "Title 2", "intent": "commercial"},
    {"title": "Title 3", "intent": "transactional"}
  ],
  "keywordClusters": [
    {
      "pageType": "homepage",
      "pageName": "Homepage",
      "pageSlug": "/",
      "primaryKeyword": "...",
      "secondaryKeywords": ["...", "..."],
      "longTailKeywords": ["...", "..."],
      "faqKeywords": ["...", "..."],
      "intent": "Local Transactional"
    }
  ]
}`;

      try {
        const result = await adapter.completeJsonPrompt({
          apiKey: decryptedKey,
          modelId: providerRow.selected_model,
          systemPrompt,
          userPrompt,
          baseUrl: providerRow.base_url,
        });

        const latencyMs = Date.now() - startTime;

        // Log successful token usage
        await repo.logUsage({
          user_id: userId || null,
          website_id: null,
          provider_type: providerRow.provider_type,
          model: providerRow.selected_model,
          operation_type: "business_analysis",
          status: "success",
          prompt_tokens: result.promptTokens,
          completion_tokens: result.completionTokens,
          total_tokens: result.totalTokens,
          latency_ms: latencyMs,
          error_message: null,
        });

        if (result.rawText) {
          const parsed = JSON.parse(result.rawText);
          return {
            services: (parsed.services || []).map((s: string, idx: number) => ({
              id: `srv_${idx + 1}`,
              name: s,
              isAiSuggested: true,
            })),
            locations: (parsed.locations || []).map((l: string, idx: number) => ({
              id: `loc_${idx + 1}`,
              name: l,
              strategy,
              isAiSuggested: true,
            })),
            blogTitles: (parsed.blogTitles || []).map((b: { title?: string; intent?: "informational" | "commercial" | "transactional" } | string, idx: number) => ({
              id: `blog_${idx + 1}`,
              title: typeof b === "string" ? b : b.title || `Blog Title ${idx + 1}`,
              intent: typeof b === "string" ? "informational" : b.intent || "informational",
            })),
            keywordClusters: parsed.keywordClusters || [],
            providerUsed: providerRow.provider_name,
            modelUsed: providerRow.selected_model,
          };
        }
      } catch (provErr) {
        // Log failure
        await repo.logUsage({
          user_id: userId || null,
          website_id: null,
          provider_type: providerRow.provider_type,
          model: providerRow.selected_model,
          operation_type: "business_analysis",
          status: "failed",
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          latency_ms: Date.now() - startTime,
          error_message: provErr instanceof Error ? provErr.message : "Provider call failed",
        });
        console.warn("Configured AI Provider failed, falling back to deterministic heuristic analysis:", provErr);
      }
    }
  } catch (err) {
    console.warn("AI Provider resolution error, falling back:", err);
  }

  // Graceful deterministic offline fallback
  return generateHeuristicAnalysis(input, strategy);
}
