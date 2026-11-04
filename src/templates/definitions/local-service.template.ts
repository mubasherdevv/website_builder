import { TemplateDefinition } from "../types";
import { deepSlatePreset } from "@/themes/presets";

export type { TemplateDefinition } from "../types";

export const localServiceTemplate: TemplateDefinition = {
  id: "template-local-plumber",
  name: "Apex Plumbing & Trades",
  slug: "apex-plumbing",
  category: "local-service",
  description: "High-converting multi-page template engineered for plumbing, HVAC, electrical, and home service contractors.",
  thumbnailUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
  theme: deepSlatePreset,
  navigation: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  pages: [
    // 1. Home Page
    {
      schemaVersion: 1,
      page: {
        id: "page_home",
        title: "Apex Plumbing Pros | 24/7 Emergency Plumber Austin",
        slug: "/",
        status: "published",
        description: "24/7 Fast Emergency Plumbing and Drain Services in Austin, TX. Licensed technicians with upfront pricing.",
      },
      sections: [
        {
          id: "sec_header",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Apex Plumbing Pros",
            phone: "(512) 555-0199",
            ctaLabel: "Emergency Call",
            ctaHref: "tel:5125550199",
          },
        },
        {
          id: "sec_hero",
          componentId: "hero.split.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Master Licensed Plumbers #48921",
            title: "Fast, Reliable Plumbing Across Greater Austin",
            description: "From broken pipes and slab leaks to water heater replacement, our certified technicians are on call 24 hours a day with zero overtime charges.",
            primaryButtonLabel: "Schedule Service",
            primaryButtonHref: "#contact",
            secondaryButtonLabel: "Call (512) 555-0199",
            secondaryButtonHref: "tel:5125550199",
            imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80",
            badgeText: "Upfront Pricing · No Overtime Fees",
            variant: "split",
          },
        },
        {
          id: "sec_features",
          componentId: "features.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "The Apex Difference",
            title: "Why Austin Homeowners Trust Us",
            subtitle: "We believe in honest estimates, rapid dispatch, and fixing the problem right the first time.",
            columns: "3",
          },
        },
        {
          id: "sec_services",
          componentId: "services.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Core Services",
            title: "Comprehensive Plumbing & Drain Solutions",
            subtitle: "Residential and commercial plumbing services delivered with master-level precision.",
            columns: "3",
            cardStyle: "boxed",
            services: [
              {
                title: "Emergency Leak Detection",
                description: "State-of-the-art acoustic detection locating slab and wall leaks without unnecessary excavation.",
                icon: "clock",
              },
              {
                title: "Tankless Water Heaters",
                description: "Endless hot water with energy-efficient installations and same-day replacements.",
                icon: "wrench",
              },
              {
                title: "Hydro-Jetting Drain Clean",
                description: "Heavy-duty clearing of grease, sludge, and tree roots restoring full drain flow.",
                icon: "check",
              },
            ],
          },
        },
        {
          id: "sec_about",
          componentId: "about.split.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Austin Family Owned",
            title: "Proudly Serving Central Texas Since 2011",
            description: "We founded Apex Plumbing with a simple standard: arrive on time, explain the repair options clearly, and back every job with an ironclad guarantee.",
            imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
            imagePosition: "right",
          },
        },
        {
          id: "sec_gallery",
          componentId: "gallery.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Recent Projects",
            title: "Real Work, Real Results",
            subtitle: "Take a look at our recent installations and emergency repair jobs across Travis and Williamson counties.",
            columns: "3",
            aspectRatio: "square",
          },
        },
        {
          id: "sec_reviews",
          componentId: "testimonials.cards.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Verified Reviews",
            title: "Over 500+ Five-Star Reviews Across Google & Yelp",
            testimonials: [
              {
                quote: "Apex arrived within 45 minutes of our main line backing up on a Sunday night. Professional, clean, and upfront price.",
                authorName: "Sarah Jenkins",
                authorRole: "Homeowner in Round Rock",
                rating: 5,
              },
              {
                quote: "Installed a Rinnai tankless water heater. Flawless workmanship and our gas bill actually dropped 25%.",
                authorName: "Robert Mitchell",
                authorRole: "Property Manager in Downtown Austin",
                rating: 5,
              },
            ],
          },
        },
        {
          id: "sec_cta",
          componentId: "cta.banner.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Emergency Plumbing Needed?",
            title: "Call Our On-Call Dispatch Team Right Now",
            description: "We have fully-stocked service vans dispatched across Austin, Cedar Park, and Pflugerville.",
            primaryButtonLabel: "Call (512) 555-0199",
            primaryButtonHref: "tel:5125550199",
            secondaryButtonLabel: "Request Callback Online",
            secondaryButtonHref: "#contact",
            variant: "dark",
          },
        },
        {
          id: "sec_contact",
          componentId: "contact.form.v1",
          componentVersion: 1,
          props: {
            title: "Book Service or Request a Free Estimate",
            subtitle: "Fill out the quick form below or call us directly. We respond within 15 minutes during business hours.",
            phone: "(512) 555-0199",
            email: "service@apexplumbingpros.com",
            address: "100 Congress Ave, Suite 200, Austin, TX 78701",
          },
        },
        {
          id: "sec_footer",
          componentId: "footer.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Apex Plumbing Pros",
            brandDescription: "Licensed, bonded, and insured plumbing contractor serving residential and commercial clients across Austin, TX.",
            copyright: `© ${new Date().getFullYear()} Apex Plumbing Pros. All rights reserved.`,
          },
        },
      ],
    },
    // 2. Services Page
    {
      schemaVersion: 1,
      page: {
        id: "page_services",
        title: "All Plumbing Services | Apex Plumbing Pros",
        slug: "/services",
        status: "published",
        description: "Full range of residential and commercial plumbing solutions in Austin, TX.",
      },
      sections: [
        {
          id: "sec_srv_header",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Apex Plumbing Pros",
            phone: "(512) 555-0199",
            ctaLabel: "Emergency Call",
            ctaHref: "tel:5125550199",
          },
        },
        {
          id: "sec_srv_hero",
          componentId: "hero.split.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Specialized Trade Solutions",
            title: "Complete Residential & Commercial Plumbing",
            description: "From routine diagnostics to municipal-grade sewer replacements, explore our full spectrum of certified trade capabilities.",
            primaryButtonLabel: "Request an Estimate",
            primaryButtonHref: "/contact",
            secondaryButtonLabel: "Call (512) 555-0199",
            secondaryButtonHref: "tel:5125550199",
            variant: "centered",
          },
        },
        {
          id: "sec_srv_grid",
          componentId: "services.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "What We Offer",
            title: "Our Full Capabilities",
            subtitle: "Every job executed with precision code compliance and high-grade materials.",
            columns: "3",
            cardStyle: "boxed",
          },
        },
        {
          id: "sec_srv_cta",
          componentId: "cta.banner.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Ready for an Estimate?",
            title: "Speak Directly to a Master Plumber",
            description: "We provide upfront, transparent flat-rate pricing before any work begins.",
            primaryButtonLabel: "Book Your Slot",
            primaryButtonHref: "/contact",
            variant: "brand",
          },
        },
        {
          id: "sec_srv_footer",
          componentId: "footer.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Apex Plumbing Pros",
            brandDescription: "Serving Austin, Round Rock, and Cedar Park with 24/7 priority emergency service.",
            copyright: `© ${new Date().getFullYear()} Apex Plumbing Pros.`,
          },
        },
      ],
    },
    // 3. About Page
    {
      schemaVersion: 1,
      page: {
        id: "page_about",
        title: "About Our Team | Apex Plumbing Pros",
        slug: "/about",
        status: "published",
        description: "Learn about our company history, licenses, team of master technicians, and customer guarantees.",
      },
      sections: [
        {
          id: "sec_abt_header",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Apex Plumbing Pros",
            phone: "(512) 555-0199",
            ctaLabel: "Emergency Call",
            ctaHref: "tel:5125550199",
          },
        },
        {
          id: "sec_abt_story",
          componentId: "about.split.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Who We Are",
            title: "Built on Honest Workmanship & Community Trust",
            description: "We are local master plumbers dedicated to keeping Austin families safe and properties protected.",
            imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
            imagePosition: "left",
          },
        },
        {
          id: "sec_abt_features",
          componentId: "features.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Our Core Standards",
            title: "The Guarantees That Protect You",
            columns: "3",
          },
        },
        {
          id: "sec_abt_footer",
          componentId: "footer.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Apex Plumbing Pros",
            brandDescription: "Certified trade craftsmanship in Central Texas.",
            copyright: `© ${new Date().getFullYear()} Apex Plumbing Pros.`,
          },
        },
      ],
    },
    // 4. Contact Page
    {
      schemaVersion: 1,
      page: {
        id: "page_contact",
        title: "Contact & 24/7 Dispatch | Apex Plumbing Pros",
        slug: "/contact",
        status: "published",
        description: "Get in touch with our on-call coordinator or book your appointment online.",
      },
      sections: [
        {
          id: "sec_cnt_header",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Apex Plumbing Pros",
            phone: "(512) 555-0199",
            ctaLabel: "Call Now",
            ctaHref: "tel:5125550199",
          },
        },
        {
          id: "sec_cnt_form",
          componentId: "contact.form.v1",
          componentVersion: 1,
          props: {
            title: "Contact Our Austin Service Center",
            subtitle: "Need immediate dispatch or scheduling a project inspection? We are standing by.",
            phone: "(512) 555-0199",
            email: "service@apexplumbingpros.com",
            address: "100 Congress Ave, Suite 200, Austin, TX 78701",
          },
        },
        {
          id: "sec_cnt_footer",
          componentId: "footer.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Apex Plumbing Pros",
            brandDescription: "Available 24/7/365 across Central Texas.",
            copyright: `© ${new Date().getFullYear()} Apex Plumbing Pros.`,
          },
        },
      ],
    },
  ],
};
