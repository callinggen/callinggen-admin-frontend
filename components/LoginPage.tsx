"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, Lock, Sparkles, UserRound } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

export function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState("admin@callinggen.ai")
  const [password, setPassword] = useState("admin123")
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await login(email, password, rememberMe)
      toast.success("Welcome back! Redirecting to the admin portal.")
      await new Promise((resolve) => setTimeout(resolve, 850))
      router.replace("/dashboard")
    } catch {
      toast.error("Invalid credentials.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(circle_at_top_left,_rgba(108,76,241,0.14),_transparent_38%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.14),_transparent_38%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[32px] border border-border/70 bg-background/85 shadow-[0_24px_120px_rgba(15,23,42,0.08)] backdrop-blur xl:min-h-[calc(100vh-3rem)]">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 lg:flex"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(108,76,241,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(56,189,248,0.16),_transparent_22%),radial-gradient(circle_at_60%_80%,_rgba(129,140,248,0.16),_transparent_22%)]" />
          <div className="absolute left-12 top-12 h-40 w-40 rounded-full border border-primary/10" />
          <div className="absolute bottom-10 right-8 h-56 w-56 rounded-full border border-primary/10" />
          <div className="absolute left-20 top-24 h-24 w-24 rounded-3xl border border-primary/10 bg-background/70 backdrop-blur" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                CG
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-foreground">CallingGen</p>
                <p className="text-sm text-muted-foreground">Admin Portal</p>
              </div>
            </div>

            <div className="mt-14 max-w-md space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-background/80 px-3 py-1 text-sm font-medium text-primary shadow-sm">
                <Sparkles className="h-4 w-4" />
                Premium operator workspace
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Manage your AI voice platform from one powerful dashboard.
              </h1>
              <p className="max-w-lg text-lg leading-8 text-muted-foreground">
                Monitor usage, review requests, and keep your calling operations running smoothly.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 shadow-sm">
              <p className="text-sm font-medium text-foreground">Fast onboarding</p>
              <p className="text-sm text-muted-foreground">Secure access to the admin console</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 shadow-sm">
              <p className="text-sm font-medium text-foreground">Live visibility</p>
              <p className="text-sm text-muted-foreground">Every critical metric in one place</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex flex-1 items-center justify-center bg-background px-6 py-10 sm:px-8 lg:px-10"
        >
          <div className="w-full max-w-md">
            <div className="mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-sm font-medium text-muted-foreground">
                <Lock className="h-4 w-4" />
                Secure sign in
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Sign in to continue to the CallingGen Admin Portal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div whileFocus={{ scale: 1.01, y: -1 }} className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email / User ID
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@callinggen.ai"
                    required
                    className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </motion.div>

              <motion.div whileFocus={{ scale: 1.01, y: -1 }} className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </motion.div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Remember me
                </label>

                <Link href="#" className="font-medium text-primary transition-colors hover:text-primary/80">
                  Forgot password?
                </Link>
              </div>

              <motion.div whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}>
                <Button type="submit" disabled={isSubmitting} className="h-11 w-full gap-2 rounded-2xl text-sm font-semibold shadow-lg shadow-primary/20">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8, ease: "linear" }}
                        className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                      />
                      Signing in…
                    </span>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="mt-8 rounded-2xl border border-border/70 bg-muted/50 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <p>
                  Demo access: <span className="font-semibold text-foreground">admin@callinggen.ai</span> / <span className="font-semibold text-foreground">admin123</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="flex flex-col items-center gap-4 rounded-3xl border border-border/70 bg-background px-8 py-8 shadow-[0_20px_80px_rgba(15,23,42,0.12)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                CG
              </div>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                  className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary"
                />
                <p className="text-sm font-medium text-muted-foreground">Opening the admin portal…</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
