import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, Send, UserCheck, Search, Filter, RefreshCw, BarChart2, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdvisoryQuery {
  id: string
  farmerName: string
  crop: string
  issue: string
  date: string
  status: 'Pending' | 'Approved' | 'Resolved'
  priority: 'High' | 'Medium' | 'Low'
}

const INITIAL_QUERIES: AdvisoryQuery[] = [
  { id: 'ADV-101', farmerName: 'Ramesh Kumar', crop: 'Wheat / Paddy', issue: 'Yellow rust infestation in northern sector', date: '2026-07-24', status: 'Pending', priority: 'High' },
  { id: 'ADV-102', farmerName: 'Suresh Patel', crop: 'Cotton', issue: 'Pink bollworm damage report', date: '2026-07-23', status: 'Approved', priority: 'High' },
  { id: 'ADV-103', farmerName: 'Anita Sharma', crop: 'Sugarcane', issue: 'Soil nitrogen deficit evaluation', date: '2026-07-22', status: 'Resolved', priority: 'Medium' },
  { id: 'ADV-104', farmerName: 'Vijay Singh', crop: 'Soybean', issue: 'Waterlogging prevention guidance', date: '2026-07-21', status: 'Pending', priority: 'Low' },
]

export default function OfficerPage() {
  const [queries, setQueries] = useState<AdvisoryQuery[]>(INITIAL_QUERIES)
  const [selectedId, setSelectedId] = useState<string | null>('ADV-101')
  const [responseText, setResponseText] = useState('')
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved'>('All')

  const handleApprove = (id: string) => {
    setQueries(prev => prev.map(q => q.id === id ? { ...q, status: 'Approved' } : q))
    toast.success(`Advisory ${id} approved successfully!`, {
      style: { background: '#09090b', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)' }
    })
  }

  const handleSendResponse = (id: string) => {
    if (!responseText.trim()) {
      toast.error('Please enter advisory instructions before sending.')
      return
    }
    setQueries(prev => prev.map(q => q.id === id ? { ...q, status: 'Resolved' } : q))
    setResponseText('')
    toast.success(`Advisory response dispatched for ${id}!`, {
      style: { background: '#09090b', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)' }
    })
  }

  const activeQuery = queries.find(q => q.id === selectedId) || queries[0]
  const filteredQueries = filter === 'All' ? queries : queries.filter(q => q.status === filter)

  return (
    <div className="min-h-screen bg-background text-text-main font-sans p-6 md:p-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-secondary/30 to-primary/30 flex items-center justify-center border border-secondary/40 shadow-lg">
            <ShieldCheck className="w-7 h-7 text-secondary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-white">Officer Advisory Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary/20 text-secondary border border-secondary/30">
                OFFICER ROLE
              </span>
            </div>
            <p className="text-sm text-text-muted">Review, approve & issue agricultural crop advisories across registered sectors.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium">
            <UserCheck className="w-4 h-4 text-secondary" />
            <span>Officer ID: <strong className="text-white">OFF-9942</strong></span>
          </div>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="glass-card p-5 flex items-center justify-between border-l-4 border-l-secondary">
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Total Queries</p>
            <h3 className="text-2xl font-bold text-white mt-1">{queries.length}</h3>
          </div>
          <FileText className="w-8 h-8 text-secondary/60" />
        </div>

        <div className="glass-card p-5 flex items-center justify-between border-l-4 border-l-warning">
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Pending Action</p>
            <h3 className="text-2xl font-bold text-white mt-1">{queries.filter(q => q.status === 'Pending').length}</h3>
          </div>
          <AlertCircle className="w-8 h-8 text-warning/60" />
        </div>

        <div className="glass-card p-5 flex items-center justify-between border-l-4 border-l-primary">
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Approved</p>
            <h3 className="text-2xl font-bold text-white mt-1">{queries.filter(q => q.status === 'Approved').length}</h3>
          </div>
          <CheckCircle2 className="w-8 h-8 text-primary/60" />
        </div>

        <div className="glass-card p-5 flex items-center justify-between border-l-4 border-l-accent">
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Resolution Rate</p>
            <h3 className="text-2xl font-bold text-white mt-1">94.2%</h3>
          </div>
          <BarChart2 className="w-8 h-8 text-accent/60" />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Query List */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" /> Field Requests
            </h2>
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
              {(['All', 'Pending', 'Approved'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filter === f ? 'bg-secondary text-background font-bold' : 'text-text-muted hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filteredQueries.map(q => (
              <motion.div
                key={q.id}
                onClick={() => setSelectedId(q.id)}
                whileHover={{ scale: 1.01 }}
                className={`glass-card p-4 cursor-pointer transition-all border ${selectedId === q.id ? 'border-secondary bg-secondary/10 shadow-lg' : 'border-white/10 hover:border-white/20'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-secondary font-bold">{q.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    q.status === 'Pending' ? 'bg-warning/20 text-warning border border-warning/30' :
                    q.status === 'Approved' ? 'bg-primary/20 text-primary border border-primary/30' :
                    'bg-accent/20 text-accent border border-accent/30'
                  }`}>
                    {q.status}
                  </span>
                </div>
                <h4 className="font-semibold text-white text-base">{q.farmerName}</h4>
                <p className="text-xs text-text-muted mt-1">Crop: <strong className="text-white">{q.crop}</strong></p>
                <p className="text-xs text-text-muted line-clamp-1 mt-1">{q.issue}</p>
                <div className="flex items-center justify-between mt-3 text-[11px] text-text-muted border-t border-white/5 pt-2">
                  <span>Priority: <strong className={q.priority === 'High' ? 'text-error' : 'text-warning'}>{q.priority}</strong></span>
                  <span>{q.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Query Detail & Response Form */}
        <div className="lg:col-span-7">
          {activeQuery ? (
            <div className="glass-card p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-secondary font-bold">{activeQuery.id}</span>
                  <h3 className="text-xl font-bold text-white mt-1">{activeQuery.issue}</h3>
                  <p className="text-xs text-text-muted mt-1">Submitted by <strong className="text-white">{activeQuery.farmerName}</strong> for <strong className="text-white">{activeQuery.crop}</strong></p>
                </div>
                <button
                  onClick={() => handleApprove(activeQuery.id)}
                  disabled={activeQuery.status !== 'Pending'}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-background font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-opacity"
                >
                  {activeQuery.status === 'Pending' ? 'APPROVE REQUEST' : 'APPROVED'}
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-text-muted leading-relaxed">
                <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Request Details</h5>
                Farmer report indicates potential disease spreading across lower plot. Requesting official advisory for treatment schedule and fungicide application dosages.
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-secondary" /> Officer Technical Advisory Recommendation
                </label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type advisory recommendations, treatment schedules, and compliance steps here..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                />
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => handleSendResponse(activeQuery.id)}
                    className="px-6 py-3 rounded-xl bg-secondary text-background font-bold text-sm hover:bg-secondary/90 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> DISPATCH ADVISORY
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-text-muted">
              Select a field request to review details and issue advisory instructions.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
