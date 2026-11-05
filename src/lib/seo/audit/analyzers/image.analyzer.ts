import { ParsedHTMLData } from "../html-parser";
import { CrawlResponse, AuditIssueDraft } from "../types";

export function analyzeImageSEO(
  crawl: CrawlResponse,
  parsed: ParsedHTMLData,
  websiteId: string
): AuditIssueDraft[] {
  const issues: AuditIssueDraft[] = [];

  const imagesMissingAlt = parsed.images.filter((img) => !img.hasAlt || img.alt === null);
  const imagesEmptyAlt = parsed.images.filter((img) => img.hasAlt && img.alt === "");
  const imagesMissingDimensions = parsed.images.filter((img) => !img.width || !img.height);

  // 1. Missing Alt Tags
  if (imagesMissingAlt.length > 0) {
    issues.push({
      issueCode: "IMAGES_MISSING_ALT",
      category: "images",
      severity: "error",
      affectedUrl: crawl.url,
      title: `${imagesMissingAlt.length} image${imagesMissingAlt.length > 1 ? "s" : ""} missing alt text attribute`,
      finding: `Found ${imagesMissingAlt.length} images without an alt attribute on this page.`,
      evidence: {
        count: imagesMissingAlt.length,
        samples: imagesMissingAlt.slice(0, 3).map((img) => img.src),
      },
      explanation: "Alt text is vital for accessibility, screen readers, and image search rankings in Google Images.",
      recommendedFix: "Add descriptive, contextual alt attributes describing each image in the visual editor or media library.",
      editorRoute: `/websites/${websiteId}/media`,
    });
  }

  // 2. Empty Alt Tags (when not decorative)
  if (imagesEmptyAlt.length > 3) {
    issues.push({
      issueCode: "MULTIPLE_EMPTY_ALT_TAGS",
      category: "images",
      severity: "notice",
      affectedUrl: crawl.url,
      title: `${imagesEmptyAlt.length} images have empty alt text (alt="")`,
      finding: `Found ${imagesEmptyAlt.length} images with blank alt attributes.`,
      evidence: { count: imagesEmptyAlt.length },
      explanation: "Empty alt='' marks images as purely decorative. Ensure meaningful content images have descriptive text.",
      recommendedFix: "Review these images to verify if any contain substantive diagrams, products, or service photos.",
      editorRoute: `/websites/${websiteId}/media`,
    });
  }

  // 3. Missing Dimensions (CLS risk)
  if (imagesMissingDimensions.length > 0) {
    issues.push({
      issueCode: "IMAGES_MISSING_DIMENSIONS",
      category: "images",
      severity: "warning",
      affectedUrl: crawl.url,
      title: `${imagesMissingDimensions.length} image${imagesMissingDimensions.length > 1 ? "s" : ""} missing width or height attributes`,
      finding: `Images without explicit width/height can cause Cumulative Layout Shift (CLS) during page loading.`,
      evidence: { count: imagesMissingDimensions.length },
      explanation: "Specifying width and height allows the browser to reserve space before image downloading finishes, eliminating layout shifts.",
      recommendedFix: "Use responsive image components with predefined aspect ratios and explicit dimension tags.",
      editorRoute: `/websites/${websiteId}/pages`,
    });
  }

  return issues;
}

