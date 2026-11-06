"use client";

import React, { useState } from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import { sanitizeFooterImageUrl } from "@/components/website/footer/shared/footer-url";

export const TeamMemberSchema = z.object({
  name: z.string().default("Team Member"),
  role: z.string().default("Role / Position"),
  imageUrl: z.string().default(""),
  bio: z.string().default("Short introduction covering experience and what this person handles."),
});

export const TeamGridPropsSchema = z.object({
  eyebrow: z.string().default("Meet The Team"),
  title: z.string().default("The People Behind Every Great Project"),
  subtitle: z.string().default(
    "Qualified, background-checked professionals who treat your property like their own."
  ),
  columns: z.enum(["2", "3", "4"]).default("3"),
  members: z
    .array(TeamMemberSchema)
    .default([
      {
        name: "Jordan Ellis",
        role: "Founder & Lead Technician",
        imageUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        bio: "20 years on the tools. Oversees quality control on every job and trains the crew.",
      },
      {
        name: "Priya Raman",
        role: "Operations Manager",
        imageUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        bio: "Keeps schedules tight and customers informed from first call to final walkthrough.",
      },
      {
        name: "Marcus Reed",
        role: "Senior Project Specialist",
        imageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
        bio: "Handles complex installs and upgrades with a clean, code-compliant finish every time.",
      },
    ]),
});

export type TeamGridProps = z.infer<typeof TeamGridPropsSchema>;

const initialsFor = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

const cardChrome = () => ({
  backgroundColor: "var(--color-card-bg, #FFFFFF)",
  borderColor: "var(--color-border, #E1EAE4)",
  borderRadius: "var(--radius-card, 16px)",
  boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
});

interface MemberCardProps {
  member: TeamGridProps["members"][number];
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const [failed, setFailed] = useState(false);
  const source = sanitizeFooterImageUrl(member.imageUrl);

  return (
    <div
      className="shrink-0 min-w-[150px] sm:min-w-[170px] border flex flex-col"
      style={cardChrome()}
    >
      <div className="overflow-hidden" style={{ borderRadius: "var(--radius-card, 12px)" }}>
        <div
          className="w-full h-24 sm:h-28 overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: "var(--color-primary-soft, #DDF3E8)" }}
        >
          {source && !failed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={source}
              alt={member.name}
              loading="lazy"
              onError={() => setFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{ color: "var(--color-primary, #087A55)" }}
            >
              {initialsFor(member.name) || "TM"}
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 space-y-1 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-text-primary break-words">
          {member.name}
        </h3>
        <p
          className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider break-words"
          style={{ color: "var(--color-accent, var(--color-primary, #087A55))" }}
        >
          {member.role}
        </p>
        {member.bio && (
          <p className="text-[10px] sm:text-xs text-text-secondary leading-relaxed line-clamp-2">
            {member.bio}
          </p>
        )}
      </div>
    </div>
  );
};

export const TeamGrid: React.FC<TeamGridProps> = ({
  eyebrow,
  title,
  subtitle,
  columns = "3",
  members = [],
}) => {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 max-w-7xl mx-auto transition-colors">
      <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-10 space-y-2">
        {eyebrow && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              color: "var(--color-accent, var(--color-primary, #087A55))",
              backgroundColor: "var(--color-primary-soft, #DDF3E8)",
            }}
          >
            <span>{eyebrow}</span>
          </div>
        )}
        <h2
          className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words"
          style={{
            color: "var(--color-heading, var(--color-text-primary, #172B24))",
            fontFamily: "var(--font-heading, inherit)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{subtitle}</p>
        )}
      </div>

      {/* Single container: mobile/tablet = horizontal scroll flex row,
          desktop (md+) = grid. Cards stay small on all screens. */}
      <div className="overflow-x-auto pb-4">
        <div
          className={`flex gap-3 min-w-fit md:flex-none md:grid gap-4 sm:gap-5 ${
            columns === "2"
              ? "md:grid-cols-2"
              : columns === "4"
                ? "md:grid-cols-4"
                : "md:grid-cols-3"
          }`}
        >
          {members.map((member, index) => (
            <MemberCard key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const teamGridDefinition: ComponentDefinition<TeamGridProps> = {
  id: "team.grid.v1",
  name: "Team & Staff",
  category: "content",
  version: 1,
  schema: TeamGridPropsSchema,
  defaults: TeamGridPropsSchema.parse({}),
  component: TeamGrid,
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
      { propName: "members", label: "Team Members", type: "list" },
    ],
  },
};
