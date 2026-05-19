'use client';

import Navbar from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/hero';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowToUseSection } from '@/components/landing/HowToUseSection';
import Discover from '@/components/landing/features-section-demo-3';
import { Testimonials } from '@/components/landing/Testimonials';
import FAQWithSpiral from '@/components/landing/faq-section';
import Cta from '@/components/cta';
import { Footerdemo } from '@/components/ui/footer-section';

export default function Home() {
  return (
    <div className="landing-page bg-background text-foreground">
      <Navbar className="top-5" />
      <Hero />
      <FeaturesSection />
      <HowToUseSection />
      <Discover />
      <Testimonials />
      <FAQWithSpiral />
      <Cta />
      <Footerdemo />
    </div>
  );
}
