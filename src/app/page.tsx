import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { TopicsSection } from "@/components/landing/TopicsSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
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
