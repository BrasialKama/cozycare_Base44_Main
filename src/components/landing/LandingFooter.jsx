import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

function FooterSection({ title, links }) {
  return (
    <div>
      <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground mb-4">{title}</h4>
      <ul className="space-y-3">
        {links.map(({ label }) => (
          <li key={label}>
            <span className="text-sm text-muted-foreground opacity-50 cursor-default">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LandingFooter() {
  return (
    <footer className="bg-muted/40 border-t border-border/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top area: logo + description + socials */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/90 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">CozyCare</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-5">
            Boutique tržište za čuvanje djece. Svaka dadilja na CozyCare-u ima potvrđen identitet, provjeru pozadine i provjerene reference.
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-4 opacity-50">
            <span aria-label="Instagram" className="text-muted-foreground cursor-default">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span aria-label="Facebook" className="text-muted-foreground cursor-default">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </span>
            <span aria-label="Twitter" className="text-muted-foreground cursor-default">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
          <FooterSection
            title="Za roditelje"
            links={[
              { label: 'Pretraži dadilje', to: '/FindNannies' },
              { label: 'Povjerenje i sigurnost', to: '/SafetyCenter' },
              { label: 'Priče obitelji', to: '/' },
              { label: 'Cijene', to: '/' },
            ]}
          />
          <FooterSection
            title="Za dadilje"
            links={[
              { label: 'Prijavi se kao dadilja', to: '/NannyOnboarding' },
              { label: 'Postupak verifikacije', to: '/SafetyCenter' },
              { label: 'Zajednica dadilja', to: '/' },
              { label: 'Resursi', to: '/' },
            ]}
          />
          <FooterSection
            title="Podrška"
            links={[
              { label: 'Centar za pomoć', to: '/' },
              { label: 'Kontaktirajte nas', to: '/' },
              { label: 'Pravila privatnosti', to: '/' },
              { label: 'Uvjeti korištenja', to: '/' },
            ]}
          />
        </div>

        {/* Bottom */}
        <div className="border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CozyCare. Sva prava pridržana. Napravljeno s ljubavlju za zagrebačke obitelji.
          </p>
        </div>
      </div>
    </footer>
  );
}