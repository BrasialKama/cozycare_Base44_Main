import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CTABanner() {
  return (
    <section className="py-20 bg-primary/5 border-y border-primary/10">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Ready to find the right nanny for your family?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Browse freely, no account needed. When you're ready to message or book,
          we'll guide you through a quick, warm sign-up.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            className="h-14 px-10 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/FindNannies">Find Your Nanny</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-14 px-10 text-lg border-border hover:border-secondary/50 hover:bg-secondary/5"
          >
            <Link to="/NannyOnboarding">I'm a Nanny</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}