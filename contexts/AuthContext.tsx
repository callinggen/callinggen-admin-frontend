"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { authService, type AuthUser } from "@/lib/auth"

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = authService.restoreSession()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true)

    try {
      const nextUser = await authService.authenticate(email, password, rememberMe)
      authService.persistSession(nextUser, rememberMe)
      setUser(nextUser)
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.clearSession()
    setUser(null)
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [isLoading, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => {},
      logout: () => {},
    }
  }

  return context
}
