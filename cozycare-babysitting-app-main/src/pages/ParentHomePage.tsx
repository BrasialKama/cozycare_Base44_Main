import { Link } from '@tanstack/react-router'
import { CalendarDays, ChevronRight, MapPin, Plus, Settings2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { getDiscoveryPreferences } from '../features/app/session'
import { useSavedLocations } from '../features/parents/hooks/useSavedLocations'
import { demoNannies } from '../features/nannies/demoNannies'
import { NannyCard } from '../features/nannies/components/NannyCard'

export function ParentHomePage() {
  const { user } = useAuth()
  const preferences = getDiscoveryPreferences()
  const { data: savedLocations = [] } = useSavedLocations(user?.id)
  const activeLocation =
    savedLocations.find((item: any) => Number(item.isActive) > 0)?.locationText ||
    preferences?.location ||
    'West London'
  const chosenDate = preferences?.date || new Date().toISOString().slice(0, 10)

  const nannies = demoNannies.filter((nanny) =>
    activeLocation
      ? nanny.serviceArea
          .toLowerCase()
          .includes(activeLocation.toLowerCase().split(',')[0].trim().toLowerCase()) ||
        activeLocation.length < 4
      : true,
  )

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    } catch {
      return d
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Active search context */}
            <div className="boutique-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary mb-3">Your search</p>
              <h1 className="font-serif text-2xl font-bold text-foreground leading-tight">
                Curated matches for your family
              </h1>
              <div className="mt-5 space-y-2.5">
                <div className="flex items-center gap-3 rounded-2xl bg-primary/6 px-4 py-3 text-sm font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{activeLocation}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-accent/10 px-4 py-3 text-sm font-medium text-foreground">
                  <CalendarDays className="h-4 w-4 text-accent-foreground shrink-0" />
                  <span>{formatDate(chosenDate)}</span>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button asChild size="sm" className="rounded-full px-4 shadow-sm text-xs h-9">
                  <Link to="/parent/locations">
                    <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                    Switch location
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-full px-4 text-xs h-9 border-border/60">
                  <Link to="/start">Change date</Link>
                </Button>
              </div>
            </div>

            {/* Saved places */}
            <div className="boutique-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-bold text-foreground">Saved places</h2>
                <Button asChild variant="ghost" size="sm" className="text-primary text-xs rounded-full px-3">
                  <Link to="/parent/locations">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Manage
                  </Link>
                </Button>
              </div>
              <div className="space-y-2.5">
                {savedLocations.slice(0, 4).map((location: any) => {
                  const active = Number(location.isActive) > 0
                  return (
                    <div
                      key={location.id}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${
                        active
                          ? 'border-primary/25 bg-primary/6 text-foreground'
                          : 'border-border/50 bg-background text-muted-foreground'
                      }`}
                    >
                      <MapPin className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground/60'}`} />
                      <div className="min-w-0">
                        <div className={`font-medium truncate ${active ? 'text-foreground' : ''}`}>{location.label}</div>
                        <div className="text-xs truncate opacity-70">{location.locationText}</div>
                      </div>
                      {active && (
                        <span className="ml-auto shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                          Active
                        </span>
                      )}
                    </div>
                  )
                })}
                {savedLocations.length === 0 && (
                  <p className="text-sm leading-6 text-muted-foreground py-1">
                    No saved places yet. Add your family's regular areas so CozyCare can suggest nannies faster next time.
                  </p>
                )}
              </div>
            </div>

            {/* Account CTA for anonymous users */}
            {!user && (
              <div className="boutique-card border-accent/20 bg-accent/5 p-6">
                <h3 className="font-serif text-lg font-bold text-foreground">Save your search</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Create a free parent account to save locations, bookmark nannies, and return to your matches anytime.
                </p>
                <Button asChild size="sm" className="mt-4 rounded-full px-5 shadow-elegant">
                  <Link to="/auth/choose">Create an Account</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Results */}
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Nannies near {activeLocation.split(',')[0]}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Trust-verified matches for{' '}
                  <span className="font-medium text-foreground">{formatDate(chosenDate)}</span>
                </p>
              </div>
              <Link
                to="/nannies"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
              >
                Browse all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5">
              {(nannies.length > 0 ? nannies : demoNannies).map((nanny) => (
                <NannyCard key={nanny.id} nanny={nanny} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
