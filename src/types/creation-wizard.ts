import { ServiceSuggestion, LocationSuggestion, BlogTitleSuggestion, PageKeywordCluster } from "@/lib/ai/business-analysis-adapter";

export interface BasicBusinessInfo {
  projectName: string;
  language: string;
  businessName: string;
  niche: string;
  websiteUrl?: string;
  country: string;
  city: string;
  state?: string;
  phone: string;
  email: string;
  address?: string;
  secondaryKeyword?: string;
}

export type LocationStrategy = "neighborhoods" | "nearby_cities" | "custom_areas";

export interface WebsiteCreationDraft {
  basicInfo: BasicBusinessInfo;
  services: ServiceSuggestion[];
  locationStrategy: LocationStrategy;
  locations: LocationSuggestion[];
  blogTitles: BlogTitleSuggestion[];
  keywordClusters: PageKeywordCluster[];
  selectedTemplateId: string;
  selectedThemeId: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  logoUrl?: string;
}

