import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Partner } from "@/components/sections/Partner";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Feature } from "@/components/sections/Feature";
import { Benefit } from "@/components/sections/Benefit";
import { MarketplacePreview } from "@/components/sections/MarketplacePreview";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { Transparency } from "@/components/sections/Transparency";
import { Stats } from "@/components/sections/Stats";
import { Testimonial } from "@/components/sections/Testimonial";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <Hero />
      <Partner />
      <Problem />
      <Solution />
      <HowItWorks />
      <Feature />
      <Benefit />
      <MarketplacePreview />
      <DashboardPreview />
      <Transparency />
      <Stats />
      <Testimonial />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
