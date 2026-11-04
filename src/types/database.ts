export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "owner" | "admin" | "member";
export type WebsiteRole = "admin" | "editor" | "author" | "viewer";
export type WebsiteStatus = "draft" | "published" | "archived";
export type PageStatus = "draft" | "published" | "archived";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          is_super_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: UserRole;
          created_at?: string;
        };
      };
      websites: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          subdomain: string;
          custom_domain: string | null;
          theme_config: Json;
          status: WebsiteStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          subdomain: string;
          custom_domain?: string | null;
          theme_config?: Json;
          status?: WebsiteStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          subdomain?: string;
          custom_domain?: string | null;
          theme_config?: Json;
          status?: WebsiteStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      website_members: {
        Row: {
          id: string;
          website_id: string;
          user_id: string;
          role: WebsiteRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          website_id: string;
          user_id: string;
          role: WebsiteRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          website_id?: string;
          user_id?: string;
          role?: WebsiteRole;
          created_at?: string;
        };
      };
      pages: {
        Row: {
          id: string;
          website_id: string;
          title: string;
          slug: string;
          status: PageStatus;
          draft_revision_id: string | null;
          published_revision_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          website_id: string;
          title: string;
          slug: string;
          status?: PageStatus;
          draft_revision_id?: string | null;
          published_revision_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          website_id?: string;
          title?: string;
          slug?: string;
          status?: PageStatus;
          draft_revision_id?: string | null;
          published_revision_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      page_revisions: {
        Row: {
          id: string;
          page_id: string;
          revision_number: number;
          document: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          revision_number: number;
          document: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          revision_number?: number;
          document?: Json;
          created_by?: string | null;
          created_at?: string;
        };
      };
      forms: {
        Row: {
          id: string;
          website_id: string;
          name: string;
          type: string;
          status: string;
          fields: Json;
          settings: Json;
          submissions_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          website_id: string;
          name: string;
          type?: string;
          status?: string;
          fields?: Json;
          settings?: Json;
          submissions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          website_id?: string;
          name?: string;
          type?: string;
          status?: string;
          fields?: Json;
          settings?: Json;
          submissions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_submissions: {
        Row: {
          id: string;
          form_id: string;
          website_id: string;
          form_name: string;
          data: Json;
          status: string;
          submitted_at: string;
          ip_address: string;
          user_agent: string;
          notes: Json;
        };
        Insert: {
          id?: string;
          form_id: string;
          website_id: string;
          form_name?: string;
          data?: Json;
          status?: string;
          submitted_at?: string;
          ip_address?: string;
          user_agent?: string;
          notes?: Json;
        };
        Update: {
          id?: string;
          form_id?: string;
          website_id?: string;
          form_name?: string;
          data?: Json;
          status?: string;
          submitted_at?: string;
          ip_address?: string;
          user_agent?: string;
          notes?: Json;
        };
      };
      navigation_menus: {
        Row: {
          id: string;
          website_id: string;
          name: string;
          location: string;
          is_published: boolean;
          settings: Json;
          items: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          website_id: string;
          name: string;
          location: string;
          is_published?: boolean;
          settings?: Json;
          items?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          website_id?: string;
          name?: string;
          location?: string;
          is_published?: boolean;
          settings?: Json;
          items?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_categories: {
        Row: {
          id: string;
          website_id: string;
          name: string;
          slug: string;
          description: string | null;
          seo_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          website_id: string;
          name: string;
          slug: string;
          description?: string | null;
          seo_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          website_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          seo_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          website_id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: Json;
          featured_image: string | null;
          featured_image_alt: string | null;
          image_caption: string | null;
          author: Json;
          category_id: string | null;
          tag_ids: Json;
          status: string;
          published_at: string | null;
          scheduled_at: string | null;
          reading_time_minutes: number;
          seo: Json;
          seo_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          website_id: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: Json;
          featured_image?: string | null;
          featured_image_alt?: string | null;
          image_caption?: string | null;
          author?: Json;
          category_id?: string | null;
          tag_ids?: Json;
          status?: string;
          published_at?: string | null;
          scheduled_at?: string | null;
          reading_time_minutes?: number;
          seo?: Json;
          seo_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          website_id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: Json;
          featured_image?: string | null;
          featured_image_alt?: string | null;
          image_caption?: string | null;
          author?: Json;
          category_id?: string | null;
          tag_ids?: Json;
          status?: string;
          published_at?: string | null;
          scheduled_at?: string | null;
          reading_time_minutes?: number;
          seo?: Json;
          seo_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      website_seo: {
        Row: {
          website_id: string;
          sitemap_enabled: boolean;
          include_blog_in_sitemap: boolean;
          custom_robots_rules: Json;
          google_search_console_verification: string | null;
          bing_webmaster_verification: string | null;
          default_meta_title: string | null;
          default_meta_description: string | null;
          default_og_image: string | null;
          redirects: Json;
          schema_configs: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          website_id: string;
          sitemap_enabled?: boolean;
          include_blog_in_sitemap?: boolean;
          custom_robots_rules?: Json;
          google_search_console_verification?: string | null;
          bing_webmaster_verification?: string | null;
          default_meta_title?: string | null;
          default_meta_description?: string | null;
          default_og_image?: string | null;
          redirects?: Json;
          schema_configs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          website_id?: string;
          sitemap_enabled?: boolean;
          include_blog_in_sitemap?: boolean;
          custom_robots_rules?: Json;
          google_search_console_verification?: string | null;
          bing_webmaster_verification?: string | null;
          default_meta_title?: string | null;
          default_meta_description?: string | null;
          default_og_image?: string | null;
          redirects?: Json;
          schema_configs?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

