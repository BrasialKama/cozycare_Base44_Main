import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { MapPin, CalendarDays, ArrowRight, ShieldCheck, Users, Clock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { getDiscoveryPreferences, setDiscoveryPreferences } from '../features/app/session'
import { useAuth } from '../hooks/useAuth'
import { useSavedLocations } from '../features/parents/hooks/useSavedLocations'

export function LocationDateEntryPage() {
  const navigate = useNavigate()
  const { user, intent } = useAuth()
  const { data: savedLocations = [], addLocation } = useSavedLocations(user?.id)
  const initial = getDiscoveryPreferences()
  const [location, setLocation] = useState(initial?.location ?? '')
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const active = savedLocations.find((item: any) => Number(item.isActive) > 0)
    if (active && !location) setLocation(active.locationText)
  }, [savedLocations, location])

  const handleContinue = async () => {
    if (!location || !date) return
    setDiscoveryPreferences({ location, date })

    if (user && intent === 'parent' && savedLocations.length === 0) {
      try {
        await addLocation.mutateAsync({ label: 'Home', locationText: location })
      } catch {
        // Non-fatal — user still proceeds to browse nannies even if saving the location fails
      }
    }

    navigate({ to: '/parent/home' })
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] warm-gradient">
      <div className="container mx-auto max-w-5xl px-4 py-14 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

          {/* Main entry card */}
          <div className="boutique-card border-primary/15 p-8 md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Step 1 of 2 — Where &amp; When
            </div>

            <h1 className="max-w-lg font-serif text-4xl md:text-5xl font-bold leading-[1.1] text-foreground">
              Where are you looking for care?
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              Browse curated, verified nannies in your area — no account needed until you're ready to message or book.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="boutique-card border-border/60 p-4 cursor-text hover:border-primary/30 transition-colors">
                <span className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Your location
                </span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kensington, Chelsea, Notting Hill…"
                  className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </label>
              <label className="boutique-card border-border/60 p-4 cursor-pointer hover:border-primary/30 transition-colors">
                <span className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  Care date
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent text-base text-foreground outline-none"
                />
              </label>
            </div>

            {/* Trust pills */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              {[
                'Browse freely — no sign-up required',
                'Only approved nannies shown',
                'Trust badges visible upfront',
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
                  {item}
                </span>
              ))}
            </div>

            <Button
              onClick={handleContinue}
              size="lg"
              disabled={!location || !date}
              className="mt-9 h-12 rounded-full px-8 shadow-elegant group disabled:opacity-50"
            >
              Show me matching nannies
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

          {/* Side info cards */}
          <div className="space-y-4">
            <div className="boutique-card p-6">
              <h2 className="font-serif text-xl font-bold text-foreground">How it works</h2>
              <div className="mt-5 space-y-4">
                {[
                  { icon: <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />, text: 'Enter your area and care date' },
                  { icon: <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />, text: 'Browse warm, curated nanny portfolios' },
                  { icon: <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />, text: 'Create an account only when you want to message or book' },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                    {icon}
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="boutique-card bg-primary/4 border-primary/15 p-6">
              <h2 className="font-serif text-lg font-bold text-foreground">Smart for returning parents</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Once you have a parent account, CozyCare remembers your saved locations and jumps straight to your curated matches — no entry screen needed.
              </p>
            </div>

            <div className="boutique-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary mb-3">Trust first</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Every nanny on CozyCare is ID verified, background checked, and reference reviewed before appearing in search results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
