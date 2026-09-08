'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { env } from '@/env';
import {
  fetchSocketTicket,
  type SocketNotificationPayload,
} from '@/features/messaging/services/messaging-client';
import { InAppMessageNotification } from '@/features/messaging/components/InAppMessageNotification';

interface MessagingSocketContextValue {
  socket: Socket | null;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
}

const MessagingSocketContext = createContext<MessagingSocketContextValue>({
  socket: null,
  joinConversation: () => {},
  leaveConversation: () => {},
  setActiveConversation: () => {},
});

export function useMessagingSocket() {
  return useContext(MessagingSocketContext);
}

function getSocketUrl(): string {
  return env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3000';
}

export function MessagingSocketProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notification, setNotification] = useState<SocketNotificationPayload | null>(null);
  const joinedRef = useRef<Set<string>>(new Set());
  const pendingJoinRef = useRef<Set<string>>(new Set());
  const activeConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let client: Socket | null = null;

    void (async () => {
      try {
        const ticketResponse = await fetchSocketTicket();
        const ticket = ticketResponse.data?.ticket;
        if (!ticket || !active) return;

        client = io(getSocketUrl(), {
          auth: { ticket },
          transports: ['websocket', 'polling'],
        });

        client.on('notification:message', (payload: SocketNotificationPayload) => {
          if (payload.conversationId === activeConversationIdRef.current) return;
          setNotification(payload);
        });

        if (active) setSocket(client);
      } catch {
        // socket optional — REST still works
      }
    })();

    return () => {
      active = false;
      client?.disconnect();
      setSocket(null);
    };
  }, [enabled]);

  useEffect(() => {
    if (!socket) return;
    for (const conversationId of pendingJoinRef.current) {
      if (joinedRef.current.has(conversationId)) continue;
      socket.emit('conversation:join', conversationId);
      joinedRef.current.add(conversationId);
    }
    pendingJoinRef.current.clear();
  }, [socket]);

  const joinConversation = useCallback((conversationId: string) => {
    if (joinedRef.current.has(conversationId)) return;
    if (!socket) {
      pendingJoinRef.current.add(conversationId);
      return;
    }
    socket.emit('conversation:join', conversationId);
    joinedRef.current.add(conversationId);
    pendingJoinRef.current.delete(conversationId);
  }, [socket]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (!socket || !joinedRef.current.has(conversationId)) return;
    socket.emit('conversation:leave', conversationId);
    joinedRef.current.delete(conversationId);
  }, [socket]);

  const setActiveConversation = useCallback((conversationId: string | null) => {
    activeConversationIdRef.current = conversationId;
    setNotification((current) => {
      if (current && conversationId && current.conversationId === conversationId) return null;
      return current;
    });
  }, []);

  const value = useMemo(
    () => ({ socket, joinConversation, leaveConversation, setActiveConversation }),
    [socket, joinConversation, leaveConversation, setActiveConversation],
  );

  return (
    <MessagingSocketContext.Provider value={value}>
      {children}
      {notification ? (
        <InAppMessageNotification
          payload={notification}
          onDismiss={() => setNotification(null)}
          onOpen={() => {
            router.push(`/dashboard/messages/${notification.conversationId}`);
            setNotification(null);
          }}
        />
      ) : null}
    </MessagingSocketContext.Provider>
  );
}
