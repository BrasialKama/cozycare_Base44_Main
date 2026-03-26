import { Link } from '@tanstack/react-router'
import { CheckCircle2, FileVideo, MapPinned, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { useNannyProfile, isPubliclyDiscoverable } from '../features/nannies/hooks/useNannyProfile'

export function NannyDashboardPage() {
  const { user, isAuthenticated, login } = useAuth()
  const { data: profile } = useNannyProfile(user?.id)

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-background py-14">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="boutique-card p-8 text-center">
            <h1 className="text-3xl">Sign in to manage your caregiver profile.</h1>
            <Button onClick={() => login(`${window.location.origin}/nanny/dashboard`, 'nanny')} className="mt-8 h-12 rounded-full px-6 shadow-elegant">Continue as Nanny</Button>
          </div>
        </div>
      </div>
    )
  }

  const checklist = [
    { label: 'Profile basics completed', done: Boolean(profile?.displayName && profile?.bio), icon: CheckCircle2 },
    { label: 'Service area and availability set', done: Boolean(profile?.serviceArea && profile?.availability), icon: MapPinned },
    { label: 'Video verification uploaded', done: Boolean(profile?.videoUrl), icon: FileVideo },
    { label: 'Trust review approved for discovery', done: isPubliclyDiscoverable(profile), icon: ShieldCheck },
  ]

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="boutique-card p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Nanny dashboard</p>
            <h1 className="mt-3 text-3xl">Your profile, trust progress, and requests.</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              CozyCare keeps your professional setup polished while making each verification step transparent and reassuring for families.
            </p>
            <div className="mt-8 space-y-4">
              {checklist.map(({ label, done, icon: Icon }) => (
                <div key={label} className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card px-5 py-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${done ? 'bg-secondary/15 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-sm text-foreground">{label}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{done ? 'Done' : 'Pending'}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-5 shadow-elegant"><Link to="/nanny/onboarding">Edit profile setup</Link></Button>
              <Button asChild variant="outline" className="rounded-full px-5"><Link to="/nannies">Preview public discovery</Link></Button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="boutique-card p-6">
              <h2 className="text-xl">Discoverability</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Only approved nannies appear in public discovery. Your current status is <span className="font-medium text-foreground">{isPubliclyDiscoverable(profile) ? 'ready for public discovery' : 'private until review is complete'}</span>.
              </p>
            </div>
            <div className="boutique-card p-6">
              <h2 className="text-xl">Requests & next steps</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Booking requests, messages, and schedule coordination will live here once your trust review is fully approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
