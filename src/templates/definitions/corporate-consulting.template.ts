import { TemplateDefinition } from "../types";
import { deepSlatePreset } from "@/themes/presets";

export const corporateConsultingTemplate: TemplateDefinition = {
  id: "template-corporate-advisory",
  name: "Vanguard Legal & Advisory",
  slug: "vanguard-legal",
  category: "corporate",
  description: "Prestigious, trust-building presentation for commercial law firms, financial consultancies, and executive advisory practices.",
  thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
  theme: deepSlatePreset,
  navigation: [
    { label: "Home", href: "/" },
    { label: "Practice Areas", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  pages: [
    {
      schemaVersion: 1,
      page: {
        id: "page_home",
        title: "Vanguard Legal Partners | Commercial Litigation & Corporate Advisory",
        slug: "/",
        status: "published",
        description: "Sophisticated legal counsel protecting enterprise assets, business transactions, and regulatory compliance.",
      },
      sections: [
        {
          id: "sec_header",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Vanguard Legal Partners",
            ctaLabel: "Schedule Consultation",
            ctaHref: "#contact",
            phone: "(512) 555-0188",
          },
        },
        {
          id: "sec_hero",
          componentId: "hero.split.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Trusted Counsel Since 2004",
            title: "Strategic Legal & Corporate Counsel for High-Stakes Matters",
            description: "We represent commercial enterprises, institutional investors, and founders navigating mergers, regulatory compliance, and complex civil litigation.",
            primaryButtonLabel: "Request Confidential Consultation",
            primaryButtonHref: "#contact",
            secondaryButtonLabel: "Call (512) 555-0188",
            secondaryButtonHref: "tel:5125550188",
            imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
            badgeText: "AV-Preeminent Rated · Over $450M in Protected Transactions",
            variant: "split",
          },
        },
        {
          id: "sec_features",
          componentId: "features.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Our Core Standards",
            title: "Guiding Principles of Our Legal Practice",
            subtitle: "Uncompromising diligence, fiduciary integrity, and clear strategic roadmaps.",
            columns: "3",
          },
        },
        {
          id: "sec_services",
          componentId: "services.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Practice Areas",
            title: "Comprehensive Legal Capabilities",
            subtitle: "Focused expertise across commercial law, securities, and dispute resolution.",
            columns: "3",
            cardStyle: "boxed",
            services: [
              {
                title: "Mergers & Acquisitions",
                description: "End-to-end deal structuring, due diligence, and contract negotiation for mid-market acquisitions.",
                icon: "award",
              },
              {
                title: "Corporate Governance & Compliance",
                description: "Fiduciary oversight, board advisory, and regulatory alignment across state and federal jurisdictions.",
                icon: "check",
              },
              {
                title: "Commercial Dispute Litigation",
                description: "Vigorous courtroom representation and alternative arbitration for complex breach-of-contract matters.",
                icon: "clock",
              },
            ],
          },
        },
        {
          id: "sec_about",
          componentId: "about.split.v1",
          componentVersion: 1,
          props: {
            eyebrow: "About the Firm",
            title: "Two Decades of Protecting Business Interests",
            description: "Founded by former senior federal prosecutors and corporate general counsel, Vanguard Legal brings relentless analytical rigor to every engagement.",
            imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
            imagePosition: "right",
          },
        },
        {
          id: "sec_cta",
          componentId: "cta.banner.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Need Strategic Counsel?",
            title: "Speak in Confidence with a Senior Partner Today",
            description: "All inquiries are protected by strict attorney-client confidentiality.",
            primaryButtonLabel: "Request Case Evaluation",
            primaryButtonHref: "#contact",
            secondaryButtonLabel: "Call (512) 555-0188",
            secondaryButtonHref: "tel:5125550188",
            variant: "dark",
          },
        },
        {
          id: "sec_contact",
          componentId: "contact.form.v1",
          componentVersion: 1,
          props: {
            title: "Confidential Case Inquiry",
            subtitle: "Submit your matter details below and our managing partner will review them within 2 hours.",
            phone: "(512) 555-0188",
            email: "counsel@vanguardlegal.com",
            address: "500 W 2nd St, Suite 1900, Austin, TX 78701",
          },
        },
        {
          id: "sec_footer",
          componentId: "footer.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Vanguard Legal Partners",
            brandDescription: "Commercial litigation and enterprise transaction advisory.",
            copyright: `© ${new Date().getFullYear()} Vanguard Legal Partners LLP. All rights reserved.`,
          },
        },
      ],
    },
  ],
};

