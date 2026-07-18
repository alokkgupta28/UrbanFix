import p1 from "@/assets/providers/p1.jpg";
import p2 from "@/assets/providers/p2.jpg";
import p3 from "@/assets/providers/p3.jpg";
import p4 from "@/assets/providers/p4.jpg";
import p5 from "@/assets/providers/p5.jpg";
import p6 from "@/assets/providers/p6.jpg";
import p7 from "@/assets/providers/p7.jpg";
import p8 from "@/assets/providers/p8.jpg";
import p9 from "@/assets/providers/p9.jpg";
import p10 from "@/assets/providers/p10.jpg";
import p11 from "@/assets/providers/p11.jpg";
import p12 from "@/assets/providers/p12.jpg";
import hero from "@/assets/hero.jpg";
import heroEditorial from "@/assets/hero-editorial.jpg";

export const heroImage = hero;
export const heroEditorialImage = heroEditorial;

export const providerAvatars: Record<string, string> = {
  p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12,
};

export function providerAvatar(key: string): string {
  return providerAvatars[key] ?? p1;
}
