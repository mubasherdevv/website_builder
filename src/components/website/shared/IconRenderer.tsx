/* eslint-disable @next/next/no-img-element */
import React from "react";
import {
  Wrench,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Lock,
  Headphones,
  CheckCircle,
  Award,
  Star,
  Heart,
  Phone,
  Mail,
  MapPin,
  Truck,
  Camera,
  Flame,
  DollarSign,
  Settings,
  Users,
  Calendar,
  Search,
  Compass,
  HelpCircle,
  Activity,
  Layers,
  Globe,
  Coffee,
  Briefcase,
  Building,
  Cpu,
  Scissors,
  Utensils,
  Hammer,
  Paintbrush,
  Sun,
  Moon,
  Droplets,
  Smile,
  ThumbsUp,
  Home,
  ShoppingBag,
  BadgeCheck,
  FileText,
  Key,
  Rocket,
} from "lucide-react";

export const ICON_REGISTRY: Record<string, React.ComponentType<{ className?: string }>> = {
  wrench: Wrench,
  tool: Wrench,
  hammer: Hammer,
  paintbrush: Paintbrush,
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  verified: BadgeCheck,
  badgecheck: BadgeCheck,
  zap: Zap,
  lightning: Zap,
  flash: Zap,
  clock: Clock,
  time: Clock,
  fast: Clock,
  sparkles: Sparkles,
  ai: Sparkles,
  magic: Sparkles,
  lock: Lock,
  security: Lock,
  key: Key,
  support: Headphones,
  headphones: Headphones,
  headset: Headphones,
  check: CheckCircle,
  checkcircle: CheckCircle,
  guarantee: Award,
  award: Award,
  trophy: Award,
  star: Star,
  rating: Star,
  heart: Heart,
  like: Heart,
  phone: Phone,
  call: Phone,
  mail: Mail,
  email: Mail,
  mappin: MapPin,
  location: MapPin,
  map: MapPin,
  truck: Truck,
  delivery: Truck,
  camera: Camera,
  photo: Camera,
  flame: Flame,
  fire: Flame,
  hot: Flame,
  dollar: DollarSign,
  dollarsign: DollarSign,
  pricing: DollarSign,
  settings: Settings,
  gear: Settings,
  users: Users,
  team: Users,
  calendar: Calendar,
  date: Calendar,
  search: Search,
  compass: Compass,
  help: HelpCircle,
  helpcircle: HelpCircle,
  activity: Activity,
  pulse: Activity,
  layers: Layers,
  globe: Globe,
  web: Globe,
  coffee: Coffee,
  briefcase: Briefcase,
  work: Briefcase,
  building: Building,
  company: Building,
  cpu: Cpu,
  tech: Cpu,
  scissors: Scissors,
  salon: Scissors,
  utensils: Utensils,
  restaurant: Utensils,
  food: Utensils,
  sun: Sun,
  moon: Moon,
  droplets: Droplets,
  plumbing: Droplets,
  water: Droplets,
  smile: Smile,
  thumbsup: ThumbsUp,
  home: Home,
  house: Home,
  roofing: Home,
  shoppingbag: ShoppingBag,
  store: ShoppingBag,
  filetext: FileText,
  doc: FileText,
  rocket: Rocket,
  launch: Rocket,
};

export interface IconRendererProps {
  icon?: string;
  className?: string;
  fallback?: React.ComponentType<{ className?: string }>;
}

/**
 * Universal IconRenderer that seamlessly handles:
 * 1. Image URLs (https://..., http://..., data:image/...) or SVG assets
 * 2. Emojis and Unicode characters (🔥, ⚡, 🛡️, 🛠️, ⭐, 🚀, etc.)
 * 3. 40+ Lucide icon names (wrench, shield, star, phone, truck, flame, etc.)
 * 4. Fallback component when no match is found
 */
export const IconRenderer: React.FC<IconRendererProps> = ({
  icon = "wrench",
  className = "w-6 h-6",
  fallback: Fallback = Wrench,
}) => {
  if (!icon || icon === "none") {
    return null;
  }

  const trimmed = icon.trim();

  // 1. Custom Image / SVG URL
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("/") ||
    trimmed.endsWith(".svg") ||
    trimmed.endsWith(".png") ||
    trimmed.endsWith(".jpg") ||
    trimmed.endsWith(".webp")
  ) {
    return (
      <img
        src={trimmed}
        alt="icon"
        className={`${className} object-contain inline-block`}
        onError={(e) => {
          // If image fails to load, gracefully display fallback
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  // 2. Custom Emoji (e.g. 🛠️, ⚡, 🛡️, 🚀, ⭐, 💡, 🔥, etc.)
  // Emoji string check: contains non-ascii or emoji surrogate pairs or short length with emoji
  const isEmoji =
    /\p{Extended_Pictographic}/u.test(trimmed) ||
    /^[^\x00-\x7F]{1,4}$/.test(trimmed);

  if (isEmoji) {
    return (
      <span
        role="img"
        aria-label="custom icon"
        className="inline-flex items-center justify-center text-2xl leading-none select-none"
      >
        {trimmed}
      </span>
    );
  }

  // 3. Named Lucide Icon Lookup
  const normalized = trimmed.toLowerCase().replace(/[-_\s]/g, "");
  const Component = ICON_REGISTRY[normalized];

  if (Component) {
    return <Component className={className} />;
  }

  // 4. Fallback
  return <Fallback className={className} />;
};

