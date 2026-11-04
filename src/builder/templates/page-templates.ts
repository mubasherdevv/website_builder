import { PageDocument, SectionNode } from "@/types/builder";
import { PageType } from "@/types/cms";
import { generateEntityId } from "@/lib/utils/id";

export interface PageTemplateDefinition {
  type: PageType;
  name: string;
  description: string;
  icon: string;
  defaultSlug: string;
  defaultTitle: string;
  createDocument: (websiteTitle: string, pageTitle: string, slug: string) => PageDocument;
}

function createNode(
  componentId: string,
  props: Record<string, unknown>,
  style?: SectionNode["style"]
): SectionNode {
  return {
    id: generateEntityId("sec"),
    componentId,
    componentVersion: 1,
    props,
    style,
  };
}

export const PAGE_TEMPLATES: Record<PageType, PageTemplateDefinition> = {
  home: {
    type: "home",
    name: "Home",
    description: "High-converting homepage with hero, services, trust badges, reviews & contact form.",
    icon: "home",
    defaultSlug: "/",
    defaultTitle: "Home",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site, ctaLabel: "Get a Quote" }),
        createNode("hero.split.v1", {
          eyebrow: "Welcome to " + site,
          title: "Superior Craftsmanship & Dependable Service",
          description: "Delivering top-rated residential and commercial solutions with prompt, 24/7 client care.",
          primaryButtonLabel: "Request Service",
          secondaryButtonLabel: "Explore Work",
        }),
        createNode("features.grid.v1", {
          eyebrow: "Why Choose Us",
          title: "Engineered for Reliability & Trust",
          columns: "3",
        }),
        createNode("services.grid.v1", {
          eyebrow: "What We Offer",
          title: "Comprehensive Solutions for Every Need",
          columns: "3",
        }),
        createNode("testimonials.cards.v1", {
          eyebrow: "Verified Client Reviews",
          title: "What Our Customers Say",
        }),
        createNode("contact.form.v1", {
          eyebrow: "Get Started",
          title: "Request a Free Inspection & Quote",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  about: {
    type: "about",
    name: "About Us",
    description: "Company story, founding values, team background, and trust certifications.",
    icon: "users",
    defaultSlug: "/about",
    defaultTitle: "About Us",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Our Heritage & Story",
          title: "Built on Integrity, Driven by Results",
          description: `Founded with a commitment to excellence, ${site} has grown into a trusted industry leader.`,
          variant: "centered",
          primaryButtonLabel: "Meet the Team",
          secondaryButtonLabel: "Contact Us",
        }),
        createNode("about.split.v1", {
          eyebrow: "Who We Are",
          title: "Over a Decade of Industry Leadership",
          description: "Our dedicated team pairs cutting-edge methodology with reliable local customer service.",
          storyParagraph: "Every project is executed with precision, transparent communication, and full code-compliance.",
        }),
        createNode("features.grid.v1", {
          eyebrow: "Core Values",
          title: "The Principles That Guide Our Work",
          columns: "3",
        }),
        createNode("cta.banner.v1", {
          eyebrow: "Work With Us",
          title: "Experience the Difference Firsthand",
          description: "Get in touch today to discuss your next project with our senior specialists.",
          primaryButtonLabel: "Speak With an Expert",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  services: {
    type: "services",
    name: "Services",
    description: "Comprehensive grid of core offerings with detailed descriptions and booking CTAs.",
    icon: "wrench",
    defaultSlug: "/services",
    defaultTitle: "Our Services",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Expert Capabilities",
          title: "Professional Services Built to Last",
          description: "Explore our complete suite of specialized commercial and residential services.",
          primaryButtonLabel: "Schedule an Inspection",
          secondaryButtonLabel: "View Pricing",
        }),
        createNode("services.grid.v1", {
          eyebrow: "Full Spectrum Solutions",
          title: "Customized Service Options",
          columns: "3",
        }),
        createNode("features.grid.v1", {
          eyebrow: "Quality Assurance",
          title: "Guaranteed Satisfaction on Every Job",
          columns: "3",
        }),
        createNode("cta.banner.v1", {
          eyebrow: "Ready to Begin?",
          title: "Receive a Detailed Estimate in 15 Minutes",
          primaryButtonLabel: "Request Quote Now",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  service_detail: {
    type: "service_detail",
    name: "Service Detail",
    description: "Deep-dive focus page highlighting a single high-value service with FAQs and form.",
    icon: "file-text",
    defaultSlug: "/services/premium-restoration",
    defaultTitle: "Service Details",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Featured Specialization",
          title: "Complete Emergency Repair & Maintenance",
          description: "Rapid on-call dispatch with certified technicians and upfront diagnostic reporting.",
          primaryButtonLabel: "Book This Service",
          secondaryButtonLabel: "View All Services",
        }),
        createNode("about.split.v1", {
          eyebrow: "Service Overview",
          title: "What is Included in Our Package",
          description: "Every service engagement follows strict multi-point checklists and verified code inspections.",
        }),
        createNode("features.grid.v1", {
          eyebrow: "Key Benefits",
          title: "Why Clients Choose This Solution",
          columns: "3",
        }),
        createNode("contact.form.v1", {
          eyebrow: "Instant Booking",
          title: "Schedule Your Service Appointment",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  pricing: {
    type: "pricing",
    name: "Pricing & Plans",
    description: "Clear tiers, plan comparisons, transparent cost estimates, and FAQ answers.",
    icon: "dollar-sign",
    defaultSlug: "/pricing",
    defaultTitle: "Pricing & Plans",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Transparent Investment",
          title: "Simple, Upfront Pricing with Zero Hidden Fees",
          description: "Choose the package tailored to your property size and ongoing service requirements.",
          variant: "centered",
          primaryButtonLabel: "View Packages",
          secondaryButtonLabel: "Custom Quote",
        }),
        createNode("features.grid.v1", {
          eyebrow: "Service Tiers",
          title: "Flexible Packages for Every Scale",
          columns: "3",
        }),
        createNode("testimonials.cards.v1", {
          eyebrow: "Customer Value",
          title: "Proven ROI from Verified Property Owners",
        }),
        createNode("contact.form.v1", {
          eyebrow: "Need a Custom Proposal?",
          title: "Get an Itemized Estimate for Your Facility",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  team: {
    type: "team",
    name: "Team & Leadership",
    description: "Introduce key staff members, leadership credentials, and company culture.",
    icon: "users",
    defaultSlug: "/team",
    defaultTitle: "Meet the Team",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Our Professionals",
          title: "Certified Experts Committed to Your Success",
          description: "Meet the licensed managers, engineers, and specialists behind every completed project.",
          variant: "centered",
          primaryButtonLabel: "Join Our Team",
          secondaryButtonLabel: "Contact Leadership",
        }),
        createNode("features.grid.v1", {
          eyebrow: "Leadership Team",
          title: "Decades of Combined Practical Experience",
          columns: "3",
        }),
        createNode("about.split.v1", {
          eyebrow: "Culture & Standards",
          title: "Continuous Training & Safety First",
          description: "Our staff undergoes ongoing field testing and OSHA-compliant safety certifications.",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  contact: {
    type: "contact",
    name: "Contact & Location",
    description: "Interactive contact form, direct phone lines, office locations, and hours.",
    icon: "phone",
    defaultSlug: "/contact",
    defaultTitle: "Contact Us",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Reach Out Anytime",
          title: "We Are Here to Help 24/7",
          description: "Have a question or need emergency support? Our dedicated team is on standby.",
          variant: "centered",
          primaryButtonLabel: "Fill Out Form",
          secondaryButtonLabel: "Call Directly",
        }),
        createNode("contact.form.v1", {
          eyebrow: "Quick Message",
          title: "Send Us an Inquiry",
        }),
        createNode("features.grid.v1", {
          eyebrow: "Office Details",
          title: "Direct Channels & Operating Hours",
          columns: "3",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  faq: {
    type: "faq",
    name: "Frequently Asked Questions",
    description: "Address common buyer questions, warranties, response times, and booking steps.",
    icon: "help-circle",
    defaultSlug: "/faq",
    defaultTitle: "FAQ",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Help & Answers",
          title: "Frequently Asked Questions",
          description: "Find clear answers to questions regarding our guarantees, billing, and project timelines.",
          variant: "centered",
          primaryButtonLabel: "Ask a Question",
          secondaryButtonLabel: "Contact Support",
        }),
        createNode("features.grid.v1", {
          eyebrow: "Popular Questions",
          title: "Everything You Need to Know",
          columns: "3",
        }),
        createNode("cta.banner.v1", {
          eyebrow: "Still Have Questions?",
          title: "Our Specialists Are Happy to Assist",
          description: "Call or email our team directly for personalized answers to your specific situation.",
          primaryButtonLabel: "Contact Support",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  testimonials: {
    type: "testimonials",
    name: "Testimonials & Reviews",
    description: "Dedicated social proof showcase with client ratings, quotes, and case studies.",
    icon: "star",
    defaultSlug: "/testimonials",
    defaultTitle: "Client Reviews",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Client Stories",
          title: "Real Feedback from Real Customers",
          description: "Read verified reviews and testimonials from homeowners and businesses who trust our service.",
          variant: "centered",
          primaryButtonLabel: "Read Reviews",
          secondaryButtonLabel: "Leave Feedback",
        }),
        createNode("testimonials.cards.v1", {
          eyebrow: "Verified Experiences",
          title: "Over 500+ Five-Star Reviews Across the Region",
          layout: "grid",
        }),
        createNode("gallery.grid.v1", {
          eyebrow: "Proof of Work",
          title: "Completed Project Highlights",
          columns: "3",
        }),
        createNode("cta.banner.v1", {
          eyebrow: "Join Our Happy Customers",
          title: "Ready to Experience Quality Service?",
          primaryButtonLabel: "Get Started Today",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  gallery: {
    type: "gallery",
    name: "Gallery & Portfolio",
    description: "Visual portfolio showcasing completed work, installations, and before-and-after photos.",
    icon: "camera",
    defaultSlug: "/gallery",
    defaultTitle: "Project Gallery",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Visual Showcase",
          title: "Our Work in Action",
          description: "Browse high-resolution photographs of recently completed installations and repairs.",
          variant: "centered",
          primaryButtonLabel: "View Portfolio",
          secondaryButtonLabel: "Request Estimate",
        }),
        createNode("gallery.grid.v1", {
          eyebrow: "Featured Projects",
          title: "Recent Residential & Commercial Installations",
          columns: "3",
        }),
        createNode("cta.banner.v1", {
          eyebrow: "Inspired by Our Work?",
          title: "Let Us Bring Your Vision to Reality",
          primaryButtonLabel: "Consult an Engineer",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  locations: {
    type: "locations",
    name: "Locations & Service Areas",
    description: "Targeted service area page showing served cities, response radiuses, and local contacts.",
    icon: "map-pin",
    defaultSlug: "/locations",
    defaultTitle: "Service Areas",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Coverage Area",
          title: "Proudly Serving the Entire Greater Metro Area",
          description: "Prompt same-day service and 24/7 emergency dispatch across all surrounding counties.",
          primaryButtonLabel: "Check My Zip Code",
          secondaryButtonLabel: "Contact Local Team",
        }),
        createNode("features.grid.v1", {
          eyebrow: "Regional Hubs",
          title: "Communities We Actively Serve",
          columns: "3",
        }),
        createNode("contact.form.v1", {
          eyebrow: "Local Dispatch",
          title: "Request Rapid Service in Your City",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },

  custom: {
    type: "custom",
    name: "Custom Blank Page",
    description: "Clean canvas with essential header and footer, ready for your custom section layout.",
    icon: "plus",
    defaultSlug: "/new-page",
    defaultTitle: "New Custom Page",
    createDocument: (site, title, slug) => ({
      schemaVersion: 1,
      page: { id: generateEntityId("page"), title, slug, status: "draft" },
      sections: [
        createNode("header.simple.v1", { brandName: site }),
        createNode("hero.split.v1", {
          eyebrow: "Custom Page",
          title: title,
          description: "This page is ready for your custom sections. Open the Visual Builder to add elements.",
          variant: "centered",
          primaryButtonLabel: "Take Action",
        }),
        createNode("footer.simple.v1", { brandName: site }),
      ],
    }),
  },
};

export function listPageTemplates(): PageTemplateDefinition[] {
  return Object.values(PAGE_TEMPLATES);
}

export function getPageTemplate(type: PageType): PageTemplateDefinition {
  return PAGE_TEMPLATES[type] || PAGE_TEMPLATES.custom;
}

export function generatePageDocumentFromTemplate(
  type: PageType,
  siteTitle: string,
  slug: string,
  pageTitle?: string
): PageDocument {
  const tpl = getPageTemplate(type);
  return tpl.createDocument(siteTitle, pageTitle || tpl.defaultTitle, slug);
}

