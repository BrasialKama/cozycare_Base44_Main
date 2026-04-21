import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ClipboardList, Check, X, Eye, Star, StarOff, Shield,
  EyeOff, AlertCircle, Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-destructive/10 text-destructive',
};

function NannyDetailDialog({ nanny }) {
  return (
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
        <div className="space-y-4 text-sm mt-2">
          <div className="flex items-center gap-3">
            {nanny.photo_url ? (
              <img src={nanny.photo_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {(nanny.first_name || '?')[0]}
              </div>
            )}
            <div>
              <p className="font-semibold">{nanny.first_name} {nanny.last_name}</p>
              <p className="text-xs text-muted-foreground">{nanny.user_email}</p>
              <div className="flex gap-1.5 mt-1">
                <Badge className={`text-[10px] ${STATUS_BADGE[nanny.status]} border-0`}>{nanny.status === 'pending' ? 'Na čekanju' : nanny.status === 'approved' ? 'Odobrena' : nanny.status === 'rejected' ? 'Odbijena' : nanny.status}</Badge>
                <Badge className={`text-[10px] ${nanny.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'} border-0`}>
                  {nanny.is_active ? 'Aktivna' : 'Neaktivna'}
                </Badge>
                {nanny.is_featured && <Badge className="text-[10px] bg-amber-100 text-amber-800 border-0">Istaknuta</Badge>}
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-muted-foreground">Satnica:</span> <strong>€{nanny.hourly_rate}/h</strong></div>
            <div><span className="text-muted-foreground">Iskustvo:</span> <strong>{nanny.years_experience || 0} god.</strong></div>
            <div><span className="text-muted-foreground">Lokacija:</span> <strong>{nanny.location || '—'}</strong></div>
            <div><span className="text-muted-foreground">Ocjena:</span> <strong>{nanny.rating || 0}/5 ({nanny.review_count || 0})</strong></div>
          </div>
          <Separator />
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
          {nanny.id_document_url && (
            <div>
              <p className="font-semibold mb-1">Osobna iskaznica:</p>
              <a href={nanny.id_document_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">
                Otvori dokument →
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NannyRow({ nanny, onAction, isUpdating }) {
  return (
    <Card className="p-4 border-border/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-border flex-shrink-0">
            {nanny.photo_url ? (
              <img src={nanny.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {(nanny.first_name || '?')[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">{nanny.first_name} {nanny.last_name}</h3>
              <Badge className={`text-[10px] ${STATUS_BADGE[nanny.status]} border-0`}>{nanny.status === 'pending' ? 'Na čekanju' : nanny.status === 'approved' ? 'Odobrena' : nanny.status === 'rejected' ? 'Odbijena' : nanny.status}</Badge>
              {nanny.is_featured && <Badge className="text-[10px] bg-amber-100 text-amber-800 border-0">⭐ Istaknuta</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              €{nanny.hourly_rate}/h · {nanny.years_experience || 0} god. · {nanny.location || '—'}
            </p>
            {nanny.certifications?.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{nanny.certifications.join(', ')}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          <NannyDetailDialog nanny={nanny} />

          {/* Approve */}
          {nanny.status !== 'approved' && (
            <Button
              size="sm"
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
              disabled={isUpdating}
              onClick={() => onAction(nanny.id, { status: 'approved', is_active: true })}
            >
              <Check className="w-3 h-3 mr-1" /> Odobri
            </Button>
          )}

          {/* Reject */}
          {nanny.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs text-destructive border-destructive/30"
              disabled={isUpdating}
              onClick={() => onAction(nanny.id, { status: 'rejected', is_active: false })}
            >
              <X className="w-3 h-3 mr-1" /> Odbij
            </Button>
          )}

          {/* Deactivate / Activate */}
          {nanny.status === 'approved' && (
            <Button
              size="sm"
              variant="outline"
              className={`h-8 text-xs ${nanny.is_active ? 'text-destructive border-destructive/30' : 'text-emerald-700 border-emerald-300'}`}
              disabled={isUpdating}
              onClick={() => onAction(nanny.id, { is_active: !nanny.is_active })}
            >
              {nanny.is_active ? <><EyeOff className="w-3 h-3 mr-1" /> Deaktiviraj</> : <><Eye className="w-3 h-3 mr-1" /> Aktiviraj</>}
            </Button>
          )}

          {/* Feature toggle */}
          {nanny.status === 'approved' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-amber-700"
              disabled={isUpdating}
              onClick={() => onAction(nanny.id, { is_featured: !nanny.is_featured })}
              title={nanny.is_featured ? 'Ukloni iz istaknutih' : 'Istakni na naslovnici'}
            >
              {nanny.is_featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function AdminApplications() {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState(null);

  const { data: nannies = [], isLoading } = useQuery({
    queryKey: ['allNanniesAdmin'],
    queryFn: () => base44.entities.NannyProfile.list('-created_date'),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['adminReportsCount'],
    queryFn: () => base44.entities.Report.filter({ status: 'open' }, '-created_date', 50),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      setUpdatingId(id);
      await base44.entities.NannyProfile.update(id, data);
      await base44.functions.invoke('syncPublicNannyProfile', { nanny_profile_id: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNanniesAdmin'] });
      toast.success('Profil ažuriran');
      setUpdatingId(null);
    },
    onError: (err) => {
      toast.error('Greška: ' + (err.message || 'Ažuriranje nije uspjelo'));
      setUpdatingId(null);
    },
  });

  const handleAction = (id, data) => updateMutation.mutate({ id, data });

  const pending = nannies.filter(n => n.status === 'pending');
  const approved = nannies.filter(n => n.status === 'approved');
  const rejected = nannies.filter(n => n.status === 'rejected');

  return (
    <div>
      <PageHeader
        icon={ClipboardList}
        title="Upravljanje dadiljama"
        subtitle="Odobrite, odbijte, istaknite ili deaktivirajte profile dadilja"
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Na čekanju', count: pending.length, color: 'text-amber-700 bg-amber-50' },
          { label: 'Odobrene', count: approved.length, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Odbijene', count: rejected.length, color: 'text-destructive bg-destructive/8' },
          { label: 'Otvoreni problemi', count: reports.length, color: 'text-primary bg-primary/8' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl px-4 py-3 ${s.color}`}>
            <p className="text-2xl font-display font-bold">{s.count}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Na čekanju ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Odobrene ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Odbijene ({rejected.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pending.length === 0 ? (
              <EmptyState icon={ClipboardList} title="Nema prijava na čekanju" description="Sve prijave su pregledane." />
            ) : (
              <div className="space-y-3">{pending.map(n => <NannyRow key={n.id} nanny={n} onAction={handleAction} isUpdating={updatingId === n.id} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approved.length === 0 ? (
              <EmptyState icon={ClipboardList} title="Nema odobrenih dadilja" />
            ) : (
              <div className="space-y-3">{approved.map(n => <NannyRow key={n.id} nanny={n} onAction={handleAction} isUpdating={updatingId === n.id} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejected.length === 0 ? (
              <EmptyState icon={ClipboardList} title="Nema odbijenih dadilja" />
            ) : (
              <div className="space-y-3">{rejected.map(n => <NannyRow key={n.id} nanny={n} onAction={handleAction} isUpdating={updatingId === n.id} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}