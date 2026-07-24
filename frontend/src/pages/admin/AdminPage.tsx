import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Server, Activity, Database, Key, Settings, Terminal, CheckCircle, RefreshCw, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemUser {
  id: string
  name: string
  email: string
  role: 'User' | 'Officer' | 'Admin'
  status: 'Active' | 'Suspended'
  lastLogin: string
}

const INITIAL_USERS: SystemUser[] = [
  { id: 'USR-001', name: 'Ramesh Farmer', email: 'farmer_demo@demo.com', role: 'User', status: 'Active', lastLogin: '2 mins ago' },
  { id: 'USR-002', name: 'Officer Vikram', email: 'officer@demo.com', role: 'Officer', status: 'Active', lastLogin: '10 mins ago' },
  { id: 'USR-003', name: 'System Administrator', email: 'admin@demo.com', role: 'Admin', status: 'Active', lastLogin: 'Just now' },
  { id: 'USR-004', name: 'Anita Student', email: 'student_test@demo.com', role: 'User', status: 'Active', lastLogin: '1 hour ago' },
]

export default function AdminPage() {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS)
  const [selectedTab, setSelectedTab] = useState<'Users' | 'Logs' | 'System'>('Users')

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active'
        toast.success(`User ${u.email} set to ${nextStatus}`, {
          style: { background: '#09090b', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)' }
        })
        return { ...u, status: nextStatus }
      }
      return u
    }))
  }

  return (
    <div className="min-h-screen bg-background text-text-main font-sans p-6 md:p-10 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/30 to-accent/30 flex items-center justify-center border border-primary/40 shadow-lg">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-white">System Admin Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                SUPERADMIN
              </span>
            </div>
            <p className="text-sm text-text-muted">Manage system users, monitor live HTTP logs, and view backend system status.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-xl">
          {(['Users', 'Logs', 'System'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${selectedTab === tab ? 'bg-primary text-background shadow-md' : 'text-text-muted hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="glass-card p-5 border-l-4 border-l-primary flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-bold text-white mt-1">1,482</h3>
          </div>
          <Users className="w-8 h-8 text-primary/60" />
        </div>

        <div className="glass-card p-5 border-l-4 border-l-secondary flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Backend API Latency</p>
            <h3 className="text-2xl font-bold text-white mt-1">14 ms</h3>
          </div>
          <Activity className="w-8 h-8 text-secondary/60" />
        </div>

        <div className="glass-card p-5 border-l-4 border-l-accent flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Database Status</p>
            <h3 className="text-2xl font-bold text-white mt-1">Healthy</h3>
          </div>
          <Database className="w-8 h-8 text-accent/60" />
        </div>

        <div className="glass-card p-5 border-l-4 border-l-warning flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Active Sessions</p>
            <h3 className="text-2xl font-bold text-white mt-1">324</h3>
          </div>
          <Server className="w-8 h-8 text-warning/60" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10">
        {selectedTab === 'Users' && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> System User Directory & Roles
              </h3>
              <button
                onClick={() => toast.success('Refreshed user directory!')}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-text-muted hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> REFRESH
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-muted">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-white border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-secondary font-bold">{u.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{u.name}</td>
                      <td className="py-3.5 px-4">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === 'Admin' ? 'bg-primary/20 text-primary border border-primary/30' :
                          u.role === 'Officer' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                          'bg-white/10 text-white border border-white/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          u.status === 'Active' ? 'text-accent bg-accent/10 border border-accent/20' : 'text-error bg-error/10 border border-error/20'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">{u.lastLogin}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 text-white transition-colors"
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'Logs' && (
          <div className="glass-card p-6 font-mono text-xs text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Terminal className="w-5 h-5 text-secondary" /> Live Backend HTTP Request Stream
              </h3>
              <span className="px-2.5 py-1 rounded bg-secondary/20 text-secondary font-bold text-[11px]">
                LIVE RECORDING ACTIVE
              </span>
            </div>
            <div className="bg-black/60 rounded-xl p-4 border border-white/10 space-y-2 max-h-[400px] overflow-y-auto leading-relaxed">
              <p className="text-secondary">[Backend Log] 2026-07-24T10:59:01Z - GET /api/admin/users 200 OK 12.4ms</p>
              <p className="text-text-muted">[Backend Log] 2026-07-24T10:59:02Z - GET /api/market/all-crops?state=Maharashtra 200 OK 284.7ms</p>
              <p className="text-text-muted">[Backend Log] 2026-07-24T10:59:03Z - GET /api/expense 200 OK 3.4ms</p>
              <p className="text-text-muted">[Backend Log] 2026-07-24T10:59:04Z - GET /api/alert/my-alerts 200 OK 3.5ms</p>
              <p className="text-secondary">[Backend Log] 2026-07-24T10:59:05Z - POST /api/auth/login 200 OK 45.1ms (user: admin@demo.com)</p>
              <p className="text-text-muted">[Backend Log] 2026-07-24T10:59:06Z - GET /api/farm/profile 200 OK 6.1ms</p>
              <p className="text-text-muted">[Backend Log] 2026-07-24T10:59:07Z - GET /api/crop/all 200 OK 5.4ms</p>
              <p className="text-accent">[Backend Log] 2026-07-24T10:59:08Z - POST /api/advisory/respond 200 OK 28.5ms (officer: OFF-9942)</p>
            </div>
          </div>
        )}

        {selectedTab === 'System' && (
          <div className="glass-card p-6 flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-accent" /> System Services & Environment Health
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white">Vite Frontend Server</h4>
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                </div>
                <p className="text-xs text-text-muted">Port 5173 • HTTP/2</p>
                <p className="text-xs text-accent font-bold mt-2">RUNNING (0 Errors)</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white">Express Backend API</h4>
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                </div>
                <p className="text-xs text-text-muted">Port 5000 • CORS Enabled</p>
                <p className="text-xs text-accent font-bold mt-2">RUNNING (200 OK)</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white">Supabase / Postgres DB</h4>
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                </div>
                <p className="text-xs text-text-muted">SSL Encrypted Connection</p>
                <p className="text-xs text-accent font-bold mt-2">CONNECTED</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
