"use client"

import { KPICards } from "@/components/KPICards"
import { motion } from "framer-motion"
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || "Admin"} 👋 Here is what's happening today.
          </p>
        </div>
      </motion.div>

      <div className="space-y-6">
        <KPICards />
      </div>
    </div>
  )
}
