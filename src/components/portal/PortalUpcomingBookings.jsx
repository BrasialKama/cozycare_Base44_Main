import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function PortalUpcomingBookings({ bookings }) {
  const upcoming = bookings.filter(b => ['Potvrđeno', 'Na čekanju'].includes(b.status));

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-base">Nadolazeći termini</h3>
        <Link to="/NannyBookings" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          Svi termini <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nema nadolazećih termina</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.slice(0, 4).map(b => (
            <div key={b.id} className="flex items-center gap-4 bg-muted/30 rounded-xl px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-light to-peach/60 flex items-center justify-center flex-shrink-0 text-sm font-display font-bold text-primary">
                {(b.family_name || 'O')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{b.family_name || 'Obitelj'}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {b.date} · {b.start_time}–{b.end_time}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                b.status === 'Na čekanju' ? 'bg-peach/50 text-peach-dark' : 'bg-sage/30 text-sage-foreground'
              }`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}