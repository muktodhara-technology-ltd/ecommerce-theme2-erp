import type { Metadata } from "next";
import { HeritagePage } from "@/components/HeritagePage";

export const metadata: Metadata = {
  title: "Revitalization",
  description: "Intangible Heritage Products Deshojo Bazar.",
};

const cards = [
  "Traditional food knowledge",
  "Craft and making traditions",
  "Regional stories and techniques",
  "Community-led heritage preservation",
];

export default function RevitalizationPage() {
  return (
    <HeritagePage
      eyebrow="Revitalization • Intangible Heritage"
      title="Revitalization"
      description="Intangible Heritage Products"
      kicker="Intangible heritage"
      heading="Intangible Heritage Products"
      intro="Revitalization is a dedicated space for intangible heritage products crafts, food traditions, techniques, stories and cultural knowledge that live through people and practice."
      cta="Explore heritage products →"
      cards={cards}
      bandTitle="Keep heritage alive through living practice."
      bandText="Revitalization connects products with the traditions, skills and cultural knowledge that give them meaning."
    />
  );
}
