import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileView from '@/components/profile/ProfileView';
import ProfileEditForm from '@/components/profile/ProfileEditForm';

export default function FamilySettings() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: existing = null, isLoading } = useQuery({
    queryKey: ['familyProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.FamilyProfile.filter(
        { user_email: user?.email },
        '-created_date',
        1
      );
      return profiles?.[0] || null;
    },
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: async (form) => {
      const data = {
        family_name: form.family_name,
        address: form.address,
        neighborhood: form.neighborhood,
        phone: form.phone,
        emergency_contact: form.emergency_contact,
        schedule_preferences: form.schedule_preferences,
        special_requirements: form.special_requirements,
        preferred_languages: String(form.preferred_languages || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        children: (form.children || [])
          .filter(c => c.name)
          .map(c => ({
            ...c,
            age: c.age !== '' ? Number(c.age) : undefined,
          })),
      };

      const currentProfiles = await base44.entities.FamilyProfile.filter(
        { user_email: user?.email },
        '-created_date',
        1
      );

      if (currentProfiles.length > 0) {
        await base44.entities.FamilyProfile.update(currentProfiles[0].id, data);
      } else {
        await base44.entities.FamilyProfile.create({
          ...data,
          user_email: user.email,
        });
      }

      // Personal name → updates user.display_name (what the app calls them by)
      // Family name → stays on the FamilyProfile entity, not on user.display_name
      await base44.auth.updateMe({
        onboarding_complete: true,
        display_name: (form.display_name || '').trim() || user?.display_name || user?.full_name,
        phone: form.phone,
      });

      // Refresh local user state so any downstream page that checks onboarding_complete or display_name sees the new value
      await refreshUser();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyProfile', user?.email] });
      toast.success('Profil spremljen ✓');
      setEditing(false);
    },
    onError: (error) => {
      toast.error('Greška pri spremanju: ' + (error?.message || 'Nepoznata greška'));
    },
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-8">
      <ProfileHeader user={user} onEdit={() => setEditing(true)} />

      {editing ? (
        <ProfileEditForm
          profile={existing}
          isSaving={saveMutation.isPending}
          onSave={(form) => saveMutation.mutate(form)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ProfileView profile={existing} onEdit={() => setEditing(true)} />
      )}
    </div>
  );
}