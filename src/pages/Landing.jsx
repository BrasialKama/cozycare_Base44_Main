import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import TrustPillars from '@/components/landing/TrustPillars';
import FeaturedNannies from '@/components/landing/FeaturedNannies';
import CTABanner from '@/components/landing/CTABanner';

export default function Landing() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TrustPillars />
      <FeaturedNannies />
      <CTABanner />
    </div>
  );
}