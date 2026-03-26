import { FormEvent, useState } from 'react'
import { Check, MapPin, Plus } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { useSavedLocations } from '../features/parents/hooks/useSavedLocations'

export function ParentLocationsPage() {
  const { user, isAuthenticated, login } = useAuth()
  const { data: savedLocations = [], addLocation, setActiveLocation } = useSavedLocations(user?.id)
  const [label, setLabel] = useState('')
  const [locationText, setLocationText] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!isAuthenticated) {
      login(`${window.location.origin}/parent/locations`, 'parent')
      return
    }
    if (!label || !locationText) return
    await addLocation.mutateAsync({ label, locationText })
    setLabel('')
    setLocationText('')
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="boutique-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Saved locations</p>
          <h1 className="mt-3 text-3xl">Switch family places with ease.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Keep multiple family locations on hand and change your active discovery area whenever routines, school pickups, or holidays shift.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-3 md:grid-cols-[0.9fr_1.2fr_auto]">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (Home, Grandparents)" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <input value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="West London, Kensington & Chelsea" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none" />
            <Button type="submit" className="h-12 rounded-full px-5 shadow-elegant"><Plus className="mr-2 h-4 w-4" />Add</Button>
          </form>

          <div className="mt-8 grid gap-4">
            {savedLocations.map((location: any) => {
              const active = Number(location.isActive) > 0
              return (
                <div key={location.id} className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{location.label}</div>
                      <div className="text-sm text-muted-foreground">{location.locationText}</div>
                    </div>
                  </div>
                  <Button onClick={() => setActiveLocation.mutate(location.id)} variant={active ? 'secondary' : 'outline'} className="rounded-full px-5">
                    {active ? <><Check className="mr-2 h-4 w-4" />Active</> : 'Make active'}
                  </Button>
                </div>
              )
            })}
            {savedLocations.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-card/60 p-6 text-sm leading-6 text-muted-foreground">
                Sign in as a parent to save more than one location and let CozyCare remember your family’s usual care areas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
