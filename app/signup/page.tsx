
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Toast from '@/components/ui/Toast'

export default function SignUp() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' as 'success' | 'error' })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, isVisible: true, type })
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Basic username validation
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showToast("Username can only contain letters, numbers, and underscores.", 'error')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
            username: username.toLowerCase()
        }
      },
    })


    if (error) {
      showToast(error.message, 'error')
    } else {
      // In a real app, you might ask for email confirmation.
      // For this demo, let's assume they might be auto-signed in or directed to check email.
      // Supabase default is "Confirm Email".
      showToast("Account created! Check email for link.", 'success')
      // Optional: redirect to login or check-email page after delay, or just let them sit there.
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/bg-gradient.svg')] bg-cover">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />
      
      <Card className="w-full max-w-md relative z-10" hoverEffect>
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white mb-2 tracking-tighter"
          >
            ngl<span className="text-brand-primary">.ayooluwa</span>
          </motion.h1>
          <p className="text-gray-400">Get anonymous messages on Instagram.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="username"
            minLength={3}
            maxLength={20}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Toast 
            message={toast.message}
            isVisible={toast.isVisible}
            type={toast.type}
            onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
          />

          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:text-brand-primary transition-colors">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  )
}
