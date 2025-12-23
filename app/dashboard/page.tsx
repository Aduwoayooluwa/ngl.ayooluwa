
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, Copy, Inbox, Share2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useMessages } from '@/hooks/useMessages'
import { User } from '@supabase/supabase-js'
import DeleteMessagesModal from '@/components/DeleteMessagesModal'
import { useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { data: messages, isLoading, error } = useMessages()
  const [copied, setCopied] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    getUser()
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

        message.success('Messages deleted successfully')
        // Invalidate query to refresh list
        queryClient.invalidateQueries({ queryKey: ['messages'] })
    } catch (e: any) {
        message.error('Failed to delete messages: ' + e.message)
    }
  }

  if (!user) return null // or loading spinner

  const username = user.user_metadata?.username || "Anonymous"

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={async () => {
                   try {
                     const mod = await import('@/utils/push')
                     await mod.subscribeToPush()
                     alert('Subscribed successfully! You might have to check your browser permission settings if you didn\'t see a prompt.')
                   } catch (e: any) {
                     alert('Error subscribing: ' + e.message)
                     console.error(e)
                   }
                }}
            >
            Enable Notifications
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
            </Button>
        </div>
      </header>

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
        </div>
      </Card>

      {/* Messages Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Inbox className="text-brand-primary" />
          <h3>Inbox</h3>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading messages...</div>
        ) : error ? (
            <div className="text-center py-20 text-red-400">Error loading messages. Please check your connection.</div>
        ) : messages && messages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card hoverEffect className="h-full flex flex-col justify-between min-h-[200px] border-l-4 border-l-brand-primary">
                  <p className="text-lg font-medium leading-relaxed">
                    {msg.content}
                  </p>
                  <div className="mt-4 text-xs text-gray-500 font-mono text-right">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </div>
                </Card>
              </motion.div>
            ))}
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
      {/* </div> */}

      <DeleteMessagesModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete}
      />
    </div>
  )
}
