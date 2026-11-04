import { CMSPageItem, MenuItem, PageType, SEOHealthStatus } from "@/types/cms";
import { PageDocument, SectionNode } from "@/types/builder";
import { generateEntityId } from "@/lib/utils/id";
import { PAGE_TEMPLATES } from "@/builder/templates/page-templates";
import { NavigationManagerService } from "./navigation-manager.service";

const STORAGE_PREFIX = "website_";

export function computeSEOHealth(
  titleOrSEO?: string | { title?: string; description?: string; focusKeyword?: string },
  description?: string,
  focusKeyword?: string
): SEOHealthStatus {
  let t = "";
  let d = "";
  let kw = "";
  if (typeof titleOrSEO === "object" && titleOrSEO !== null) {
    t = titleOrSEO.title || "";
    d = titleOrSEO.description || "";
    kw = titleOrSEO.focusKeyword || "";
  } else {
    t = titleOrSEO || "";
    d = description || "";
    kw = focusKeyword || "";
  }

  if (!t || !d) return "missing";
  const tLen = t.trim().length;
  const dLen = d.trim().length;

  if (tLen >= 20 && tLen <= 70 && dLen >= 30 && dLen <= 170) {
    if (kw && (!t.toLowerCase().includes(kw.toLowerCase()) || !d.toLowerCase().includes(kw.toLowerCase()))) {
      return "warning";
    }
    return "good";
  }
  return "warning";
}

export function sanitizeSlug(input: string): string {
  let s = (input || "").trim().toLowerCase();
  if (!s || s === "/") return "/";
  s = s.replace(/[^a-z0-9/_-]+/g, "-").replace(/-+/g, "-");
  s = s.replace(/\/+/g, "/").replace(/-+$/, "");
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s || "/";
}

export function getInitialDefaultPages(websiteId: string): CMSPageItem[] {
  const homeDoc = PAGE_TEMPLATES.home.createDocument("Austin Pro Roofing", "Home", "/");
  const servicesDoc = PAGE_TEMPLATES.services.createDocument("Austin Pro Roofing", "Services", "/services");
  const aboutDoc = PAGE_TEMPLATES.about.createDocument("Austin Pro Roofing", "About Us", "/about");
  const contactDoc = PAGE_TEMPLATES.contact.createDocument("Austin Pro Roofing", "Contact", "/contact");

  return [
    {
      id: "page_home",
      websiteId,
      title: "Home",
      slug: "/",
      pageType: "home",
      description: "Main homepage highlighting core services, reputation, and quote request.",
      status: "published",
      updatedAt: "2 hours ago",
      createdAt: "3 days ago",
      isHome: true,
      inNavigation: true,
      navLabel: "Home",
      seo: {
        title: "Austin Pro Roofing | Top-Rated Central Texas Roofers",
        description: "Dependable residential and commercial roofing services in Austin, TX. 24/7 emergency leak repair and lifetime warranty installations.",
        canonicalUrl: "https://austin-roofing.example.com",
        noIndex: false,
        focusKeyword: "roofing",
        ogTitle: "Austin Pro Roofing - High Quality Roof Installations",
        ogDescription: "Dependable residential and commercial roofing in Austin, TX.",
      },
      seoStatus: "good",
      document: homeDoc,
    },
    {
      id: "page_services",
      websiteId,
      title: "Services & Pricing",
      slug: "/services",
      pageType: "services",
      description: "Full service catalogue including repair, inspection, and replacement.",
      status: "published",
      updatedAt: "1 day ago",
      createdAt: "3 days ago",
      inNavigation: true,
      navLabel: "Services",
      seo: {
        title: "Roofing & Exterior Services | Austin Pro Roofing",
        description: "Explore our complete range of roofing repair, replacement, and regular inspection plans.",
        focusKeyword: "services",
        noIndex: false,
      },
      seoStatus: "good",
      document: servicesDoc,
    },
    {
      id: "page_about",
      websiteId,
      title: "About Our Company",
      slug: "/about",
      pageType: "about",
      description: "Our company story, values, and licensed crew credentials.",
      status: "draft",
      updatedAt: "3 days ago",
      createdAt: "3 days ago",
      inNavigation: true,
      navLabel: "About",
      seo: {
        title: "About Austin Pro Roofing",
        description: "Over 15 years of industry leadership in Central Texas.",
        noIndex: false,
      },
      seoStatus: "warning",
      document: aboutDoc,
    },
    {
      id: "page_contact",
      websiteId,
      title: "Contact & Free Quote",
      slug: "/contact",
      pageType: "contact",
      description: "Direct phone, dispatch map, and online quote request form.",
      status: "published",
      updatedAt: "Just now",
      createdAt: "3 days ago",
      inNavigation: true,
      navLabel: "Contact",
      seo: {
        title: "Contact Austin Pro Roofing | Request a Free Estimate",
        description: "Call our on-duty team at (512) 555-0199 or fill out our instant online quote form.",
        focusKeyword: "contact",
        noIndex: false,
      },
      seoStatus: "good",
      document: contactDoc,
    },
  ];
}

