import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';

export default function useUnreadMessages() {
  const { user } = useAuth();

  const { data: unreadMessages = [], refetch } = useQuery({
    queryKey: ['unreadMessages', user?.email],
    queryFn: () =>
      base44.entities.Message.filter(
        { receiver_email: user?.email, read: false },
        '-created_date',
        100
      ),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

  const markAllRead = async () => {
    if (unreadMessages.length === 0) {
      refetch();
      return;
    }
    // Batch in chunks of 100 (backend function limit)
    const ids = unreadMessages.map(m => m.id);
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      await base44.functions.invoke('markMessageAsRead', { message_ids: chunk });
    }
    refetch();
  };

  return {
    unreadCount: unreadMessages.length,
    markAllRead,
    refetch,
  };
}