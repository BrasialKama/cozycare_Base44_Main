import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, X } from 'lucide-react';

const EMPTY_FORM = {
  family_name: '',
  address: '',
  neighborhood: '',
  phone: '',
  emergency_contact: '',
  schedule_preferences: '',
  special_requirements: '',
  preferred_languages: '',
  children: [{ name: '', age: '', needs: '' }],
};

function populateForm(profile) {
  if (!profile) return { ...EMPTY_FORM, children: [{ name: '', age: '', needs: '' }] };
  return {
    family_name: profile.family_name || '',
    address: profile.address || '',
    neighborhood: profile.neighborhood || '',
    phone: profile.phone || '',
    emergency_contact: profile.emergency_contact || '',
    schedule_preferences: profile.schedule_preferences || '',
    special_requirements: profile.special_requirements || '',
    preferred_languages: (profile.preferred_languages || []).join(', '),
    children: profile.children?.length > 0
      ? profile.children.map(c => ({ name: c.name || '', age: c.age != null ? String(c.age) : '', needs: c.needs || '' }))
      : [{ name: '', age: '', needs: '' }],
  };
}

export default function ProfileEditForm({ profile, isSaving, onSave, onCancel }) {
  const [form, setForm] = useState(() => populateForm(profile));

  useEffect(() => {
    setForm(populateForm(profile));
  }, [profile]);

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

  const handleSave = () => onSave(form);

  return (
    <Card className="p-6 space-y-5 border-border/50 shadow-sm">
      <div>
        <Label>Ime obitelji</Label>
        <Input value={form.family_name} onChange={e => update('family_name', e.target.value)} placeholder="npr. Obitelj Horvat" className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Telefon</Label>
          <Input value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" className="mt-1" />
        </div>
        <div>
          <Label>Kvart</Label>
          <Input value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} className="mt-1" />
        </div>
      </div>

      <div>
        <Label>Adresa</Label>
        <Input value={form.address} onChange={e => update('address', e.target.value)} className="mt-1" />
      </div>

      <div>
        <Label>Kontakt za hitne slučajeve</Label>
        <Input value={form.emergency_contact} onChange={e => update('emergency_contact', e.target.value)} className="mt-1" />
      </div>

      {/* Children */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Djeca</Label>
          <Button variant="ghost" size="sm" onClick={addChild} className="text-xs text-primary">
            <Plus className="w-3 h-3 mr-1" /> Dodaj dijete
          </Button>
        </div>
        <div className="space-y-3">
          {form.children.map((child, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Input placeholder="Ime" value={child.name} onChange={e => updateChild(idx, 'name', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Input placeholder="Dob" type="number" value={child.age} onChange={e => updateChild(idx, 'age', e.target.value)} />
              </div>
              <div className="col-span-4">
                <Input placeholder="Posebne potrebe" value={child.needs} onChange={e => updateChild(idx, 'needs', e.target.value)} />
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
        <Label>Preferencije rasporeda</Label>
        <Textarea value={form.schedule_preferences} onChange={e => update('schedule_preferences', e.target.value)} rows={2} className="mt-1" placeholder="npr. jutro radnim danom, povremene večeri" />
      </div>

      <div>
        <Label>Posebni zahtjevi</Label>
        <Textarea value={form.special_requirements} onChange={e => update('special_requirements', e.target.value)} rows={2} className="mt-1" placeholder="npr. ljubimci u kući, alergije na hranu" />
      </div>

      <div>
        <Label>Željeni jezici (odvojeno zarezima)</Label>
        <Input value={form.preferred_languages} onChange={e => update('preferred_languages', e.target.value)} className="mt-1" />
      </div>

      <div className="flex gap-3 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1 h-11 rounded-xl font-semibold">
          <X className="w-4 h-4 mr-2" /> Odustani
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-11 rounded-xl font-semibold shadow-md shadow-primary/15">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Spremanje...' : 'Spremi profil'}
        </Button>
      </div>
    </Card>
  );
}