import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import ReportConversationPanels from '@/components/admin/ReportConversationPanels';

const statusStyles = {
  open: 'bg-destructive/10 text-destructive',
  investigating: 'bg-peach/50 text-peach-dark',
  resolved: 'bg-sage/30 text-sage-foreground',
  dismissed: 'bg-muted text-muted-foreground',
};

const STATUS_LABEL = {
  open: 'Otvoreno',
  investigating: 'Istraživanje',
  resolved: 'Riješeno',
  dismissed: 'Odbačeno',
};

const CATEGORY_LABEL = {
  safety_concern: 'Sigurnosni problem',
  inappropriate_behavior: 'Neprimjereno ponašanje',
  no_show: 'Nedolazak',
  payment_dispute: 'Spor oko plaćanja',
  early_completion: 'Prerani završetak',
  parent_dispute: 'Prijava obitelji',
  other: 'Ostalo',
};

// Statuses that prompt for an optional verdict note before being applied.
const TERMINAL_STATUSES = new Set(['resolved', 'dismissed']);

export default function AdminReportRow({ report, onUpdate }) {
  const [pendingStatus, setPendingStatus] = useState(null);
  const [verdictNote, setVerdictNote] = useState('');

  const handleStatusChange = (status) => {
    if (status === report.status) return;
    if (TERMINAL_STATUSES.has(status)) {
      setPendingStatus(status);
      setVerdictNote('');
    } else {
      onUpdate({ id: report.id, status });
    }
  };

  const handleConfirmTerminal = () => {
    onUpdate({ id: report.id, status: pendingStatus, verdict_note: verdictNote.trim() });
    setPendingStatus(null);
    setVerdictNote('');
  };

  return (
    <Card className="p-4 border-border/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <Badge className={`text-[11px] ${statusStyles[report.status]} border-0`}>
              {STATUS_LABEL[report.status] || report.status}
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              {CATEGORY_LABEL[report.category] || report.category?.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{report.description}</p>
          <p className="text-xs text-muted-foreground mt-1.5">
            Prijavio/la: {report.reporter_email}
            {report.reported_email && ` · Protiv: ${report.reported_email}`}
          </p>
          {report.admin_notes && (
            <div className="mt-2 bg-muted/40 border border-border/40 rounded-lg p-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Zabilješke / odgovori</p>
              <pre className="text-[11px] text-foreground whitespace-pre-wrap font-body leading-relaxed">{report.admin_notes}</pre>
            </div>
          )}
        </div>
        <Select value={report.status} onValueChange={handleStatusChange}>
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
      {report.booking_id && <ReportConversationPanels reportId={report.id} />}

      <AlertDialog open={!!pendingStatus} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus === 'resolved' ? 'Riješiti prijavu' : 'Odbaciti prijavu'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Prijavitelj će dobiti poruku s ovom napomenom. Polje je opcionalno — ako ostavite prazno, neće se poslati nikakva napomena.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Textarea
              value={verdictNote}
              onChange={(e) => setVerdictNote(e.target.value)}
              placeholder="Napomena za prijavitelja (opcionalno)…"
              rows={4}
              maxLength={1000}
            />
            <p className="text-[11px] text-muted-foreground mt-1">{verdictNote.length}/1000</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTerminal}>
              {pendingStatus === 'resolved' ? 'Riješi' : 'Odbaci'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}