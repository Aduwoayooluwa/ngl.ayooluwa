'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, Copy, Inbox, Trash2, Bell, Pin } from 'lucide-react' 
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useMessages } from '@/hooks/useMessages'
import { User } from '@supabase/supabase-js'
import DeleteMessagesModal from '@/components/DeleteMessagesModal'
import { useQueryClient } from '@tanstack/react-query'
import Toast from '@/components/ui/Toast'
import NotificationPromptModal from '@/components/NotificationPromptModal'
import { getSubscriptionStatus } from '@/utils/push'
import { toJpeg } from 'html-to-image'
import { useRef } from 'react'
import { IGShareCard } from '@/components/IGShareCard'
import { MessageShareCard } from '@/components/MessageShareCard'
import { Instagram, Download, Share2, Palette } from 'lucide-react'
import ThemeSelector from '@/components/ThemeSelector'
import AnalyticsCard from '@/components/AnalyticsCard'
import InboxFilters, { DateFilter } from '@/components/InboxFilters'
import { useMemo } from 'react'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { data: messages, isLoading, error } = useMessages()
  const [copied, setCopied] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isNotifPromptOpen, setIsNotifPromptOpen] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const queryClient = useQueryClient()
  const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' as 'success' | 'error' })
  
  const shareRef = useRef<HTMLDivElement>(null)
  const messageShareRef = useRef<HTMLDivElement>(null)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [messageToShare, setMessageToShare] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState('default')
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)

  // Filter messages based on search, date, and pinned filters
  const filteredMessages = useMemo(() => {
    if (!messages) return []
    
    return messages.filter(msg => {
      // Search filter
      if (searchQuery && !msg.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Pinned only filter
      if (showPinnedOnly && !msg.is_pinned) {
        return false
      }
      
      // Date filter
      if (dateFilter !== 'all') {
        const msgDate = new Date(msg.created_at)
        const now = new Date()
        
        if (dateFilter === 'today') {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          if (msgDate < today) return false
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (msgDate < weekAgo) return false
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (msgDate < monthAgo) return false
        }
      }
      
      return true
    })
  }, [messages, searchQuery, dateFilter, showPinnedOnly])

  // Toggle pin status of a message
  const handleTogglePin = async (messageId: string, currentlyPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_pinned: !currentlyPinned })
        .eq('id', messageId)
      
      if (error) throw error
      
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      showToast(currentlyPinned ? 'Message unpinned' : 'Message pinned!', 'success')
    } catch (e: any) {
      showToast('Failed to update pin status: ' + e.message, 'error')
    }
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, isVisible: true, type })
  }

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        // Fetch current theme
        const { data: profile } = await supabase.from('profiles').select('theme').eq('id', user.id).single()
        if (profile) setCurrentTheme(profile.theme || 'default')
      }
    }
    getUser()

    // Check notification status
    async function checkNotif() {
        const status = await getSubscriptionStatus()
        setIsSubscribed(status)
        // If not subscribed and we haven't bugged them in this session (simplified for now: just check status)
        if (!status) {
             // Small delay for better UX
             setTimeout(() => setIsNotifPromptOpen(true), 1500)
        }
    }
    checkNotif()

  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const copyLink = () => {
    if (!user) return
    const username = user.user_metadata?.username || user.id
    const link = `${window.location.origin}/${username}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (startDate?: Date, endDate?: Date) => {
    try {
        let query = supabase.from('messages').delete().eq('user_id', user!.id)
        
        if (startDate && endDate) {
            query = query.gte('created_at', startDate.toISOString())
                         .lte('created_at', endDate.toISOString())
        }

        const { error } = await query

        if (error) throw error

        showToast('Messages deleted successfully', 'success')
        // Invalidate query to refresh list
        queryClient.invalidateQueries({ queryKey: ['messages'] })
    } catch (e: any) {
        showToast('Failed to delete messages: ' + e.message, 'error')
    }
  }

  const handleShare = async () => {
    if (shareRef.current === null) {
      return
    }
    setGeneratingImage(true)
    try {
        // Double size for retina displays
        // Use JPEG with quality for smaller file size (~300KB vs 7MB with PNG)
        const dataUrl = await toJpeg(shareRef.current, { cacheBust: true, quality: 0.85 })
        const link = document.createElement('a')
        link.download = `ngl-ayooluwa-share-${username}.jpg`
        link.href = dataUrl
        link.click()
        showToast('Image saved! Post it to your Story.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Could not generate image', 'error')
    }
    setGeneratingImage(false)
  }
  
  // Effect to capture message share card when state changes
  useEffect(() => {
    const element = messageShareRef.current
    if (messageToShare && element) {
        const generate = async () => {
            try {
                // Wait a tick to ensure render
                await new Promise(resolve => setTimeout(resolve, 100))
                // Use JPEG with quality for smaller file size (~300KB vs 7MB with PNG)
                const dataUrl = await toJpeg(element, { cacheBust: true, quality: 0.85 })
                const link = document.createElement('a')
                link.download = `ngl-message.jpg`
                link.href = dataUrl
                link.click()
                showToast('Message ready to share!', 'success')
            } catch (err) {
                console.error(err)
                showToast('Failed to generate image', 'error')
            }
            setMessageToShare(null)
        }
        generate()
    }
  }, [messageToShare])

  if (!user) return null 

  const username = user.user_metadata?.username || "Anonymous"

  return (
    <div className="min-h-dvh p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
            {!isSubscribed && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={async () => {
                   try {
                     const mod = await import('@/utils/push')
                     await mod.subscribeToPush()
                     setIsSubscribed(true)
                     showToast('Notifications enabled!', 'success')
                   } catch (e: any) {
                     showToast('Error subscribing: ' + e.message, 'error')
                     console.error(e)
                   }
                }}
            >
            <Bell size={18} />
            <span className="hidden md:inline"> Enable Notifications</span>
            </Button>
            )}
            
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsDeleteModalOpen(true)} 
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
            
                <Trash2 size={18} />
                <span className="hidden md:inline">Clear</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
            </Button>
        </div>
      </header>

      {/* Analytics Section */}
      <AnalyticsCard />

      {/* Hero / Link Section */}
      <Card className="text-center py-10 space-y-6" variant="strong">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
            Get your messages
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Share your connection link to receive anonymous messages from your friends.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
           <div className="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-gray-300 w-full truncate font-mono text-sm">
             {typeof window !== 'undefined' ? window.location.origin : ''}/{username}
           </div>
           <Button onClick={copyLink} className="w-full sm:w-auto shrink-0">
             {copied ? 'Copied!' : 'Copy Link'}
             <Copy size={18} />
           </Button>
            
           <Button onClick={handleShare} className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" loading={generatingImage}>
             Share to IG
             <Instagram size={18} />
           </Button>
        </div>
      </Card>

      {/* Theme Selection */}
      <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />

      {/* Messages Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Inbox className="text-brand-primary" />
          <h3>Inbox</h3>
        </div>

        {/* Filters */}
        <InboxFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          showPinnedOnly={showPinnedOnly}
          onPinnedOnlyChange={setShowPinnedOnly}
          totalCount={messages?.length || 0}
          filteredCount={filteredMessages.length}
        />

        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading messages...</div>
        ) : error ? (
            <div className="text-center py-20 text-red-400">Error loading messages. Please check your connection.</div>
        ) : filteredMessages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMessages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card hoverEffect className={`h-full flex flex-col justify-between min-h-[200px] border-l-4 ${msg.is_pinned ? 'border-l-amber-400 bg-amber-500/5' : 'border-l-brand-primary'}`}>
                  {msg.is_pinned && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-medium mb-2">
                      <Pin size={12} />
                      Pinned
                    </div>
                  )}
                  <p className="text-lg font-medium leading-relaxed flex-1">
                    {msg.content}
                  </p>
                  <div className="mt-4 flex justify-between items-end">
                     <div className="flex gap-1">
                       <button 
                          onClick={() => handleTogglePin(msg.id, msg.is_pinned)}
                          className={`transition-colors p-2 rounded-full ${msg.is_pinned ? 'text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10'}`}
                          title={msg.is_pinned ? 'Unpin message' : 'Pin message'}
                       >
                          <Pin size={18} />
                       </button>
                       <button 
                          onClick={() => setMessageToShare(msg.content)}
                          className="text-gray-400 hover:text-brand-primary transition-colors p-2 hover:bg-brand-primary/10 rounded-full"
                          title="Share this message"
                       >
                          <Download size={18} />
                       </button>
                     </div>
                     <div className="text-xs text-gray-500 font-mono">
                        {new Date(msg.created_at).toLocaleDateString()}
                     </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Inbox size={32} />
            </div>
            <p className="text-gray-400">No messages match your filters.</p>
            <p className="text-gray-600 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Inbox size={32} />
            </div>
            <p className="text-gray-400">No messages yet.</p>
            <p className="text-gray-600 text-sm">Share your link to get started!</p>
          </div>
        )}
      </div>

      <DeleteMessagesModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete}
      />

      <NotificationPromptModal
        isOpen={isNotifPromptOpen}
        onClose={() => setIsNotifPromptOpen(false)}
      />

      <Toast 
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Hidden Share Card for capture */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
         <IGShareCard ref={shareRef} username={username} />
         <MessageShareCard ref={messageShareRef} message={messageToShare || '...'} username={username} />
      </div>
    </div>
  )
}
