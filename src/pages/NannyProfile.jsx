import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { User, Save, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import { TrustBadgeRow } from '@/components/shared/TrustBadge';
import { toast } from 'sonner';

export default function NannyProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['myNannyProfile', user?.email],
    queryFn: () => base44.entities.NannyProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const profile = profiles[0];

  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    hourly_rate: 25,
    service_area: '',
    education: '',
    languages: '',
    specialties: '',
    certifications: '',
    emergency_contact: '',
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
    toast.success('Photo updated');
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
      toast.success('Profile updated!');
    },
  });

  if (!profile) {
    return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader icon={User} title="My Profile" subtitle="Manage how families see you" />

      {/* Status badge */}
      <div className="mb-5">
        <Badge className={`${
          profile.status === 'approved' ? 'bg-sage/30 text-sage-foreground' :
          profile.status === 'pending' ? 'bg-peach/50 text-peach-dark' :
          'bg-destructive/10 text-destructive'
        } border-0`}>
          Status: {profile.status}
        </Badge>
        {profile.badges?.length > 0 && (
          <div className="mt-3">
            <TrustBadgeRow badges={profile.badges} size="md" />
          </div>
        )}
      </div>

      <Card className="p-6 space-y-5">
        {/* Photo */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-peach/60">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary/40" />
              </div>
            )}
          </div>
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span><Upload className="w-3.5 h-3.5 mr-1.5" /> Change Photo</span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e.target.files?.[0])} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Display Name</Label>
            <Input value={form.display_name} onChange={e => update('display_name', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Hourly Rate ($)</Label>
            <Input type="number" value={form.hourly_rate} onChange={e => update('hourly_rate', e.target.value)} className="mt-1" />
          </div>
        </div>

        <div>
          <Label>Bio</Label>
          <Textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={4} className="mt-1" />
        </div>

        <div>
          <Label>Service Area</Label>
          <Input value={form.service_area} onChange={e => update('service_area', e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label>Education</Label>
          <Input value={form.education} onChange={e => update('education', e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label>Languages (comma-separated)</Label>
          <Input value={form.languages} onChange={e => update('languages', e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label>Specialties (comma-separated)</Label>
          <Input value={form.specialties} onChange={e => update('specialties', e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label>Certifications (comma-separated)</Label>
          <Input value={form.certifications} onChange={e => update('certifications', e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label>Emergency Contact</Label>
          <Input value={form.emergency_contact} onChange={e => update('emergency_contact', e.target.value)} className="mt-1" />
        </div>

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full h-11 font-semibold">
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </Card>
    </div>
  );
}