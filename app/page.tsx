import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { PlatformMetrics } from "@/components/sections/PlatformMetrics";
import { TechStack } from "@/components/sections/TechStack";
import { Writing } from "@/components/sections/Writing";
import { AIMultiplier } from "@/components/sections/AIMultiplier";
import { OpenTo } from "@/components/sections/OpenTo";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <CaseStudies />
      <PlatformMetrics />
      <TechStack />
      <Writing />
      <AIMultiplier />
      <OpenTo />
      <Contact />
    </>
  );
}
