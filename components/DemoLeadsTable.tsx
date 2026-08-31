import { API_BASE } from "../lib/api";
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  Bot,
  User,
  PhoneCall,
  Search,
  Loader2,
  AlertCircle,
  FileText,
  RefreshCw,
  PhoneForwarded
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useRef } from "react"

interface DemoLead {
  id: number;
  name: string;
  company?: string;
  email: string;
  phone: string;
  industry: string;
  status: string; // "pending" | "calling" | "completed" | "failed" | "no_answer"
  call_id?: number | null;
  created_at: string;
}

export function DemoLeadsTable() {
  const [leads, setLeads] = useState<DemoLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "calling" | "completed" | "pending" | "failed">("all")

  // Calling State
  const [callingLeadId, setCallingLeadId] = useState<number | null>(null)
  const [notificationMsg, setNotificationMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Dialog State
  const [selectedCall, setSelectedCall] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [callDetailsLoading, setCallDetailsLoading] = useState(false)

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/api/demo/leads`)
      if (response.ok) {
        const data = await response.json()
        setLeads(data)
      }
    } catch (error) {
      console.error("Failed to fetch demo leads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  // Trigger Outbound AI Call
  const handleTriggerCall = async (e: React.MouseEvent, lead: DemoLead) => {
    e.stopPropagation()
    setCallingLeadId(lead.id)
    setNotificationMsg(null)

    try {
      const response = await fetch(`${API_BASE}/api/demo/leads/${lead.id}/trigger-call`, {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setNotificationMsg({ type: "success", text: `AI Call dispatched to ${lead.name} (${lead.phone})!` })
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: "calling" } : l))
      } else {
        setNotificationMsg({ type: "error", text: data.detail || "Failed to trigger call" })
      }
    } catch (err: any) {
      console.error("Call trigger error:", err)
      setNotificationMsg({ type: "error", text: "Failed to connect to backend server" })
    } finally {
      setCallingLeadId(null)
    }
  }

  // Update Status
  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/demo/leads/${leadId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  // Open Call Log & Transcript Modal
  const handleOpenLogModal = async (leadId: number) => {
    setIsModalOpen(true)
    setCallDetailsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/demo/lead/${leadId}/details`)
      if (response.ok) {
        const data = await response.json()
        setSelectedCall(data)
      }
    } catch (error) {
      console.error("Failed to fetch demo call details:", error)
    } finally {
      setCallDetailsLoading(false)
    }
  }

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Metrics
  const totalCount = leads.length
  const callingCount = leads.filter(l => l.status === "calling").length
  const completedCount = leads.filter(l => l.status === "completed" || l.status === "done").length
  const pendingCount = leads.filter(l => l.status === "pending").length
  const failedCount = leads.filter(l => l.status === "failed" || l.status === "no_answer").length

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.industry.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeTab === "calling") return lead.status === "calling"
    if (activeTab === "completed") return lead.status === "completed" || lead.status === "done"
    if (activeTab === "pending") return lead.status === "pending"
    if (activeTab === "failed") return lead.status === "failed" || lead.status === "no_answer"
    return true
  })

  return (
    <div className="space-y-6">

      {/* ALERT NOTIFICATION */}
      {notificationMsg && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm animate-in fade-in duration-300 ${
          notificationMsg.type === "success"
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
            : "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300"
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold">
            {notificationMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-xs opacity-70 hover:opacity-100 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Test Calls</p>
            <h3 className="text-2xl font-extrabold mt-1">{totalCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <PhoneCall className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active / Calling</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{callingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <PhoneForwarded className="h-6 w-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed Calls</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{completedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Failed / No Answer</p>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{failedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border shadow-sm">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            All ({totalCount})
          </button>

          <button
            onClick={() => setActiveTab("calling")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "calling"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Calling ({callingCount})
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "completed"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Completed ({completedCount})
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "pending"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>

        {/* Search Input & Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search test users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={fetchLeads}
            className="p-2 rounded-xl border hover:bg-muted text-muted-foreground transition-colors"
            title="Refresh Leads"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Loading test users...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground p-6">
            <PhoneCall className="h-10 w-10 mb-3 text-muted-foreground/40" />
            <p className="text-sm font-semibold">No test call requests match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">User Details</th>
                  <th className="px-6 py-4 font-bold">Contact Info</th>
                  <th className="px-6 py-4 font-bold">Industry</th>
                  <th className="px-6 py-4 font-bold">Call Status</th>
                  <th className="px-6 py-4 font-bold">Time Requested</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredLeads.map((lead, index) => (
                  <motion.tr 
                    key={lead.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleOpenLogModal(lead.id)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    {/* User Details */}
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-foreground text-sm">{lead.name}</div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                        <Building2 className="w-3.5 h-3.5 text-primary/70" />
                        <span className="font-semibold">{lead.company || "Not Provided"}</span>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Mail className="w-3.5 h-3.5 text-primary/70" />
                          <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        {lead.industry}
                      </span>
                    </td>

                    {/* Interactive Status Selector */}
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all ${
                          lead.status === "calling"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : lead.status === "completed" || lead.status === "done"
                            ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                            : lead.status === "failed" || lead.status === "no_answer"
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="calling">Calling Now 📞</option>
                        <option value="completed">Completed (Done)</option>
                        <option value="no_answer">No Answer</option>
                        <option value="failed">Call Failed</option>
                      </select>
                    </td>

                    {/* Time Requested */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(lead.created_at).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Call Now Trigger Button */}
                        <button
                          onClick={(e) => handleTriggerCall(e, lead)}
                          disabled={callingLeadId === lead.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105 disabled:opacity-50"
                          title="Call this test user now"
                        >
                          {callingLeadId === lead.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <PhoneCall className="h-3.5 w-3.5" />
                          )}
                          <span>{callingLeadId === lead.id ? "Dialing..." : "Call User Now"}</span>
                        </button>

                        {/* View Transcript & Audio Dialog */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLogModal(lead.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold transition-all"
                          title="View Recording & Transcript"
                        >
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <span>Details</span>
                        </button>

                      </div>
                    </td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CALL LOG & TRANSCRIPT DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open)
        if (!open) {
          if (audioRef.current) audioRef.current.pause()
          setIsPlaying(false)
          setSelectedCall(null)
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Call Details & Recording</DialogTitle>
            <DialogDescription>Review the call transcript and audio recording for this demo lead.</DialogDescription>
          </DialogHeader>

          {callDetailsLoading ? (
            <div className="py-10 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading call details...</span>
            </div>
          ) : selectedCall ? (
            <div className="space-y-6 mt-4">
              {/* Call Summary / Audio Player */}
              <div className="bg-muted/30 rounded-2xl p-4 border flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-foreground">{selectedCall.name} — {selectedCall.campaign}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Status: <b>{selectedCall.status}</b> | Duration: <b>{selectedCall.duration}</b></p>
                </div>
                {selectedCall.recording_url && (
                  <div className="flex items-center gap-4">
                    <audio 
                      ref={audioRef} 
                      src={`${API_BASE}${selectedCall.recording_url}`} 
                      onEnded={() => setIsPlaying(false)} 
                      className="hidden" 
                    />
                    <button 
                      onClick={toggleAudio}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Transcript */}
              <div>
                <h4 className="font-bold text-foreground mb-3 text-sm">Call Transcript</h4>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {selectedCall.transcript && selectedCall.transcript.length > 0 ? (
                    selectedCall.transcript.map((msg: any, idx: number) => {
                      const isAgent = msg.speaker.toLowerCase() === "assistant" || msg.speaker.toLowerCase() === "agent";
                      return (
                        <div key={idx} className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAgent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-xs font-medium leading-relaxed ${
                            isAgent 
                              ? "bg-muted/60 border text-foreground rounded-tl-none" 
                              : "bg-primary text-primary-foreground rounded-tr-none"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center text-xs text-muted-foreground italic py-6 border rounded-xl bg-muted/20">No transcript available for this call.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground text-xs">Could not load call details. It may not have connected yet.</div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
