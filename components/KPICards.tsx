"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCircle, UserSquare2, Bot, Zap, TrendingUp, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMockData } from "@/contexts/MockDataContext"

export function KPICards() {
  const { users, dashboardStats } = useMockData()

  const totalUsers = dashboardStats ? dashboardStats.total_users : users.length
  const regularUsers = dashboardStats ? dashboardStats.paid_users : users.filter(u => u.type === "Regular").length
  const demoUserCount = dashboardStats ? dashboardStats.demo_users : users.filter(u => u.type === "Demo").length
  const activeAgents = dashboardStats 
    ? (dashboardStats.active_campaigns || dashboardStats.total_calls)
    : users.reduce((acc, u) => acc + (u.agents?.filter(a => a.status === "Active").length || 0), 0)

  const totalCredits = dashboardStats ? dashboardStats.total_credits : users.reduce((acc, u) => acc + (u.credits || 0), 0)
  const formattedCredits = totalCredits >= 1000000 
    ? `${(totalCredits / 1000000).toFixed(1)}M` 
    : totalCredits >= 1000 
      ? `${(totalCredits / 1000).toFixed(0)}k` 
      : totalCredits.toString()

  const kpiData = [
    { title: "Total Users", value: totalUsers.toLocaleString(), trend: "+12%", up: true, icon: Users, color: "primary" },
    { title: "Paid Users", value: regularUsers.toLocaleString(), trend: "+5%", up: true, icon: UserCircle, color: "blue" },
    { title: "Demo Users", value: demoUserCount.toLocaleString(), trend: "+24%", up: true, icon: UserSquare2, color: "violet" },
    { title: "Credits Distributed", value: formattedCredits, trend: "+18%", up: true, icon: Zap, color: "cyan" },
    { title: "Active AI Agents / Campaigns", value: activeAgents.toLocaleString(), trend: "+15%", up: true, icon: Bot, color: "emerald" },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {kpiData.map((kpi, i) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          whileHover={{ y: -2 }}
        >
          <Card className="group cursor-pointer overflow-hidden relative border-border/70 hover:border-primary/20 hover:shadow-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/4 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <CardContent className="p-4 relative z-10">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                  {kpi.title}
                </p>
                <div className="rounded-xl bg-primary/8 p-2 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shrink-0 ml-2">
                  <kpi.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xl font-bold tracking-tight text-foreground">{kpi.value}</div>
                <div className="flex items-center gap-1 text-[11px]">
                  {kpi.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                  <span className={cn("font-semibold", kpi.up ? "text-emerald-600" : "text-red-600")}>{kpi.trend}</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
