import { TemplateDefinition } from "../types";
import { cleanTealPreset } from "@/themes/presets";

export const restaurantTemplate: TemplateDefinition = {
  id: "template-bistro-restaurant",
  name: "Artisan Bistro & Kitchen",
  slug: "artisan-bistro",
  category: "restaurant",
  description: "Sensory-rich, appetizing presentation for restaurants, cafes, bakeries, and culinary experiences.",
  thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
  theme: cleanTealPreset,
  navigation: [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Story", href: "/about" },
    { label: "Reservations", href: "/reservations" },
  ],
  pages: [
    {
      schemaVersion: 1,
      page: {
        id: "page_home",
        title: "Artisan Kitchen & Wine Bar | Farm-to-Table Dining Austin",
        slug: "/",
        status: "published",
        description: "Farm-to-table culinary experiences with locally sourced organic ingredients in downtown Austin.",
      },
      sections: [
        {
          id: "sec_header",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Artisan Kitchen & Bar",
            ctaLabel: "Reserve a Table",
            ctaHref: "#contact",
            phone: "(512) 555-0182",
          },
        },
        {
          id: "sec_hero",
          componentId: "hero.split.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Locally Sourced · Chef Driven",
            title: "Craft Dining in the Heart of Austin",
            description: "Experience seasonal tasting menus, wood-fired specialties, and curated natural wines in a warm, inviting ambiance.",
            primaryButtonLabel: "View Evening Menu",
            primaryButtonHref: "#menu",
            secondaryButtonLabel: "Reserve a Table",
            secondaryButtonHref: "#contact",
            imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
            badgeText: "Rated 4.9 Stars on OpenTable & Google Reviews",
            variant: "split",
          },
        },
        {
          id: "sec_about",
          componentId: "about.split.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Our Heritage",
            title: "Honoring Texas Farmers & Seasonal Harvests",
            description: "Every plate tells the story of our local soil. We partner directly with regenerative Hill Country ranches and family dairies to bring authentic flavor to your table.",
            imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
            imagePosition: "right",
          },
        },
        {
          id: "sec_gallery",
          componentId: "gallery.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Culinary Highlights",
            title: "From Our Wood-Fired Hearth",
            subtitle: "Hand-rolled pastas, heritage meats, and pastry creations prepared fresh daily.",
            columns: "3",
            aspectRatio: "square",
          },
        },
        {
          id: "sec_services",
          componentId: "services.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Dining Experiences",
            title: "Bespoke Hospitality for Every Occasion",
            subtitle: "Join us for intimate evenings, private dining, or weekend tasting menus.",
            columns: "3",
            cardStyle: "minimal",
            services: [
              {
                title: "Chef's Tasting Menu",
                description: "A multi-course culinary journey paired with biodynamic wines.",
                icon: "award",
              },
              {
                title: "Private Dining Room",
                description: "Secluded dining space accommodating up to 24 guests for private celebrations.",
                icon: "check",
              },
              {
                title: "Handcrafted Cocktail Bar",
                description: "Artisanal spirits, house-infused botanicals, and small-batch bitters.",
                icon: "clock",
              },
            ],
          },
        },
        {
          id: "sec_cta",
          componentId: "cta.banner.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Join Us This Evening",
            title: "Reserve Your Table for a Memorable Dining Experience",
            description: "Reservations recommended for dinner service. Walk-ins welcomed at our lounge bar.",
            primaryButtonLabel: "Book with OpenTable",
            primaryButtonHref: "#contact",
            secondaryButtonLabel: "Call (512) 555-0182",
            secondaryButtonHref: "tel:5125550182",
            variant: "brand",
          },
        },
        {
          id: "sec_contact",
          componentId: "contact.form.v1",
          componentVersion: 1,
          props: {
            title: "Private Events & Table Inquiries",
            subtitle: "Let us know about your party size, date, or dietary preferences.",
            phone: "(512) 555-0182",
            email: "reservations@artisanbistro.com",
            address: "410 E 6th St, Austin, TX 78701",
          },
        },
        {
          id: "sec_footer",
          componentId: "footer.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Artisan Kitchen & Wine Bar",
            brandDescription: "Farm-to-table dining and natural wine bar.",
            copyright: `© ${new Date().getFullYear()} Artisan Bistro. All rights reserved.`,
          },
        },
      ],
    },
  ],
};
