import { FormEvent, useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { useNannyProfile } from '../features/nannies/hooks/useNannyProfile'
import { isAuthSessionError } from '../utils/errors'

export function NannyOnboardingPage() {
  const { user, isAuthenticated, login, loading } = useAuth()
  const { data: profile, saveProfile } = useNannyProfile(user?.id)
  const [form, setForm] = useState({
    displayName: '',
    legalName: '',
    bio: '',
    serviceArea: '',
    supportedLocations: '',
    yearsOfExperience: 0,
    certifications: '',
    languages: '',
    specialties: '',
    ageGroups: '',
    referencesInfo: '',
    hourlyRate: 0,
    contactPhone: '',
    contactEmail: '',
    serviceRadius: '',
    availability: '',
    videoUrl: '',
  })

  useEffect(() => {
    if (!profile) return
    setForm({
      displayName: profile.displayName || '',
      legalName: profile.legalName || '',
      bio: profile.bio || '',
      serviceArea: profile.serviceArea || '',
      supportedLocations: profile.supportedLocations || '',
      yearsOfExperience: Number(profile.yearsOfExperience || 0),
      certifications: profile.certifications || '',
      languages: profile.languages || '',
      specialties: profile.specialties || '',
      ageGroups: profile.ageGroups || '',
      referencesInfo: profile.referencesInfo || '',
      hourlyRate: Number(profile.hourlyRate || 0),
      contactPhone: profile.contactPhone || '',
      contactEmail: profile.contactEmail || '',
      serviceRadius: profile.serviceRadius || '',
      availability: profile.availability || '',
      videoUrl: profile.videoUrl || '',
    })
  }, [profile])

  const updateField = (key: string, value: string | number) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (loading || !isAuthenticated) {
      login(`${window.location.origin}/nanny/onboarding`, 'nanny')
      return
    }

    try {
      await saveProfile.mutateAsync(form)
    } catch (error) {
      if (isAuthSessionError(error)) {
        login(`${window.location.origin}/nanny/onboarding`, 'nanny')
        return
      }
      throw error
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <form onSubmit={handleSubmit} className="boutique-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Nanny onboarding</p>
          <h1 className="mt-3 text-3xl">Build a warm, trust-led caregiver portfolio.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Your introduction, verification details, experience, and service area all come together here. Video verification is central to becoming discoverable.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input value={form.displayName} onChange={(e) => updateField('displayName', e.target.value)} placeholder="Display name" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={form.legalName} onChange={(e) => updateField('legalName', e.target.value)} placeholder="Legal name" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} placeholder="Contact email" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={form.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value)} placeholder="Contact phone" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={form.serviceArea} onChange={(e) => updateField('serviceArea', e.target.value)} placeholder="Primary service area" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={form.supportedLocations} onChange={(e) => updateField('supportedLocations', e.target.value)} placeholder="Supported locations" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input type="number" value={form.yearsOfExperience} onChange={(e) => updateField('yearsOfExperience', Number(e.target.value))} placeholder="Years of experience" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input type="number" value={form.hourlyRate} onChange={(e) => updateField('hourlyRate', Number(e.target.value))} placeholder="Hourly rate" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
          </div>

          <textarea value={form.bio} onChange={(e) => updateField('bio', e.target.value)} placeholder="Professional introduction and care philosophy" className="mt-4 min-h-28 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />
          <textarea value={form.specialties} onChange={(e) => updateField('specialties', e.target.value)} placeholder="Specialties (newborn care, after-school support, SEN, travel care)" className="mt-4 min-h-24 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />
          <textarea value={form.ageGroups} onChange={(e) => updateField('ageGroups', e.target.value)} placeholder="Age groups served" className="mt-4 min-h-24 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />
          <textarea value={form.certifications} onChange={(e) => updateField('certifications', e.target.value)} placeholder="Certifications and formal qualifications" className="mt-4 min-h-24 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />
          <textarea value={form.languages} onChange={(e) => updateField('languages', e.target.value)} placeholder="Languages spoken" className="mt-4 min-h-24 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />
          <textarea value={form.referencesInfo} onChange={(e) => updateField('referencesInfo', e.target.value)} placeholder="References and past family details" className="mt-4 min-h-24 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />
          <textarea value={form.availability} onChange={(e) => updateField('availability', e.target.value)} placeholder="Availability and recurring windows" className="mt-4 min-h-24 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input value={form.serviceRadius} onChange={(e) => updateField('serviceRadius', e.target.value)} placeholder="Service radius (e.g. 8 miles)" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={form.videoUrl} onChange={(e) => updateField('videoUrl', e.target.value)} placeholder="Verification / intro video URL" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
          </div>

          <div className="mt-6 rounded-3xl border border-accent/30 bg-accent/10 p-5 text-sm leading-6 text-muted-foreground">
            Required for public discovery: ID verified, background checked, references reviewed, and video verified. Until then, your profile remains warm, polished, and private.
          </div>

          <Button type="submit" className="mt-6 h-12 rounded-full px-6 shadow-elegant">Save nanny onboarding</Button>
        </form>
      </div>
    </div>
  )
}
