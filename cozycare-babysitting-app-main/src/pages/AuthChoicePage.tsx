import { useSearch, useNavigate } from '@tanstack/react-router'
import { Heart, Baby, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'

export function AuthChoicePage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/auth/choose' }) as { role?: 'parent' | 'nanny'; next?: string }
  const { isAuthenticated, login, setRoleIntent } = useAuth()

  const handleStart = (role: 'parent' | 'nanny') => {
    const next = role === 'parent' ? '/parent/account' : '/nanny/onboarding'
    if (isAuthenticated) {
      setRoleIntent(role)
      navigate({ to: search.next || next })
      return
    }
    login(`${window.location.origin}${search.next || next}`, role)
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] warm-gradient">
      <div className="container mx-auto max-w-5xl px-4 py-16 md:py-20">

        {/* Header */}
        <div className="mx-auto max-w-xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary mb-6">
            <ShieldCheck className="h-4 w-4" />
            Welcome — choose your path
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-foreground">
            How would you like to join CozyCare?
          </h1>
          <p className="mt-4 text-lg leading-7 text-muted-foreground">
            Whether you're a parent searching for trusted care, or a nanny building your professional profile — your journey starts here.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">

          {/* Parent card — primary, more prominent */}
          <div className="boutique-card border-primary/25 p-8 bg-primary/3 hover:border-primary/40 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary mb-6">
              <Heart className="h-6 w-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              For parents
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground">I'm looking for a nanny</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Save family locations, browse verified caregivers, message nannies directly, and make calm, confident booking decisions — all in one place.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />Browse verified nannies freely</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />Save locations and preferences</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />Book and message with confidence</li>
            </ul>
            <Button
              onClick={() => handleStart('parent')}
              className="mt-8 h-11 rounded-full px-6 shadow-elegant group"
            >
              Continue as Parent
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

          {/* Nanny card — secondary */}
          <div className="boutique-card border-secondary/25 p-8 hover:border-secondary/40 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary mb-6">
              <Baby className="h-6 w-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
              For nannies
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground">I'm a professional nanny</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Build your professional caregiver portfolio, complete trust verification, set your service area, and receive family booking requests with polish.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />Create a verified caregiver profile</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />Upload credentials and intro video</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />Manage your availability and requests</li>
            </ul>
            <Button
              onClick={() => handleStart('nanny')}
              variant="secondary"
              className="mt-8 h-11 rounded-full px-6 group"
            >
              Join as a Nanny
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Just browsing?{' '}
          <a href="/nannies" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
            Browse caregivers — no account needed
          </a>
        </p>
      </div>
    </div>
  )
}
