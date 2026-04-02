import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import SafetySection from '@/components/landing/SafetySection';
import TrustPillars from '@/components/landing/TrustPillars';
import Testimonials from '@/components/landing/Testimonials';
import FeaturedNannies from '@/components/landing/FeaturedNannies';
import CTABanner from '@/components/landing/CTABanner';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  return (
    <div className="flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-hidden">
      <LandingHeader />
      <HeroSection />
      <HowItWorks />
      <SafetySection />
      <TrustPillars />
      <Testimonials />
      <FeaturedNannies />
      <CTABanner />
      <LandingFooter />
    </div>
  );
}