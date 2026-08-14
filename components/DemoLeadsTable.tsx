"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Phone, Mail, Clock, CheckCircle2, Play, Pause, Bot, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useRef } from "react"

export function DemoLeadsTable() {
  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCall, setSelectedCall] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [callDetailsLoading, setCallDetailsLoading] = useState(false)

  const handleRowClick = async (callId: number | null) => {
    if (!callId) return;
    setIsModalOpen(true);
    setCallDetailsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/demo/call/${callId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCall(data);
      }
    } catch (error) {
      console.error("Failed to fetch demo call:", error);
    } finally {
      setCallDetailsLoading(false);
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

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/demo/leads")
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
    fetchLeads()
  }, [])

  if (isLoading) {
    return <div className="text-center py-10 text-muted-foreground">Loading leads...</div>
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-20 bg-card border rounded-2xl">
        <h3 className="text-lg font-medium text-foreground">No Demo Leads Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">When users request a test call, they will appear here.</p>
      </div>
    )
  }

  return (
    <>
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold">User Details</th>
              <th className="px-6 py-4 font-semibold">Contact Info</th>
              <th className="px-6 py-4 font-semibold">Industry</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Time Requested</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {leads.map((lead, index) => (
              <motion.tr 
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleRowClick(lead.call_id)}
                className={`transition-colors ${lead.call_id ? 'hover:bg-muted/30 cursor-pointer' : 'hover:bg-muted/10 cursor-default'}`}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{lead.name}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                    <Building2 className="w-3 h-3" /> {lead.company || "No Company"}
                  </div>
                </td>
                <td className="px-6 py-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {lead.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Mail className="w-3 h-3" /> {lead.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {lead.industry}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lead.status === "calling" ? "Calling Now" : lead.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(lead.created_at).toLocaleString()}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

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
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>Review the transcript and recording for this demo lead.</DialogDescription>
          </DialogHeader>

          {callDetailsLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading call details...</div>
          ) : selectedCall ? (
            <div className="space-y-6 mt-4">
              {/* Call Summary / Audio Player */}
              <div className="bg-muted/30 rounded-xl p-4 border flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">{selectedCall.name} - {selectedCall.campaign}</h4>
                  <p className="text-sm text-muted-foreground">Status: {selectedCall.status} | Duration: {selectedCall.duration}</p>
                </div>
                {selectedCall.recording_url && (
                  <div className="flex items-center gap-4">
                    <audio 
                      ref={audioRef} 
                      src={`http://localhost:8000${selectedCall.recording_url}`} 
                      onEnded={() => setIsPlaying(false)} 
                      className="hidden" 
                    />
                    <button 
                      onClick={toggleAudio}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Transcript */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Transcript</h4>
                <div className="space-y-4">
                  {selectedCall.transcript && selectedCall.transcript.length > 0 ? (
                    selectedCall.transcript.map((msg: any, idx: number) => {
                      const isAgent = msg.speaker.toLowerCase() === "assistant" || msg.speaker.toLowerCase() === "agent";
                      return (
                        <div key={idx} className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAgent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                            isAgent 
                              ? "bg-muted/50 border text-foreground rounded-tl-none" 
                              : "bg-primary text-primary-foreground rounded-tr-none"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center text-sm text-muted-foreground italic py-4">No transcript available</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">Could not load call details. It may not have connected yet.</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
