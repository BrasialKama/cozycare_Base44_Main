import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { X, Sparkles, Search, Heart, MessageCircle, User, Camera, Calendar } from 'lucide-react';

/**
 * First-run welcome card, shown once to new users on Home.
 * Content varies by role (parent / nanny). Dismissal is persisted server-side
 * via dismissWelcome so it never re-appears.
 */
export default function WelcomeCard({ role }) {
  const { refreshUser } = useAuth();
  const [dismissing, setDismissing] = useState(false);
  const [localHidden, setLocalHidden] = useState(false);

  if (localHidden) return null;

  const handleDismiss = async () => {
    setDismissing(true);
    setLocalHidden(true); // optimistic — feels instant
    try {
      await base44.functions.invoke('dismissWelcome');
      await refreshUser();
    } catch (err) {
      // Non-fatal: user already hidden locally. Log for diagnosis.
      console.error('dismissWelcome failed:', err?.message || err);
    }
  };

  const isParent = role === 'parent';

  const parentContent = {
    headline: 'Dobrodo\u0161li u CozyCare obitelj',
    body: 'Drago nam je \u0161to ste tu. CozyCare je stvoren s puno pa\u017enje \u2014 za obitelji koje tra\u017ee vi\u0161e od obi\u010dne skrbi za djecu. Svaka na\u0161a dadilja je pa\u017eljivo odabrana, provjerena i spremna upoznati va\u0161u obitelj s toplinom koju zaslu\u017euje.',
    tips: [
      { icon: User, title: 'Popunite profil obitelji', body: 'Nekoliko redaka o vama i va\u0161oj djeci poma\u017ee dadiljama da se bolje pripreme.', href: '/FamilySettings' },
      { icon: Search, title: 'Pretra\u017eite dadilje', body: 'Pregledajte profile, pro\u010ditajte recenzije i prona\u0111ite osobu koja vam najvi\u0161e odgovara.', href: '/FindNannies' },
      { icon: Heart, title: 'Rezervirajte bez brige', body: 'Pla\u0107ate tek kad dadilja potvrdi rezervaciju. Nema iznena\u0111enja.', href: null },
    ],
  };

  const nannyContent = {
    headline: 'Dobrodo\u0161li u CozyCare tim',
    body: 'Hvala \u0161to ste se pridru\u017eili. Brinemo o tome da svaka dadilja u na\u0161em timu ima dostojan tretman, obitelji koje je cijene, i platformu koja radi za nju \u2014 a ne obrnuto.',
    tips: [
      { icon: Camera, title: 'Dovr\u0161ite profil', body: 'Topla fotografija, iskren bio i par rije\u010di o va\u0161em stilu skrbi \u010dine veliku razliku.', href: '/NannyProfile' },
      { icon: Calendar, title: 'Čekajte odobrenje', body: 'Na\u0161 tim pregledava va\u0161 profil unutar 24\u201348 sati. Javit \u0107emo vam \u010dim bude spreman.', href: null },
      { icon: MessageCircle, title: 'Prva rezervacija', body: 'Kad vam stigne rezervacija, dobit \u0107ete obavijest. Obitelji mo\u017eete poslati poruku izravno iz termina.', href: null },
    ],
  };

  const content = isParent ? parentContent : nannyContent;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-light/50 via-peach/30 to-ivory border border-rose-light/40 shadow-sm">
      <button
        onClick={handleDismiss}
        disabled={dismissing}
        aria-label="Zatvori"
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/60 hover:bg-white/90 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors z-10 backdrop-blur-sm"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative px-7 py-8 lg:px-10 lg:py-10">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/70 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Dobrodošli
        </p>
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-3">
          {content.headline}
        </h2>
        <p className="text-sm text-foreground/75 leading-relaxed max-w-2xl mb-6">
          {content.body}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {content.tips.map((tip, idx) => {
            const Icon = tip.icon;
            const inner = (
              <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-4 h-full hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all">
                <div className="w-9 h-9 rounded-xl bg-rose-light/80 flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="font-semibold text-sm text-foreground mb-1">{tip.title}</p>
                <p className="text-xs text-foreground/60 leading-relaxed">{tip.body}</p>
              </div>
            );
            return tip.href
              ? <a key={idx} href={tip.href} className="block">{inner}</a>
              : <div key={idx}>{inner}</div>;
          })}
        </div>
      </div>
    </section>
  );
}