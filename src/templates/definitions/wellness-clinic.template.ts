import { TemplateDefinition } from "../types";
import { cleanTealPreset } from "@/themes/presets";

export const wellnessClinicTemplate: TemplateDefinition = {
  id: "template-wellness-clinic",
  name: "Lumina Dental & Medical Spa",
  slug: "lumina-clinic",
  category: "medical",
  description: "Tranquil, high-trust presentation for dental practices, wellness clinics, medical spas, and holistic healthcare providers.",
  thumbnailUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80",
  theme: cleanTealPreset,
  navigation: [
    { label: "Home", href: "/" },
    { label: "Treatments", href: "/services" },
    { label: "Doctors", href: "/about" },
    { label: "Appointments", href: "/contact" },
  ],
  pages: [
    {
      schemaVersion: 1,
      page: {
        id: "page_home",
        title: "Lumina Dental & Aesthetics | Gentle Modern Healthcare Austin",
        slug: "/",
        status: "published",
        description: "Comprehensive aesthetic dentistry, restorative care, and modern wellness in a calm spa atmosphere.",
      },
      sections: [
        {
          id: "sec_header",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Lumina Dental & Spa",
            ctaLabel: "Book Appointment",
            ctaHref: "#contact",
            phone: "(512) 555-0177",
          },
        },
        {
          id: "sec_hero",
          componentId: "hero.split.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Compassionate, Gentle Healthcare",
            title: "Modern Dental & Aesthetic Care in Austin",
            description: "Experience pain-free dentistry, advanced cosmetic smile design, and physician-supervised aesthetic treatments designed around your comfort.",
            primaryButtonLabel: "Schedule First Visit",
            primaryButtonHref: "#contact",
            secondaryButtonLabel: "Explore Treatments",
            secondaryButtonHref: "#services",
            imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80",
            badgeText: "Accepting New Patients · Most PPO Dental Plans Accepted",
            variant: "split",
          },
        },
        {
          id: "sec_features",
          componentId: "features.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "The Patient Experience",
            title: "Healthcare Designed to Help You Relax",
            subtitle: "Heated massage chairs, noise-canceling headphones, and digital low-radiation imaging.",
            columns: "3",
          },
        },
        {
          id: "sec_services",
          componentId: "services.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Clinical Services",
            title: "Personalized Dental & Wellness Offerings",
            subtitle: "State-of-the-art diagnostic technology combined with compassionate bedside care.",
            columns: "3",
            cardStyle: "boxed",
            services: [
              {
                title: "Cosmetic Veneers & Whitening",
                description: "Digital smile mapping and porcelain veneers tailored to your facial structure.",
                icon: "sparkles",
              },
              {
                title: "Gentle Preventative Hygiene",
                description: "Thorough ultrasonic cleanings and periodontal care to safeguard oral health.",
                icon: "shield",
              },
              {
                title: "Sedation & Pain-Free Restorations",
                description: "Relaxation protocols and same-day dental crowns engineered with zero stress.",
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
            eyebrow: "Meet Our Clinical Director",
            title: "Gentle Dentistry Backed by 16+ Years of Experience",
            description: "Dr. Amanda Wright and her dedicated clinical team combine Ivy League training with a gentle touch to eliminate dental anxiety.",
            imageUrl: "https://images.unsplash.com/photo-1594824813576-59a184132c32?auto=format&fit=crop&w=800&q=80",
            imagePosition: "left",
          },
        },
        {
          id: "sec_gallery",
          componentId: "gallery.grid.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Smile Gallery",
            title: "Real Patient Smile Transformations",
            subtitle: "Before and after results showcasing our cosmetic dental restorations.",
            columns: "3",
            aspectRatio: "square",
          },
        },
        {
          id: "sec_testimonials",
          componentId: "testimonials.cards.v1",
          componentVersion: 1,
          props: {
            eyebrow: "Patient Reviews",
            title: "Why Our Patients Love Visiting Lumina",
            testimonials: [
              {
                quote: "I avoided the dentist for 7 years due to phobia. Dr. Wright and her team made me feel completely at ease. Zero pain.",
                authorName: "Jessica Morales",
                authorRole: "Patient since 2021",
                rating: 5,
              },
              {
                quote: "The office feels like a luxury resort, not a dental clinic. My smile veneers turned out completely natural.",
                authorName: "David Thornton",
                authorRole: "Patient since 2023",
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
            eyebrow: "New Patient Special Offer",
            title: "Comprehensive Exam, Digital X-Rays & Consultation",
            description: "Book your appointment online today. Includes full 3D imaging and personalized treatment plan.",
            primaryButtonLabel: "Claim New Patient Special",
            primaryButtonHref: "#contact",
            secondaryButtonLabel: "Call (512) 555-0177",
            secondaryButtonHref: "tel:5125550177",
            variant: "brand",
          },
        },
        {
          id: "sec_contact",
          componentId: "contact.form.v1",
          componentVersion: 1,
          props: {
            title: "Schedule Your Visit",
            subtitle: "Fill out the appointment request form below. We will confirm your preferred time within 2 hours.",
            phone: "(512) 555-0177",
            email: "care@luminaclinic.com",
            address: "1200 S Lamar Blvd, Austin, TX 78704",
          },
        },
        {
          id: "sec_footer",
          componentId: "footer.simple.v1",
          componentVersion: 1,
          props: {
            brandName: "Lumina Dental & Medical Spa",
            brandDescription: "Gentle dental aesthetics and modern wellness clinic.",
            copyright: `© ${new Date().getFullYear()} Lumina Dental Spa. All rights reserved.`,
          },
        },
      ],
    },
  ],
};

