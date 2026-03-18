import React, { useState } from 'react';
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
  { id: 0, icon: User, label: 'About You', sub: 'Your basic info' },
  { id: 1, icon: Star, label: 'Experience', sub: 'Skills & rates' },
  { id: 2, icon: Camera, label: 'Verification', sub: 'Photo & ID' },
  { id: 3, icon: CheckCircle2, label: 'Review', sub: 'Final check' },
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
          {!file && <p className="text-xs text-muted-foreground mt-0.5">Click to browse files</p>}
        </div>
        <input type="file" accept={accept} className="hidden" onChange={e => onChange(e.target.files?.[0])} />
      </label>
    </div>
  );
}

export default function NannyOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
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

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const createMutation = useMutation({
    mutationFn: async () => {
      let photo_url = '', intro_video_url = '', id_document_url = '';
      if (photoFile) photo_url = (await base44.integrations.Core.UploadFile({ file: photoFile })).file_url;
      if (videoFile) intro_video_url = (await base44.integrations.Core.UploadFile({ file: videoFile })).file_url;
      if (idFile) id_document_url = (await base44.integrations.Core.UploadFile({ file: idFile })).file_url;

      await base44.entities.NannyProfile.create({
        user_email: user.email,
        full_name: form.full_name,
        display_name: form.display_name || form.full_name,
        bio: form.bio,
        hourly_rate: Number(form.hourly_rate),
        years_experience: Number(form.years_experience),
        service_area: form.service_area,
        education: form.education,
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
        certifications: form.certifications.split(',').map(s => s.trim()).filter(Boolean),
        emergency_contact: form.emergency_contact,
        photo_url, intro_video_url, id_document_url,
        status: 'pending', badges: [], avg_rating: 0, total_reviews: 0, total_bookings: 0,
      });

      await base44.auth.updateMe({
        onboarding_complete: true,
        display_name: form.display_name || form.full_name,
        phone: form.phone,
      });
    },
    onSuccess: () => navigate('/Home'),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-rose-light/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/20 to-peach/50 flex items-center justify-center mx-auto mb-4 shadow-md">
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Join CozyCare</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
            Complete your profile and start connecting with families who need you.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl transition-all ${
                i === step
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : i < step
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/50 text-muted-foreground'
              }`}>
                {i < step ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <s.icon className="w-3.5 h-3.5" />
                )}
                <span className="text-xs font-semibold hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-5 h-0.5 rounded-full transition-all ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-card border border-border/40 rounded-3xl shadow-xl shadow-foreground/5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="p-7"
            >

              {step === 0 && (
                <div className="space-y-5">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Step 1 of 4</p>
                    <h2 className="font-display text-2xl font-bold text-foreground">About You</h2>
                    <p className="text-sm text-muted-foreground mt-1">Tell families who you are and where you work.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Legal Name</Label>
                      <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Display Name</Label>
                      <Input value={form.display_name} onChange={e => update('display_name', e.target.value)} placeholder="As families see you" className="rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Phone</Label>
                    <Input value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Service Area</Label>
                    <Input value={form.service_area} onChange={e => update('service_area', e.target.value)} placeholder="e.g., Downtown Portland" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">About Me</Label>
                    <Textarea value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Share your personality, childcare philosophy, and what makes you special as a caregiver…" rows={4} className="rounded-xl resize-none" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Step 2 of 4</p>
                    <h2 className="font-display text-2xl font-bold text-foreground">Experience & Skills</h2>
                    <p className="text-sm text-muted-foreground mt-1">Help families understand your qualifications.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Hourly Rate ($)</Label>
                      <Input type="number" value={form.hourly_rate} onChange={e => update('hourly_rate', e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Years Experience</Label>
                      <Input type="number" value={form.years_experience} onChange={e => update('years_experience', e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Education</Label>
                    <Input value={form.education} onChange={e => update('education', e.target.value)} placeholder="e.g., B.A. Early Childhood Education" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Languages <span className="normal-case font-normal">(comma-separated)</span></Label>
                    <Input value={form.languages} onChange={e => update('languages', e.target.value)} placeholder="English, Spanish, French" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Specialties <span className="normal-case font-normal">(comma-separated)</span></Label>
                    <Input value={form.specialties} onChange={e => update('specialties', e.target.value)} placeholder="Infant care, Special needs, Tutoring" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Certifications <span className="normal-case font-normal">(comma-separated)</span></Label>
                    <Input value={form.certifications} onChange={e => update('certifications', e.target.value)} placeholder="CPR, First Aid, Montessori" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Emergency Contact</Label>
                    <Input value={form.emergency_contact} onChange={e => update('emergency_contact', e.target.value)} className="rounded-xl" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Step 3 of 4</p>
                    <h2 className="font-display text-2xl font-bold text-foreground">Verification & Media</h2>
                    <p className="text-sm text-muted-foreground mt-1">Help families trust you before they even meet you.</p>
                  </div>
                  <UploadZone label="Profile Photo" hint="A warm, friendly photo helps families connect with you." accept="image/*" file={photoFile} onChange={setPhotoFile} icon={Camera} />
                  <UploadZone label="Introduction Video" hint="A 1–2 minute video introducing yourself builds instant trust with families." accept="video/*" file={videoFile} onChange={setVideoFile} icon={Sparkles} />
                  <UploadZone label="Government ID" hint="Required for identity verification. Your ID is securely stored and never shared with families." accept="image/*,.pdf" file={idFile} onChange={setIdFile} icon={Shield} />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Step 4 of 4</p>
                    <h2 className="font-display text-2xl font-bold text-foreground">Review Your Profile</h2>
                    <p className="text-sm text-muted-foreground mt-1">Our team reviews applications within 24–48 hours.</p>
                  </div>
                  <div className="bg-gradient-to-br from-ivory to-rose-light/30 rounded-2xl p-5 space-y-3.5">
                    {[
                      ['Name', form.display_name || form.full_name],
                      ['Rate', `$${form.hourly_rate}/hr`],
                      ['Experience', `${form.years_experience} years`],
                      ['Service Area', form.service_area || '—'],
                      ['Languages', form.languages || '—'],
                      ['Photo', photoFile ? '✓ Uploaded' : '— Not added'],
                      ['Video', videoFile ? '✓ Uploaded' : '— Not added'],
                      ['ID Document', idFile ? '✓ Uploaded' : '— Not added'],
                    ].map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">{key}</span>
                        <span className={`text-sm font-medium ${val.startsWith('✓') ? 'text-emerald-600' : 'text-foreground'}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 bg-sage/15 rounded-2xl p-4">
                    <CheckCircle2 className="w-4.5 h-4.5 text-sage-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-sage-foreground leading-relaxed">
                      By submitting, you agree to our caregiver standards. We'll notify you once your profile is reviewed and approved.
                    </p>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between px-7 pb-7 pt-2 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} className="rounded-xl">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="rounded-xl shadow-md shadow-primary/20"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Submitting…
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Heart className="w-4 h-4" fill="currentColor" /> Submit Application</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}