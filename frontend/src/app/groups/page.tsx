'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Users, Plus, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function GroupsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AppShell title="Study Groups">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex gap-3">
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Create Group
          </button>
          <button className="btn-ghost flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" /> Join with Code
          </button>
        </div>

        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card space-y-3">
            <h3 className="font-semibold">New Study Group</h3>
            <input className="input-field" placeholder="Group name..." />
            <textarea className="input-field resize-none" rows={3} placeholder="Description (optional)..." />
            <div className="flex gap-2">
              <button className="btn-primary text-sm">Create Group</button>
              <button onClick={() => setShowCreate(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="card text-center py-16 text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold text-lg">No groups yet</h3>
          <p className="text-sm mt-2">Create or join a study group to study with friends</p>
        </div>
      </div>
    </AppShell>
  );
}
