export interface ExtractedImage {
  src: string;
  alt: string | null;
  hasAlt: boolean;
  width: string | null;
  height: string | null;
}

export interface ExtractedLink {
  href: string;
  text: string;
  isExternal: boolean;
  rel: string | null;
}

export interface ParsedHTMLData {
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  descriptionLength: number;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  htmlLang: string | null;
  viewportMeta: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  h1List: string[];
  h2List: string[];
  h3List: string[];
  images: ExtractedImage[];
  links: ExtractedLink[];
  jsonLdSchemas: Record<string, unknown>[];
  wordCount: number;
  textContent: string;
}

export function parseHTML(html: string, currentUrl: string): ParsedHTMLData {
  const currentHost = (() => {
    try {
      return new URL(currentUrl).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();

  // 1. Title Tag
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? cleanText(titleMatch[1]) : null;

  // 2. Meta Tags
  const metaDescription = extractMetaContent(html, "name", "description");
  const canonicalUrl = extractLinkHref(html, "canonical");
  const robotsMeta = extractMetaContent(html, "name", "robots");
  const viewportMeta = extractMetaContent(html, "name", "viewport");
  const ogTitle = extractMetaContent(html, "property", "og:title");
  const ogDescription = extractMetaContent(html, "property", "og:description");
  const ogImage = extractMetaContent(html, "property", "og:image");
  const twitterCard = extractMetaContent(html, "name", "twitter:card");

  // 3. HTML lang attribute
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const htmlLang = langMatch ? langMatch[1].trim() : null;

  // 4. Headings
  const h1List = extractHeadings(html, "h1");
  const h2List = extractHeadings(html, "h2");
  const h3List = extractHeadings(html, "h3");

  // 5. Images
  const images = extractImages(html);

  // 6. Links
  const links = extractLinks(html, currentUrl, currentHost);

  // 7. Structured Data (JSON-LD)
  const jsonLdSchemas = extractJsonLd(html);

  // 8. Body Text & Word Count
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const rawBody = bodyMatch ? bodyMatch[1] : html;
  // Strip scripts, styles, svg
  const stripped = rawBody
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<[^>]+>/g, " ");

  const textContent = cleanText(stripped);
  const words = textContent.split(/\s+/).filter((w) => w.length > 0);

  return {
    title,
    titleLength: title ? title.length : 0,
    metaDescription,
    descriptionLength: metaDescription ? metaDescription.length : 0,
    canonicalUrl,
    robotsMeta,
    htmlLang,
    viewportMeta,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    h1List,
    h2List,
    h3List,
    images,
    links,
    jsonLdSchemas,
    wordCount: words.length,
    textContent,
  };
}

function cleanText(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMetaContent(html: string, attrName: string, attrVal: string): string | null {
  const regex = new RegExp(`<meta[^>]*${attrName}=["']${attrVal}["'][^>]*content=["']([^"']*)["']`, "i");
  const regexReverse = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attrName}=["']${attrVal}["']`, "i");
  const match = html.match(regex) || html.match(regexReverse);
  return match ? cleanText(match[1]) : null;
}

function extractLinkHref(html: string, relVal: string): string | null {
  const regex = new RegExp(`<link[^>]*rel=["']${relVal}["'][^>]*href=["']([^"']*)["']`, "i");
  const regexReverse = new RegExp(`<link[^>]*href=["']([^"']*)["'][^>]*rel=["']${relVal}["']`, "i");
  const match = html.match(regex) || html.match(regexReverse);
  return match ? match[1].trim() : null;
}

function extractHeadings(html: string, tag: "h1" | "h2" | "h3"): string[] {
  const list: string[] = [];
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  let m;
  while ((m = regex.exec(html)) !== null) {
    const text = cleanText(m[1].replace(/<[^>]+>/g, ""));
    if (text) list.push(text);
  }
  return list;
}

function extractImages(html: string): ExtractedImage[] {
  const list: ExtractedImage[] = [];
  const imgRegex = /<img[^>]*>/gi;
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    const tag = m[0];
    const srcMatch = tag.match(/src=["']([^"']*)["']/i);
    if (!srcMatch) continue;

    const hasAlt = /alt=/i.test(tag);
    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    const widthMatch = tag.match(/width=["']([^"']*)["']/i);
    const heightMatch = tag.match(/height=["']([^"']*)["']/i);

    list.push({
      src: srcMatch[1],
      hasAlt,
      alt: altMatch ? altMatch[1].trim() : null,
      width: widthMatch ? widthMatch[1] : null,
      height: heightMatch ? heightMatch[1] : null,
    });
  }
  return list;
}

function extractLinks(html: string, currentUrl: string, currentHost: string): ExtractedLink[] {
  const list: ExtractedLink[] = [];
  const aRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = aRegex.exec(html)) !== null) {
    const rawHref = m[1].trim();
    const rawText = cleanText(m[2].replace(/<[^>]+>/g, ""));

    if (rawHref.startsWith("#") || rawHref.startsWith("javascript:") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
      continue;
    }

    try {
      const resolved = new URL(rawHref, currentUrl);
      const isExternal = resolved.hostname.toLowerCase() !== currentHost;

      list.push({
        href: resolved.toString(),
        text: rawText,
        isExternal,
        rel: null,
      });
    } catch {
      // Ignore invalid URLs
    }
  }
  return list;
}

function extractJsonLd(html: string): Record<string, unknown>[] {
  const list: Record<string, unknown>[] = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      if (Array.isArray(parsed)) {
        list.push(...parsed);
      } else if (typeof parsed === "object" && parsed !== null) {
        list.push(parsed);
      }
    } catch {
      // JSON parse error
    }
  }
  return list;
}

