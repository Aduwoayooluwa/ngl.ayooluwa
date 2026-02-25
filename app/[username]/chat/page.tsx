'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, ChevronRight, Send, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { SearchX, Home } from 'lucide-react'
import { THEMES } from '@/utils/constants'

const LS_KEY = (username: string) => `ngl_chat_sessions_${username}`

interface LocalSession {
  token: string
  name: string | null
  startedAt: string
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

export default function ChatEntryPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [profileId, setProfileId] = useState<string | null>(null)
  const [theme, setTheme] = useState('default')
  const [isInvalidUser, setIsInvalidUser] = useState(false)
  const [checkingUser, setCheckingUser] = useState(true)
  const [localSessions, setLocalSessions] = useState<LocalSession[]>([])
  const [showComposer, setShowComposer] = useState(false)
  const [firstMessage, setFirstMessage] = useState('')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentTheme = THEMES[theme] || THEMES.default
  const accentColor = currentTheme.gradient.match(/#([0-9a-f]{6})/i)?.[0] || '#ff0050'

  // Load profile
  useEffect(() => {
    async function getProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('id, theme')
        .eq('username', username)
        .single()

      if (data) {
        setProfileId(data.id)
        setTheme(data.theme || 'default')
      } else {
        setIsInvalidUser(true)
      }
      setCheckingUser(false)
    }
    getProfile()
  }, [username, supabase])

  // Load sessions from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY(username))
      if (raw) setLocalSessions(JSON.parse(raw))
    } catch {
      setLocalSessions([])
    }
  }, [username])

  const saveSession = (token: string, name: string | null) => {
    const session: LocalSession = { token, name, startedAt: new Date().toISOString() }
    const updated = [session, ...localSessions]
    setLocalSessions(updated)
    localStorage.setItem(LS_KEY(username), JSON.stringify(updated))
  }

  const handleStartChat = async () => {
    if (!firstMessage.trim() || !profileId) return
    setStarting(true)
    setError(null)

    try {
      // Capture push subscription if available
      let senderPushSubscription = null
      try {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const reg = await navigator.serviceWorker.ready
          const sub = await reg.pushManager.getSubscription()
          senderPushSubscription = sub ? sub.toJSON() : null
        }
      } catch {}

      const res = await fetch('/api/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverUsername: username,
          firstMessage: firstMessage.trim(),
          senderPushSubscription,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to start chat')
        return
      }

      // Save to localStorage and navigate
      saveSession(data.token, null)
      router.push(`/c/${data.token}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  if (checkingUser) {
    return (
      <div className={`min-h-dvh flex items-center justify-center ${currentTheme.bg}`}>
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none"
          style={{ background: currentTheme.gradient }} />
        <div className="animate-pulse bg-white/10 w-16 h-16 rounded-full" />
      </div>
    )
  }

  if (isInvalidUser) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-black">
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 0%, #ff0050 0%, transparent 50%)' }} />
        <Card className="w-full max-w-md relative z-10 text-center space-y-4 py-10" variant="strong">
          <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
            <SearchX size={48} />
          </div>
          <h1 className="text-3xl font-bold text-white">User not found</h1>
          <p className="text-gray-400">
            The user <span className="text-brand-primary font-bold">@{username}</span> does not exist.
          </p>
          <a href="/" className="inline-block w-full">
            <Button className="w-full"><Home size={18} className="mr-2" /> Create your own Link</Button>
          </a>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-dvh ${currentTheme.bg} transition-colors duration-500`}>
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none transition-all duration-500"
        style={{ background: currentTheme.gradient }} />

      <div className="relative z-10 max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="pt-8 pb-4 text-center space-y-1">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3"
            style={{ background: accentColor }}
          >
            {username.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-white">@{username}</h1>
          <p className="text-gray-400 text-sm">Anonymous Chat</p>
        </div>

        {/* New Chat button */}
        <button
          onClick={() => setShowComposer(!showComposer)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all"
          style={showComposer ? {} : { borderColor: accentColor + '50', background: accentColor + '15' }}
        >
          {showComposer ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Start New Chat</>}
        </button>

        {/* Composer */}
        <AnimatePresence>
          {showComposer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card variant="strong" className="space-y-3">
                <p className="text-sm text-gray-400">Start with a message:</p>
                <textarea
                  value={firstMessage}
                  onChange={e => setFirstMessage(e.target.value)}
                  placeholder="Type your first message..."
                  rows={3}
                  maxLength={300}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-white/20"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">{firstMessage.length}/300</span>
                  <Button
                    onClick={handleStartChat}
                    loading={starting}
                    disabled={!firstMessage.trim()}
                    className="text-sm"
                  >
                    Send <Send size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing sessions */}
        {localSessions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider px-1">Recent Chats</p>
            {localSessions.map(session => (
              <motion.button
                key={session.token}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(`/c/${session.token}`)}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-left group"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: accentColor }}
                >
                  <MessageSquare size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">
                    {session.name || 'Anonymous Chat'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{timeAgo(session.startedAt)}</p>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              </motion.button>
            ))}
          </div>
        )}

        {localSessions.length === 0 && !showComposer && (
          <div className="text-center py-10 text-gray-600 text-sm">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
            No previous chats. Start one above!
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 text-center">
          <a
            href={`/${username}`}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Send an anonymous message instead →
          </a>
        </div>
      </div>

      <div className="fixed bottom-6 text-center w-full z-10 pointer-events-none">
        <p className="text-gray-600 text-sm font-medium">
          ngl.ayooluwa <span className="mx-2">•</span> 100% Anonymous
        </p>
      </div>
    </div>
  )
}
