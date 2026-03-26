import { Link } from '@tanstack/react-router';
import { Heart, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <span className="font-serif text-lg font-bold text-foreground">CozyCare</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              A boutique childcare marketplace. Every nanny on CozyCare is ID verified, background checked, and reference reviewed.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">For Parents</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/nannies" className="text-sm text-muted-foreground hover:text-primary">Search Nannies</Link></li>
              <li><Link to="/nannies" className="text-sm text-muted-foreground hover:text-primary">Trust & Safety</Link></li>
              <li><Link to="/nannies" className="text-sm text-muted-foreground hover:text-primary">Family Stories</Link></li>
              <li><Link to="/auth/choose" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">For Nannies</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/auth/choose?role=nanny" className="text-sm text-muted-foreground hover:text-primary">Apply as a Nanny</Link></li>
              <li><Link to="/nanny/onboarding" className="text-sm text-muted-foreground hover:text-primary">Verification Process</Link></li>
              <li><Link to="/nanny/dashboard" className="text-sm text-muted-foreground hover:text-primary">Nanny Community</Link></li>
              <li><Link to="/nanny/onboarding" className="text-sm text-muted-foreground hover:text-primary">Resources</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/auth/choose" className="text-sm text-muted-foreground hover:text-primary">Help Center</Link></li>
              <li><Link to="/auth/choose" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CozyCare Boutique Childcare. Made with love for families.
          </p>
        </div>
      </div>
    </footer>
  );
}
