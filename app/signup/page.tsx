
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

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showToast("Username can only contain letters, numbers, and underscores.", 'error')
      setLoading(false)
      return
    }

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase()) 
      .single()

    if (existingUser) {
      showToast("Username already taken. Please choose another.", 'error')
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
      showToast("Account created!")
      // Redirect to login after a short delay to let them see the success message
      setTimeout(() => router.push('/login'), 1500)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-3 md:p-4" style={{ backgroundImage: "url('/bg-gradient.svg')", backgroundSize: 'cover' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />
      
      <Card className="w-full max-w-md relative z-10" hoverEffect>
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter"
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
