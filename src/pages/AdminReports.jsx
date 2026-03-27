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
import { toast } from 'sonner';

const statusStyles = {
  open: 'bg-destructive/10 text-destructive',
  investigating: 'bg-peach/50 text-peach-dark',
  resolved: 'bg-sage/30 text-sage-foreground',
  dismissed: 'bg-muted text-muted-foreground',
};

export default function AdminReports() {
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => base44.entities.Report.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Report.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      toast.success('Prijava ažurirana');
    },
  });

  return (
    <div>
      <PageHeader icon={Shield} title="Prijave problema" subtitle="Upravljajte prijavama sigurnosti i sporovima" />

      {reports.length === 0 ? (
        <EmptyState icon={Shield} title="Nema prijava" description="Nema prijavljenih sigurnosnih problema" />
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <Card key={r.id} className="p-4 border-border/60">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <Badge className={`text-[11px] ${statusStyles[r.status]} border-0`}>{r.status}</Badge>
                    <Badge variant="outline" className="text-[11px]">{r.category?.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Prijavio/la: {r.reporter_email}
                    {r.reported_email && ` · Protiv: ${r.reported_email}`}
                  </p>
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}