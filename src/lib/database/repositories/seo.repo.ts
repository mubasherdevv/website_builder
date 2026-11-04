import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "@/types/database";
import { SEOTechnicalSettings, SEORedirect, SEOSchemaConfig } from "@/types/seo";
import { handleDatabaseError } from "@/lib/database/errors";

export type WebsiteSeoRow = Database["public"]["Tables"]["website_seo"]["Row"];

export interface FullWebsiteSEO {
  websiteId: string;
  technicalSettings: SEOTechnicalSettings;
  redirects: SEORedirect[];
  schemaConfigs: SEOSchemaConfig[];
  updatedAt: string;
}

export class SeoRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getSEOByWebsite(websiteId: string): Promise<FullWebsiteSEO> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("website_seo")
        .select("*")
        .eq("website_id", websiteId)
        .maybeSingle();

      if (error) throw handleDatabaseError(error);

      if (!data) {
        return this.getDefaultSEO(websiteId);
      }

      const row = data as WebsiteSeoRow;
      return {
        websiteId: row.website_id,
        technicalSettings: {
          websiteId: row.website_id,
          sitemapEnabled: row.sitemap_enabled,
          includeBlogInSitemap: row.include_blog_in_sitemap,
          customRobotsRules: (row.custom_robots_rules as unknown as SEOTechnicalSettings["customRobotsRules"]) || [
            {
              userAgent: "*",
              allow: ["/"],
              disallow: ["/dashboard/", "/admin/", "/editor/", "/api/"],
            },
          ],
          googleSearchConsoleVerification: row.google_search_console_verification || "",
          bingWebmasterVerification: row.bing_webmaster_verification || "",
          defaultTitleTemplate: row.default_meta_title || "%title% | %site_name%",
          fallbackOgImage: row.default_og_image || "",
        },
        redirects: (row.redirects as unknown as SEORedirect[]) || [],
        schemaConfigs: (row.schema_configs as unknown as SEOSchemaConfig[]) || [],
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async saveSEO(seo: FullWebsiteSEO): Promise<FullWebsiteSEO> {
    try {
      const now = new Date().toISOString();
      const payload = {
        website_id: seo.websiteId,
        sitemap_enabled: seo.technicalSettings.sitemapEnabled ?? true,
        include_blog_in_sitemap: seo.technicalSettings.includeBlogInSitemap ?? true,
        custom_robots_rules: (seo.technicalSettings.customRobotsRules || []) as unknown as Json,
        google_search_console_verification: seo.technicalSettings.googleSearchConsoleVerification || null,
        bing_webmaster_verification: seo.technicalSettings.bingWebmasterVerification || null,
        default_meta_title: seo.technicalSettings.defaultTitleTemplate || null,
        default_meta_description: null,
        default_og_image: seo.technicalSettings.fallbackOgImage || null,
        redirects: (seo.redirects || []) as unknown as Json,
        schema_configs: (seo.schemaConfigs || []) as unknown as Json,
        updated_at: now,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("website_seo")
        .upsert(payload, { onConflict: "website_id" })
        .select()
        .single();

      if (error) throw handleDatabaseError(error);

      const row = data as WebsiteSeoRow;
      return {
        websiteId: row.website_id,
        technicalSettings: {
          websiteId: row.website_id,
          sitemapEnabled: row.sitemap_enabled,
          includeBlogInSitemap: row.include_blog_in_sitemap,
          customRobotsRules: (row.custom_robots_rules as unknown as SEOTechnicalSettings["customRobotsRules"]) || [],
          googleSearchConsoleVerification: row.google_search_console_verification || "",
          bingWebmasterVerification: row.bing_webmaster_verification || "",
          defaultTitleTemplate: row.default_meta_title || "%title% | %site_name%",
          fallbackOgImage: row.default_og_image || "",
        },
        redirects: (row.redirects as unknown as SEORedirect[]) || [],
        schemaConfigs: (row.schema_configs as unknown as SEOSchemaConfig[]) || [],
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  public getDefaultSEO(websiteId: string): FullWebsiteSEO {
    return {
      websiteId,
      technicalSettings: {
        websiteId,
        sitemapEnabled: true,
        includeBlogInSitemap: true,
        customRobotsRules: [
          {
            userAgent: "*",
            allow: ["/"],
            disallow: ["/dashboard/", "/admin/", "/editor/", "/api/"],
          },
        ],
        googleSearchConsoleVerification: "",
        bingWebmasterVerification: "",
        defaultTitleTemplate: "%title% | %site_name%",
        fallbackOgImage: "",
      },
      redirects: [],
      schemaConfigs: [],
      updatedAt: new Date().toISOString(),
    };
  }
}
