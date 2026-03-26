import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Save, Upload, Camera, CheckCircle2, Clock, Star, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TrustBadgeRow } from '@/components/shared/TrustBadge';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  approved: { label: 'Live — visible to families', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Under review · 24–48 hrs', color: 'bg-peach/50 text-peach-dark border-peach/30' },
  rejected: { label: 'Not approved', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  suspended: { label: 'Suspended', color: 'bg-muted text-muted-foreground border-border' },
};

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
    queryFn: () => base44.entities.NannyProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const profile = profiles[0];

  const [form, setForm] = useState({
    display_name: '', bio: '', hourly_rate: 25, service_area: '',
    education: '', languages: '', specialties: '', certifications: '', emergency_contact: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        hourly_rate: profile.hourly_rate || 25,
        service_area: profile.service_area || '',
        education: profile.education || '',
        languages: (profile.languages || []).join(', '),
        specialties: (profile.specialties || []).join(', '),
        certifications: (profile.certifications || []).join(', '),
        emergency_contact: profile.emergency_contact || '',
      });
    }
  }, [profile]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handlePhotoUpload = async (file) => {
    if (!file || !profile) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.NannyProfile.update(profile.id, { photo_url: file_url });
    queryClient.invalidateQueries({ queryKey: ['myNannyProfile'] });
    toast.success('Photo updated!');
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.NannyProfile.update(profile.id, {
        display_name: form.display_name,
        bio: form.bio,
        hourly_rate: Number(form.hourly_rate),
        service_area: form.service_area,
        education: form.education,
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
        certifications: form.certifications.split(',').map(s => s.trim()).filter(Boolean),
        emergency_contact: form.emergency_contact,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNannyProfile'] });
      toast.success('Profile saved!');
    },
  });

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <Heart className="w-12 h-12 text-primary/30 mx-auto mb-4" />
        <p className="text-muted-foreground">No profile found. Please complete onboarding first.</p>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[profile.status] || STATUS_CONFIG.pending;
  const initial = (profile.display_name || profile.full_name || '?')[0];

  return (
    <div className="max-w-xl mx-auto pb-12 space-y-6">

      {/* Header */}
      <div>
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/60 mb-2">
          <Heart className="w-3 h-3" fill="currentColor" /> Your profile
        </p>
        <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">How families see you on CozyCare.</p>
      </div>

      {/* Status & stats strip */}
      <div className="bg-card border border-border/40 rounded-2xl p-5 flex flex-wrap items-center gap-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusCfg.color}`}>
          <CheckCircle2 className="w-3 h-3" /> {statusCfg.label}
        </span>
        {profile.avg_rating > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-foreground font-semibold">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {profile.avg_rating.toFixed(1)}
            <span className="font-normal text-muted-foreground text-xs">({profile.total_reviews} reviews)</span>
          </span>
        )}
        {profile.total_bookings > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-foreground font-semibold">
            <Clock className="w-4 h-4 text-primary/60" /> {profile.total_bookings} sessions
          </span>
        )}
        {profile.badges?.length > 0 && (
          <div className="w-full pt-2 border-t border-border/40">
            <TrustBadgeRow badges={profile.badges} size="md" />
          </div>
        )}
      </div>

      {/* Photo */}
      <div className="bg-card border border-border/40 rounded-3xl p-6">
        <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
          <Camera className="w-4.5 h-4.5 text-primary" /> Profile Photo
        </h2>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-peach/60 flex-shrink-0 shadow-sm">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-light to-peach/60 flex items-center justify-center">
                <span className="text-3xl font-display font-bold text-primary">{initial}</span>
              </div>
            )}
          </div>
          <div>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild className="rounded-xl">
                <span><Upload className="w-3.5 h-3.5 mr-1.5" /> Change Photo</span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e.target.files?.[0])} />
            </label>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              A warm, friendly photo helps families connect with you.
            </p>
          </div>
        </div>
      </div>

      {/* Core info */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 space-y-5">
        <h2 className="font-display font-semibold text-lg">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SectionLabel>Display Name</SectionLabel>
            <Input value={form.display_name} onChange={e => update('display_name', e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <SectionLabel>Hourly Rate ($)</SectionLabel>
            <Input type="number" value={form.hourly_rate} onChange={e => update('hourly_rate', e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <div>
          <SectionLabel>Service Area</SectionLabel>
          <Input value={form.service_area} onChange={e => update('service_area', e.target.value)} placeholder="e.g., Downtown Portland" className="rounded-xl" />
        </div>
        <div>
          <SectionLabel>About Me</SectionLabel>
          <Textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={4} placeholder="Share your personality and childcare philosophy…" className="rounded-xl resize-none" />
        </div>
      </div>

      {/* Credentials */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 space-y-5">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <Shield className="w-4.5 h-4.5 text-primary" /> Credentials
        </h2>
        <div>
          <SectionLabel>Education</SectionLabel>
          <Input value={form.education} onChange={e => update('education', e.target.value)} placeholder="e.g., B.A. Early Childhood Education" className="rounded-xl" />
        </div>
        <div>
          <SectionLabel>Languages <span className="normal-case font-normal">(comma-separated)</span></SectionLabel>
          <Input value={form.languages} onChange={e => update('languages', e.target.value)} placeholder="English, Spanish" className="rounded-xl" />
        </div>
        <div>
          <SectionLabel>Specialties <span className="normal-case font-normal">(comma-separated)</span></SectionLabel>
          <Input value={form.specialties} onChange={e => update('specialties', e.target.value)} placeholder="Infant care, Special needs, Tutoring" className="rounded-xl" />
        </div>
        <div>
          <SectionLabel>Certifications <span className="normal-case font-normal">(comma-separated)</span></SectionLabel>
          <Input value={form.certifications} onChange={e => update('certifications', e.target.value)} placeholder="CPR, First Aid, Montessori" className="rounded-xl" />
        </div>
      </div>

      {/* Emergency contact */}
      <div className="bg-card border border-border/40 rounded-3xl p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Emergency Contact</h2>
        <Input value={form.emergency_contact} onChange={e => update('emergency_contact', e.target.value)} placeholder="Name and phone number" className="rounded-xl" />
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
            Saving…
          </span>
        ) : (
          <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>
        )}
      </Button>
    </div>
  );
}