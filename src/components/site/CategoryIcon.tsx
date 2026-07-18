import {
  Zap, Droplets, Sparkles, Hammer, PaintRoller, Scissors,
  GlassWater, Wind, Wrench, Bug, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  electrician: Zap,
  plumber: Droplets,
  cleaning: Sparkles,
  carpenter: Hammer,
  painter: PaintRoller,
  salon: Scissors,
  ro: GlassWater,
  ac: Wind,
  appliance: Wrench,
  pest: Bug,
};

export function CategoryIcon({
  iconKey,
  className,
}: {
  iconKey: string;
  className?: string;
}) {
  const Icon = map[iconKey] ?? Zap;
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}
