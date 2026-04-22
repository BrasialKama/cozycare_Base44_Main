import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Heart, Baby, Sparkles, ArrowRight, ArrowLeft, Shield, Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const TRUST_POINTS = [
  { icon: Shield, text: 'Svaka dadilja provjerena' },
  { icon: Star, text: 'Stvarne recenzije obitelji' },
  { icon: CheckCircle2, text: 'Provjerene reference' },
];

const VALID_INTENTS = ['parent', 'nanny'];

export default function Onboarding() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get('intent');

  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState(null);
  const [autoApplying, setAutoApplying] = useState(false);

  // Auth check — preserve intent in returnUrl when redirecting to login
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) {
      const qs = intent ? `?intent=${encodeURIComponent(intent)}` : '';
      navigateToLogin(window.location.origin + '/Onboarding' + qs);
      return;
    }
    setCheckingAuth(false);
  }, [isLoadingAuth, isAuthenticated, intent]);

  // Auto-apply intent if present and valid
  useEffect(() => {
    if (checkingAuth || autoApplying || !user) return;
    if (!VALID_INTENTS.includes(intent)) return;

    setAutoApplying(true);
    (async () => {
      try {
        await base44.functions.invoke('setUserRole', {
          role: intent,
          display_name: user?.full_name || '',
        });
        // Refresh local user state so downstream pages see the new role
        await refreshUser();
        // If a returnTo URL was provided (e.g. from BookNanny role guard), honor it.
        // Otherwise, route to the role's natural destination.
        const returnTo = searchParams.get('returnTo');
        if (returnTo && returnTo.startsWith('/')) {
          navigate(returnTo, { replace: true });
        } else {
          navigate(intent === 'parent' ? '/FamilySettings' : '/NannyOnboarding', { replace: true });
        }
      } catch (err) {
        console.error('Intent auto-apply failed:', err);
        setError('Došlo je do greške pri postavljanju računa. Odaberite opciju ispod.');
        setAutoApplying(false);
      }
    })();
  }, [checkingAuth, intent, user, navigate, autoApplying]);

  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError(null);
    try {
      await base44.functions.invoke('setUserRole', {
        role: selectedRole,
        display_name: user?.full_name || '',
      });
      // Refresh local user state before navigating so the next page sees the new role
      await refreshUser();
      // Honor returnTo if provided
      const returnTo = searchParams.get('returnTo');
      if (returnTo && returnTo.startsWith('/')) {
        navigate(returnTo, { replace: true });
      } else {
        navigate(selectedRole === 'parent' ? '/FamilySettings' : '/NannyOnboarding');
      }
    } catch (err) {
      console.error('Role setup failed:', err);
      setError('Došlo je do greške pri postavljanju računa. Pokušajte ponovo.');
      setLoading(false);
    }
  };

  if (isLoadingAuth || checkingAuth || autoApplying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-body">
            {autoApplying ? 'Postavljanje računa…' : 'Učitavanje...'}
          </p>
        </div>
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
        className="w-full max-w-md relative"
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Natrag
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-peach/60 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/10">
            <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
            Dobrodošli u<br />
            <span className="text-primary italic">CozyCare</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-xs mx-auto">
            Toplo i pouzdano mjesto gdje obitelji pronalaze dadilje koje vole.
          </p>
        </div>

        <div className="flex justify-center gap-5 mb-10">
          {TRUST_POINTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-1.5 text-center max-w-[5.5rem]">
              <div className="w-9 h-9 rounded-xl bg-card border border-border/60 shadow-sm flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary/70" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-7">
          <div className="flex-1 h-px bg-border/60" />
          <Sparkles className="w-3.5 h-3.5 text-primary/30" />
          <div className="flex-1 h-px bg-border/60" />
        </div>

        <p className="text-center text-sm font-semibold text-foreground mb-4">Kako nam se pridružujete?</p>

        <div className="space-y-3 mb-7">
          {[
            {
              id: 'parent',
              emoji: '🏡',
              title: 'Tražim dadilju',
              description: 'Za obitelji koje traže pouzdanu skrb za svoju djecu.',
              bullets: [
                'Pregledajte provjerene dadilje u vašem kvartu',
                'Rezervirajte termine i dogovorite se izravno',
                'Ostavite recenzije nakon završene rezervacije',
              ],
              bg: selectedRole === 'parent' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border/60 bg-card hover:border-primary/25',
            },
            {
              id: 'nanny',
              emoji: '💛',
              title: 'Ja sam dadilja',
              description: 'Za dadilje koje žele raditi s provjerenim obiteljima.',
              bullets: [
                'Izgradite profil i predstavite svoje iskustvo',
                'Primajte rezervacije od obitelji u vašem području',
                'Profil pregledava CozyCare tim prije objave',
              ],
              bg: selectedRole === 'nanny' ? 'border-sage bg-sage/10 shadow-md shadow-sage/10' : 'border-border/60 bg-card hover:border-sage/40',
            },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${role.bg}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-light/80 to-peach/60 flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
                  {role.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-foreground">{role.title}</h3>
                    {selectedRole === role.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{role.description}</p>
                  <ul className="mt-2 space-y-1">
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
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 px-4 py-3 rounded-xl mb-4">
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          className="w-full h-13 font-semibold text-base rounded-2xl shadow-lg shadow-primary/20"
          style={{ height: '3.25rem' }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Postavljanje računa…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Započni
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
          Pridruživanjem prihvaćate naše uvjete. Sigurnost vaše obitelji nam je prioritet.
        </p>
      </motion.div>
    </div>
  );
}