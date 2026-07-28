'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Plus, Pin, Trash2, Edit3, StickyNote } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function NotesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', search],
    queryFn: () => api.get(`/notes${search ? `?search=${encodeURIComponent(search)}` : ''}`).then(r => r.data),
  });

  const pinNote = useMutation({
    mutationFn: ({ id, pinned }: any) => api.put(`/notes/${id}`, { pinned }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });

  const deleteNote = useMutation({
    mutationFn: (id: string) => api.delete(`/notes/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Note deleted'); },
  });

  const pinned = notes.filter((n: any) => n.pinned);
  const rest = notes.filter((n: any) => !n.pinned);

  return (
    <AppShell title="Notes">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field flex-1"
            placeholder="Search notes..."
          />
          <Link href="/notes/editor">
            <button className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Note
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-40" />)}
          </div>
        ) : notes.length > 0 ? (
          <>
            {pinned.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Pin className="w-4 h-4" /> Pinned
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinned.map((note: any) => <NoteCard key={note.id} note={note} onPin={pinNote.mutate} onDelete={deleteNote.mutate} />)}
                </div>
              </div>
            )}
            {rest.length > 0 && (
              <div>
                {pinned.length > 0 && <h3 className="text-sm font-medium text-muted-foreground mb-3">All Notes</h3>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map((note: any) => <NoteCard key={note.id} note={note} onPin={pinNote.mutate} onDelete={deleteNote.mutate} />)}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card text-center py-16 text-muted-foreground">
            <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No notes yet</p>
            <p className="text-sm mt-1">Start capturing your study notes</p>
            <Link href="/notes/editor"><button className="btn-primary mt-4 text-sm">Create Note</button></Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function NoteCard({ note, onPin, onDelete }: any) {
  const preview = note.content.replace(/[#*`]/g, '').substring(0, 120);
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="card group space-y-3 cursor-pointer relative"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-sm truncate flex-1 mr-2">{note.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onPin({ id: note.id, pinned: !note.pinned }); }} className={cn('p-1.5 rounded-lg hover:bg-white/10 transition-colors', note.pinned ? 'text-yellow-400' : 'text-muted-foreground')}>
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <Link href={`/notes/editor?id=${note.id}`}>
        <p className="text-xs text-muted-foreground line-clamp-4">{preview}</p>
      </Link>
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{new Date(note.updatedAt).toLocaleDateString()}</p>
    </motion.div>
  );
}
