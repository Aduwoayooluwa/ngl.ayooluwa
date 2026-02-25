'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { MessageSquare, ChevronRight, Trash2, ArrowLeft } from 'lucide-react'
import { createPortal } from 'react-dom'
import { ChatSession } from '@/types'
import ChatView from '@/components/ChatView'
import { THEMES } from '@/utils/constants'
import {
  useChatSessions,
  useDeleteChatSession,
  useRenameChatSession,
} from '@/hooks/useChatSessions'

interface ChatsPanelProps {
  theme?: string
  username?: string
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

function expiryHours(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) return 'Expires soon'
  return `${hrs}h left`
}

// ─── Full-screen portal modal ─────────────────────────────────────────────────
function ChatModal({
  session,
  theme,
  isOpen,
  onClose,
  onRename,
}: {
  session: ChatSession | null
  theme: string
  isOpen: boolean
  onClose: () => void
  onRename: (name: string) => void
}) {
  const currentTheme = THEMES[theme] || THEMES.default
  const accentColor = currentTheme.gradient.match(/#([0-9a-f]{6})/i)?.[0] || '#ff0050'

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && session && (
        /* Single container — avoids backdrop-filter bleed into panel */
        <motion.div
          key="modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-end justify-center"
          style={{ isolation: 'isolate' }}
        >
          {/* Backdrop — blur is safe here: it's an absolute child, not a sibling of the panel */}
          <div
            className="absolute inset-0 backdrop-blur-md bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="relative z-10 flex flex-col w-full h-dvh"
            style={{ maxWidth: '860px', paddingTop: 'env(safe-area-inset-top, 0px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/25" />
            </div>

            <div
              className={`flex-1 flex flex-col overflow-hidden rounded-t-[28px] border border-white/10 border-b-0 ${currentTheme.bg}`}
              style={{ boxShadow: `0 -12px 80px ${accentColor}30, 0 0 0 1px rgba(255,255,255,0.06)` }}
            >
              <div className="absolute inset-x-0 top-0 h-52 pointer-events-none opacity-20 rounded-t-[28px]"
                style={{ background: currentTheme.gradient }} />

              <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10 shrink-0">
                <button onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-gray-300 shrink-0">
                  <ArrowLeft size={16} />
                </button>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: accentColor }}>?</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{session.name || 'Anonymous Chat'}</p>
                  <p className="text-xs text-gray-500">{expiryHours(session.expires_at)}</p>
                </div>
              </div>

              <div className="flex-1 overflow-hidden relative z-10">
                <ChatView
                  token={session.secret_token}
                  senderType="owner"
                  theme={theme}
                  sessionName={session.name}
                  expiresAt={session.expires_at}
                  onRename={onRename}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── Swipeable row ────────────────────────────────────────────────────────────
function SwipeableRow({
  session,
  accentColor,
  onOpen,
  onDelete,
  idx,
}: {
  session: ChatSession
  accentColor: string
  onOpen: () => void
  onDelete: () => void
  idx: number
}) {
  const x = useMotionValue(0)
  const DELETE_ZONE = -110
  const [gone, setGone] = useState(false)

  const deleteOpacity = useTransform(x, [0, -60, DELETE_ZONE], [0, 0.5, 1])
  const deleteScale = useTransform(x, [-60, DELETE_ZONE], [0.7, 1])

  const handleDragEnd = async (_: any, info: any) => {
    if (info.offset.x < DELETE_ZONE) {
      await animate(x, -340, { duration: 0.18 })
      setGone(true)
      onDelete()
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }
  }

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -340, height: 0, marginBottom: 0 }}
          transition={{ delay: idx * 0.04 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-end pr-5 rounded-2xl bg-red-500"
            style={{ opacity: deleteOpacity }}
          >
            <motion.div style={{ scale: deleteScale }}>
              <Trash2 size={20} className="text-white" />
            </motion.div>
          </motion.div>

          <motion.div
            drag="x"
            dragConstraints={{ left: -130, right: 0 }}
            dragElastic={{ left: 0.08, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x }}
            onClick={() => { if (x.get() > -20) onOpen() }}
            whileTap={{ scale: 0.99 }}
            className="relative z-10 flex items-center gap-4 p-4 bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl cursor-pointer select-none transition-colors"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ background: accentColor }}>?</div>

            <div className="flex-1 min-w-0 pointer-events-none">
              <div className="flex justify-between items-baseline gap-2">
                <p className="font-semibold text-white text-sm truncate">{session.name || 'Anonymous Chat'}</p>
                <span className="text-xs text-gray-600 shrink-0">
                  {session.lastMessage ? timeAgo(session.lastMessage.created_at) : timeAgo(session.created_at)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5 gap-2">
                <p className="text-xs text-gray-500 truncate">
                  {session.lastMessage
                    ? `${session.lastMessage.sender_type === 'owner' ? 'You: ' : ''}${session.lastMessage.content}`
                    : 'No messages yet'}
                </p>
                <span className="text-[10px] text-gray-600 shrink-0">{expiryHours(session.expires_at)}</span>
              </div>
            </div>

            <ChevronRight size={15} className="text-gray-600 shrink-0 pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function ChatsPanel({ theme = 'default', username }: ChatsPanelProps) {
  const [openSession, setOpenSession] = useState<ChatSession | null>(null)

  const { data: sessions = [], isLoading } = useChatSessions()
  const deleteSession = useDeleteChatSession()
  const renameSession = useRenameChatSession()

  const currentTheme = THEMES[theme] || THEMES.default
  const accentColor = currentTheme.gradient.match(/#([0-9a-f]{6})/i)?.[0] || '#ff0050'

  const handleRename = (token: string, name: string) => {
    renameSession.mutate({ token, name })
    if (openSession?.secret_token === token) {
      setOpenSession(prev => prev ? { ...prev, name } : prev)
    }
  }

  const chatUrl = typeof window !== 'undefined' && username
    ? `${window.location.origin}/${username}/chat`
    : null

  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    if (!chatUrl) return
    navigator.clipboard.writeText(chatUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Share link bar */}
      {chatUrl && (
        <div className="flex items-center gap-2 p-3 mb-2 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide font-medium">Your chat link</p>
            <p className="text-xs text-gray-300 truncate font-mono">{chatUrl}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              copied
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/10'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}
      <div className="space-y-2">
        {sessions.length > 0 && !isLoading && (
          <p className="text-xs text-gray-600 px-1 pb-1">← Swipe left to delete</p>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl animate-pulse">
                <div className="w-12 h-12 rounded-full bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded-full w-1/3" />
                  <div className="h-2.5 bg-white/5 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed"
          >
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <MessageSquare size={32} />
            </div>
            <p className="text-gray-400">No anonymous chats yet.</p>
            <p className="text-gray-600 text-sm mt-1">Share your /chat link to get started!</p>
          </motion.div>
        ) : (
          sessions.map((session, idx) => (
            <SwipeableRow
              key={session.id}
              session={session}
              accentColor={accentColor}
              idx={idx}
              onOpen={() => setOpenSession(session)}
              onDelete={() => deleteSession.mutate(session.secret_token)}
            />
          ))
        )}
      </div>

      <ChatModal
        session={openSession}
        theme={theme}
        isOpen={!!openSession}
        onClose={() => setOpenSession(null)}
        onRename={(name) => openSession && handleRename(openSession.secret_token, name)}
      />
    </>
  )
}
