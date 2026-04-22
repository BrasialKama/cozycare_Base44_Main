import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { MessageCircle, Send, ArrowLeft, Heart, Pencil, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import useUnreadMessages from '@/hooks/useUnreadMessages';
import SwipeableConversationItem from '@/components/messages/SwipeableConversationItem';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get('conversation_id') || searchParams.get('conversation');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConv, setActiveConv] = useState(initialConvId || null);
  const [newMessage, setNewMessage] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const { markAllRead } = useUnreadMessages();

  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const hideBulk = async () => {
    const ids = [...selectedIds];
    await Promise.all(ids.map(id => hideConversation(id)));
    exitSelectionMode();
  };

  // Mark unread messages as read when page opens
  useEffect(() => {
    if (user?.email) markAllRead();
  }, [user?.email]);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      const mine = await base44.entities.Conversation.filter(
        { participant_emails: user?.email },
        '-last_message_date',
        100
      );

      return mine.filter(c => !(c.hidden_for || []).includes(user?.email));
    },
    enabled: !!user?.email,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  // TODO: Replace polling with Base44 real-time subscriptions or WebSockets
  // when the platform supports them, to reduce unnecessary network requests.
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', activeConv],
    queryFn: () => base44.entities.Message.filter({ conversation_id: String(activeConv) }, 'created_date', 100),
    enabled: !!activeConv,
    refetchInterval: activeConv ? 4000 : false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const conv = conversations.find(c => c.id === activeConv);
      const receiverEmail = conv?.participant_emails?.find(e => e !== user.email);
      await base44.entities.Message.create({
        conversation_id: activeConv,
        sender_email: user.email,
        receiver_email: receiverEmail,
        content: newMessage,
        sender_name: user.display_name || user.full_name || (user.email ? user.email.split('@')[0] : 'Korisnik'),
        read: false,
      });
      // Unhide conversation for receiver if they had hidden it
      const currentHidden = conv?.hidden_for || [];
      const updatedHidden = currentHidden.filter(e => e !== receiverEmail);
      await base44.entities.Conversation.update(activeConv, {
        last_message: newMessage,
        last_message_date: new Date().toISOString(),
        hidden_for: updatedHidden,
      });
    },
    onSuccess: () => {
      setNewMessage('');
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const activeConvData = conversations.find(c => c.id === activeConv);
  const otherName = activeConvData?.participant_names?.find(
    (n, i) => activeConvData.participant_emails[i] !== user?.email
  ) || 'Korisnik';

  const getOtherName = (conv) =>
    conv.participant_names?.find((n, i) => conv.participant_emails[i] !== user?.email) || 'Korisnik';

  const hideConversation = async (convId) => {
    const conv = conversations.find(c => c.id === convId);
    const currentHidden = conv?.hidden_for || [];
    await base44.entities.Conversation.update(convId, {
      hidden_for: [...currentHidden, user.email],
    });
    if (activeConv === convId) setActiveConv(null);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)]">

      {/* Header */}
      <div className="mb-5">
        {activeConv ? (
          <div className="lg:hidden flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setActiveConv(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-light to-peach/60 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{otherName[0]}</span>
              </div>
              <p className="font-display font-semibold text-lg">{otherName}</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/60 mb-1.5">
              <Heart className="w-3 h-3" fill="currentColor" /> Vaši razgovori
            </p>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Poruke</h1>
          </div>
        )}
      </div>

      <div className="flex gap-5 flex-1 min-h-0">

        {/* ── Conversation list ── */}
        <div className={`w-full lg:w-80 flex-shrink-0 flex flex-col min-h-0 ${activeConv ? 'hidden lg:flex' : 'flex'}`}>
          {conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 bg-card border border-dashed border-border/60 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-primary/50" />
              </div>
              <p className="font-display font-semibold text-foreground mb-1">Još nema poruka</p>
              <p className="text-sm text-muted-foreground max-w-[16rem] mb-5">
                Posjetite profil dadilje i pošaljite joj prvu poruku.
              </p>
              <Button asChild className="rounded-2xl px-6 h-10 font-semibold shadow-md shadow-primary/15">
                <Link to="/FindNannies">
                  <Search className="w-4 h-4 mr-2" />
                  Pronađi dadilju
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Selection toolbar or Uredi button */}
              <div className="flex items-center justify-between mb-2">
                {selectionMode ? (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-sm font-semibold text-foreground">{selectedIds.size} odabrano</span>
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl text-xs"
                        disabled={selectedIds.size === 0}
                        onClick={() => setShowBulkConfirm(true)}
                      >
                        Sakrij odabrano
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={exitSelectionMode}>
                        Odustani
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="ml-auto">
                    <Button variant="ghost" size="sm" className="rounded-xl text-xs text-muted-foreground" onClick={() => setSelectionMode(true)}>
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Uredi
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2 overflow-y-auto">
                {conversations.map(conv => (
                  <SwipeableConversationItem
                    key={conv.id}
                    conv={conv}
                    isActive={activeConv === conv.id}
                    otherName={getOtherName(conv)}
                    onSelect={selectionMode ? toggleSelection : setActiveConv}
                    onHide={hideConversation}
                    selectionMode={selectionMode}
                    selected={selectedIds.has(conv.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Message thread ── */}
        <div className={`flex-1 flex flex-col min-h-0 ${!activeConv ? 'hidden lg:flex' : 'flex'}`}>
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center bg-card border border-dashed border-border/60 rounded-3xl p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary/40" />
              </div>
              <p className="font-display font-semibold text-foreground mb-1">Odaberite razgovor</p>
              <p className="text-sm text-muted-foreground">Odaberite razgovor s lijeve strane za početak</p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0 bg-card border border-border/40 rounded-3xl overflow-hidden">
              {/* Thread header */}
              <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-light to-peach/60 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{otherName[0]}</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground leading-tight">{otherName}</p>
                  <p className="text-xs text-muted-foreground">CozyCare dadilja</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-60">
                    <Heart className="w-8 h-8 text-primary/30 mb-2" fill="currentColor" />
                    <p className="text-sm text-muted-foreground">Pozdravite — započnite razgovor!</p>
                  </div>
                )}
                {messages.map(msg => {
                  const isMine = msg.sender_email === user?.email;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-light to-peach/60 flex items-center justify-center mr-2 flex-shrink-0 mt-auto mb-0.5">
                          <span className="text-[10px] font-bold text-primary">{otherName[0]}</span>
                        </div>
                      )}
                      <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-md shadow-sm shadow-primary/20'
                          : 'bg-muted/70 text-foreground rounded-bl-md'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-4 border-t border-border/40 flex gap-2.5 flex-shrink-0">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={`Poruka za ${otherName}…`}
                  className="flex-1 rounded-2xl bg-muted/40 border-border/50 focus:border-primary/40"
                  onKeyDown={e => e.key === 'Enter' && newMessage.trim() && sendMutation.mutate()}
                />
                <Button
                  onClick={() => sendMutation.mutate()}
                  disabled={!newMessage.trim() || sendMutation.isPending}
                  size="icon"
                  className="h-10 w-10 rounded-2xl flex-shrink-0 shadow-md shadow-primary/15"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk hide confirmation */}
      <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sakriti {selectedIds.size} razgovora?</AlertDialogTitle>
            <AlertDialogDescription>
              Odabrani razgovori će biti skriveni iz vašeg popisa. Ako vam osoba pošalje novu poruku, razgovor će se ponovo pojaviti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={hideBulk}
            >
              Da
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}