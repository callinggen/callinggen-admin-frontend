"use client"

import { KPICards } from "@/components/KPICards"
import { AnalyticsCharts } from "@/components/AnalyticsCharts"
import { RecentActivity } from "@/components/RecentActivity"
import { SystemHealth } from "@/components/SystemHealth"
import { motion } from "framer-motion"
import { UserPlus, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const user = { name: "Admin User" }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || "Admin"} 👋 Here is your real-time platform activity and analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/users">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/create-user">
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Create New User
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="space-y-6">
        <KPICards />
        <AnalyticsCharts />
        <RecentActivity />
        <SystemHealth />
      </div>
    </div>
  )
}

