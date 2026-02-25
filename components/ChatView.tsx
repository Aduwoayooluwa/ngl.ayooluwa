'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Pencil, Check, X, Clock } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { ChatMessage } from '@/types'
import { THEMES } from '@/utils/constants'
import { createClient } from '@/utils/supabase/client'
import { CHAT_SESSIONS_KEY } from '@/hooks/useChatSessions'

interface ChatViewProps {
  token: string
  senderType: 'anonymous' | 'owner'
  theme?: string
  sessionName?: string | null
  expiresAt?: string
  onRename?: (newName: string) => void
  onSessionLoad?: (name: string | null, expiresAt: string | undefined) => void
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(date).toLocaleDateString()
}

function expiryCountdown(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (hrs > 0) return `Expires in ${hrs}h ${mins}m`
  return `Expires in ${mins}m`
}

export default function ChatView({
  token,
  senderType,
  theme = 'default',
  sessionName,
  expiresAt,
  onRename,
  onSessionLoad,
}: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expired, setExpired] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(sessionName || '')
  const [isSavingName, setIsSavingName] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabaseRef = useRef(createClient())
  const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null)
  const queryClient = useQueryClient()

  const currentTheme = THEMES[theme] || THEMES.default

  // Derive accent color from theme gradient
  const accentColor = currentTheme.gradient.match(/#([0-9a-f]{6})/i)?.[0] || '#ff0050'


  // Initial load + Realtime subscription
  useEffect(() => {
    const supabase = supabaseRef.current

    async function init() {
      try {
        const res = await fetch(`/api/chat/${token}/messages`)
        if (res.status === 410) { setExpired(true); return }
        if (!res.ok) return
        const data = await res.json()
        const sessionId: string | null = data.session?.id ?? null
        setMessages(data.messages || [])
        onSessionLoad?.(data.session?.name ?? null, data.session?.expires_at)

        if (!sessionId) return

        channelRef.current = supabase
          .channel(`chat:${sessionId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `session_id=eq.${sessionId}`,
          }, (payload) => {
            const msg = payload.new as ChatMessage
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev
              const withoutOptimistic = prev.filter(m => !String(m.id).startsWith('opt-'))
              return [...withoutOptimistic, msg]
            })
            // Keep session list preview in sync
            queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY })
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') console.log('[ChatView] Realtime connected ✓')
            if (status === 'CHANNEL_ERROR') console.error('[ChatView] Realtime error — ensure chat_messages is enabled in Supabase Replication.')
          })
      } catch (e) {
        console.error('[ChatView] init error:', e)
      } finally {
        setLoading(false)
      }
    }

    init()

    return () => {
      if (channelRef.current) { supabase.removeChannel(channelRef.current as any); channelRef.current = null }
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)

    // Optimistic update
    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      sender_type: senderType,
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await fetch(`/api/chat/${token}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, senderType }),
      })
      if (res.status === 410) { setExpired(true); return }
      // Realtime will deliver the real message — just remove optimistic if it hasn't been replaced
      if (!res.ok) {
        setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      }
    } catch (e) {
      console.error(e)
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  const handleRename = async () => {
    if (!renameValue.trim() || !onRename) return
    setIsSavingName(true)
    try {
      await fetch(`/api/chat/${token}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue.trim() }),
      })
      onRename(renameValue.trim())
      setIsRenaming(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSavingName(false)
    }
  }

  if (expired) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <Clock size={32} className="text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white">This chat has expired</h3>
        <p className="text-gray-500 text-sm">Anonymous chats are available for 48 hours only.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/30"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${currentTheme.bg}`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-white/10 backdrop-blur-md"
        style={{ background: 'rgba(0,0,0,0.4)' }}
      >
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: accentColor }}
        >
          ?
        </div>

        {/* Name / Rename */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsRenaming(false) }}
                className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white outline-none flex-1 min-w-0"
                placeholder="Chat name..."
                maxLength={40}
              />
              <button onClick={handleRename} disabled={isSavingName} className="text-green-400 hover:text-green-300 transition-colors">
                <Check size={16} />
              </button>
              <button onClick={() => setIsRenaming(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-white text-sm truncate">
                {sessionName || 'Anonymous Chat'}
              </p>
              {onRename && (
                <button
                  onClick={() => { setRenameValue(sessionName || ''); setIsRenaming(true) }}
                  className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                >
                  <Pencil size={12} />
                </button>
              )}
            </div>
          )}
          {expiresAt && (
            <p className="text-xs text-gray-500 mt-0.5">{expiryCountdown(expiresAt)}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-sm">No messages yet. Say something! 👋</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.sender_type === senderType
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-[18px] text-sm leading-relaxed ${
                    isMe
                      ? 'text-white rounded-br-[4px]'
                      : 'bg-white/10 text-gray-100 rounded-bl-[4px]'
                  }`}
                  style={isMe ? { background: accentColor } : {}}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-500'}`}>
                    {timeAgo(msg.created_at)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 border-t border-white/10 backdrop-blur-md"
        style={{ background: 'rgba(0,0,0,0.4)' }}
      >
        <div className="flex items-end gap-3 bg-white/5 border border-white/10 rounded-[22px] px-4 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Message..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none resize-none max-h-28 py-1"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: input.trim() ? accentColor : 'rgba(255,255,255,0.1)' }}
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
