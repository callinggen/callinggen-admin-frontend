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
