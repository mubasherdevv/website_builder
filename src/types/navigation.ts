import { z } from "zod";

export type NavigationLocation = "header" | "footer" | "utility" | "custom";

export type NavItemDestinationType =
  | "page"
  | "blog_listing"
  | "blog_post"
  | "blog_category"
  | "custom_url"
  | "section_anchor"
  | "dropdown_parent"
  | "clickable_parent";

export interface NavItemVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface NavigationItem {
  id: string;
  menuId: string;
  parentId?: string | null;
  label: string;
  destinationType: NavItemDestinationType;
  destinationId?: string; // pageId, postId, categoryId, or section anchor (#services)
  customUrl?: string; // external or relative path
  openInNewTab?: boolean;
  icon?: string;
  visibility: NavItemVisibility;
  enabled: boolean;
  cssClass?: string;
  description?: string;
  order: number;
  level: 1 | 2 | 3;
  children?: NavigationItem[];
  isBroken?: boolean;
  brokenReason?: string;
  isCustomLabel?: boolean;
}

export interface NavigationDisplaySettings {
  // Desktop
  layout: "horizontal" | "vertical";
  alignment: "left" | "center" | "right";
  logoPosition: "left" | "center";
  itemSpacing: number; // in px
  fontSize: number; // in px
  fontWeight: "normal" | "medium" | "semibold" | "bold";
  textColor?: string;
  hoverColor?: string;
  activeColor?: string;
  stickyHeader: boolean;
  transparentHeader: boolean;
  ctaButtonEnabled: boolean;
  ctaButtonLabel?: string;
  ctaButtonHref?: string;

  // Dropdown
  dropdownTrigger: "hover" | "click";
  dropdownBg?: string;
  dropdownTextColor?: string;
  dropdownWidth: number; // in px
  dropdownBorderRadius: number; // in px
  dropdownShadow: "none" | "sm" | "md" | "lg" | "xl";
  dropdownAnimation: "fade" | "slide" | "none";

  // Overflow
  maxVisibleTopLevelItems: number;
  overflowBehavior: "more_dropdown" | "wrap";

  // Mobile
  mobileStyle: "drawer_left" | "drawer_right" | "fullscreen" | "dropdown";
  mobileLogo: boolean;
  mobileCtaEnabled: boolean;
  mobileCtaLabel?: string;
  mobileCtaHref?: string;
  accordionDropdowns: boolean;
}

export interface WebsiteMenu {
  id: string;
  websiteId: string;
  name: string;
  location: NavigationLocation;
  isPublished: boolean;
  items: NavigationItem[];
  settings: NavigationDisplaySettings;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export const defaultDisplaySettings: NavigationDisplaySettings = {
  layout: "horizontal",
  alignment: "right",
  logoPosition: "left",
  itemSpacing: 24,
  fontSize: 14,
  fontWeight: "medium",
  stickyHeader: true,
  transparentHeader: false,
  ctaButtonEnabled: true,
  ctaButtonLabel: "Get a Quote",
  ctaButtonHref: "#contact",
  dropdownTrigger: "hover",
  dropdownWidth: 220,
  dropdownBorderRadius: 8,
  dropdownShadow: "md",
  dropdownAnimation: "fade",
  maxVisibleTopLevelItems: 6,
  overflowBehavior: "more_dropdown",
  mobileStyle: "drawer_right",
  mobileLogo: true,
  mobileCtaEnabled: true,
  mobileCtaLabel: "Get a Quote",
  mobileCtaHref: "#contact",
  accordionDropdowns: true,
};

export const NavigationItemSchema = z.object({
  id: z.string(),
  menuId: z.string(),
  parentId: z.string().nullable().optional(),
  label: z.string().min(1, "Label is required"),
  destinationType: z.enum([
    "page",
    "blog_listing",
    "blog_post",
    "blog_category",
    "custom_url",
    "section_anchor",
    "dropdown_parent",
    "clickable_parent",
  ]),
  destinationId: z.string().optional(),
  customUrl: z.string().optional(),
  openInNewTab: z.boolean().default(false),
  icon: z.string().optional(),
  visibility: z.object({
    desktop: z.boolean().default(true),
    tablet: z.boolean().default(true),
    mobile: z.boolean().default(true),
  }),
  enabled: z.boolean().default(true),
  cssClass: z.string().optional(),
  description: z.string().optional(),
  order: z.number().default(0),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
});

