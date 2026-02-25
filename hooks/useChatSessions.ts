import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatSession } from '@/types'

// ─── Query key ───────────────────────────────────────────────────────────────
export const CHAT_SESSIONS_KEY = ['chat-sessions'] as const

// ─── Fetcher ─────────────────────────────────────────────────────────────────
async function fetchChatSessions(): Promise<ChatSession[]> {
  const res = await fetch('/api/chat/dashboard')
  if (!res.ok) throw new Error('Failed to fetch chat sessions')
  const data = await res.json()
  return data.sessions ?? []
}

// ─── useQuery hook ────────────────────────────────────────────────────────────
export function useChatSessions() {
  return useQuery({
    queryKey: CHAT_SESSIONS_KEY,
    queryFn: fetchChatSessions,
    staleTime: 30_000,       // treat data as fresh for 30s
    refetchOnWindowFocus: true,
  })
}

// ─── Delete mutation ─────────────────────────────────────────────────────────
export function useDeleteChatSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch(`/api/chat/${token}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete session')
    },
    // Optimistic: remove from cache immediately
    onMutate: async (token) => {
      await queryClient.cancelQueries({ queryKey: CHAT_SESSIONS_KEY })
      const previous = queryClient.getQueryData<ChatSession[]>(CHAT_SESSIONS_KEY)
      queryClient.setQueryData<ChatSession[]>(
        CHAT_SESSIONS_KEY,
        (old) => (old ?? []).filter(s => s.secret_token !== token)
      )
      return { previous }
    },
    onError: (_err, _token, ctx) => {
      // Roll back on failure
      if (ctx?.previous) queryClient.setQueryData(CHAT_SESSIONS_KEY, ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY })
    },
  })
}

// ─── Rename mutation ─────────────────────────────────────────────────────────
export function useRenameChatSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ token, name }: { token: string; name: string }) => {
      const res = await fetch(`/api/chat/${token}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to rename session')
    },
    // Optimistic: update name in cache immediately
    onMutate: async ({ token, name }) => {
      await queryClient.cancelQueries({ queryKey: CHAT_SESSIONS_KEY })
      const previous = queryClient.getQueryData<ChatSession[]>(CHAT_SESSIONS_KEY)
      queryClient.setQueryData<ChatSession[]>(
        CHAT_SESSIONS_KEY,
        (old) => (old ?? []).map(s => s.secret_token === token ? { ...s, name } : s)
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(CHAT_SESSIONS_KEY, ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY })
    },
  })
}
