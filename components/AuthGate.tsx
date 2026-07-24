"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { MockDataProvider } from "@/contexts/MockDataContext"
import { Navbar } from "@/components/Navbar"
import { Sidebar } from "@/components/Sidebar"
import { LoginPage } from "@/components/LoginPage"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || isLoading) {
      return
    }

    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login")
    }
  }, [isAuthenticated, isHydrated, isLoading, pathname, router])

  if (!isHydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background bg-[radial-gradient(circle_at_top_left,_rgba(108,76,241,0.14),_transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.14),_transparent_42%)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-3xl border border-border/70 bg-background/85 px-8 py-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary shadow-sm">
            CG
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary"
            />
            <p className="text-sm font-medium text-muted-foreground">Preparing your workspace…</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <MockDataProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </MockDataProvider>
    )
  }

  if (pathname === "/login") {
    return <>{children}</>
  }

  return <LoginPage />
}
