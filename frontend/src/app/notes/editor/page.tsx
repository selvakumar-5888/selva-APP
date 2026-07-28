'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Save, Trash2, Brain, Loader2, ArrowLeft, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useDebouncedCallback } from '@/hooks/useDebounce';

export default function NoteEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const noteId = searchParams.get('id');

  const [title, setTitle] = useState('Untitled Note');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const currentId = useRef<string | null>(noteId);

  const { data: existingNote } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => noteId ? api.get(`/notes/${noteId}`).catch(() => null).then(r => r?.data) : null,
    enabled: !!noteId,
  });

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setTags(existingNote.tags || []);
      setSummary(existingNote.summary || '');
    }
  }, [existingNote]);

  const saveNote = useMutation({
    mutationFn: (data: any) =>
      currentId.current
        ? api.put(`/notes/${currentId.current}`, data)
        : api.post('/notes', data),
    onSuccess: (res) => {
      if (!currentId.current) currentId.current = res.data.id;
      qc.invalidateQueries({ queryKey: ['notes'] });
      setSaved(true);
    },
  });

  const autoSave = useDebouncedCallback((t: string, c: string, tgs: string[]) => {
    if (t || c) {
      saveNote.mutate({ title: t, content: c, tags: tgs });
    }
  }, 1500);

  const handleChange = (t: string, c: string, tgs: string[]) => {
    setSaved(false);
    autoSave(t, c, tgs);
  };

  const summarize = async () => {
    if (!content) return;
    setSummarizing(true);
    try {
      const res = await api.post('/ai/summarize-notes', { content, noteId: currentId.current });
      setSummary(res.data.summary);
      toast.success('Notes summarized!');
    } catch {
      toast.error('AI summarization failed');
    } finally {
      setSummarizing(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTags = [...tags, tagInput.trim().toLowerCase()];
      setTags(newTags);
      setTagInput('');
      handleChange(title, content, newTags);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-2xl p-2">
          <Link href="/notes">
            <button className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">{saved ? '✓ Saved' : '...'}</span>
          <button
            onClick={summarize}
            disabled={summarizing || !content}
            className="flex items-center gap-2 text-sm bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {summarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            AI Summary
          </button>
          <button
            onClick={() => saveNote.mutate({ title, content, tags })}
            className="flex items-center gap-2 text-sm btn-primary px-4 py-1.5"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); handleChange(e.target.value, content, tags); }}
          className="w-full bg-transparent text-3xl font-bold placeholder:text-muted-foreground/50 focus:outline-none"
          placeholder="Note title..."
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
              #{tag}
              <button onClick={() => { const t = tags.filter(x => x !== tag); setTags(t); handleChange(title, content, t); }} className="ml-0.5 hover:text-foreground">×</button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
            className="bg-transparent text-xs text-muted-foreground focus:outline-none placeholder:text-muted-foreground/50"
            placeholder="Add tag..."
          />
        </div>

        {/* AI Summary */}
        {summary && (
          <div className="card bg-purple-600/10 border-purple-500/20 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
              <Brain className="w-4 h-4" /> AI Summary
            </div>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
        )}

        {/* Content */}
        <textarea
          value={content}
          onChange={e => { setContent(e.target.value); handleChange(title, e.target.value, tags); }}
          className="w-full min-h-[60vh] bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none font-mono text-sm leading-relaxed"
          placeholder={`Start writing...\n\nYou can use Markdown:\n# Heading 1\n## Heading 2\n**bold** _italic_\n- bullet point\n1. numbered list`}
        />
      </div>
    </AppShell>
  );
}
