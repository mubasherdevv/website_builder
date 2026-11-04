import React from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import { Camera } from "lucide-react";

export const GalleryGridPropsSchema = z.object({
  eyebrow: z.string().default("Recent Project Showcase"),
  title: z.string().default("Craftsmanship You Can See & Trust"),
  subtitle: z.string().default("Explore our latest completed client projects, renovations, and verified local installations."),
  columns: z.enum(["2", "3", "4"]).default("3"),
  aspectRatio: z.enum(["video", "square", "portrait"]).default("square"),
  images: z.array(z.object({
    title: z.string(),
    category: z.string(),
    imageUrl: z.string(),
  })).default([
    {
      title: "Custom Residential Bathroom Remodel",
      category: "Plumbing & Tile",
      imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Commercial High-Rise Tankless Water System",
      category: "Commercial HVAC",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Modern Minimalist Kitchen Island Setup",
      category: "Residential Fixtures",
      imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Emergency Pipe Burst Mitigation",
      category: "24/7 Restoration",
      imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Full Copper Repiping Project",
      category: "Repiping & Inspection",
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Smart Water Filtration System",
      category: "Water Quality",
      imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    },
  ]),
});

export type GalleryGridProps = z.infer<typeof GalleryGridPropsSchema>;

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  eyebrow,
  title,
  subtitle,
  columns = "3",
  aspectRatio = "square",
  images = [],
}) => {
  // Mobile (<768px): 1 column (or 2 on sm)
  // Tablet (768px-1023px): 2 columns
  // Desktop (>=1024px): 2, 3, or 4 columns
  const colClasses = {
    "2": "md:grid-cols-2",
    "3": "sm:grid-cols-2 lg:grid-cols-3",
    "4": "sm:grid-cols-2 lg:grid-cols-4",
  }[columns] || "sm:grid-cols-2 lg:grid-cols-3";

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-3/4",
  }[aspectRatio] || "aspect-square";

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto transition-colors">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-2.5">
        {eyebrow && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              color: "var(--color-accent, var(--color-primary, #087A55))",
              backgroundColor: "var(--color-primary-soft, #DDF3E8)",
            }}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{eyebrow}</span>
          </div>
        )}
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight break-words"
          style={{
            color: "var(--color-heading, var(--color-text-primary, #172B24))",
            fontFamily: "var(--font-heading, inherit)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-text-secondary font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-1 ${colClasses} gap-4 sm:gap-6`}>
        {images.map((item, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden border shadow-xs hover:shadow-lg transition-all"
            style={{
              backgroundColor: "var(--color-card-bg, #FFFFFF)",
              borderColor: "var(--color-border, #E1EAE4)",
              borderRadius: "var(--radius-card, 16px)",
              boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
            }}
          >
            <div className={`w-full overflow-hidden ${aspectClasses}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
              />
            </div>

            {/* Overlay Caption */}
            <div className="p-3.5 sm:p-4 bg-surface border-t border-border flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                {item.category}
              </span>
              <p className="font-bold text-xs sm:text-sm text-text-primary truncate mt-0.5">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const galleryGridDefinition: ComponentDefinition<GalleryGridProps> = {
  id: "gallery.grid.v1",
  name: "Photo & Case Study Gallery",
  category: "content",
  version: 1,
  schema: GalleryGridPropsSchema,
  defaults: GalleryGridPropsSchema.parse({}),
  component: GalleryGrid,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "title", label: "Title", type: "text" },
      { propName: "subtitle", label: "Subtitle", type: "textarea" },
      {
        propName: "columns",
        label: "Columns",
        type: "select",
        options: [
          { label: "2 Columns", value: "2" },
          { label: "3 Columns", value: "3" },
          { label: "4 Columns", value: "4" },
        ],
      },
      {
        propName: "aspectRatio",
        label: "Photo Aspect Ratio",
        type: "select",
        options: [
          { label: "Square (1:1)", value: "square" },
          { label: "Landscape Video (16:9)", value: "video" },
          { label: "Portrait (3:4)", value: "portrait" },
        ],
      },
      { propName: "images", label: "Photos List", type: "list" },
    ],
  },
};
