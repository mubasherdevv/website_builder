import { PageDocument, ThemeConfig } from "@/types/builder";

export interface NavigationItemDefinition {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  slug: string;
  category: "local-service" | "agency" | "restaurant" | "saas" | "portfolio" | "corporate" | "medical";
  description: string;
  thumbnailUrl: string;
  theme: ThemeConfig;
  navigation: NavigationItemDefinition[];
  pages: PageDocument[];
}

