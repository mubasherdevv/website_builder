import { PageDocument, ThemeConfig } from "@/types/builder";

export interface AIWebsitePrompt {
  businessName: string;
  niche: string;
  location: string;
  phone?: string;
  services: string[];
  targetCities?: string[];
  brandTone: "professional" | "energetic" | "luxury" | "friendly";
}

export interface AIWebsiteProposal {
  websiteName: string;
  subdomain: string;
  theme: ThemeConfig;
  pages: PageDocument[];
  seoTitle: string;
  seoDescription: string;
}

