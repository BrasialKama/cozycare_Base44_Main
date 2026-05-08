import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function CTABanner() {
  const { user } = useAuth();
  return (
    <section className="py-20 bg-primary/5 border-y border-primary/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Spremni pronaći dadilju kojoj stvarno vjerujete?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Pregledavajte slobodno, račun nije potreban. Kada budete spremni za poruku ili rezervaciju,
          provest ćemo vas kroz brzu i jednostavnu registraciju. Jer vaš mir je naša briga.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            className="h-14 px-10 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/FindNannies">Pronađi dadilju kojoj vjeruješ</Link>
          </Button>
          {!user && (
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-14 px-10 text-lg border-border hover:border-secondary/50 hover:bg-secondary/5"
            >
              <Link to="/Join?for=nanny">Ja sam dadilja</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}