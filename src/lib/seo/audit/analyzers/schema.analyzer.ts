import { ParsedHTMLData } from "../html-parser";
import { CrawlResponse, AuditIssueDraft } from "../types";

export function analyzeSchemaSEO(
  crawl: CrawlResponse,
  parsed: ParsedHTMLData,
  websiteId: string
): AuditIssueDraft[] {
  const issues: AuditIssueDraft[] = [];

  // 1. Check if structured data exists
  if (parsed.jsonLdSchemas.length === 0) {
    issues.push({
      issueCode: "MISSING_STRUCTURED_DATA",
      category: "structured_data",
      severity: "notice",
      affectedUrl: crawl.url,
      title: "No JSON-LD structured data detected",
      finding: "Page does not contain any Schema.org structured data blocks.",
      evidence: { schemaCount: 0 },
      explanation: "Structured data enables Google Rich Results, knowledge panels, and enhanced mobile search cards.",
      recommendedFix: "Enable LocalBusiness, Organization, or Article schema in your website SEO settings.",
      editorRoute: `/websites/${websiteId}/seo`,
    });
    return issues;
  }

  // 2. Validate extracted schemas
  for (const schema of parsed.jsonLdSchemas) {
    const rawType = schema["@type"];
    const schemaType = typeof rawType === "string" ? rawType : Array.isArray(rawType) ? rawType.join(", ") : "Unknown";

    // Required fields check for common business types
    if (schemaType.includes("Organization") || schemaType.includes("LocalBusiness")) {
      if (!schema.name) {
        issues.push({
          issueCode: "SCHEMA_MISSING_REQUIRED_NAME",
          category: "structured_data",
          severity: "warning",
          affectedUrl: crawl.url,
          title: `Schema ${schemaType} is missing 'name' property`,
          finding: `Structured data block of type "${schemaType}" has no business name defined.`,
          evidence: { schemaType, schema },
          explanation: "Google requires a valid 'name' attribute to recognize organization or local business entities.",
          recommendedFix: "Fill in the business/company name in your global business profile.",
          editorRoute: `/websites/${websiteId}/settings`,
        });
      }
    }

    if (schemaType.includes("Article") || schemaType.includes("BlogPosting")) {
      if (!schema.headline) {
        issues.push({
          issueCode: "SCHEMA_MISSING_HEADLINE",
          category: "structured_data",
          severity: "warning",
          affectedUrl: crawl.url,
          title: "Article schema missing 'headline' property",
          finding: "Article structured data block does not define a headline.",
          evidence: { schemaType, schema },
          explanation: "Article rich snippets require a headline to qualify for Google News and search cards.",
          recommendedFix: "Ensure blog articles have an explicit title/headline populated.",
          editorRoute: `/websites/${websiteId}/blog`,
        });
      }
    }
  }

  return issues;
}

