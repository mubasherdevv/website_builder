import { describe, it, expect } from "vitest";
import { validateCrawlUrl } from "@/lib/seo/audit/ssrf-guard";
import { parseHTML } from "@/lib/seo/audit/html-parser";
import { analyzeTechnicalSEO } from "@/lib/seo/audit/analyzers/technical.analyzer";
import { analyzeOnPageSEO } from "@/lib/seo/audit/analyzers/onpage.analyzer";
import { analyzeContentSEO } from "@/lib/seo/audit/analyzers/content.analyzer";
import { analyzeImageSEO } from "@/lib/seo/audit/analyzers/image.analyzer";
import { calculateAuditScores } from "@/lib/seo/audit/scoring";
import { CrawlResponse } from "@/lib/seo/audit/types";

describe("SEO Audit Engine — Security & SSRF Guard", () => {
  it("blocks localhost, loopback and private subnets", () => {
    expect(validateCrawlUrl("http://localhost:3000", ["example.com"]).allowed).toBe(false);
    expect(validateCrawlUrl("http://127.0.0.1/admin", ["example.com"]).allowed).toBe(false);
    expect(validateCrawlUrl("http://10.0.0.1/secret", ["example.com"]).allowed).toBe(false);
    expect(validateCrawlUrl("http://192.168.1.1/router", ["example.com"]).allowed).toBe(false);
    expect(validateCrawlUrl("http://169.254.169.254/latest/meta-data", ["example.com"]).allowed).toBe(false);
  });

  it("blocks non-http protocols and private dashboard paths", () => {
    expect(validateCrawlUrl("file:///etc/passwd", ["example.com"]).allowed).toBe(false);
    expect(validateCrawlUrl("ftp://example.com/file", ["example.com"]).allowed).toBe(false);
    expect(validateCrawlUrl("https://example.com/dashboard", ["example.com"]).allowed).toBe(false);
    expect(validateCrawlUrl("https://example.com/admin/settings", ["example.com"]).allowed).toBe(false);
    expect(validateCrawlUrl("https://example.com/api/private", ["example.com"]).allowed).toBe(false);
  });

  it("allows valid primary domain and alias public URLs", () => {
    const res = validateCrawlUrl("https://example.com/services/roof-repair", ["example.com", "www.example.com"]);
    expect(res.allowed).toBe(true);
    expect(res.normalizedUrl).toBe("https://example.com/services/roof-repair");
  });
});

describe("SEO Audit Engine — HTML Parser", () => {
  const sampleHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Best Austin Roofing Contractor | Top Rated Roof Repair</title>
      <meta name="description" content="Looking for trusted roof replacement in Austin TX? We provide licensed estimates and reliable roof repairs." />
      <link rel="canonical" href="https://example.com/services/roof-repair" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Austin Pro Roofing",
          "telephone": "512-555-0199"
        }
      </script>
    </head>
    <body>
      <h1>Austin Premier Roof Services</h1>
      <h2>Residential Shingle Replacement</h2>
      <p>Here is a detailed guide on roof replacement. We offer commercial and residential services with warranty.</p>
      <img src="/roof.jpg" alt="Commercial metal roof installation" width="800" height="600" />
      <img src="/banner.png" alt="" />
      <a href="/contact">Get Free Quote</a>
      <a href="https://external.com">Partner Site</a>
    </body>
    </html>
  `;

  it("extracts metadata, headings, schema and links correctly", () => {
    const parsed = parseHTML(sampleHTML, "https://example.com/services/roof-repair");

    expect(parsed.title).toBe("Best Austin Roofing Contractor | Top Rated Roof Repair");
    expect(parsed.metaDescription).toContain("Looking for trusted roof replacement");
    expect(parsed.canonicalUrl).toBe("https://example.com/services/roof-repair");
    expect(parsed.htmlLang).toBe("en");
    expect(parsed.viewportMeta).toBe("width=device-width, initial-scale=1.0");
    expect(parsed.h1List).toEqual(["Austin Premier Roof Services"]);
    expect(parsed.h2List).toEqual(["Residential Shingle Replacement"]);
    expect(parsed.images).toHaveLength(2);
    expect(parsed.images[0].alt).toBe("Commercial metal roof installation");
    expect(parsed.images[1].alt).toBe("");
    expect(parsed.links.length).toBeGreaterThanOrEqual(1);
    expect(parsed.jsonLdSchemas).toHaveLength(1);
    expect(parsed.jsonLdSchemas[0]["@type"]).toBe("LocalBusiness");
  });
});

describe("SEO Audit Engine — Analyzers & Scoring", () => {
  const fakeCrawl = (status = 200, url = "https://example.com/services/roof-repair"): CrawlResponse => ({
    url,
    path: "/services/roof-repair",
    httpStatus: status,
    loadTimeMs: 150,
    contentType: "text/html",
    headers: {},
    html: "",
  });

  it("detects technical issues on 404 response", () => {
    const parsed = parseHTML("<html><head></head><body>Not found</body></html>", "https://example.com/missing");
    const crawl = fakeCrawl(404, "https://example.com/missing");
    const issues = analyzeTechnicalSEO(crawl, parsed, "web_123");

    expect(issues.some((i) => i.issueCode === "HTTP_CLIENT_ERROR")).toBe(true);
  });

  it("detects missing H1 and short title on page", () => {
    const parsed = parseHTML("<html><head><title>Hi</title></head><body>No heading</body></html>", "https://example.com");
    const crawl = fakeCrawl(200, "https://example.com");
    const issues = analyzeOnPageSEO(crawl, parsed, "web_123");

    expect(issues.some((i) => i.issueCode === "MISSING_H1_HEADING")).toBe(true);
    expect(issues.some((i) => i.issueCode === "TITLE_TOO_SHORT")).toBe(true);
  });

  it("detects thin content", () => {
    const parsed = parseHTML("<html><body>Short text</body></html>", "https://example.com/about");
    const crawl = fakeCrawl(200, "https://example.com/about");
    const issues = analyzeContentSEO(crawl, parsed, "web_123");

    expect(issues.some((i) => i.issueCode === "THIN_CONTENT")).toBe(true);
  });

  it("detects missing image alt tags", () => {
    const parsed = parseHTML('<html><body><img src="/photo.png" /></body></html>', "https://example.com/gallery");
    const crawl = fakeCrawl(200, "https://example.com/gallery");
    const issues = analyzeImageSEO(crawl, parsed, "web_123");

    expect(issues.some((i) => i.issueCode === "IMAGES_MISSING_ALT")).toBe(true);
  });

  it("calculates accurate weighted category and health scores", () => {
    const scores = calculateAuditScores([], 5);
    expect(scores.technicalScore).toBe(100);
    expect(scores.onpageScore).toBe(100);
    expect(scores.overallScore).toBe(100);
    expect(scores.errorCount).toBe(0);
    expect(scores.warningCount).toBe(0);
  });
});
