import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ArrowRight, ArrowLeft, User, FileText, Camera, CheckCircle2,
  Heart, Upload, Sparkles, Shield, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 0, icon: User, label: 'O vama', sub: 'Osnovni podaci' },
  { id: 1, icon: Star, label: 'Iskustvo', sub: 'Vještine i cijena' },
  { id: 2, icon: Camera, label: 'Verifikacija', sub: 'Foto i dokument' },
  { id: 3, icon: CheckCircle2, label: 'Pregled', sub: 'Završna provjera' },
];

function UploadZone({ label, hint, accept, file, onChange, icon: Icon }) {
  return (
    <div>
      <Label className="text-sm font-semibold text-foreground mb-1.5 block">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">{hint}</p>}
      <label className={`flex items-center gap-3.5 p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
        file ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-primary/3'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${file ? 'bg-primary/10' : 'bg-muted'}`}>
          {file ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Icon className="w-5 h-5 text-muted-foreground" />}
        </div>
        <div>
          <p className={`text-sm font-medium ${file ? 'text-primary' : 'text-muted-foreground'}`}>
            {file ? file.name : `Upload ${label.toLowerCase()}`}
          </p>
          {!file && <p className="text-xs text-muted-foreground mt-0.5">Kliknite za odabir datoteke</p>}
        </div>
        <input type="file" accept={accept} className="hidden" onChange={e => onChange(e.target.files?.[0])} />
      </label>
    </div>
  );
}

