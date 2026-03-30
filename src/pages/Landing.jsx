import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import TrustPillars from '@/components/landing/TrustPillars';
import FeaturedNannies from '@/components/landing/FeaturedNannies';
import CTABanner from '@/components/landing/CTABanner';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  return (
    <div className="flex flex-col">
      <LandingHeader />
      <HeroSection />
      <HowItWorks />
      <TrustPillars />
      <FeaturedNannies />
      <CTABanner />
      <LandingFooter />
    </div>
  );
}