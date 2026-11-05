import { describe, it, expect, vi } from "vitest";
import {
  generateHeuristicAnalysis,
  runBusinessAnalysis,
} from "@/lib/ai/business-analysis-adapter";

describe("Business Analysis & SEO Keyword Research Workflow", () => {
  const sampleInput = {
    projectName: "Austin Pro Roofing",
    language: "English",
    businessName: "Austin Pro Roofing LLC",
    niche: "Roofing Contractor",
    country: "United States",
    city: "Austin",
    state: "Texas",
    phone: "(512) 555-0144",
    email: "contact@austinproroofing.com",
    address: "1024 Main St, Austin, TX",
    secondaryKeyword: "roof leak repair Austin",
  };

  it("generates deterministic heuristic analysis when offline / no API key is provided", () => {
    const analysis = generateHeuristicAnalysis(sampleInput, "neighborhoods");

    expect(analysis).toBeDefined();
    expect(analysis.providerUsed).toBe("heuristic_offline");
    expect(analysis.services.length).toBeGreaterThanOrEqual(4);
    expect(analysis.locations.length).toBeGreaterThanOrEqual(3);
    expect(analysis.blogTitles.length).toBeGreaterThanOrEqual(3);
    expect(analysis.keywordClusters.length).toBeGreaterThanOrEqual(4);

    // Verify service naming reflects niche
    expect(analysis.services.some((s) => s.name.includes("Roofing"))).toBe(true);

    // Verify location strategy
    expect(analysis.locations.every((l) => l.strategy === "neighborhoods")).toBe(true);

    // Verify keyword cluster structure
    const homeCluster = analysis.keywordClusters.find((c) => c.pageType === "homepage");
    expect(homeCluster).toBeDefined();
    expect(homeCluster?.primaryKeyword).toContain("Roofing Contractor");
    expect(homeCluster?.secondaryKeywords.length).toBeGreaterThan(0);
    expect(homeCluster?.faqKeywords.length).toBeGreaterThan(0);
  });

  it("handles alternative location strategies (nearby cities)", () => {
    const analysis = generateHeuristicAnalysis(sampleInput, "nearby_cities");
    expect(analysis.locations.every((l) => l.strategy === "nearby_cities")).toBe(true);
  });

  it("runBusinessAnalysis gracefully falls back to heuristic generation without throwing", async () => {
    const result = await runBusinessAnalysis(sampleInput, "custom_areas");
    expect(result).toBeDefined();
    expect(result.services.length).toBeGreaterThan(0);
    expect(result.keywordClusters.length).toBeGreaterThan(0);
  });
});