export default function NannyOnboarding() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const navigate = useNavigate();

  // Auth guard: unauthenticated users and users without role=nanny must go through /Onboarding first.
  // /Onboarding handles login redirect and calls setUserRole before returning here.
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) {
      navigateToLogin(window.location.origin + '/Onboarding');
      return;
    }
    if (user && user.role !== 'nanny' && user.role !== 'admin') {
      // Send them through role-selection so setUserRole runs first
      navigate('/Onboarding', { replace: true });
    }
  }, [isLoadingAuth, isAuthenticated, user, navigate, navigateToLogin]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: '',
    display_name: '',
    bio: '',
    hourly_rate: 25,
    years_experience: 0,
    service_area: '',
    education: '',
    languages: '',
    specialties: '',
    certifications: '',
    phone: '',
    emergency_contact: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [stepErrors, setStepErrors] = useState([]);

  // When user loads, seed full_name default
  useEffect(() => {
    if (user?.full_name && !form.full_name) {
      setForm(prev => ({ ...prev, full_name: user.full_name }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validateStep = (s) => {
    const errors = [];
    if (s === 0) {
      if (!form.full_name.trim()) errors.push('Unesite puno ime');
      if (!form.phone.trim()) errors.push('Unesite broj telefona');
      if (!form.service_area.trim()) errors.push('Unesite područje rada');
    }
    if (s === 1) {
      if (!form.hourly_rate || Number(form.hourly_rate) <= 0) errors.push('Unesite valjanu satnicu');
      if (!form.languages.trim()) errors.push('Unesite barem jedan jezik');
    }
    if (s === 2) {
      if (!photoFile) errors.push('Dodajte profilnu fotografiju');
    }
    return errors;
  };

  const tryAdvance = () => {
    const errors = validateStep(step);
    setStepErrors(errors);
    if (errors.length === 0) {
      setStep(s => s + 1);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      // Hard guard: never attempt submission without a resolved user.
      if (!user || !user.email) {
        throw new Error('Niste prijavljeni. Osvježite stranicu i pokušajte ponovo.');
      }

      let photo_url = '', intro_video_url = '', id_document_url = '';
      if (photoFile) photo_url = (await base44.integrations.Core.UploadFile({ file: photoFile })).file_url;
      if (videoFile) intro_video_url = (await base44.integrations.Core.UploadFile({ file: videoFile })).file_url;
      if (idFile) id_document_url = (await base44.integrations.Core.UploadFile({ file: idFile })).file_url;

      const nameParts = form.full_name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const createdProfile = await base44.entities.NannyProfile.create({
        first_name: firstName,
        last_name: lastName,
        display_name: form.display_name || form.full_name,
        user_email: user.email,
        bio: form.bio,
        hourly_rate: Number(form.hourly_rate),
        years_experience: Number(form.years_experience),
        service_area: form.service_area,
        location: form.service_area,
        education: form.education,
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
        certifications: form.certifications.split(',').map(s => s.trim()).filter(Boolean),
        emergency_contact: form.emergency_contact,
        photo_url,
        intro_video_url,
        video_url: intro_video_url,
        id_document_url,
        status: 'pending',
        is_active: false,
        badges: [], rating: 0, review_count: 0, total_bookings: 0,
      });

      await base44.functions.invoke('syncPublicNannyProfile', { nanny_profile_id: createdProfile.id });

      await base44.auth.updateMe({
        onboarding_complete: true,
        display_name: form.display_name || form.full_name,
        phone: form.phone,
      });
    },
    onSuccess: () => navigate('/Home'),
  });

  // Show loading while auth is resolving or while redirecting unauthenticated users.
  if (isLoadingAuth || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-body">Učitavanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-rose-light/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Natrag
        </button>

        {/* Brand heading */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-peach/60 flex items-center justify-center mx-auto mb-3 shadow-md shadow-primary/10">
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground leading-tight">Pridruži se CozyCare-u</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed max-w-xs mx-auto">
            Ispunite svoj profil i počnite se povezivati s obiteljima kojima trebate.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  i === step
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                    : i < step
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-card text-muted-foreground border-border/60'
                }`}
              >
                <s.icon className="w-3 h-3" /> {s.label}
              </div>
              {i < STEPS.length - 1 && <span className="text-muted-foreground/40">—</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-card border border-border/50 rounded-3xl shadow-lg shadow-primary/5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="p-7"
            >
              {step === 0 && (
                <div className="space-y-5">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Korak 1 od 4</p>
                    <h2 className="font-display text-2xl font-bold text-foreground">O vama</h2>
                    <p className="text-sm text-muted-foreground mt-1">Osnovni podaci koje obitelji trebaju znati.</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Puno ime</Label>
                    <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Ana Marija Horvat" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Javno ime (opcionalno)</Label>
                    <Input value={form.display_name} onChange={e => update('display_name', e.target.value)} placeholder="Ana M." className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Broj telefona</Label>
                    <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+385 91 234 5678" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Područje rada</Label>
                    <Input value={form.service_area} onChange={e => update('service_area', e.target.value)} placeholder="e.g., Gornji Grad, Zagreb" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">O meni</Label>
                    <Textarea value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Podijelite svoju osobnost, filozofiju brige o djeci i što vas čini posebnom dadiljom…" rows={4} className="rounded-xl resize-none" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Korak 2 od 4</p>
                    <h2 className="font-display text-2xl font-bold text-foreground">Iskustvo i vještine</h2>
                    <p className="text-sm text-muted-foreground mt-1">Pomozite obiteljima da razumiju vaše kvalifikacije.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Satnica (€)</Label>
                      <Input type="number" value={form.hourly_rate} onChange={e => update('hourly_rate', e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Godine iskustva</Label>
                      <Input type="number" value={form.years_experience} onChange={e => update('years_experience', e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Obrazovanje</Label>
                    <Input value={form.education} onChange={e => update('education', e.target.value)} placeholder="npr. Prvostupnica ranog odgoja" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Jezici <span className="normal-case font-normal">(odvojeno zarezima)</span></Label>
                    <Input value={form.languages} onChange={e => update('languages', e.target.value)} placeholder="Croatian, English, German" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Specijalnosti <span className="normal-case font-normal">(odvojeno zarezima)</span></Label>
                    <Input value={form.specialties} onChange={e => update('specialties', e.target.value)} placeholder="Njega dojenčadi, Posebne potrebe, Podučavanje" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Obrazovanje i tečajevi <span className="normal-case font-normal">(odvojeno zarezima)</span></Label>
                    <Input value={form.certifications} onChange={e => update('certifications', e.target.value)} placeholder="Tečaj prve pomoći, Diploma predškolskog odgoja" className="rounded-xl" />
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                      Navedite stvarne tečajeve i obrazovanje. Službene oznake povjerenja dodjeljuje CozyCare tim nakon provjere dokumenata.
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Kontakt za hitne slučajeve</Label>
                    <Input value={form.emergency_contact} onChange={e => update('emergency_contact', e.target.value)} className="rounded-xl" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Korak 3 od 4</p>
                    <h2 className="font-display text-2xl font-bold text-foreground">Verifikacija i mediji</h2>
                    <p className="text-sm text-muted-foreground mt-1">Pomozite obiteljima da vam vjeruju prije nego vas upoznaju.</p>
                  </div>
                  <UploadZone label="Profilna fotografija" hint="Topla, prijateljska fotografija pomaže obiteljima da se povežu s vama." accept="image/*" file={photoFile} onChange={setPhotoFile} icon={Camera} />
                  <UploadZone label="Video predstavljanje" hint="Video od 1–2 minute u kojem se predstavite gradi povjerenje obitelji." accept="video/*" file={videoFile} onChange={setVideoFile} icon={Sparkles} />
                  <UploadZone label="Osobna iskaznica" hint="Potrebna za provjeru identiteta. Vaš dokument je sigurno pohranjen i nikad se ne dijeli s obiteljima." accept="image/*,.pdf" file={idFile} onChange={setIdFile} icon={Shield} />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Korak 4 od 4</p>
                    <h2 className="font-display text-2xl font-bold text-foreground">Pregledajte svoj profil</h2>
                    <p className="text-sm text-muted-foreground mt-1">Naš tim pregledava prijave unutar 24–48 sati.</p>
                  </div>
                  <div className="bg-gradient-to-br from-ivory to-rose-light/30 rounded-2xl p-5 space-y-3.5">
                    {[
                      ['Ime', form.display_name || form.full_name],
                      ['Satnica', `€${form.hourly_rate}/h`],
                      ['Iskustvo', `${form.years_experience} godina`],
                      ['Područje', form.service_area || '—'],
                      ['Jezici', form.languages || '—'],
                      ['Fotografija', photoFile ? '✓ Učitano' : '— Nije dodano'],
                      ['Video', videoFile ? '✓ Učitano' : '— Nije dodano'],
                      ['Osobna iskaznica', idFile ? '✓ Učitano' : '— Nije dodano'],
                    ].map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">{key}</span>
                        <span className={`text-sm font-medium ${String(val).startsWith('✓') ? 'text-emerald-600' : 'text-foreground'}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 bg-sage/15 rounded-2xl p-4">
                    <CheckCircle2 className="w-4.5 h-4.5 text-sage-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-sage-foreground leading-relaxed">
                      Slanjem pristajete na naše standarde za dadilje. Obavijestit ćemo vas kada vaš profil bude pregledan i odobren.
                    </p>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Validation errors */}
          {stepErrors.length > 0 && (
            <div className="mx-7 mb-2 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3 space-y-1">
              {stepErrors.map((err, i) => (
                <p key={i} className="text-xs text-destructive font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-destructive flex-shrink-0" /> {err}
                </p>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between px-7 pb-7 pt-2 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={() => { setStepErrors([]); setStep(s => s - 1); }}
              disabled={step === 0}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Natrag
            </Button>
            {step < 3 ? (
              <Button onClick={tryAdvance} className="rounded-xl">
                Dalje <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  className="rounded-xl shadow-md shadow-primary/20"
                >
                  {createMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Šaljem…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2"><Heart className="w-4 h-4" fill="currentColor" /> Pošalji prijavu</span>
                  )}
                </Button>
                {createMutation.isError && (
                  <p className="text-xs text-destructive text-right">
                    Prijava nije poslana: {createMutation.error?.message || 'Došlo je do greške. Pokušajte ponovo.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}