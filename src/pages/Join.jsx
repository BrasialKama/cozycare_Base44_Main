import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import {
  Heart, ArrowLeft, ArrowRight, Shield, Star, CheckCircle2, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const TRUST_POINTS = [
  { icon: Shield, text: 'Svaka dadilja provjerena' },
  { icon: Star, text: 'Stvarne recenzije obitelji' },
  { icon: CheckCircle2, text: 'Provjerene reference' },
];

const ROLES = {
  parent: {
    id: 'parent',
    emoji: '🏡',
    title: 'Tražim dadilju',
    subtitle: 'Za obitelji koje traže pouzdanu skrb za svoju djecu.',
    bullets: [
      'Pregledajte provjerene dadilje u vašem kvartu',
      'Rezervirajte termine i dogovorite se izravno',
      'Ostavite recenzije nakon završene rezervacije',
    ],
    accent: 'primary',
  },
  nanny: {
    id: 'nanny',
    emoji: '💛',
    title: 'Ja sam dadilja',
    subtitle: 'Za dadilje koje žele raditi s provjerenim obiteljima.',
    bullets: [
      'Izgradite profil i predstavite svoje iskustvo',
      'Primajte rezervacije od obitelji u vašem području',
      'Profil pregledava CozyCare tim prije objave',
    ],
    accent: 'sage',
  },
};

function RoleCard({ role, onSelect }) {
  const accentClasses =
    role.accent === 'sage'
      ? 'border-border/60 hover:border-sage/50 hover:bg-sage/5'
      : 'border-border/60 hover:border-primary/40 hover:bg-primary/5';

  return (
    <button
      type="button"
      onClick={() => onSelect(role.id)}
      className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 bg-card ${accentClasses}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-light/80 to-peach/60 flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
          {role.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-bold text-lg text-foreground">{role.title}</h3>
            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{role.subtitle}</p>
          <ul className="mt-3 space-y-1.5">
            {role.bullets.map((b) => (
              <li key={b} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-primary/40 flex-shrink-0 mt-1.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
}

export default function Join() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forFilter = searchParams.get('for'); // 'nanny' or null

  // If user is already authenticated with a role, send them where they actually belong.
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated || !user) return;
    if (user.role === 'admin') {
      navigate('/AdminDashboard', { replace: true });
    } else if (user.role === 'nanny') {
      navigate('/NannyPortal', { replace: true });
    } else if (user.role === 'parent') {
      navigate('/Home', { replace: true });
    }
    // Users with role='user' or no role fall through to role-selection cards below
  }, [isLoadingAuth, isAuthenticated, user, navigate]);

  const handleSelect = (role) => {
    const returnUrl = `${window.location.origin}/Onboarding?intent=${encodeURIComponent(role)}`;
    if (!isAuthenticated) {
      navigateToLogin(returnUrl);
    } else {
      // Authenticated but role not set yet — go straight to /Onboarding with intent
      navigate(`/Onboarding?intent=${encodeURIComponent(role)}`);
    }
  };

  const isNannyOnly = forFilter === 'nanny';
  const rolesToShow = isNannyOnly ? [ROLES.nanny] : [ROLES.parent, ROLES.nanny];

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-rose-light/30 flex items-center justify-center p-4">
      <div className="fixed -top-32 -right-32 w-96 h-96 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 -left-24 w-80 h-80 rounded-full bg-sage/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg relative"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Natrag na početnu
        </Link>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-peach/60 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/10">
            <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          </div>
          {isNannyOnly ? (
            <>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Postanite <span className="text-primary italic">CozyCare dadilja</span>
              </h1>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-sm mx-auto">
                Pridružite se zajednici dadilja koje obitelji vole. Registracija traje nekoliko minuta,
                a profil odobravamo unutar 24–48 sati.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Dobrodošli u<br />
                <span className="text-primary italic">CozyCare</span>
              </h1>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-sm mx-auto">
                Toplo i pouzdano mjesto gdje obitelji pronalaze dadilje koje vole.
                Odaberite kako nam se pridružujete.
              </p>
            </>
          )}
        </div>

        {/* Trust row — only on the general view, not the nanny-only view */}
        {!isNannyOnly && (
          <>
            <div className="flex justify-center gap-5 mb-8">
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 text-center max-w-[5.5rem]">
                  <div className="w-9 h-9 rounded-xl bg-card border border-border/60 shadow-sm flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary/70" />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border/60" />
              <Sparkles className="w-3.5 h-3.5 text-primary/30" />
              <div className="flex-1 h-px bg-border/60" />
            </div>
          </>
        )}

        <div className="space-y-3 mb-6">
          {rolesToShow.map((role) => (
            <RoleCard key={role.id} role={role} onSelect={handleSelect} />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {isNannyOnly ? (
            <>Već ste registrirani kao dadilja? <button onClick={() => navigateToLogin()} className="text-primary hover:underline font-medium">Prijavite se</button></>
          ) : (
            <>Već imate račun? <button onClick={() => navigateToLogin()} className="text-primary hover:underline font-medium">Prijavite se</button></>
          )}
        </p>

        <p className="text-center text-[11px] text-muted-foreground/70 mt-4 leading-relaxed max-w-xs mx-auto">
          Sigurnost vaše obitelji nam je prioritet. Račun kreirate tek nakon što odaberete opciju.
        </p>
      </motion.div>
    </div>
  );
}