export class PagesManagerService {
  private static getStorageKey(websiteId: string): string {
    return `${STORAGE_PREFIX}${websiteId}_pages`;
  }

  private static getNavKey(websiteId: string): string {
    return `${STORAGE_PREFIX}${websiteId}_navigation`;
  }

  public static getPageDocument(websiteId: string, pageId: string): PageDocument | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`website_${websiteId}_page_${pageId}_doc`);
      if (raw) return JSON.parse(raw);
    } catch {}
    const page = this.getPageById(websiteId, pageId);
    return page?.document || null;
  }

  public static savePageDocument(websiteId: string, pageId: string, doc: PageDocument): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`website_${websiteId}_page_${pageId}_doc`, JSON.stringify(doc));

      // If document contains a header, automatically synchronize global header for the site
      const headerSection = doc.sections?.find((s) => s.componentId.startsWith("header."));
      if (headerSection) {
        localStorage.setItem(`website_${websiteId}_global_header`, JSON.stringify(headerSection));
      }
    } catch {}
  }

  public static getGlobalHeader(websiteId: string): SectionNode | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`website_${websiteId}_global_header`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  public static syncGlobalHeader(websiteId: string, headerSection: SectionNode): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`website_${websiteId}_global_header`, JSON.stringify(headerSection));

      const pages = this.getPages(websiteId);
      pages.forEach((p) => {
        const doc = this.getPageDocument(websiteId, p.id);
        if (doc && doc.sections) {
          const headerIdx = doc.sections.findIndex((s) => s.componentId.startsWith("header."));
          if (headerIdx !== -1) {
            doc.sections[headerIdx] = {
              ...doc.sections[headerIdx],
              componentId: headerSection.componentId,
              componentVersion: headerSection.componentVersion,
              props: {
                ...doc.sections[headerIdx].props,
                ...headerSection.props,
              },
              style: headerSection.style || doc.sections[headerIdx].style,
            };
            this.savePageDocument(websiteId, p.id, doc);
          }
        }
      });

      window.dispatchEvent(new CustomEvent("securesite-global-header-updated", { detail: headerSection }));
    } catch (e) {
      console.error("Failed to sync global header", e);
    }
  }

  public static getPages(websiteId: string): CMSPageItem[] {
    if (typeof window === "undefined") {
      return getInitialDefaultPages(websiteId);
    }

    try {
      const raw = localStorage.getItem(this.getStorageKey(websiteId));
      if (!raw) {
        const defaults = getInitialDefaultPages(websiteId);
        this.savePages(websiteId, defaults);
        this.syncNavigationFromPages(websiteId, defaults);
        return defaults;
      }
      return JSON.parse(raw) as CMSPageItem[];
    } catch {
      return getInitialDefaultPages(websiteId);
    }
  }

  public static savePages(websiteId: string, pages: CMSPageItem[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.getStorageKey(websiteId), JSON.stringify(pages));
    } catch (e) {
      console.error("Failed to save pages to localStorage", e);
    }
  }

  public static getPageById(websiteId: string, pageId: string): CMSPageItem | null {
    const pages = this.getPages(websiteId);
    return pages.find((p) => p.id === pageId) || null;
  }

  public static createPage(
    websiteId: string,
    payload: {
      title: string;
      slug: string;
      pageType?: PageType;
      templateId?: PageType;
      description?: string;
      status?: "draft" | "published";
      inNavigation?: boolean;
      navLabel?: string;
      navMenuId?: string;
      navParentId?: string | null;
      seo?: {
        title?: string;
        description?: string;
        canonicalUrl?: string;
        noIndex?: boolean;
        ogTitle?: string;
        ogDescription?: string;
        ogImage?: string;
        focusKeyword?: string;
      };
    }
  ): { success: boolean; page?: CMSPageItem; error?: string } {
    const pages = this.getPages(websiteId);
    const cleanSlug = sanitizeSlug(payload.slug);

    // Validate slug uniqueness within website (PRD Section 10.1)
    const slugExists = pages.some(
      (p) => p.slug.toLowerCase() === cleanSlug.toLowerCase()
    );
    if (slugExists) {
      return {
        success: false,
        error: `The URL slug "${cleanSlug}" is already in use by another page on this website.`,
      };
    }

    const type = payload.pageType || "custom";
    const tmpl = PAGE_TEMPLATES[type] || PAGE_TEMPLATES.custom;
    const pageId = generateEntityId("page");
    const doc = tmpl.createDocument("My Website", payload.title, cleanSlug);

    const seoTitle = payload.seo?.title || `${payload.title} | My Website`;
    const seoDesc = payload.seo?.description || payload.description || `Discover more about ${payload.title}.`;

    const newPage: CMSPageItem = {
      id: pageId,
      websiteId,
      title: payload.title,
      slug: cleanSlug,
      pageType: type,
      description: payload.description || tmpl.description,
      status: payload.status || "draft",
      updatedAt: "Just now",
      createdAt: "Just now",
      isHome: cleanSlug === "/",
      inNavigation: payload.inNavigation ?? true,
      navLabel: payload.navLabel || payload.title,
      seo: {
        title: seoTitle,
        description: seoDesc,
        canonicalUrl: payload.seo?.canonicalUrl || "",
        noIndex: payload.seo?.noIndex || false,
        ogTitle: payload.seo?.ogTitle || seoTitle,
        ogDescription: payload.seo?.ogDescription || seoDesc,
        ogImage: payload.seo?.ogImage || "",
        focusKeyword: payload.seo?.focusKeyword || "",
      },
      seoStatus: computeSEOHealth(seoTitle, seoDesc, payload.seo?.focusKeyword),
      document: doc,
    };

    const updated = [newPage, ...pages];
    this.savePages(websiteId, updated);

    // Persist document for visual editor
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`website_${websiteId}_page_${pageId}_doc`, JSON.stringify(doc));
      } catch {}
    }

    // Sync to navigation if requested
    if (newPage.inNavigation) {
      this.addPageToNavigation(websiteId, newPage);
      NavigationManagerService.addPageToMenu(websiteId, payload.navMenuId, newPage.id, {
        label: payload.navLabel || payload.title,
        parentId: payload.navParentId,
      });
    }

    return { success: true, page: newPage };
  }

  public static duplicatePage(websiteId: string, pageId: string): { success: boolean; page?: CMSPageItem; error?: string } {
    const pages = this.getPages(websiteId);
    const source = pages.find((p) => p.id === pageId);
    if (!source) {
      return { success: false, error: "Source page not found." };
    }

    // Generate unique slug
    let candidateSlug = source.slug === "/" ? "/home-copy" : `${source.slug}-copy`;
    let counter = 1;
    while (pages.some((p) => p.slug.toLowerCase() === candidateSlug.toLowerCase())) {
      counter++;
      candidateSlug = `${source.slug}-copy-${counter}`;
    }

    const newId = generateEntityId("page");
    const clonedDoc: PageDocument = source.document
      ? JSON.parse(JSON.stringify(source.document))
      : PAGE_TEMPLATES[source.pageType || "custom"].createDocument("My Website", `${source.title} (Copy)`, candidateSlug);

    clonedDoc.page = {
      ...clonedDoc.page,
      id: newId,
      title: `${source.title} (Copy)`,
      slug: candidateSlug,
      status: "draft",
    };

    const newPage: CMSPageItem = {
      ...source,
      id: newId,
      title: `${source.title} (Copy)`,
      slug: candidateSlug,
      status: "draft",
      isHome: false,
      updatedAt: "Just now",
      createdAt: "Just now",
      document: clonedDoc,
    };

    const updated = [newPage, ...pages];
    this.savePages(websiteId, updated);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`website_${websiteId}_page_${newId}_doc`, JSON.stringify(clonedDoc));
      } catch {}
    }

    return { success: true, page: newPage };
  }

  public static updatePage(
    websiteId: string,
    pageId: string,
    updates: Partial<CMSPageItem>
  ): { success: boolean; page?: CMSPageItem; error?: string } {
    const pages = this.getPages(websiteId);
    const idx = pages.findIndex((p) => p.id === pageId);
    if (idx === -1) {
      return { success: false, error: "Page not found." };
    }

    const existing = pages[idx];

    // Slug check if changed
    if (updates.slug && updates.slug !== existing.slug) {
      const clean = sanitizeSlug(updates.slug);
      const conflict = pages.some(
        (p) => p.id !== pageId && p.slug.toLowerCase() === clean.toLowerCase()
      );
      if (conflict) {
        return { success: false, error: `The URL slug "${clean}" is already taken.` };
      }
      updates.slug = clean;
    }

    // Auto-sync navLabel if it was previously identical to title
    if (updates.title && (!existing.navLabel || existing.navLabel === existing.title) && !updates.navLabel) {
      updates.navLabel = updates.title;
    }

    const updatedPage: CMSPageItem = {
      ...existing,
      ...updates,
      updatedAt: "Just now",
    };

    if (updates.seo || updates.title || updates.description) {
      const title = updates.seo?.title || updatedPage.seo?.title || updatedPage.title;
      const desc = updates.seo?.description || updatedPage.seo?.description || updatedPage.description;
      const kw = updates.seo?.focusKeyword || updatedPage.seo?.focusKeyword;
      updatedPage.seoStatus = computeSEOHealth(title, desc, kw);
    }

    pages[idx] = updatedPage;
    this.savePages(websiteId, pages);

    // Sync navigation label if updated
    if (updates.navLabel || updates.inNavigation !== undefined) {
      this.syncNavigationFromPages(websiteId, pages);
    }

    // Sync to Navigation Manager menus
    NavigationManagerService.handlePageUpdated(websiteId, pageId, {
      slug: updatedPage.slug,
      title: updatedPage.title,
      navLabel: updatedPage.navLabel,
      status: updatedPage.status,
    });

    return { success: true, page: updatedPage };
  }

  public static deletePage(websiteId: string, pageId: string): { success: boolean; error?: string } {
    const pages = this.getPages(websiteId);
    const target = pages.find((p) => p.id === pageId);
    if (!target) {
      return { success: false, error: "Page not found." };
    }

    if (target.isHome || target.slug === "/") {
      return { success: false, error: "The designated Home page cannot be deleted." };
    }

    const filtered = pages.filter((p) => p.id !== pageId);
    this.savePages(websiteId, filtered);

    // Remove from navigation
    this.removePageFromNavigation(websiteId, pageId);
    NavigationManagerService.handlePageDeleted(websiteId, pageId);

    // Clean up document key
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`website_${websiteId}_page_${pageId}_doc`);
      } catch {}
    }

    return { success: true };
  }

  public static togglePublish(websiteId: string, pageId: string): { success: boolean; status?: string; error?: string } {
    const pages = this.getPages(websiteId);
    const page = pages.find((p) => p.id === pageId);
    if (!page) {
      return { success: false, error: "Page not found." };
    }

    const newStatus = page.status === "published" ? "draft" : "published";
    page.status = newStatus;
    page.updatedAt = "Just now";
    this.savePages(websiteId, pages);

    NavigationManagerService.handlePageUpdated(websiteId, pageId, {
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel,
      status: newStatus,
    });

    return { success: true, status: newStatus };
  }

  // Navigation integration methods
  public static getNavigation(websiteId: string): MenuItem[] {
    if (typeof window === "undefined") {
      return [
        { id: "m1", label: "Home", url: "/" },
        { id: "m2", label: "Services", url: "/services" },
        { id: "m3", label: "About", url: "/about" },
        { id: "m4", label: "Contact", url: "/contact" },
      ];
    }
    try {
      const raw = localStorage.getItem(this.getNavKey(websiteId));
      if (!raw) {
        const pages = this.getPages(websiteId);
        const nav = pages
          .filter((p) => p.inNavigation)
          .map((p) => ({
            id: `m_${p.id}`,
            label: p.navLabel || p.title,
            url: p.slug,
            pageId: p.id,
          }));
        this.saveNavigation(websiteId, nav);
        return nav;
      }
      return JSON.parse(raw) as MenuItem[];
    } catch {
      return [];
    }
  }

  public static saveNavigation(websiteId: string, items: MenuItem[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.getNavKey(websiteId), JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save navigation", e);
    }
  }

  public static addPageToNavigation(websiteId: string, page: CMSPageItem): void {
    const nav = this.getNavigation(websiteId);
    if (!nav.some((item) => item.pageId === page.id || item.url === page.slug)) {
      nav.push({
        id: `m_${page.id}`,
        label: page.navLabel || page.title,
        url: page.slug,
        pageId: page.id,
      });
      this.saveNavigation(websiteId, nav);
    }
  }

  public static removePageFromNavigation(websiteId: string, pageId: string): void {
    const nav = this.getNavigation(websiteId);
    const filtered = nav.filter((item) => item.pageId !== pageId);
    this.saveNavigation(websiteId, filtered);
  }

  public static togglePageInNavigation(websiteId: string, pageId: string): boolean {
    const pages = this.getPages(websiteId);
    const p = pages.find((item) => item.id === pageId);
    if (!p) return false;

    const nextState = !p.inNavigation;
    p.inNavigation = nextState;
    this.savePages(websiteId, pages);

    if (nextState) {
      this.addPageToNavigation(websiteId, p);
    } else {
      this.removePageFromNavigation(websiteId, pageId);
    }

    return nextState;
  }

  public static syncNavigationFromPages(websiteId: string, pages?: CMSPageItem[]): MenuItem[] {
    const pageList = pages || this.getPages(websiteId);
    const currentNav = this.getNavigation(websiteId);
    const pageNavMap = new Map<string, CMSPageItem>();
    pageList.forEach((p) => {
      if (p.inNavigation) pageNavMap.set(p.id, p);
    });

    const updatedNav: MenuItem[] = [];

    // Keep existing items if still in navigation, updating label/url
    currentNav.forEach((item) => {
      if (item.pageId && pageNavMap.has(item.pageId)) {
        const page = pageNavMap.get(item.pageId)!;
        updatedNav.push({
          ...item,
          label: page.navLabel || page.title,
          url: page.slug,
        });
        pageNavMap.delete(item.pageId);
      } else if (item.isExternal) {
        updatedNav.push(item);
      }
    });

    // Add remaining newly checked pages
    pageNavMap.forEach((page) => {
      updatedNav.push({
        id: `m_${page.id}`,
        label: page.navLabel || page.title,
        url: page.slug,
        pageId: page.id,
      });
    });

    this.saveNavigation(websiteId, updatedNav);
    return updatedNav;
  }
}

