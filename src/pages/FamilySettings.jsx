import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { User, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from 'sonner';

export default function FamilySettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['familyProfile', user?.email],
    queryFn: () => base44.entities.FamilyProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const existing = profiles[0];

  const [form, setForm] = useState({
    family_name: '',
    address: '',
    neighborhood: '',
    phone: '',
    emergency_contact: '',
    schedule_preferences: '',
    special_requirements: '',
    preferred_languages: '',
    children: [{ name: '', age: '', needs: '' }],
  });

  useEffect(() => {
    if (existing) {
      setForm({
        family_name: existing.family_name || '',
        address: existing.address || '',
        neighborhood: existing.neighborhood || '',
        phone: existing.phone || '',
        emergency_contact: existing.emergency_contact || '',
        schedule_preferences: existing.schedule_preferences || '',
        special_requirements: existing.special_requirements || '',
        preferred_languages: (existing.preferred_languages || []).join(', '),
        children: existing.children?.length > 0 ? existing.children : [{ name: '', age: '', needs: '' }],
      });
    }
  }, [existing]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addChild = () => setForm(prev => ({
    ...prev,
    children: [...prev.children, { name: '', age: '', needs: '' }],
  }));

  const updateChild = (idx, key, val) => {
    const newChildren = [...form.children];
    newChildren[idx] = { ...newChildren[idx], [key]: val };
    setForm(prev => ({ ...prev, children: newChildren }));
  };

  const removeChild = (idx) => {
    setForm(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== idx),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        user_email: user.email,
        family_name: form.family_name,
        address: form.address,
        neighborhood: form.neighborhood,
        phone: form.phone,
        emergency_contact: form.emergency_contact,
        schedule_preferences: form.schedule_preferences,
        special_requirements: form.special_requirements,
        preferred_languages: form.preferred_languages.split(',').map(s => s.trim()).filter(Boolean),
        children: form.children.filter(c => c.name),
      };
      if (existing) {
        await base44.entities.FamilyProfile.update(existing.id, data);
      } else {
        await base44.entities.FamilyProfile.create(data);
      }
      await base44.auth.updateMe({
        onboarding_complete: true,
        display_name: form.family_name || user?.full_name,
        phone: form.phone,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyProfile'] });
      toast.success('Family profile saved!');
      if (!existing) navigate('/Home');
    },
  });

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader icon={User} title="My Family Profile" subtitle="Tell us about your family so we can find the best nannies" />

      <Card className="p-6 space-y-5">
        <div>
          <Label>Family Name</Label>
          <Input value={form.family_name} onChange={e => update('family_name', e.target.value)} placeholder="e.g., The Smith Family" className="mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" className="mt-1" />
          </div>
          <div>
            <Label>Neighborhood</Label>
            <Input value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} className="mt-1" />
          </div>
        </div>

        <div>
          <Label>Address</Label>
          <Input value={form.address} onChange={e => update('address', e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label>Emergency Contact</Label>
          <Input value={form.emergency_contact} onChange={e => update('emergency_contact', e.target.value)} className="mt-1" />
        </div>

        {/* Children */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Children</Label>
            <Button variant="ghost" size="sm" onClick={addChild} className="text-xs text-primary">
              <Plus className="w-3 h-3 mr-1" /> Add child
            </Button>
          </div>
          <div className="space-y-3">
            {form.children.map((child, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Input
                    placeholder="Name"
                    value={child.name}
                    onChange={e => updateChild(idx, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Age"
                    type="number"
                    value={child.age}
                    onChange={e => updateChild(idx, 'age', e.target.value)}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Special needs"
                    value={child.needs}
                    onChange={e => updateChild(idx, 'needs', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={() => removeChild(idx)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Schedule Preferences</Label>
          <Textarea value={form.schedule_preferences} onChange={e => update('schedule_preferences', e.target.value)} rows={2} className="mt-1" placeholder="e.g., Weekday mornings, occasional date nights" />
        </div>

        <div>
          <Label>Special Requirements</Label>
          <Textarea value={form.special_requirements} onChange={e => update('special_requirements', e.target.value)} rows={2} className="mt-1" placeholder="e.g., Pet-friendly, nut allergy awareness" />
        </div>

        <div>
          <Label>Preferred Languages (comma-separated)</Label>
          <Input value={form.preferred_languages} onChange={e => update('preferred_languages', e.target.value)} className="mt-1" />
        </div>

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full h-11 font-semibold">
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </Card>
    </div>
  );
}