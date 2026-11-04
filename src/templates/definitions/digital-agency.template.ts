import { TemplateDefinition } from "../types";
import { modernPurplePreset } from "@/themes/presets";

export const digitalAgencyTemplate: TemplateDefinition = {
  id: "template-digital-agency",
  name: "Vanguard Digital & SEO",
  slug: "vanguard-agency",
  category: "agency",
  description: "Modern, high-impact portfolio and lead acquisition website for digital agencies, SEO firms, and design studios.",
  thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  theme: modernPurplePreset,
  navigation: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Work", href: "/work" },
    { label: "Contact", href: "/contact" },
  ],
  pages: [
    {
      schemaVersion: 1,
      page: {
        id: "page_home",
        title: "Vanguard Digital | Local SEO & Conversion Optimization Agency",
        slug: "/",
        status: "published",
        description: "Scale your revenue with predictable organic search rankings, programmatic SEO, and high-converting websites.",
      },
      sections: [
        {
          id: "sec_header",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Vanguard Agency",
            ctaLabel: "Free SEO Audit",
            ctaHref: "#contact",
            phone: "(512) 555-0144",
          },
        },
        {
          id: "sec_hero",
          componentId: "hero.split.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Rank Higher. Convert Faster.",
            title: "We Help High-Growth Companies Dominate Google Search",
            description: "Data-driven SEO strategies, programmatic local landing pages, and conversion-optimized websites that generate qualified inbound pipeline.",
            primaryButtonLabel: "Claim Free SEO Audit",
            primaryButtonHref: "#contact",
            secondaryButtonLabel: "View Case Studies",
            secondaryButtonHref: "#portfolio",
            imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
            badgeText: "Average 240% increase in qualified organic pipeline",
            variant: "split",
          },
        },
        {
          id: "sec_features",
          componentId: "features.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Proven Growth Framework",
            title: "Everything You Need to Scale Inbound Pipeline",
            subtitle: "Battle-tested systems designed specifically for service brands and growth companies.",
            columns: "3",
          },
        },
        {
          id: "sec_services",
          componentId: "services.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Core Capabilities",
            title: "Services Tailored for Predictable ROI",
            subtitle: "Custom organic search campaigns engineered to capture high-intent buyers.",
            columns: "3",
            cardStyle: "boxed",
            services: [
              {
                title: "Programmatic Local SEO",
                description: "Dominate Google 3-Pack and state-wide city clusters with automated Schema markup and location silos.",
                icon: "clock",
              },
              {
                title: "High-Converting Web Design",
                description: "Fast sub-second Next.js pages optimized for mobile conversions and maximum lead capture.",
                icon: "wrench",
              },
              {
                title: "Technical Audits & Speed",
                description: "Fix crawl errors, optimize Core Web Vitals, and build domain authority with verified outreach.",
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
            eyebrow: "Our Philosophy",
            title: "Data Over Guesswork. Measurable Pipeline Over Vanity Metrics.",
            description: "We don't build websites to look pretty in design contests; we engineer them to rank on Google and ring your phones with paying customers.",
            imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
            imagePosition: "left",
          },
        },
        {
          id: "sec_portfolio",
          componentId: "gallery.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Client Showcase",
            title: "Featured Case Studies & Revenue Growth",
            subtitle: "Real results achieved for multi-location contractors, SaaS startups, and professional firms.",
            columns: "3",
            aspectRatio: "video",
          },
        },
        {
          id: "sec_testimonials",
          componentId: "testimonials.cards.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Client Proof",
            title: "What Agency Founders & CMOs Say",
            testimonials: [
              {
                quote: "Vanguard doubled our inbound calls within 90 days. Their programmatic local landing page system is unbelievable.",
                authorName: "Alex Rivera",
                authorRole: "Founder at Apex Roof Solutions",
                rating: 5,
              },
              {
                quote: "The cleanest Next.js builds we've ever seen. We hit 100 on Google PageSpeed Insights and saw immediate rank lifts.",
                authorName: "Elena Rostova",
                authorRole: "Marketing Director at NexaTech",
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
            eyebrow: "Ready to Scale Your Rankings?",
            title: "Request Your Comprehensive Competitor & SEO Audit",
            description: "We will analyze your top 3 competitors, uncover keyword gaps, and provide a 90-day action plan for free.",
            primaryButtonLabel: "Claim Free Growth Audit",
            primaryButtonHref: "#contact",
            secondaryButtonLabel: "Call (512) 555-0144",
            secondaryButtonHref: "tel:5125550144",
            variant: "gradient",
          },
        },
        {
          id: "sec_contact",
          componentId: "contact.form.v1",
          componentVersion: 1,
          props: {
            title: "Let's Discuss Your Growth Goals",
            subtitle: "Fill out the form below and an SEO strategist will review your market within 24 hours.",
            phone: "(512) 555-0144",
            email: "hello@vanguardagency.io",
            address: "300 Colorado St, Austin, TX 78701",
          },
        },
        {
          id: "sec_footer",
          componentId: "footer.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Vanguard Digital Agency",
            brandDescription: "Search engine optimization and high-converting web engineering.",
            copyright: `© ${new Date().getFullYear()} Vanguard Digital Agency. All rights reserved.`,
          },
        },
      ],
    },
  ],
};
