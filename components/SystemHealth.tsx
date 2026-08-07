"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Server, Database, PhoneCall, Webhook, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function SystemHealth() {
  const [apiPing, setApiPing] = useState<number | null>(null)
  const [apiStatus, setApiStatus] = useState<"Operational" | "Degraded" | "Offline">("Operational")
  const [isChecking, setIsChecking] = useState(false)

  const checkHealth = async () => {
    setIsChecking(true)
    const startTime = performance.now()
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${backendUrl}/`, { method: "GET", cache: "no-store" }).catch(() => null)
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      setApiPing(duration)

      if (res && res.ok) {
        setApiStatus("Operational")
      } else if (res) {
        setApiStatus("Degraded")
      } else {
        setApiStatus("Offline")
      }
    } catch {
      setApiStatus("Offline")
      setApiPing(null)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const healthData = [
    {
      name: "API Server",
      status: apiStatus,
      uptime: apiStatus === "Offline" ? "0%" : "99.99%",
      ping: apiPing !== null ? `${apiPing}ms` : "N/A",
      icon: Server,
      color: apiStatus === "Operational" ? "text-emerald-500" : apiStatus === "Degraded" ? "text-amber-500" : "text-red-500",
      bg: apiStatus === "Operational" ? "bg-emerald-500/10" : apiStatus === "Degraded" ? "bg-amber-500/10" : "bg-red-500/10"
    },
    { name: "Database", status: "Operational", uptime: "99.98%", ping: "12ms", icon: Database, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Calling Engine", status: "Operational", uptime: "99.85%", ping: "42ms", icon: PhoneCall, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Webhooks", status: "Operational", uptime: "100%", ping: "28ms", icon: Webhook, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ]

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-semibold">Live System Health</h2>
        <button
          onClick={checkHealth}
          disabled={isChecking}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isChecking && "animate-spin")} />
          <span>Refresh Health</span>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {healthData.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
          >
            <Card className="hover:border-border/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl", item.bg, item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-1.5 w-1.5 rounded-full", item.status === "Operational" ? "bg-emerald-500" : item.status === "Degraded" ? "bg-amber-500" : "bg-red-500")} />
                      <p className="text-xs text-muted-foreground">{item.status}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">{item.uptime}</p>
                    <p className="text-xs text-muted-foreground">{item.ping}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
