import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { MessageCircle, Send, ArrowLeft, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useUnreadMessages from '@/hooks/useUnreadMessages';

export default function Messages() {
  const params = new URLSearchParams(window.location.search);
  const initialConvId = params.get('conversation_id') || params.get('conversation');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConv, setActiveConv] = useState(initialConvId || null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { markAllRead } = useUnreadMessages();

  // Mark unread messages as read when page opens
  useEffect(() => {
    if (user?.email) markAllRead();
  }, [user?.email]);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list('-updated_date');
      return all.filter(c => c.participant_emails?.includes(user?.email));
    },
    enabled: !!user?.email,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', activeConv],
    queryFn: () => base44.entities.Message.filter({ conversation_id: String(activeConv) }, 'created_date', 100),
    enabled: !!activeConv,
    refetchInterval: 5000,
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
        sender_name: user.display_name || user.full_name,
        read: false,
      });
      await base44.entities.Conversation.update(activeConv, {
        last_message: newMessage,
        last_message_date: new Date().toISOString(),
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
  ) || 'User';

  const getOtherName = (conv) =>
    conv.participant_names?.find((n, i) => conv.participant_emails[i] !== user?.email) || 'User';

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
              <p className="text-sm text-muted-foreground max-w-[16rem]">
                Posjetite profil dadilje i pošaljite joj poruku za početak.
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto">
              {conversations.map(conv => {
                const other = getOtherName(conv);
                const isActive = activeConv === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-primary/8 border border-primary/20 shadow-sm'
                        : 'bg-card border border-border/50 hover:border-primary/15 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary/15' : 'bg-gradient-to-br from-rose-light to-peach/60'}`}>
                        <span className="text-sm font-bold text-primary">{other[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{other}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message || 'Započnite razgovor…'}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
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
    </div>
  );
}