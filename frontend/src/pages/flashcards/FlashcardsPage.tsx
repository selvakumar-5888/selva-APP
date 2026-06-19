import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'

interface Deck {
  id: string
  title: string
  description: string | null
  card_count: number
  mastered_count: number
  subject_id: string | null
}

interface Flashcard {
  id: string
  front: string
  back: string
  deck_id: string
  review_count: number
}

interface Subject { id: string; name: string; color: string }

export default function FlashcardsPage() {
  const navigate = useNavigate()
  const [decks, setDecks] = useState<Deck[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  const [studyingDeck, setStudyingDeck] = useState<Deck | null>(null)
  const [deckCards, setDeckCards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [newDeck, setNewDeck] = useState({ title: '', description: '', subject_id: '' })
  const [newCard, setNewCard] = useState({ front: '', back: '' })
  const [saving, setSaving] = useState(false)
  const [showDeckModal, setShowDeckModal] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      // ── Dev bypass: use mock data ─────────────────────────────────
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setDecks([
          { id: '1', title: 'React Hooks', description: 'useState, useEffect, useRef and more', card_count: 12, mastered_count: 5, subject_id: '1' },
          { id: '2', title: 'Physics Formulas', description: 'Key equations for mechanics and thermodynamics', card_count: 20, mastered_count: 8, subject_id: '2' },
        ] as Deck[])
        setSubjects([{ id: '1', name: 'Mathematics', color: '#c4c0ff' }, { id: '2', name: 'Physics', color: '#eec13c' }])
        setLoading(false)
        return
      }
      // ─────────────────────────────────────────────────────────────
      const userId = await getUserId()
      if (!userId) { navigate('/login', { replace: true }); return }
      const [decksRes, subjectsRes] = await Promise.all([
        supabase.from('flashcard_decks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('subjects').select('id,name,color').eq('user_id', userId),
      ])
      setDecks((decksRes.data || []) as Deck[])
      setSubjects(subjectsRes.data || [])
    } catch (e: any) {
      console.error(e)
      toast.error('Failed to load flashcards.')
    } finally {
      setLoading(false)
    }
  }


  const handleCreateDeck = async () => {
    if (!newDeck.title.trim()) return
    setSaving(true)
    const userId = await getUserId()
    // No need for user check; getUserId will throw if unauthenticated
    const { error } = await supabase.from('flashcard_decks').insert({
      user_id: userId, title: newDeck.title, description: newDeck.description || null,
      subject_id: newDeck.subject_id || null, card_count: 0, mastered_count: 0,
    })
    if (error) toast.error(error.message)
    else { toast.success('Deck created!'); setShowDeckModal(false); setNewDeck({ title: '', description: '', subject_id: '' }); fetchData() }
    setSaving(false)
  }

  const handleStudyDeck = async (deck: Deck) => {
    const { data } = await supabase.from('flashcards').select('*').eq('deck_id', deck.id).order('created_at')
    if (!data || data.length === 0) { toast.error('No cards in this deck yet!'); return }
    setDeckCards(data as Flashcard[])
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setStudyingDeck(deck)
  }

  const handleAddCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim() || !studyingDeck) return
    setSaving(true)
    const userId = await getUserId()
    // No need for user check; getUserId will throw if unauthenticated
    const { error } = await supabase.from('flashcards').insert({
      deck_id: studyingDeck.id, user_id: userId, front: newCard.front, back: newCard.back,
    })
    if (!error) {
      // Update card count
      await supabase.from('flashcard_decks').update({ card_count: studyingDeck.card_count + 1 }).eq('id', studyingDeck.id)
      toast.success('Card added!')
      setNewCard({ front: '', back: '' })
      setShowAddCard(false)
      handleStudyDeck(studyingDeck)
      fetchData()
    } else toast.error(error.message)
    setSaving(false)
  }

  const handleDeleteDeck = async (id: string) => {
    await supabase.from('flashcards').delete().eq('deck_id', id)
    await supabase.from('flashcard_decks').delete().eq('id', id)
    toast.success('Deck deleted')
    fetchData()
  }

  const getSubject = (id: string | null) => subjects.find(s => s.id === id)

  // Study mode
  if (studyingDeck) {
    const card = deckCards[currentCardIndex]
    return (
      <div className="bg-[#0a0e1a] text-[#dfe2f3] min-h-screen flex flex-col" style={{ background: 'radial-gradient(at 30% 20%, rgba(108,99,255,0.12) 0%, transparent 50%), #0a0e1a' }}>
        <header className="flex justify-between items-center px-6 py-4">
          <button onClick={() => setStudyingDeck(null)} className="text-[#c4c0ff] flex items-center gap-2">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm">Exit Study</span>
          </button>
          <span className="text-sm text-[#c7c4d8]">{currentCardIndex + 1} / {deckCards.length}</span>
          <button onClick={() => setShowAddCard(true)} className="text-[#eec13c] flex items-center gap-1 text-sm">
            <span className="material-symbols-outlined text-sm">add</span> Add Card
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <h2 className="text-2xl font-bold text-[#eec13c]" style={{ fontFamily: 'Syne, sans-serif' }}>{studyingDeck.title}</h2>

          {/* Progress bar */}
          <div className="w-full max-w-lg h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#c4c0ff] rounded-full transition-all duration-500" style={{ width: ((currentCardIndex + 1) / deckCards.length * 100) + '%' }} />
          </div>

          {/* Flashcard */}
          <div
            className="w-full max-w-lg cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(f => !f)}
          >
            <div style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)', transformStyle: 'preserve-3d', transition: 'transform 0.5s', position: 'relative', minHeight: '300px' }}>
              {/* Front */}
              <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(196,192,255,0.3)', boxShadow: '0 0 40px rgba(108,99,255,0.2)' }}>
                <span className="text-xs uppercase tracking-widest text-[#c4c0ff] mb-4">Question</span>
                <p className="text-2xl font-semibold text-[#dfe2f3]" style={{ fontFamily: 'Syne, sans-serif' }}>{card?.front}</p>
                <p className="text-sm text-[#c7c4d8] mt-8">Tap to reveal answer</p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'rgba(196,192,255,0.08)', border: '1px solid rgba(196,192,255,0.5)', boxShadow: '0 0 40px rgba(196,192,255,0.3)' }}>
                <span className="text-xs uppercase tracking-widest text-[#eec13c] mb-4">Answer</span>
                <p className="text-2xl font-semibold text-[#dfe2f3]" style={{ fontFamily: 'Syne, sans-serif' }}>{card?.back}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 w-full max-w-lg justify-center">
            <button onClick={() => { setCurrentCardIndex(Math.max(0, currentCardIndex - 1)); setIsFlipped(false) }} disabled={currentCardIndex === 0} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-30" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              ← Previous
            </button>
            <button onClick={() => { setCurrentCardIndex(Math.min(deckCards.length - 1, currentCardIndex + 1)); setIsFlipped(false) }} disabled={currentCardIndex === deckCards.length - 1} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-30" style={{ background: '#c4c0ff', color: '#1b0091' }}>
              Next →
            </button>
          </div>
        </div>

        {/* Add Card Modal */}
        {showAddCard && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: '#1b1f2c', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex justify-between"><h3 className="text-xl font-bold text-[#dfe2f3]" style={{ fontFamily: 'Syne, sans-serif' }}>Add Card</h3><button onClick={() => setShowAddCard(false)}><span className="material-symbols-outlined text-[#c7c4d8]">close</span></button></div>
              <textarea className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-4 py-3 text-[#dfe2f3] focus:outline-none focus:border-[#c4c0ff] resize-none" rows={3} placeholder="Front (Question)..." value={newCard.front} onChange={e => setNewCard(p => ({ ...p, front: e.target.value }))} />
              <textarea className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-4 py-3 text-[#dfe2f3] focus:outline-none focus:border-[#c4c0ff] resize-none" rows={3} placeholder="Back (Answer)..." value={newCard.back} onChange={e => setNewCard(p => ({ ...p, back: e.target.value }))} />
              <button onClick={handleAddCard} disabled={saving} className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50" style={{ background: '#eec13c', color: '#3d2e00' }}>{saving ? 'Saving...' : 'Add Card'}</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-[#0f131f] text-[#dfe2f3] min-h-screen pb-24">
      <header className="bg-[#0f131f]/80 backdrop-blur-xl flex justify-between items-center w-full px-4 md:px-6 h-16 fixed top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-[#c4c0ff] p-2 hover:bg-white/5 rounded-full">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold text-[#eec13c]" style={{ fontFamily: 'Syne, sans-serif' }}>Flashcards</h1>
        </div>
        <button onClick={() => setShowDeckModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#c4c0ff', color: '#1b0091' }}>
          <span className="material-symbols-outlined text-sm">add</span> New Deck
        </button>
      </header>

      <main className="mt-20 px-4 md:px-6 max-w-7xl mx-auto py-6">
        {loading ? (
          <div className="text-center py-20 text-[#c7c4d8]">Loading decks...</div>
        ) : decks.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-[#c4c0ff]/30 block mb-4">style</span>
            <p className="text-[#c7c4d8] text-lg mb-6">No flashcard decks yet.</p>
            <button onClick={() => setShowDeckModal(true)} className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: '#c4c0ff', color: '#1b0091' }}>Create First Deck</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => {
              const subj = getSubject(deck.subject_id)
              const masteryPct = deck.card_count > 0 ? Math.round(deck.mastered_count / deck.card_count * 100) : 0
              return (
                <div key={deck.id} className="rounded-2xl p-6 flex flex-col gap-4 group hover:shadow-[0_0_25px_rgba(196,192,255,0.15)] transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(196,192,255,0.1)', border: '1px solid rgba(196,192,255,0.2)' }}>
                      <span className="material-symbols-outlined text-[#c4c0ff]" style={{ fontVariationSettings: "'FILL' 1" }}>style</span>
                    </div>
                    <button onClick={() => handleDeleteDeck(deck.id)} className="opacity-0 group-hover:opacity-100 text-[#c7c4d8] hover:text-red-400 transition-all p-1">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#dfe2f3]" style={{ fontFamily: 'Syne, sans-serif' }}>{deck.title}</h3>
                    {deck.description && <p className="text-sm text-[#c7c4d8] mt-1 line-clamp-2">{deck.description}</p>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#c7c4d8]">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">style</span> {deck.card_count} cards</span>
                    {subj && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: subj.color + '22', color: subj.color }}>{subj.name}</span>}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-[#c7c4d8] mb-1">
                      <span>Mastery</span><span>{masteryPct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#c4c0ff] rounded-full transition-all" style={{ width: masteryPct + '%' }} />
                    </div>
                  </div>
                  <button onClick={() => handleStudyDeck(deck)} className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95 mt-auto" style={{ background: '#c4c0ff', color: '#1b0091' }}>
                    Study Now →
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Create Deck Modal */}
      {showDeckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: '#1b1f2c', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-between"><h3 className="text-xl font-bold text-[#dfe2f3]" style={{ fontFamily: 'Syne, sans-serif' }}>New Deck</h3><button onClick={() => setShowDeckModal(false)}><span className="material-symbols-outlined text-[#c7c4d8]">close</span></button></div>
            <input className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-4 py-3 text-[#dfe2f3] focus:outline-none focus:border-[#c4c0ff]" placeholder="Deck title..." value={newDeck.title} onChange={e => setNewDeck(p => ({ ...p, title: e.target.value }))} />
            <textarea className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-4 py-3 text-[#dfe2f3] focus:outline-none focus:border-[#c4c0ff] resize-none" rows={2} placeholder="Description (optional)..." value={newDeck.description} onChange={e => setNewDeck(p => ({ ...p, description: e.target.value }))} />
            <select className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-4 py-3 text-[#dfe2f3] focus:outline-none" value={newDeck.subject_id} onChange={e => setNewDeck(p => ({ ...p, subject_id: e.target.value }))}>
              <option value="">No Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={handleCreateDeck} disabled={saving} className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50" style={{ background: '#eec13c', color: '#3d2e00' }}>{saving ? 'Creating...' : 'Create Deck'}</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
