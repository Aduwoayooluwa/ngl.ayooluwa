
'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Send, CheckCircle, SearchX, Home } from 'lucide-react'

// Correctly typing params for Next.js 15+ (can be async or hook based, using React.use for safe access of params)
// But to be safe with all Next versions and TS, we can treat params as a generic promise or prop.
// Next.js 15 params is async.
 
export default function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  // Unwrap params using React 19 use() API if available, or just await it if it's a server component (this is client component).
  // For client component, params is not a promise in older versions but in Next 15 it might be.
  // Actually, strictly speaking, in Next 15 Client Components, `params` is likely a Promise.
  // Let's use `use` from react to unwrap it if we can, or just standard useEffect usage.
  // Wait, standard `use` is available in React 19. Next 15 uses React 19.

  const resolvedParams = use(params)
  const { username } = resolvedParams
  
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInvalidUser, setIsInvalidUser] = useState(false)
  const [checkingUser, setCheckingUser] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Resolve username to ID
    // Assumption: there is a 'profiles' table with username column.
    async function getProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()
      
      if (data) {
        setProfileId(data.id)
      } else {
        setIsInvalidUser(true)
      }
      setCheckingUser(false)
    }
    getProfile()
  }, [username, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    
    setLoading(true)

    const getMeta = () => {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenHeight: window.screen.height,
            screenWidth: window.screen.width,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            referrer: document.referrer
        }
    }
    
    
    const targetId = profileId
    
    if (!targetId) {
        setError("User does not exist!")
        setLoading(false)
        return
    }

    // Use our new API route to send the message AND trigger notification
    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: targetId,
                content: message,
                meta: getMeta()
            })
        })

        const data = await response.json()

        if (!response.ok) {
            setError(data.error || 'Failed to send')
        } else {
            setSent(true)
            setMessage('')
            fireConfetti()
        }
    } catch (e) {
        setError("Network error occurred")
    }
    
    setLoading(false)
  }

  const fireConfetti = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults, 
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }
  
  const resetForm = () => {
    setSent(false)
    setError(null)
  }
  if (checkingUser) {
    return (
        <div className="min-h-dvh flex items-center justify-center p-4 bg-black">
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#ff0050_0%,_transparent_50%)]" />
        </div>
        <div className="animate-pulse bg-white/10 w-16 h-16 rounded-full" />
      </div>
    )
  }

  if (isInvalidUser) {
    return (
        <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-black">
        {/* Background Ambience */}
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#ff0050_0%,_transparent_50%)]" />
        </div>
  
        <Card className="w-full max-w-md relative z-10 text-center space-y-4 md:space-y-6 py-6 md:py-10" variant="strong">
            <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
               <SearchX size={48} />
            </div>
            
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">User not found</h1>
                <p className="text-gray-400">
                    The user <span className="text-brand-primary font-bold">@{username}</span> does not exist or has deleted their account.
                </p>
            </div>
  
            <div className="pt-4">
                <a href="/" className="inline-block w-full">
                    <Button className="w-full">
                        <Home size={18} className="mr-2"/>
                        Create your own Link
                    </Button>
                </a>
            </div>
        </Card>
        
        <div className="fixed bottom-6 text-center w-full z-10">
            <p className="text-gray-600 text-sm font-medium">
               ngl.ayooluwa <span className="mx-2">•</span> 100% Anonymous
            </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-3 md:p-4 bg-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#ff0050_0%,_transparent_50%)]" />
      </div>

      <Card className="w-full max-w-md relative z-10 min-h-[350px] flex flex-col justify-center" variant="strong">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary mx-auto p-[2px]">
                   <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                      {/* Avatar placeholder */}
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
                        {username.slice(0, 2).toUpperCase()}
                      </span>
                   </div>
                </div>
                <h1 className="text-2xl font-bold text-white">@{username}</h1>
                <p className="text-gray-400 text-sm">Send me an anonymous message!</p>
              </div>

              <form onSubmit={handleSend} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 resize-none transition-all"
                    maxLength={300}
                    required
                  />
                  <div className="absolute bottom-3 right-4 text-xs text-gray-600">
                    {message.length}/300
                  </div>
                </div>

                {error && (
                    <p className="text-red-400 text-center text-sm">{error}</p>
                )}

                <Button 
                   type="submit" 
                   className="w-full text-lg h-14" 
                   loading={loading}
                   disabled={!message.trim()}
                >
                  Send Anonymous Message
                  <Send size={20} />
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-10"
            >
              <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-bold text-white">Sent!</h2>
              <p className="text-gray-400">Your message has been delivered anonymously.</p>
              
              <Button onClick={resetForm} variant="secondary" className="w-full">
                Send Another
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

        
      
      <div className="fixed bottom-6 text-center w-full space-y-6 z-10 pointer-events-none">
        <a 
            href="/" 
            className="pointer-events-auto bg-white text-black px-6 py-3 mx-auto rounded-full w-fit max-w-[90%] md:max-w-sm font-bold text-sm hover:scale-105 transition-transform shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            Get your own messages
          </a>
          <p className="text-gray-600 text-sm font-medium">
             ngl.ayooluwa <span className="mx-2">•</span> 100% Anonymous
          </p>
      </div>
    </div>
  )
}
