import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Users, Sparkles, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: number
}

export default function StudyRoomsPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [onlineCount, setOnlineCount] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    fetchProfileAndJoin()
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchProfileAndJoin = async () => {
    try {
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setProfile({ id: 'dev-user', full_name: 'Dev Scholar' })
        joinRoom({ id: 'dev-user', full_name: 'Dev Scholar' })
        return
      }

      const userId = await getUserId()
      if (!userId) { navigate('/login', { replace: true }); return }

      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (error) throw error
      setProfile(data)
      joinRoom(data)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load profile')
    }
  }

  const joinRoom = (userProfile: any) => {
    // Join a global study room channel
    const room = supabase.channel('global-study-room', {
      config: {
        broadcast: { ack: false },
        presence: { key: userProfile.id }
      }
    })

    room
      .on('broadcast', { event: 'chat' }, payload => {
        setMessages(prev => [...prev, payload.payload as Message])
      })
      .on('presence', { event: 'sync' }, () => {
        const state = room.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Optional: show toast when someone joins
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Optional: show toast when someone leaves
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({ user: userProfile.full_name, online_at: new Date().toISOString() })
        }
      })

    channelRef.current = room
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !profile) return

    const newMessage: Message = {
      id: crypto.randomUUID(),
      userId: profile.id,
      userName: profile.full_name || 'Scholar',
      text: inputText.trim(),
      timestamp: Date.now()
    }

    // Optimistic update
    setMessages(prev => [...prev, newMessage])
    setInputText('')

    // Broadcast to others
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'chat',
        payload: newMessage
      })
    }
  }

  return (
    <div className="bg-background min-h-screen pb-24 text-text-main font-sans antialiased overflow-hidden flex flex-col relative">
      <div className="fixed inset-0 bg-luminous-glow pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-surface-border bg-background/80">
        <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-hover transition-colors">
              <ArrowLeft className="w-5 h-5 text-text-muted hover:text-white transition-colors" />
            </button>
            <div>
              <h1 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" /> Global Study Room
              </h1>
              <p className="text-xs text-text-muted font-medium flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                {onlineCount} scholars focusing
              </p>
            </div>
          </div>
          <Users className="w-6 h-6 text-text-muted" />
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 relative z-10 max-w-4xl mx-auto w-full px-4 py-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <MessageSquare className="w-12 h-12 mb-4 text-primary" />
            <p className="text-lg font-display text-white">It's quiet in here...</p>
            <p className="text-sm">Be the first to share your goals!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => {
              const isMe = msg.userId === profile?.id
              const isSystem = msg.userId === 'system'
              
              if (isSystem) {
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className="flex justify-center my-2"
                  >
                    <span className="text-xs text-text-muted bg-surface py-1 px-3 rounded-full border border-surface-border">
                      {msg.text}
                    </span>
                  </motion.div>
                )
              }

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  {!isMe && (
                    <span className="text-xs font-semibold text-text-muted ml-1 mb-1">{msg.userName}</span>
                  )}
                  <div 
                    className={`px-4 py-3 rounded-2xl ${
                      isMe 
                        ? 'bg-gradient-to-br from-primary to-secondary text-background font-medium rounded-tr-sm' 
                        : 'glass-card rounded-tl-sm border border-surface-border text-white'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="fixed bottom-16 left-0 w-full p-4 bg-background/80 backdrop-blur-xl border-t border-surface-border z-40">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Share what you're working on..."
              className="w-full bg-surface border border-surface-border rounded-full py-4 pl-6 pr-16 text-white placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="absolute right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>

      <BottomNav />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 172, 254, 0.2); border-radius: 4px; }
      `}</style>
    </div>
  )
}
