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
    await Promise.all(
      unreadMessages.map(m => base44.entities.Message.update(m.id, { read: true }))
    );
    refetch();
  };

  return {
    unreadCount: unreadMessages.length,
    markAllRead,
    refetch,
  };
}