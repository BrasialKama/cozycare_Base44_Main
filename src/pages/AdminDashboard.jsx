import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Calendar, Shield, DollarSign, ClipboardList, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';

export default function AdminDashboard() {
  const { data: nannies = [] } = useQuery({
    queryKey: ['allNannies'],
    queryFn: () => base44.entities.NannyProfile.list(),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['allReports'],
    queryFn: () => base44.entities.Report.list(),
  });

  const pendingApps = nannies.filter(n => n.status === 'pending').length;
  const approvedNannies = nannies.filter(n => n.status === 'approved').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.platform_fee || 0), 0);
  const openReports = reports.filter(r => r.status === 'open').length;

  const stats = [
    { icon: ClipboardList, label: 'Prijave na čekanju', value: pendingApps, color: 'bg-peach/50 text-peach-dark', link: '/AdminApplications' },
    { icon: Users, label: 'Odobrene dadilje', value: approvedNannies, color: 'bg-sage/30 text-sage-foreground', link: '/AdminApplications' },
    { icon: Calendar, label: 'Završene rezervacije', value: completedBookings, color: 'bg-primary/8 text-primary', link: '/AdminBookings' },
    { icon: DollarSign, label: 'Prihod platforme', value: `€${totalRevenue.toFixed(2)}`, color: 'bg-powder-blue/40 text-foreground', link: '/AdminBookings' },
    { icon: Shield, label: 'Otvorene prijave', value: openReports, color: 'bg-destructive/10 text-destructive', link: '/AdminReports' },
    { icon: BarChart3, label: 'Ukupno rezervacija', value: bookings.length, color: 'bg-muted text-muted-foreground', link: '/AdminBookings' },
  ];

  return (
    <div>
      <PageHeader icon={BarChart3} title="Nadzorna ploča" subtitle="Pregled i upravljanje platformom" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.link}>
            <Card className="p-5 hover:shadow-md transition-all border-border/60 hover:border-primary/20 cursor-pointer">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}