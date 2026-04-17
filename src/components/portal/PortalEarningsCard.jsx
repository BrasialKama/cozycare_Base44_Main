import React from 'react';
import { Link } from 'react-router-dom';
import { Euro, ArrowRight } from 'lucide-react';

export default function PortalEarningsCard({ bookings }) {
  const now = new Date();
  const thisMonth = bookings.filter(b => {
    if (b.status !== 'Završeno') return false;
    const d = new Date(b.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthTotal = thisMonth.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const allTimeTotal = bookings.filter(b => b.status === 'Završeno').reduce((sum, b) => sum + (b.total_price || 0), 0);

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-base">Zarada</h3>
        <Link to="/Earnings" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          Detalji <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary/6 rounded-xl p-4">
          <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center mb-2">
            <Euro className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="font-display text-2xl font-bold text-foreground">€{monthTotal.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ovaj mjesec</p>
        </div>
        <div className="bg-sage/15 rounded-xl p-4">
          <div className="w-9 h-9 rounded-xl bg-sage/25 flex items-center justify-center mb-2">
            <Euro className="w-4.5 h-4.5 text-sage-foreground" />
          </div>
          <p className="font-display text-2xl font-bold text-foreground">€{allTimeTotal.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ukupno</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        {thisMonth.length} {thisMonth.length === 1 ? 'završen termin' : 'završenih termina'} ovaj mjesec
      </p>
    </div>
  );
}