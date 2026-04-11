import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Save, Upload, Camera, CheckCircle2, Clock, Star, Heart, Shield } from 'lucide-react';
import { getNannyImage, hasRealPhoto } from '@/lib/nannyImages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{children}</p>
  );
}

export default function NannyProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['myNannyProfile', user?.email],
    queryFn: () => base44.entities.NannyProfile.filter({ user_email: user?.email }, '-created_date', 1),
    enabled: !!user?.email,
  });

  const profile = profiles[0];

  const [form, setForm] = useState({
    first_name: '', last_name: '', bio: '', hourly_rate: 25, location: '',
    languages: '', specialties: '', certifications: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        hourly_rate: profile.hourly_rate || 25,
        location: profile.location || '',
        languages: (profile.languages || []).join(', '),
        specialties: (profile.specialties || []).join(', '),
        certifications: (profile.certifications || []).join(', '),
      });
    }
  }, [profile]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handlePhotoUpload = async (file) => {
    if (!file || !profile) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.NannyProfile.update(profile.id, { photo_url: file_url });
    await base44.functions.invoke('syncPublicNannyProfile', { nanny_profile_id: profile.id });
    queryClient.invalidateQueries({ queryKey: ['myNannyProfile'] });
    toast.success('Fotografija ažurirana!');
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.NannyProfile.update(profile.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        bio: form.bio,
        hourly_rate: Number(form.hourly_rate),
        location: form.location,
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
        certifications: form.certifications.split(',').map(s => s.trim()).filter(Boolean),
      });
      await base44.functions.invoke('syncPublicNannyProfile', { nanny_profile_id: profile.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNannyProfile'] });
      toast.success('Profil spremljen!');
    },
  });

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <Heart className="w-12 h-12 text-primary/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Profil nije pronađen. Molimo prvo završite registraciju.</p>
      </div>
    );
  }

  const name = `${profile.first_name} ${profile.last_name}`;
  const initial = (profile.first_name || '?')[0];

  return (
    <div className="max-w-xl mx-auto pb-12 space-y-6">

      {/* Header */}
      <div>
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/60 mb-2">
          <Heart className="w-3 h-3" fill="currentColor" /> Vaš profil
        </p>
        <h1 className="font-display text-3xl font-bold text-foreground">Moj profil</h1>
        <p className="text-sm text-muted-foreground mt-1">Kako vas obitelji vide na CozyCare-u.</p>
      </div>

      {/* Status & stats strip */}
      <div className="bg-card border border-border/40 rounded-2xl p-5 flex flex-wrap items-center gap-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${profile.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-peach/50 text-peach-dark border-peach/30'}`}>
          <CheckCircle2 className="w-3 h-3" /> {profile.is_active ? 'Aktivan — vidljiv obiteljima' : 'Neaktivan'}
        </span>
        {profile.rating > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-foreground font-semibold">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {profile.rating.toFixed(1)}
            <span className="font-normal text-muted-foreground text-xs">({profile.review_count} recenzija)</span>
          </span>
        )}
      </div>

      {/* Photo */}
      <div className="bg-card border border-border/40 rounded-3xl p-6">
        <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
          <Camera className="w-4.5 h-4.5 text-primary" /> Profilna fotografija
        </h2>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-peach/60 flex-shrink-0 shadow-sm">
            <img src={getNannyImage(profile)} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild className="rounded-xl">
                <span><Upload className="w-3.5 h-3.5 mr-1.5" /> Promijeni fotografiju</span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e.target.files?.[0])} />
            </label>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Topla, prijateljska fotografija pomaže obiteljima da se povežu s vama.
            </p>
          </div>
        </div>
      </div>

      {/* Core info */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 space-y-5">
        <h2 className="font-display font-semibold text-lg">Osnovni podaci</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SectionLabel>Ime</SectionLabel>
            <Input value={form.first_name} onChange={e => update('first_name', e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <SectionLabel>Prezime</SectionLabel>
            <Input value={form.last_name} onChange={e => update('last_name', e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SectionLabel>Satnica (€)</SectionLabel>
            <Input type="number" value={form.hourly_rate} onChange={e => update('hourly_rate', e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <SectionLabel>Lokacija</SectionLabel>
            <Input value={form.location} onChange={e => update('location', e.target.value)} placeholder="npr. Gornji Grad, Zagreb" className="rounded-xl" />
          </div>
        </div>
        <div>
          <SectionLabel>O meni</SectionLabel>
          <Textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={4} placeholder="Podijelite svoju osobnost i filozofiju brige o djeci…" className="rounded-xl resize-none" />
        </div>
      </div>

      {/* Credentials */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 space-y-5">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <Shield className="w-4.5 h-4.5 text-primary" /> Kvalifikacije
        </h2>
        <div>
          <SectionLabel>Jezici <span className="normal-case font-normal">(odvojeno zarezima)</span></SectionLabel>
          <Input value={form.languages} onChange={e => update('languages', e.target.value)} placeholder="Hrvatski, Engleski" className="rounded-xl" />
        </div>
        <div>
          <SectionLabel>Specijalnosti <span className="normal-case font-normal">(odvojeno zarezima)</span></SectionLabel>
          <Input value={form.specialties} onChange={e => update('specialties', e.target.value)} placeholder="Njega dojenčadi, Posebne potrebe, Podučavanje" className="rounded-xl" />
        </div>
        <div>
          <SectionLabel>Certifikati <span className="normal-case font-normal">(odvojeno zarezima)</span></SectionLabel>
          <Input value={form.certifications} onChange={e => update('certifications', e.target.value)} placeholder="Potvrđen ID, Provjera pozadine, Reference" className="rounded-xl" />
        </div>
      </div>

      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="w-full h-13 font-semibold rounded-2xl shadow-lg shadow-primary/20 text-base"
        style={{ height: '3.25rem' }}
      >
        {saveMutation.isPending ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Spremanje…
          </span>
        ) : (
          <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Spremi promjene</span>
        )}
      </Button>
    </div>
  );
}