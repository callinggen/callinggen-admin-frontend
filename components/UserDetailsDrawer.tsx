"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Copy, Check, Edit2, Trash2, KeyRound, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { UserFormModal } from "./UserFormModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"

export type Agent = {
  id: string
  name: string
  language: string
  voice: string
  script: string
  knowledgebaseDoc: string
  status: "Active" | "Inactive" | "Error"
}

export type User = {
  id: string
  name: string
  email: string
  mobile: string
  phone: string
  password?: string
  industry: string
  provider: string
  organization: string
  plan: "Starter" | "Standard" | "Pro" | "Optional" | "Demo"
  credits: number
  apiKey: string
  type: "Regular" | "Demo"
  status: "Active" | "Inactive" | "Suspended"
  createdAt: string
  agents: Agent[]
}

type UserDetailsDrawerProps = {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export function UserDetailsDrawer({ user, isOpen, onClose }: UserDetailsDrawerProps) {
  const [copied, setCopied] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Prevent background scrolling when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <>
      <AnimatePresence>
        {isOpen && user && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:bg-black/10"
            />

            {/* Drawer / Modal */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "fixed inset-y-0 right-0 z-40 flex flex-col bg-background shadow-2xl",
                "w-full sm:w-[500px] sm:border-l"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold">User Details</h2>
                  <p className="text-sm text-muted-foreground">{user.id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* General Info */}
                <section className="space-y-4">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">General</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium text-sm">{user.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Organization</p>
                      <p className="font-medium text-sm">{user.organization}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <p className="font-medium text-sm">{user.industry}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-sm">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Mobile</p>
                      <p className="font-medium text-sm">{user.mobile}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-sm">{user.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Provider</p>
                      <p className="font-medium text-sm">{user.provider}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <span className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        user.plan === "Pro" && "bg-primary/10 text-primary",
                        user.plan === "Standard" && "bg-blue-500/10 text-blue-600",
                        user.plan === "Starter" && "bg-emerald-500/10 text-emerald-600",
                        user.plan === "Optional" && "bg-slate-500/10 text-slate-600",
                        user.plan === "Demo" && "bg-amber-500/10 text-amber-600",
                      )}>
                        {user.plan}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        user.status === "Active" && "bg-emerald-500/10 text-emerald-600",
                        user.status === "Inactive" && "bg-slate-500/10 text-slate-600",
                        user.status === "Suspended" && "bg-destructive/10 text-destructive",
                      )}>
                        {user.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Remaining Credits</p>
                      <p className="font-medium text-sm">{user.credits.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Created Date</p>
                      <p className="font-medium text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                </section>

                {/* Agents */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Agents ({user.agents.length})</h3>
                  </div>
                  
                  {user.agents.length > 0 ? (
                    <div className="space-y-3">
                      {user.agents.map(agent => (
                        <Card key={agent.id} className="shadow-none border-border">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Bot className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-none mb-1">{agent.name}</p>
                                <p className="text-xs text-muted-foreground mb-1">
                                  {agent.language} • {agent.voice}
                                </p>
                                <p className="text-xs text-muted-foreground truncate" title={agent.script}>
                                  "{agent.script}"
                                </p>
                                {agent.knowledgebaseDoc && (
                                  <p className="text-xs text-blue-600 mt-1 truncate">
                                    KB: {agent.knowledgebaseDoc}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                agent.status === "Active" ? "bg-emerald-500" : 
                                agent.status === "Inactive" ? "bg-slate-300" : "bg-destructive"
                              )} title={agent.status} />
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{agent.status}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No agents created yet.</p>
                  )}
                </section>
              </div>

              {/* Actions / Footer */}
              <div className="border-t p-4 bg-muted/10 grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setIsEditModalOpen(true)}>
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                  Edit User
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                  <KeyRound className="h-4 w-4" />
                  Reset Pass
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20" onClick={() => setIsDeleteModalOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <UserFormModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
        userToEdit={user || undefined} 
      />

      <DeleteConfirmModal 
        open={isDeleteModalOpen} 
        onOpenChange={setIsDeleteModalOpen} 
        userToDelete={user} 
        onSuccess={onClose}
      />
    </>
  )
}
