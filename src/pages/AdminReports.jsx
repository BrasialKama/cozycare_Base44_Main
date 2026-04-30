import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import AdminReportRow from '@/components/admin/AdminReportRow';
import { toast } from 'sonner';

export default function AdminReports() {
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => base44.entities.Report.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, verdict_note }) => {
      const resp = await base44.functions.invoke('updateReportStatus', {
        report_id: id,
        status,
        verdict_note: verdict_note || undefined,
      });
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
            <AdminReportRow key={r.id} report={r} onUpdate={updateMutation.mutate} />
          ))}
        </div>
      )}
    </div>
  );
}