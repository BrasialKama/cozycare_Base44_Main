import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import ReportConversationPanels from '@/components/admin/ReportConversationPanels';
import { toast } from 'sonner';

const statusStyles = {
  open: 'bg-destructive/10 text-destructive',
  investigating: 'bg-peach/50 text-peach-dark',
  resolved: 'bg-sage/30 text-sage-foreground',
  dismissed: 'bg-muted text-muted-foreground',
};

export default function AdminReports() {
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => base44.entities.Report.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const resp = await base44.functions.invoke('updateReportStatus', { report_id: id, status });
      const data = resp?.data || resp;
      if (!data?.success) throw new Error(data?.error || 'Ažuriranje nije uspjelo.');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      toast.success('Prijava ažurirana');
    },
    onError: (err) => {
      console.error('updateReport failed:', err);
      toast.error(err?.message || 'Ažuriranje nije uspjelo.');
    },
  });

  return (
    <div>
      <PageHeader icon={Shield} title="Prijave problema" subtitle="Upravljajte prijavama sigurnosti i sporovima" />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted/40 rounded-2xl animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border/60 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-sage/15 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-sage-foreground/40" />
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground mb-1.5">Nema otvorenih prijava</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Kad korisnici prijave problem ili sustav označi sumnjivu rezervaciju, prijave će se pojaviti ovdje.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <Card key={r.id} className="p-4 border-border/60">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <Badge className={`text-[11px] ${statusStyles[r.status]} border-0`}>{r.status === 'open' ? 'Otvoreno' : r.status === 'investigating' ? 'Istraživanje' : r.status === 'resolved' ? 'Riješeno' : r.status === 'dismissed' ? 'Odbačeno' : r.status}</Badge>
                    <Badge variant="outline" className="text-[11px]">{
                      r.category === 'safety_concern' ? 'Sigurnosni problem' :
                      r.category === 'inappropriate_behavior' ? 'Neprimjereno ponašanje' :
                      r.category === 'no_show' ? 'Nedolazak' :
                      r.category === 'payment_dispute' ? 'Spor oko plaćanja' :
                      r.category === 'early_completion' ? 'Prerani završetak' :
                      r.category === 'parent_dispute' ? 'Prijava obitelji' :
                      r.category === 'other' ? 'Ostalo' :
                      r.category?.replace(/_/g, ' ')
                    }</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Prijavio/la: {r.reporter_email}
                    {r.reported_email && ` · Protiv: ${r.reported_email}`}
                  </p>
                  {r.admin_notes && (
                    <div className="mt-2 bg-muted/40 border border-border/40 rounded-lg p-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Zabilješke / odgovori</p>
                      <pre className="text-[11px] text-foreground whitespace-pre-wrap font-body leading-relaxed">{r.admin_notes}</pre>
                    </div>
                  )}
                </div>
                <Select
                  value={r.status}
                  onValueChange={(status) => updateMutation.mutate({ id: r.id, status })}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Otvoreno</SelectItem>
                    <SelectItem value="investigating">Istraživanje</SelectItem>
                    <SelectItem value="resolved">Riješeno</SelectItem>
                    <SelectItem value="dismissed">Odbačeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {r.booking_id && (
                <ReportConversationPanels reportId={r.id} />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}