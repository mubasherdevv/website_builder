"use client";

import React, { useState } from "react";
import { IconRenderer } from "@/components/website/shared/IconRenderer";
import {
  Wrench,
  Shield,
  Zap,
  Clock,
  Sparkles,
  Lock,
  Headphones,
  Check,
  Award,
  Star,
  Phone,
  Mail,
  Truck,
  Flame,
  Home,
  Users,
  Camera,
  Heart,
  Droplets,
  DollarSign,
} from "lucide-react";

export interface IconPickerControlProps {
  label?: string;
  value: string;
  onChange: (newIcon: string) => void;
}

const PRESET_ICONS = [
  { id: "wrench", label: "Tool / Wrench", Icon: Wrench },
  { id: "shield", label: "Verified / Shield", Icon: Shield },
  { id: "zap", label: "Fast / Lightning", Icon: Zap },
  { id: "clock", label: "24/7 / Clock", Icon: Clock },
  { id: "sparkles", label: "AI / Premium", Icon: Sparkles },
  { id: "lock", label: "Security / Safe", Icon: Lock },
  { id: "support", label: "Support / Call", Icon: Headphones },
  { id: "check", label: "Guarantee / Check", Icon: Check },
  { id: "award", label: "Quality / Trophy", Icon: Award },
  { id: "star", label: "Rating / Star", Icon: Star },
  { id: "phone", label: "Phone / Contact", Icon: Phone },
  { id: "mail", label: "Email / Inbox", Icon: Mail },
  { id: "truck", label: "Delivery / Fleet", Icon: Truck },
  { id: "flame", label: "Heat / Energy", Icon: Flame },
  { id: "home", label: "Home / Property", Icon: Home },
  { id: "users", label: "Team / Staff", Icon: Users },
  { id: "camera", label: "Photo / Media", Icon: Camera },
  { id: "heart", label: "Care / Passion", Icon: Heart },
  { id: "droplets", label: "Plumbing / Pure", Icon: Droplets },
  { id: "dollar", label: "Pricing / Value", Icon: DollarSign },
];

const QUICK_EMOJIS = [
  "⚡", "🛡️", "🛠️", "🚀", "⭐", "🔥", "💡", "💼",
  "❤️", "🏆", "📱", "🏠", "🕒", "📞", "✉️", "🌐",
  "🎯", "💎", "🎨", "🥇", "🚗", "🏢", "💬", "✅"
];

export const IconPickerControl: React.FC<IconPickerControlProps> = ({
  label = "Card Icon",
  value = "wrench",
  onChange,
}) => {
  // Determine initial mode based on current value
  const isNone = value === "none" || !value;
  const isUrl = typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/"));
  const isPreset = PRESET_ICONS.some((p) => p.id === value);
  const isEmojiVal = !isNone && !isUrl && !isPreset;

  const [activeTab, setActiveTab] = useState<"preset" | "emoji" | "custom" | "none">(() => {
    if (isNone) return "none";
    if (isUrl) return "custom";
    if (isEmojiVal) return "emoji";
    return "preset";
  });

  return (
    <div className="space-y-2.5 p-3 rounded-xl border border-border bg-surface-subtle/70 shadow-2xs">
      {/* Header with Live Preview Badge */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-text-muted truncate max-w-[110px]">
            {isNone ? "None" : value}
          </span>
          <div
            className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 shadow-2xs text-brand"
            title={`Active: ${value}`}
          >
            <IconRenderer icon={value} className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Visual Mode Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-surface rounded-lg border border-border text-[11px] font-medium">
        <button
          type="button"
          onClick={() => {
            setActiveTab("preset");
            if (value === "none") onChange("wrench");
          }}
          className={`py-1 rounded text-center transition-colors cursor-pointer ${
            activeTab === "preset"
              ? "bg-brand text-white font-semibold shadow-2xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Popular
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("emoji");
            if (value === "none" || isPreset) onChange("⚡");
          }}
          className={`py-1 rounded text-center transition-colors cursor-pointer ${
            activeTab === "emoji"
              ? "bg-brand text-white font-semibold shadow-2xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Emoji
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("custom");
          }}
          className={`py-1 rounded text-center transition-colors cursor-pointer ${
            activeTab === "custom"
              ? "bg-brand text-white font-semibold shadow-2xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Custom
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("none");
            onChange("none");
          }}
          className={`py-1 rounded text-center transition-colors cursor-pointer ${
            activeTab === "none"
              ? "bg-status-danger text-white font-semibold shadow-2xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          No Icon
        </button>
      </div>

      {/* Tab 1: Popular Preset Grid */}
      {activeTab === "preset" && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-5 gap-1.5 max-h-44 overflow-y-auto p-1 bg-surface rounded-lg border border-border">
            {PRESET_ICONS.map((p) => {
              const isSelected = value === p.id;
              const IconComp = p.Icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChange(p.id)}
                  title={p.label}
                  className={`h-9 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brand text-white shadow-xs scale-95 ring-2 ring-brand ring-offset-1"
                      : "bg-surface-subtle text-text-secondary hover:text-brand hover:bg-brand-soft border border-border/50"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-text-muted block text-center">
            Click any icon to apply it instantly to this card.
          </span>
        </div>
      )}

      {/* Tab 2: Custom Emoji Picker */}
      {activeTab === "emoji" && (
        <div className="space-y-2.5 pt-1">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-text-secondary">
              Type or Paste Any Emoji:
            </label>
            <input
              type="text"
              placeholder="e.g. 🛠️, 🚀, 💎, 🏆, 🔥"
              value={isEmojiVal && !isNone ? value : ""}
              onChange={(e) => onChange(e.target.value.trim() || "⚡")}
              className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:border-brand font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-medium text-text-muted block">
              Quick Emoji Palette:
            </span>
            <div className="grid grid-cols-8 gap-1 p-1.5 bg-surface rounded-lg border border-border">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onChange(emoji)}
                  className={`h-7 text-sm rounded transition-all cursor-pointer flex items-center justify-center ${
                    value === emoji
                      ? "bg-brand-soft ring-2 ring-brand scale-105"
                      : "hover:bg-surface-subtle"
                  }`}
                  title={`Select ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Custom URL or Lucide Icon Name */}
      {activeTab === "custom" && (
        <div className="space-y-2 pt-1">
          <label className="text-[10px] font-medium text-text-secondary block">
            Enter Image / SVG URL or Lucide Icon Name:
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="https://.../icon.svg or hammer, globe, wrench"
              value={value === "none" ? "" : value}
              onChange={(e) => onChange(e.target.value.trim())}
              className="flex-1 px-3 py-1.5 text-xs rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:border-brand"
            />
            <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center shrink-0 text-brand">
              <IconRenderer icon={value} className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-text-muted leading-relaxed">
            Accepts any public image/SVG URL (<code className="text-brand">https://...</code>) or 45+ Lucide icon names (e.g. <code className="text-brand">flame</code>, <code className="text-brand">truck</code>, <code className="text-brand">star</code>).
          </p>
        </div>
      )}

      {/* Tab 4: No Icon (Clean Text Mode) */}
      {activeTab === "none" && (
        <div className="p-3 bg-surface rounded-lg border border-border text-center space-y-2">
          <p className="text-xs text-text-secondary">
            Icons are disabled for this card. Card will render in clean typographic mode.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab("preset");
              onChange("wrench");
            }}
            className="px-3 py-1 text-xs rounded-btn bg-brand-soft text-brand font-semibold hover:bg-brand hover:text-white transition-colors"
          >
            Enable an Icon
          </button>
        </div>
      )}
    </div>
  );
};

