"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "./ThemeToggle"

export function Navbar() {
  const router = useRouter()
  const user = { name: "Admin User", email: "admin@callinggen.ai" }

  const initials = useMemo(() => {
    if (!user?.name) return "AD"
    return user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [user?.name])


  return (
    <>
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/90 px-6 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm">
            CG
          </div>
          <div className="hidden sm:block">
            <span className="text-[15px] font-semibold tracking-tight text-foreground">CallingGen</span>
            <span className="ml-1.5 text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />



          <div className="flex items-center gap-2.5 cursor-pointer group pl-1">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[13px] font-semibold leading-none group-hover:text-primary transition-colors">
                {user?.name ?? "Admin User"}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5">{user?.email ?? "admin@callinggen.ai"}</span>
            </div>
            <Avatar className="h-8 w-8 border-2 border-transparent group-hover:border-primary/30 transition-all ring-1 ring-border/50">
              <AvatarImage alt="Admin" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
          </div>

          </div>
      </motion.header>

    </>
  )
}


