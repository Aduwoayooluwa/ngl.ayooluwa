
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { ArrowRight, Shield, Zap, Sparkles, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div className="min-h-dvh bg-black overflow-hidden relative selection:bg-brand-primary/30">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,_var(--color-brand-primary)_0%,_transparent_70%)] opacity-20 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,_var(--color-brand-secondary)_0%,_transparent_70%)] opacity-20 blur-[120px] animate-pulse-slow delay-1000" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-tighter text-white">
          ngl<span className="text-brand-primary">.ayooluwa</span>
        </div>
        <div className="flex gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button size="sm">
                <LayoutDashboard size={16} />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 h-[80vh] flex flex-col justify-center items-center text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-brand-secondary backdrop-blur-md">
            <Sparkles size={16} />
            <span>The Place for Honest Feedback</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white max-w-5xl mx-auto leading-[0.9]">
            Discover what people <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-purple-500 to-brand-secondary">
              really think.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Create your space. Share your link. Receive confessions, questions, and honest thoughts—completely anonymously.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            {user ? (
               <Link href="/dashboard">
                 <Button size="lg" className="text-xl px-10 h-16">
                   Go to Inbox
                   <ArrowRight className="ml-2" />
                 </Button>
               </Link>
            ) : (
                <Link href="/signup">
                <Button size="lg" className="text-xl px-10 h-16">
                    Get Your Link
                    <ArrowRight className="ml-2" />
                </Button>
                </Link>
            )}
          </div>
        </motion.div>
      </main>

      {/* Features Section - Premium Bento Grid */}
      <div className="relative z-10 py-20 bg-gradient-to-b from-black/0 via-black/80 to-black/0">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
             <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
               Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">ngl.ayooluwa</span>?
             </h2>
             <p className="text-gray-400 text-lg max-w-2xl mx-auto">
               Built for connection. Designed for truth. The ultimate way to hear the unspoken.
             </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Card 1: Anonymous */}
             <motion.div 
               whileHover={{ y: -10 }}
               className="col-span-1 md:col-span-2 p-8 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden group"
             >
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 blur-[100px] group-hover:bg-brand-primary/30 transition-all duration-500" />
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center text-white shrink-0 shadow-[0_0_30px_rgba(255,0,80,0.4)]">
                     <Shield size={32} />
                   </div>
                   <div className="text-center md:text-left">
                     <h3 className="text-2xl font-bold text-white mb-2">Unfiltered Honesty</h3>
                     <p className="text-gray-400 leading-relaxed max-w-md">
                       Say what you mean without the fear. No tracking. No names. Just pure, unfiltered truth delivered straight to you.
                     </p>
                   </div>
                </div>
             </motion.div>

             {/* Card 2: Instant */}
             <motion.div 
               whileHover={{ y: -10 }}
               className="col-span-1 p-8 rounded-[2.5rem] bg-gradient-to-bl from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden group"
             >
               <div className="absolute bottom-0 left-0 w-full h-32 bg-purple-500/10 blur-[60px] group-hover:bg-purple-500/20 transition-all" />
               <div className="relative z-10 flex flex-col items-center text-center gap-4">
                 <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                   <Zap size={28} fill="currentColor" />
                 </div>
                 <h3 className="text-xl font-bold text-white">Instant Dopamine</h3>
                 <p className="text-gray-400 text-sm">
                   We'll ping you the second someone spills the tea. Never miss a moment.
                 </p>
               </div>
             </motion.div>

             {/* Card 3: Design */}
             <motion.div 
               whileHover={{ y: -10 }}
               className="col-span-1 md:col-span-3 p-10 rounded-[2.5rem] bg-gradient-to-r from-gray-900 to-black border border-white/10 relative overflow-hidden group"
             >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-secondary/5 blur-[80px]" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="text-center md:text-left max-w-xl">
                      <div className="inline-flex items-center gap-2 text-brand-secondary mb-4 font-mono text-sm tracking-wider uppercase">
                        <Sparkles size={14} />
                        <span>Go Viral</span>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">Share Everywhere</h3>
                      <p className="text-gray-400">
                        Paste your unique link on your Instagram Story, Snapchat, or TikTok. 
                        It's the easiest way to start a conversation and see who's really paying attention.
                      </p>
                   </div>
                   
                   {/* Visual Element representing UI */}
                   <div className="w-full md:w-80 h-40 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md relative overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-brand-secondary/20 opacity-50" />
                      <div className="text-2xl font-black text-white mix-blend-overlay">#TRY_IT</div>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>

    </div>
  )
}
