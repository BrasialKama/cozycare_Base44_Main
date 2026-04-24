import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, ChevronDown, ChevronUp, Loader2, Users, User } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Inline admin panel on a Report card — renders TWO collapsible threads:
 * one with the family, one with the nanny. Each thread shows its own
 * messages and has its own textarea. Sends are authored as the CozyCare Bot
 * and wrapped with an auto-generated issue-context block so the recipient
 * sees the report summary alongside the admin's message.
 */
function RecipientThread({ reportId, recipient, label, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminReportConversation', reportId, recipient],
    queryFn: async () => {
      const resp = await base44.functions.invoke('adminBotConversation', {
        action: 'get',
        report_id: reportId,
        recipient,
      });
      return resp?.data || resp;
    },
    enabled: open,
    refetchInterval: open ? 8000 : false,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const resp = await base44.functions.invoke('adminBotConversation', {
        action: 'send',
        report_id: reportId,
        recipient,
        content: draft.trim(),
      });
      const d = resp?.data || resp;
      if (!d?.success) throw new Error(d?.error || 'Slanje nije uspjelo.');
    },
    onSuccess: () => {
      setDraft('');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      toast.success('Poruka poslana (' + label.toLowerCase() + ')');
    },
    onError: (e) => toast.error(e?.message || 'Slanje nije uspjelo.'),
  });

  const messages = data?.messages || [];
  const recipientEmail = data?.recipient_email;
  const issueContext = data?.issue_context;
  const unavailable = data?.error;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        <Icon className="w-3.5 h-3.5" />
        {open ? `Sakrij razgovor: ${label}` : `Razgovor: ${label}`}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {recipientEmail && (
            <p className="text-[11px] text-muted-foreground">{label}: {recipientEmail}</p>
          )}

          {issueContext && (
            <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-amber-900 mb-1">Sažetak slučaja</p>
              <pre className="text-[11px] text-amber-900/90 whitespace-pre-wrap font-body leading-relaxed">{issueContext}</pre>
              <p className="text-[10px] text-amber-800/70 mt-2 italic">Ovaj kontekst automatski se šalje s vašom porukom.</p>
            </div>
          )}

          <div className="bg-muted/30 border border-border/40 rounded-xl p-3 max-h-56 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Učitavanje…
              </div>
            ) : unavailable ? (
              <p className="text-xs text-destructive text-center py-2">{unavailable}</p>
            ) : messages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">Još nema poruka u ovoj niti.</p>
            ) : (
              messages.map(m => {
                const fromBot = m.sender_email === 'bot@cozycare.hr';
                return (
                  <div key={m.id} className={`flex ${fromBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      fromBot ? 'bg-card border border-border/50 text-foreground' : 'bg-primary/10 text-foreground'
                    }`}>
                      <p className="text-[10px] font-semibold mb-0.5 opacity-70">
                        {fromBot ? (m.sender_name || 'CozyCare Bot') : label}
                      </p>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={`Odgovori kao CozyCare podrška…`}
              rows={2}
              className="rounded-xl resize-none text-sm"
            />
            <Button
              onClick={() => sendMutation.mutate()}
              disabled={!draft.trim() || sendMutation.isPending}
              size="icon"
              className="h-10 w-10 rounded-xl flex-shrink-0 self-end"
            >
              {sendMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Vaša poruka ide s automatski priloženim sažetkom slučaja.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ReportConversationPanels({ reportId }) {
  return (
    <div className="mt-3 border-t border-border/40 pt-3 space-y-3">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <MessageCircle className="w-3 h-3" /> Komunikacija
      </p>
      <RecipientThread reportId={reportId} recipient="parent" label="Obitelj" icon={Users} />
      <RecipientThread reportId={reportId} recipient="nanny" label="Dadilja" icon={User} />
    </div>
  );
}