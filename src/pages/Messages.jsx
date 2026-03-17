import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

export default function Messages() {
  const params = new URLSearchParams(window.location.search);
  const initialConvId = params.get('conversation');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConv, setActiveConv] = useState(initialConvId || null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

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
    queryFn: () => base44.entities.Message.filter({ conversation_id: activeConv }, 'created_date', 100),
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

  return (
    <div>
      <div className="lg:hidden">
        {activeConv ? (
          <Button variant="ghost" size="sm" onClick={() => setActiveConv(null)} className="mb-3">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        ) : (
          <PageHeader icon={MessageCircle} title="Messages" subtitle="Chat with your nannies and families" />
        )}
      </div>
      <div className="hidden lg:block">
        <PageHeader icon={MessageCircle} title="Messages" subtitle="Chat with your nannies and families" />
      </div>

      <div className="flex gap-4 h-[calc(100vh-14rem)]">
        {/* Conversation list */}
        <div className={`w-full lg:w-80 flex-shrink-0 ${activeConv ? 'hidden lg:block' : ''}`}>
          {conversations.length === 0 ? (
            <EmptyState icon={MessageCircle} title="No messages yet" description="Start a conversation from a nanny's profile" />
          ) : (
            <div className="space-y-1.5">
              {conversations.map(conv => {
                const other = conv.participant_names?.find(
                  (n, i) => conv.participant_emails[i] !== user?.email
                ) || 'User';
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv.id)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all ${
                      activeConv === conv.id
                        ? 'bg-primary/8 border border-primary/20'
                        : 'bg-card border border-border/60 hover:border-primary/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">{other[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{other}</p>
                        <p className="text-xs text-muted-foreground truncate">{conv.last_message || 'No messages'}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className={`flex-1 flex flex-col ${!activeConv ? 'hidden lg:flex' : ''}`}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="pb-3 border-b border-border mb-3">
                <h3 className="font-display font-semibold">{otherName}</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {messages.map(msg => {
                  const isMine = msg.sender_email === user?.email;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2 pt-3 border-t border-border mt-3">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={e => e.key === 'Enter' && newMessage.trim() && sendMutation.mutate()}
                />
                <Button
                  onClick={() => sendMutation.mutate()}
                  disabled={!newMessage.trim() || sendMutation.isPending}
                  size="icon"
                  className="h-10 w-10"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}