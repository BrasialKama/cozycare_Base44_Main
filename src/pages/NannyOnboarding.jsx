import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ArrowRight, ArrowLeft, User, FileText, Camera, CheckCircle, Heart, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { id: 0, icon: User, label: 'Basic Info' },
  { id: 1, icon: FileText, label: 'Experience' },
  { id: 2, icon: Camera, label: 'Verification' },
  { id: 3, icon: CheckCircle, label: 'Review' },
];

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
      let photo_url = '';
      let intro_video_url = '';
      let id_document_url = '';

      if (photoFile) {
        const res = await base44.integrations.Core.UploadFile({ file: photoFile });
        photo_url = res.file_url;
      }
      if (videoFile) {
        const res = await base44.integrations.Core.UploadFile({ file: videoFile });
        intro_video_url = res.file_url;
      }
      if (idFile) {
        const res = await base44.integrations.Core.UploadFile({ file: idFile });
        id_document_url = res.file_url;
      }

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
        photo_url,
        intro_video_url,
        id_document_url,
        status: 'pending',
        badges: [],
        avg_rating: 0,
        total_reviews: 0,
        total_bookings: 0,
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/12 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-primary" fill="currentColor" />
          </div>
          <h1 className="font-display text-2xl font-bold">Join CozyCare as a Nanny</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete your profile to start connecting with families</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-lg font-semibold mb-4">Basic Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Legal Name</Label>
                      <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} />
                    </div>
                    <div>
                      <Label>Display Name</Label>
                      <Input value={form.display_name} onChange={e => update('display_name', e.target.value)} placeholder="How families will see you" />
                    </div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" />
                  </div>
                  <div>
                    <Label>Service Area</Label>
                    <Input value={form.service_area} onChange={e => update('service_area', e.target.value)} placeholder="e.g., Downtown Portland" />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell families about yourself..." rows={4} />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-display text-lg font-semibold mb-4">Experience & Qualifications</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Hourly Rate ($)</Label>
                      <Input type="number" value={form.hourly_rate} onChange={e => update('hourly_rate', e.target.value)} />
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <Input type="number" value={form.years_experience} onChange={e => update('years_experience', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Education</Label>
                    <Input value={form.education} onChange={e => update('education', e.target.value)} placeholder="e.g., B.A. in Early Childhood Education" />
                  </div>
                  <div>
                    <Label>Languages (comma-separated)</Label>
                    <Input value={form.languages} onChange={e => update('languages', e.target.value)} placeholder="English, Spanish" />
                  </div>
                  <div>
                    <Label>Specialties (comma-separated)</Label>
                    <Input value={form.specialties} onChange={e => update('specialties', e.target.value)} placeholder="Infant care, Special needs, Tutoring" />
                  </div>
                  <div>
                    <Label>Certifications (comma-separated)</Label>
                    <Input value={form.certifications} onChange={e => update('certifications', e.target.value)} placeholder="CPR, First Aid, Montessori" />
                  </div>
                  <div>
                    <Label>Emergency Contact</Label>
                    <Input value={form.emergency_contact} onChange={e => update('emergency_contact', e.target.value)} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="font-display text-lg font-semibold mb-4">Verification & Media</h2>
                  <div>
                    <Label className="mb-2 block">Profile Photo</Label>
                    <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{photoFile ? photoFile.name : 'Upload a clear, friendly photo'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => setPhotoFile(e.target.files?.[0])} />
                    </label>
                  </div>
                  <div>
                    <Label className="mb-2 block">Introduction Video</Label>
                    <p className="text-xs text-muted-foreground mb-2">Record a short video introducing yourself to families. This builds trust and helps parents feel confident.</p>
                    <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{videoFile ? videoFile.name : 'Upload your intro video'}</span>
                      <input type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files?.[0])} />
                    </label>
                  </div>
                  <div>
                    <Label className="mb-2 block">Government ID</Label>
                    <p className="text-xs text-muted-foreground mb-2">Required for identity verification. Your ID is securely stored and never shared with families.</p>
                    <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{idFile ? idFile.name : 'Upload your ID document'}</span>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setIdFile(e.target.files?.[0])} />
                    </label>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-display text-lg font-semibold mb-2">Review Your Profile</h2>
                  <p className="text-sm text-muted-foreground mb-4">Please review your details before submitting. Our team will review your application within 24-48 hours.</p>
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                    <p><strong>Name:</strong> {form.display_name || form.full_name}</p>
                    <p><strong>Rate:</strong> ${form.hourly_rate}/hr</p>
                    <p><strong>Experience:</strong> {form.years_experience} years</p>
                    <p><strong>Area:</strong> {form.service_area}</p>
                    <p><strong>Languages:</strong> {form.languages || '—'}</p>
                    <p><strong>Photo:</strong> {photoFile ? '✓ Uploaded' : '— Not uploaded'}</p>
                    <p><strong>Video:</strong> {videoFile ? '✓ Uploaded' : '— Not uploaded'}</p>
                    <p><strong>ID:</strong> {idFile ? '✓ Uploaded' : '— Not uploaded'}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-border/60">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}