import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ClipboardList, Check, X, Eye, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const statusStyles = {
  active: 'bg-sage/30 text-sage-foreground',
  inactive: 'bg-peach/50 text-peach-dark',
};

export default function AdminApplications() {
  const queryClient = useQueryClient();

  const { data: nannies = [] } = useQuery({
    queryKey: ['allNanniesAdmin'],
    queryFn: () => base44.entities.NannyProfile.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NannyProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNanniesAdmin'] });
      toast.success('Profil ažuriran');
    },
  });

  const pending = nannies.filter(n => n.status === 'pending');
  const approved = nannies.filter(n => n.status === 'approved');

  const NannyRow = ({ nanny }) => (
    <Card className="p-4 border-border/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0">
            {nanny.photo_url ? (
              <img src={nanny.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {(nanny.first_name || '?')[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{nanny.first_name} {nanny.last_name}</h3>
              <Badge className={`text-[10px] ${nanny.is_active ? statusStyles.active : statusStyles.inactive} border-0`}>{nanny.is_active ? 'Aktivna' : 'Neaktivna'}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{nanny.created_by}</p>
            <p className="text-xs text-muted-foreground mt-0.5">€{nanny.hourly_rate}/h · {nanny.years_experience || 0} god. iskustva · {nanny.location || '—'}</p>
            {nanny.certifications?.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">{nanny.certifications.join(', ')}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Eye className="w-3 h-3 mr-1" /> Detalji
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{nanny.first_name} {nanny.last_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm mt-2">
                <div><strong>Satnica:</strong> €{nanny.hourly_rate}/h</div>
                <div><strong>Iskustvo:</strong> {nanny.years_experience} godina</div>
                <div><strong>Lokacija:</strong> {nanny.location || '—'}</div>
                <div><strong>Jezici:</strong> {nanny.languages?.join(', ') || '—'}</div>
                <div><strong>Specijalnosti:</strong> {nanny.specialties?.join(', ') || '—'}</div>
                <div><strong>Certifikati:</strong> {nanny.certifications?.join(', ') || '—'}</div>
                <div><strong>Dostupnost:</strong> {nanny.availability?.join(', ') || '—'}</div>
                <div><strong>Dobne skupine:</strong> {nanny.age_groups?.join(', ') || '—'}</div>
                <div><strong>O meni:</strong> {nanny.bio || '—'}</div>
                {nanny.video_url && (
                  <div>
                    <p className="font-semibold mb-1">Video predstavljanje:</p>
                    <video src={nanny.video_url} controls className="w-full rounded-lg" />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {!nanny.is_active && (
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => updateMutation.mutate({ id: nanny.id, data: { is_active: true } })}
            >
              <Check className="w-3 h-3 mr-1" /> Aktiviraj
            </Button>
          )}
          {nanny.is_active && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs text-destructive"
              onClick={() => updateMutation.mutate({ id: nanny.id, data: { is_active: false } })}
            >
              Deaktiviraj
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader icon={ClipboardList} title="Prijave dadilja" subtitle="Pregledajte i upravljajte profilima dadilja" />

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="inactive">Neaktivne ({pending.length})</TabsTrigger>
          <TabsTrigger value="active">Aktivne ({approved.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="inactive">
          {pending.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Nema neaktivnih dadilja" />
          ) : (
            <div className="space-y-3">{pending.map(n => <NannyRow key={n.id} nanny={n} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="active">
          {approved.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Nema aktivnih dadilja" />
          ) : (
            <div className="space-y-3">{approved.map(n => <NannyRow key={n.id} nanny={n} />)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}