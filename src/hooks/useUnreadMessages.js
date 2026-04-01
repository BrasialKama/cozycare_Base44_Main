import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';

export default function useUnreadMessages() {
  const { user } = useAuth();

  const { data: unreadCount = 0, refetch } = useQuery({
    queryKey: ['unreadMessages', user?.email],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ read: false });
      return msgs.filter(m => m.sender_email !== user?.email && m.receiver_email === user?.email).length;
    },
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  // Refetch on tab focus
  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

  const markAllRead = async () => {
    const msgs = await base44.entities.Message.filter({ read: false });
    const mine = msgs.filter(m => m.sender_email !== user?.email && m.receiver_email === user?.email);
    await Promise.all(mine.map(m => base44.entities.Message.update(m.id, { read: true })));
    refetch();
  };

  return { unreadCount, markAllRead, refetch };
}