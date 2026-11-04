import { ThemeConfig } from "@/types/builder";
import { validateThemeConfig } from "@/themes/schemas/theme.schema";
import { generateEntityId } from "@/lib/utils/id";
import { sanitizeSubdomain } from "@/lib/utils/url";
import { NotFoundError, ValidationError, ConflictError } from "@/server/errors";

export interface WebsiteRecord {
  id: string;
  organization_id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  theme_config: ThemeConfig;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export class WebsiteRepository {
  private websites = new Map<string, WebsiteRecord>();

  public async createWebsite(
    organizationId: string,
    name: string,
    rawSubdomain: string,
    themeConfig: ThemeConfig
  ): Promise<WebsiteRecord> {
    const themeValidation = validateThemeConfig(themeConfig);
    if (!themeValidation.success) {
      throw new ValidationError(`Invalid theme configuration: ${themeValidation.error}`);
    }

    const cleanSubdomain = sanitizeSubdomain(rawSubdomain);
    if (!cleanSubdomain) {
      throw new ValidationError("Subdomain cannot be empty");
    }

    // Check unique subdomain
    const existing = await this.getWebsiteBySubdomain(cleanSubdomain);
    if (existing) {
      throw new ConflictError(`Subdomain "${cleanSubdomain}" is already taken`);
    }

    const websiteId = generateEntityId("site");
    const now = new Date().toISOString();

    const record: WebsiteRecord = {
      id: websiteId,
      organization_id: organizationId,
      name,
      subdomain: cleanSubdomain,
      custom_domain: null,
      theme_config: themeValidation.data as ThemeConfig,
      status: "draft",
      created_at: now,
      updated_at: now,
    };

    this.websites.set(websiteId, record);
    return record;
  }

  public async getWebsite(websiteId: string): Promise<WebsiteRecord | null> {
    return this.websites.get(websiteId) ?? null;
  }

  public async getWebsiteBySubdomain(subdomain: string): Promise<WebsiteRecord | null> {
    const target = subdomain.toLowerCase().trim();
    let found: WebsiteRecord | null = null;
    this.websites.forEach((site) => {
      if (!found && site.subdomain.toLowerCase() === target) {
        found = site;
      }
    });
    return found;
  }

  public async getWebsiteByCustomDomain(domain: string): Promise<WebsiteRecord | null> {
    const target = domain.toLowerCase().trim();
    let found: WebsiteRecord | null = null;
    this.websites.forEach((site) => {
      if (!found && site.custom_domain?.toLowerCase() === target) {
        found = site;
      }
    });
    return found;
  }

  public async updateTheme(websiteId: string, theme: ThemeConfig): Promise<WebsiteRecord> {
    const site = this.websites.get(websiteId);
    if (!site) {
      throw new NotFoundError("Website", websiteId);
    }

    const validation = validateThemeConfig(theme);
    if (!validation.success) {
      throw new ValidationError(`Invalid theme: ${validation.error}`);
    }

    site.theme_config = validation.data as ThemeConfig;
    site.updated_at = new Date().toISOString();
    this.websites.set(websiteId, site);
    return site;
  }

  public async updateStatus(
    websiteId: string,
    status: "draft" | "published" | "archived"
  ): Promise<WebsiteRecord> {
    const site = this.websites.get(websiteId);
    if (!site) {
      throw new NotFoundError("Website", websiteId);
    }

    site.status = status;
    site.updated_at = new Date().toISOString();
    this.websites.set(websiteId, site);
    return site;
  }

  public async setCustomDomain(websiteId: string, domain: string | null): Promise<WebsiteRecord> {
    const site = this.websites.get(websiteId);
    if (!site) {
      throw new NotFoundError("Website", websiteId);
    }

    if (domain) {
      const cleanDomain = domain.toLowerCase().trim();
      const existing = await this.getWebsiteByCustomDomain(cleanDomain);
      if (existing && existing.id !== websiteId) {
        throw new ConflictError(`Custom domain "${cleanDomain}" is already in use`);
      }
      site.custom_domain = cleanDomain;
    } else {
      site.custom_domain = null;
    }

    site.updated_at = new Date().toISOString();
    this.websites.set(websiteId, site);
    return site;
  }
}
