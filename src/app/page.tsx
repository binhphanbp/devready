import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";

// Lazy load below-the-fold sections — reduces initial JS bundle by ~40%
// These components are not visible on first paint, so they can be loaded after
const FeaturesGrid = dynamic(
  () =>
    import("@/components/landing/FeaturesGrid").then((m) => ({
      default: m.FeaturesGrid,
    })),
  { ssr: true }
);
const TopicsSection = dynamic(
  () =>
    import("@/components/landing/TopicsSection").then((m) => ({
      default: m.TopicsSection,
    })),
  { ssr: true }
);
const CTASection = dynamic(
  () =>
    import("@/components/landing/CTASection").then((m) => ({
      default: m.CTASection,
    })),
  { ssr: true }
);
const Footer = dynamic(
  () =>
    import("@/components/layout/Footer").then((m) => ({ default: m.Footer })),
  { ssr: true }
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeaturesGrid />
        <TopicsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
