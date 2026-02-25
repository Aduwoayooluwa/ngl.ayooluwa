'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import ChatView from '@/components/ChatView'
import { THEMES } from '@/utils/constants'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const LS_KEY_ALL = (username: string) => `ngl_chat_sessions_${username}`

export default function SenderChatPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [theme, setTheme] = useState('default')
  const [sessionName, setSessionName] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined)
  const [receiverUsername, setReceiverUsername] = useState<string | null>(null)

  // Scan localStorage to find which profile owns this token, then fetch their theme
  useEffect(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('ngl_chat_sessions_')) {
        const username = key.replace('ngl_chat_sessions_', '')
        try {
          const sessions = JSON.parse(localStorage.getItem(key) || '[]')
          const match = sessions.find((s: any) => s.token === token)
          if (match) {
            setReceiverUsername(username)
            if (match.name) setSessionName(match.name)
            break
          }
        } catch {}
      }
    }
  }, [token])

  // Fetch receiver's theme once we know their username
  useEffect(() => {
    if (!receiverUsername) return
    supabase
      .from('profiles')
      .select('theme')
      .eq('username', receiverUsername)
      .single()
      .then(({ data }) => { if (data?.theme) setTheme(data.theme) })
  }, [receiverUsername]) // eslint-disable-line react-hooks/exhaustive-deps

  // ChatView calls this when it loads session info from the API
  const handleSessionLoad = (name: string | null, expires: string | undefined) => {
    if (name) setSessionName(name)
    if (expires) setExpiresAt(expires)
  }

  const handleRename = (newName: string) => {
    setSessionName(newName)
    if (receiverUsername) {
      const key = LS_KEY_ALL(receiverUsername)
      try {
        const sessions = JSON.parse(localStorage.getItem(key) || '[]')
        const updated = sessions.map((s: any) => s.token === token ? { ...s, name: newName } : s)
        localStorage.setItem(key, JSON.stringify(updated))
      } catch {}
    }
  }

  const currentTheme = THEMES[theme] || THEMES.default
  const accentColor = currentTheme.gradient.match(/#([0-9a-f]{6})/i)?.[0] || '#ff0050'

  return (
    <div className={`flex flex-col h-dvh ${currentTheme.bg} transition-colors duration-500`}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ background: currentTheme.gradient }} />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none opacity-30 blur-3xl rounded-full"
        style={{ background: accentColor }}
      />

      <div className="relative z-10 flex flex-col h-full w-full max-w-[680px] mx-auto">
        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)' }}
        >
          <button
            onClick={() => receiverUsername ? router.push(`/${receiverUsername}/chat`) : router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-gray-300 shrink-0"
          >
            <ArrowLeft size={16} />
          </button>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: accentColor }}
          >
            {receiverUsername ? receiverUsername.slice(0, 2).toUpperCase() : '?'}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">
              {receiverUsername ? `@${receiverUsername}` : 'Anonymous Chat'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {sessionName || 'Your anonymous conversation'}
            </p>
          </div>
        </div>

        {/* ChatView handles ALL data loading — one fetch, one realtime subscription */}
        <div className="flex-1 overflow-hidden">
          <ChatView
            token={token}
            senderType="anonymous"
            theme={theme}
            sessionName={sessionName}
            expiresAt={expiresAt}
            onRename={handleRename}
            onSessionLoad={handleSessionLoad}
          />
        </div>
      </div>
    </div>
  )
}
