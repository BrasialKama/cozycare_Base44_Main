import { useMemo, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { getDemoNannyById } from '../features/nannies/demoNannies'
import { getDiscoveryPreferences } from '../features/app/session'

export function BookingRequestPage() {
  const { nannyId } = useParams({ from: '/booking/$nannyId' })
  const { isAuthenticated, login } = useAuth()
  const preferences = getDiscoveryPreferences()
  const nanny = getDemoNannyById(nannyId)
  const [startDate, setStartDate] = useState(preferences?.date ?? new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('22:00')
  const [bookingType, setBookingType] = useState<'one-time' | 'recurring'>('one-time')

  const summary = useMemo(() => {
    if (!nanny) return null
    const hours = Math.max(1, Number(endTime.split(':')[0]) - Number(startTime.split(':')[0]))
    const nannyTotal = hours * nanny.hourlyRate
    const platformFee = Math.round(nannyTotal * 0.12)
    return { hours, nannyTotal, platformFee, total: nannyTotal + platformFee }
  }, [endTime, nanny, startTime])

  if (!nanny) return <div className="p-10 text-center">Booking target not found.</div>

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-background py-14">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="boutique-card p-8 text-center">
            <h1 className="text-3xl">Sign in to request care with {nanny.displayName}.</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Browsing is always free. To send a booking request or message {nanny.displayName}, sign in with your parent account — it only takes a moment.
            </p>
            <Button onClick={() => login(`${window.location.origin}/booking/${nannyId}`, 'parent')} className="mt-8 h-12 rounded-full px-6 shadow-elegant">
              Sign In to Continue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="boutique-card p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Care request</p>
            <h1 className="mt-3 text-3xl">Book care with {nanny.displayName}.</h1>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-muted-foreground">Date<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none" /></label>
              <label className="text-sm text-muted-foreground">Booking type<select value={bookingType} onChange={(e) => setBookingType(e.target.value as 'one-time' | 'recurring')} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none"><option value="one-time">One-time booking</option><option value="recurring">Recurring booking</option></select></label>
              <label className="text-sm text-muted-foreground">Start time<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none" /></label>
              <label className="text-sm text-muted-foreground">End time<input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none" /></label>
            </div>
            <textarea placeholder="Share anything helpful — bedtime routines, allergies, pickup arrangements, or house rules" className="mt-4 min-h-28 w-full rounded-3xl border border-border bg-background px-4 py-3 outline-none" />
            <Button className="mt-6 h-12 rounded-full px-6 shadow-elegant">Send Care Request</Button>
          </div>

          <div className="space-y-6">
            <div className="boutique-card p-8">
              <h2 className="text-2xl">Booking summary</h2>
              <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Nanny rate</span><span className="text-foreground">${nanny.hourlyRate}/hr</span></div>
                <div className="flex justify-between"><span>Estimated hours</span><span className="text-foreground">{summary?.hours}</span></div>
                <div className="flex justify-between"><span>Platform fee</span><span className="text-foreground">${summary?.platformFee}</span></div>
                <div className="flex justify-between border-t border-border pt-4 text-base"><span className="text-foreground">Total</span><span className="font-semibold text-primary">${summary?.total}</span></div>
              </div>
            </div>
            <div className="boutique-card p-6 text-sm leading-6 text-muted-foreground">
              No payment is taken now. Once your request is confirmed by {nanny.displayName.split(' ')[0]}, you'll receive full details before anything is finalised.
              <div className="mt-4"><Link to={`/nannies/${nannyId}`} className="font-medium text-primary">Back to {nanny.displayName.split(' ')[0]}'s profile</Link></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
