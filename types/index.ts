
export interface Profile {
  id: string
  username: string
  avatar_url?: string
  created_at: string
}

export interface Message {
  id: string
  user_id: string
  content: string
  created_at: string
  is_read: boolean
  is_pinned: boolean
}

export interface ChatMessage {
  id: string
  sender_type: 'anonymous' | 'owner'
  content: string
  created_at: string
}

export interface ChatSession {
  id: string
  secret_token: string
  name: string | null
  created_at: string
  expires_at: string
  lastMessage: ChatMessage | null
  messageCount: number
}
