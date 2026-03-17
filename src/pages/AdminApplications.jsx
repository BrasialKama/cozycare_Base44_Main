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
import { TrustBadgeRow } from '@/components/shared/TrustBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const statusStyles = {
  pending: 'bg-peach/50 text-peach-dark',
  approved: 'bg-sage/30 text-sage-foreground',
  rejected: 'bg-destructive/10 text-destructive',
  suspended: 'bg-muted text-muted-foreground',
};

const ALL_BADGES = ['id_verified', 'background_check', 'reference_checked', 'video_verified', 'certifications_verified'];

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
      toast.success('Profile updated');
    },
  });

  const pending = nannies.filter(n => n.status === 'pending');
  const approved = nannies.filter(n => n.status === 'approved');
  const rejected = nannies.filter(n => n.status === 'rejected');

  const NannyRow = ({ nanny }) => (
    <Card className="p-4 border-border/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0">
            {nanny.photo_url ? (
              <img src={nanny.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {(nanny.display_name || nanny.full_name || '?')[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{nanny.full_name}</h3>
              <Badge className={`text-[10px] ${statusStyles[nanny.status]} border-0`}>{nanny.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{nanny.user_email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">${nanny.hourly_rate}/hr · {nanny.years_experience || 0} yrs exp · {nanny.service_area || '—'}</p>
            {nanny.badges?.length > 0 && (
              <div className="mt-1.5">
                <TrustBadgeRow badges={nanny.badges} />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Eye className="w-3 h-3 mr-1" /> Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{nanny.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm mt-2">
                <div><strong>Email:</strong> {nanny.user_email}</div>
                <div><strong>Display Name:</strong> {nanny.display_name}</div>
                <div><strong>Rate:</strong> ${nanny.hourly_rate}/hr</div>
                <div><strong>Experience:</strong> {nanny.years_experience} years</div>
                <div><strong>Education:</strong> {nanny.education || '—'}</div>
                <div><strong>Languages:</strong> {nanny.languages?.join(', ') || '—'}</div>
                <div><strong>Specialties:</strong> {nanny.specialties?.join(', ') || '—'}</div>
                <div><strong>Certifications:</strong> {nanny.certifications?.join(', ') || '—'}</div>
                <div><strong>Bio:</strong> {nanny.bio || '—'}</div>
                {nanny.id_document_url && (
                  <a href={nanny.id_document_url} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> View ID Document
                  </a>
                )}
                {nanny.intro_video_url && (
                  <div>
                    <p className="font-semibold mb-1">Intro Video:</p>
                    <video src={nanny.intro_video_url} controls className="w-full rounded-lg" />
                  </div>
                )}

                {/* Badge management */}
                <div className="pt-3 border-t">
                  <p className="font-semibold mb-2">Manage Trust Badges:</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_BADGES.map(badge => {
                      const hasBadge = nanny.badges?.includes(badge);
                      return (
                        <Button
                          key={badge}
                          variant={hasBadge ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const newBadges = hasBadge
                              ? (nanny.badges || []).filter(b => b !== badge)
                              : [...(nanny.badges || []), badge];
                            updateMutation.mutate({ id: nanny.id, data: { badges: newBadges } });
                          }}
                        >
                          {badge.replace(/_/g, ' ')}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {nanny.status === 'pending' && (
            <>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => updateMutation.mutate({ id: nanny.id, data: { status: 'approved' } })}
              >
                <Check className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs text-destructive"
                onClick={() => updateMutation.mutate({ id: nanny.id, data: { status: 'rejected' } })}
              >
                <X className="w-3 h-3 mr-1" /> Reject
              </Button>
            </>
          )}
          {nanny.status === 'approved' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs text-destructive"
              onClick={() => updateMutation.mutate({ id: nanny.id, data: { status: 'suspended' } })}
            >
              Suspend
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader icon={ClipboardList} title="Nanny Applications" subtitle="Review and manage nanny profiles" />

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          {pending.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No pending applications" />
          ) : (
            <div className="space-y-3">{pending.map(n => <NannyRow key={n.id} nanny={n} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="approved">
          {approved.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No approved nannies" />
          ) : (
            <div className="space-y-3">{approved.map(n => <NannyRow key={n.id} nanny={n} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="rejected">
          {rejected.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No rejected applications" />
          ) : (
            <div className="space-y-3">{rejected.map(n => <NannyRow key={n.id} nanny={n} />)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}