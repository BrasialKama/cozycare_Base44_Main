import { FormEvent, useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { useParentProfile } from '../features/parents/hooks/useParentProfile'
import { getDiscoveryPreferences } from '../features/app/session'
import { isAuthSessionError } from '../utils/errors'

export function ParentAccountPage() {
  const { user, isAuthenticated, login, loading } = useAuth()
  const preferences = getDiscoveryPreferences()
  const { data: profile, saveProfile } = useParentProfile(user?.id)
  const [form, setForm] = useState({
    familyName: '',
    householdDetails: '',
    childrenCount: 1,
    childrenAges: '',
    needs: '',
    location: preferences?.location ?? '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredSchedule: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        familyName: profile.familyName || '',
        householdDetails: profile.householdDetails || '',
        childrenCount: Number(profile.childrenCount || 1),
        childrenAges: profile.childrenAges || '',
        needs: profile.needs || '',
        location: profile.location || preferences?.location || '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        preferredSchedule: profile.preferredSchedule || '',
      })
    }
  }, [profile, preferences?.location])

  const updateField = (key: string, value: string | number) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (loading || !isAuthenticated) {
      login(`${window.location.origin}/parent/account`, 'parent')
      return
    }

    try {
      await saveProfile.mutateAsync({ ...form, isOnboarded: '1' })
    } catch (error) {
      if (isAuthSessionError(error)) {
        login(`${window.location.origin}/parent/account`, 'parent')
        return
      }
      throw error
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <form onSubmit={handleSubmit} className="boutique-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Parent account</p>
          <h1 className="mt-3 text-3xl">Set up your family profile with care.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            CozyCare uses these details to make location memory, booking clarity, and trust-first communication feel effortless.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input value={form.familyName} onChange={(e) => updateField('familyName', e.target.value)} placeholder="Family name" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="Primary location" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input type="number" min="1" value={form.childrenCount} onChange={(e) => updateField('childrenCount', Number(e.target.value))} placeholder="Children count" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={form.childrenAges} onChange={(e) => updateField('childrenAges', e.target.value)} placeholder="Children ages (e.g. 2, 5, 8)" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={form.emergencyContactName} onChange={(e) => updateField('emergencyContactName', e.target.value)} placeholder="Emergency contact name" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={form.emergencyContactPhone} onChange={(e) => updateField('emergencyContactPhone', e.target.value)} placeholder="Emergency contact phone" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
          </div>

          <textarea value={form.householdDetails} onChange={(e) => updateField('householdDetails', e.target.value)} placeholder="Household details, routines, or values" className="mt-4 min-h-28 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />
          <textarea value={form.needs} onChange={(e) => updateField('needs', e.target.value)} placeholder="Care needs and notes" className="mt-4 min-h-28 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />
          <textarea value={form.preferredSchedule} onChange={(e) => updateField('preferredSchedule', e.target.value)} placeholder="Preferred schedule (weekdays, evenings, recurring support)" className="mt-4 min-h-24 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />

          <Button type="submit" className="mt-6 h-12 rounded-full px-6 shadow-elegant">Save parent profile</Button>
        </form>
      </div>
    </div>
  )
}
