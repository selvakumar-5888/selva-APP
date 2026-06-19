import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  is_pinned: boolean
  subject_id: string | null
  created_at: string
  updated_at: string
}

interface Subject { id: string; name: string; color: string }

export default function NotesPage() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState<Note[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', tags: '', subject_id: '', is_pinned: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      // ── Dev bypass: use mock data ─────────────────────────────────
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setNotes([
          { id: '1', title: 'Quantum Mechanics Overview', content: 'Wave-particle duality, Heisenberg uncertainty principle...', tags: ['physics', 'quantum'], is_pinned: true, subject_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', title: 'Calculus – Integration by Parts', content: 'Integration by parts formula: ∫u dv = uv − ∫v du...', tags: ['math'], is_pinned: false, subject_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ] as Note[])
        setSubjects([{ id: '1', name: 'Mathematics', color: '#c4c0ff' }, { id: '2', name: 'Physics', color: '#eec13c' }])
        setLoading(false)
        return
      }
      // ─────────────────────────────────────────────────────────────
      const userId = await getUserId();
      if (!userId) { navigate('/login', { replace: true }); return }
      const [notesRes, subjectsRes] = await Promise.all([
        supabase.from('notes').select('*').eq('user_id', userId).order('is_pinned', { ascending: false }).order('updated_at', { ascending: false }),
        supabase.from('subjects').select('id,name,color').eq('user_id', userId),
      ])
      setNotes((notesRes.data || []) as Note[])
      setSubjects(subjectsRes.data || [])
    } catch (e: any) {
      console.error(e)
      toast.error('Failed to load notes.')
    } finally {
      setLoading(false)
    }
  }


  const openNew = () => {
    setEditingNote(null)
    setForm({ title: '', content: '', tags: '', subject_id: '', is_pinned: false })
    setShowEditor(true)
  }

  const openEdit = (note: Note) => {
    setEditingNote(note)
    setForm({ title: note.title, content: note.content, tags: (note.tags || []).join(', '), subject_id: note.subject_id || '', is_pinned: note.is_pinned })
    setShowEditor(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const userId = await getUserId();

    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const payload = { title: form.title, content: form.content, tags: tagsArray, subject_id: form.subject_id || null, is_pinned: form.is_pinned }

    if (editingNote) {
      const { error } = await supabase.from('notes').update(payload).eq('id', editingNote.id)
      if (error) toast.error(error.message); else { toast.success('Note saved!'); setShowEditor(false); fetchData() }
    } else {
      const { error } = await supabase.from('notes').insert({ ...payload, user_id: userId })
      if (error) toast.error(error.message); else { toast.success('Note created!'); setShowEditor(false); fetchData() }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id)
    toast.success('Note deleted')
    fetchData()
  }

  const handleTogglePin = async (note: Note) => {
    await supabase.from('notes').update({ is_pinned: !note.is_pinned }).eq('id', note.id)
    fetchData()
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  )
  const pinned = filtered.filter(n => n.is_pinned)
  const unpinned = filtered.filter(n => !n.is_pinned)

  const getSubject = (id: string | null) => subjects.find(s => s.id === id)

  if (showEditor) {
    return (
      <div className="bg-[#0f131f] text-[#dfe2f3] min-h-screen flex flex-col">
        <header className="bg-[#0f131f]/80 backdrop-blur-xl flex justify-between items-center px-4 h-16 fixed top-0 w-full z-50 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowEditor(false)} className="text-[#c4c0ff] p-2 hover:bg-white/5 rounded-full">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <input
              className="bg-transparent text-xl font-bold text-[#dfe2f3] focus:outline-none w-48 md:w-80"
              style={{ fontFamily: 'Syne, sans-serif' }}
              placeholder="Note title..."
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setForm(p => ({ ...p, is_pinned: !p.is_pinned }))} className={`p-2 rounded-full transition-colors ${form.is_pinned ? 'text-[#eec13c]' : 'text-[#c7c4d8]'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: form.is_pinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50" style={{ background: '#c4c0ff', color: '#1b0091' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </header>

        <div className="pt-20 flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
          <div className="flex gap-4 py-4 border-b border-white/5 mb-4">
            <select className="bg-[#1b1f2c] border border-[#464555] rounded-lg px-3 py-1.5 text-sm text-[#dfe2f3] focus:outline-none" value={form.subject_id} onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))}>
              <option value="">No Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input
              className="flex-1 bg-transparent border-b border-[#464555] text-sm text-[#dfe2f3] focus:outline-none focus:border-[#c4c0ff] px-2"
              placeholder="Tags: react, algorithms, physics (comma separated)"
              value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
            />
          </div>
          <textarea
            className="flex-1 bg-transparent text-[#dfe2f3] focus:outline-none resize-none text-base leading-relaxed min-h-[60vh]"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
            placeholder="Start writing your notes here..."
            value={form.content}
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
          />
        </div>
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
          <h1 className="text-2xl font-bold text-[#eec13c]" style={{ fontFamily: 'Syne, sans-serif' }}>Smart Notes</h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#c4c0ff', color: '#1b0091' }}>
          <span className="material-symbols-outlined text-sm">add</span> New Note
        </button>
      </header>

      <main className="mt-20 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Search */}
        <div className="py-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1]">search</span>
            <input
              className="w-full bg-[#1b1f2c] border border-[#464555] rounded-xl px-4 py-3 pl-12 text-[#dfe2f3] focus:border-[#c4c0ff] focus:outline-none transition-colors"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#c7c4d8]">Loading notes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-[#c4c0ff]/30 block mb-4">note_stack</span>
            <p className="text-[#c7c4d8] text-lg mb-6">No notes yet. Start writing!</p>
            <button onClick={openNew} className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: '#c4c0ff', color: '#1b0091' }}>Create Your First Note</button>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm uppercase tracking-widest text-[#eec13c] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span> Pinned
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinned.map(note => <NoteCard key={note.id} note={note} getSubject={getSubject} onEdit={openEdit} onDelete={handleDelete} onPin={handleTogglePin} />)}
                </div>
              </div>
            )}
            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && <h2 className="text-sm uppercase tracking-widest text-[#c7c4d8] mb-4">All Notes</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unpinned.map(note => <NoteCard key={note.id} note={note} getSubject={getSubject} onEdit={openEdit} onDelete={handleDelete} onPin={handleTogglePin} />)}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

function NoteCard({ note, getSubject, onEdit, onDelete, onPin }: {
  note: Note
  getSubject: (id: string | null) => Subject | undefined
  onEdit: (n: Note) => void
  onDelete: (id: string) => void
  onPin: (n: Note) => void
}) {
  const subj = getSubject(note.subject_id)
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 cursor-pointer group transition-all hover:shadow-[0_0_20px_rgba(196,192,255,0.1)]"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={() => onEdit(note)}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-base font-semibold text-[#dfe2f3] leading-tight flex-1 pr-2" style={{ fontFamily: 'Syne, sans-serif' }}>{note.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onPin(note) }} className={`p-1 rounded ${note.is_pinned ? 'text-[#eec13c]' : 'text-[#c7c4d8] hover:text-[#eec13c]'}`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: note.is_pinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(note.id) }} className="p-1 text-[#c7c4d8] hover:text-red-400 rounded">
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
      {note.content && <p className="text-sm text-[#c7c4d8] line-clamp-3 leading-relaxed">{note.content}</p>}
      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        {subj && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: subj.color + '22', color: subj.color }}>{subj.name}</span>
        )}
        {(note.tags || []).slice(0, 2).map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#c7c4d8]">#{tag}</span>
        ))}
      </div>
      <p className="text-xs text-[#c7c4d8]/40">{new Date(note.updated_at).toLocaleDateString()}</p>
    </div>
  )
}
