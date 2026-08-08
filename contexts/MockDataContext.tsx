"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User, Agent } from "@/components/UserDetailsDrawer"
import { 
  fetchDashboardStats, 
  fetchAdminUsers, 
  createAdminUser, 
  updateAdminUser, 
  deleteAdminUser, 
  DashboardStats,
  BackendUser 
} from "@/lib/api"

export type Notification = {
  id: string
  title: string
  time: string
  read: boolean
}

export type PricingRequest = {
  id: string
  name: string
  organization: string
  email: string
  creditsSelected: number
  type: "Monthly" | "Annual" | "Custom"
  status: "Pending" | "Approved" | "Rejected"
  message: string
  requestedAt: string
}

export type DemoUser = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  requestDate: string
  status: "Pending" | "Demo Scheduled" | "Completed" | "Converted" | "Expired"
  notes: string
  scheduledAt?: string
}

interface MockDataContextType {
  users: User[]
  dashboardStats: DashboardStats | null
  refreshData: () => Promise<void>
  addUser: (user: User) => Promise<void>
  updateUser: (id: string, data: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  notifications: Notification[]
  markAllNotificationsRead: () => void
  pricingRequests: PricingRequest[]
  updatePricingRequest: (id: string, data: Partial<PricingRequest>) => void
  demoUsers: DemoUser[]
  addDemoUser: (user: DemoUser) => void
  updateDemoUser: (id: string, data: Partial<DemoUser>) => void
  deleteDemoUser: (id: string) => void
  convertDemoToUser: (demoUserId: string, plan: User["plan"], credits: number) => void
}

const NAMES = ["Oliver Bennett", "Sophia Chen", "Marcus Rivera", "Aisha Patel", "Liam Foster", "Emma Nguyen", "James Okafor", "Mia Schmidt", "Noah Williams", "Zara Hassan", "Ethan Park", "Isabella Torres"]
const ORGS = ["Acme Corp", "TechFlow", "Stark Industries", "Wayne Ent", "Globex", "Initech", "Umbrella Corp", "Cyberdyne", "Oscorp", "Weyland Corp"]

const INITIAL_USERS: User[] = []
const INITIAL_PRICING_REQUESTS: PricingRequest[] = []
const INITIAL_DEMO_USERS: DemoUser[] = []
const INITIAL_NOTIFICATIONS: Notification[] = []

const MockDataContext = createContext<MockDataContextType | undefined>(undefined)

function mapBackendUserToFrontend(u: BackendUser): User {
  const planName = u.plan && ["Starter", "Standard", "Pro", "Optional", "Demo"].includes(u.plan)
    ? (u.plan as User["plan"])
    : "Starter"

  return {
    id: u.id.startsWith("USR-") ? u.id : `USR-${u.id}`,
    name: u.name || "User Account",
    email: u.email || "",
    mobile: u.mobile || u.phone || "",
    phone: u.phone || u.mobile || "",
    password: "password123",
    industry: "Calling Platform",
    provider: "Vobiz",
    organization: u.organization || u.name || "CallingGen",
    plan: planName,
    credits: u.credits ?? 2000,
    apiKey: `cg_live_${(u.id || "").substring(0, 8)}`,
    type: u.type || ((u.credits !== undefined && u.credits <= 50) || planName === "Demo" ? "Demo" : "Regular"),
    status: u.status || "Active",
    createdAt: u.createdAt || new Date().toISOString(),
    agents: []
  }
}

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [pricingRequests, setPricingRequests] = useState<PricingRequest[]>([])
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const refreshData = useCallback(async () => {
    try {
      const stats = await fetchDashboardStats()
      if (stats) {
        setDashboardStats(stats)
        if (stats.recent_activities && stats.recent_activities.length > 0) {
          const mappedNotifications: Notification[] = stats.recent_activities.map(act => ({
            id: act.id,
            title: act.title,
            time: act.time,
            read: false
          }))
          setNotifications(prev => {
            const combined = [...mappedNotifications, ...prev]
            const uniqueMap = new Map()
            combined.forEach(item => uniqueMap.set(item.id, item))
            return Array.from(uniqueMap.values())
          })
        }
      }

      const remoteUsers = await fetchAdminUsers()
      if (remoteUsers && Array.isArray(remoteUsers)) {
        const mappedUsers = remoteUsers.map(mapBackendUserToFrontend)
        setUsers(mappedUsers)
      }
    } catch (err) {
      console.warn("Could not sync live data from backend:", err)
    }
  }, [])

  // Load from localStorage & fetch backend on mount
  useEffect(() => {
    const localNotifications = localStorage.getItem("callinggen_notifications")
    const localPricing = localStorage.getItem("callinggen_pricing_requests")
    const localDemos = localStorage.getItem("callinggen_demo_users")

    if (localNotifications) {
      try { setNotifications(JSON.parse(localNotifications)) } catch {}
    }
    if (localPricing) {
      try { setPricingRequests(JSON.parse(localPricing)) } catch {}
    }
    if (localDemos) {
      try { setDemoUsers(JSON.parse(localDemos)) } catch {}
    }

    setIsHydrated(true)
    refreshData()
  }, [refreshData])

  // Periodic refresh every 20s to keep backend state live
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 20000)
    return () => clearInterval(interval)
  }, [refreshData])

  // Write changes to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("callinggen_users", JSON.stringify(users))
    }
  }, [users, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("callinggen_notifications", JSON.stringify(notifications))
    }
  }, [notifications, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("callinggen_pricing_requests", JSON.stringify(pricingRequests))
    }
  }, [pricingRequests, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("callinggen_demo_users", JSON.stringify(demoUsers))
    }
  }, [demoUsers, isHydrated])

  const createNotification = (title: string) => {
    setNotifications(prev => [
      {
        id: `NTF-${Math.floor(Math.random() * 100000)}`,
        title,
        time: "Just now",
        read: false
      },
      ...prev
    ])
  }

  const addUser = async (newUser: User) => {
    setUsers(prev => [newUser, ...prev])
    createNotification(`New user account created: ${newUser.organization || newUser.name}`)

    try {
      await createAdminUser({
        full_name: newUser.name,
        email: newUser.email,
        phone_number: newUser.phone
      })
      await refreshData()
    } catch (e) {
      console.warn("Backend user creation synced locally only:", e)
    }
  }

  const updateUser = async (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))
    const orgName = data.organization || data.name || id
    createNotification(`User account details updated: ${orgName}`)

    try {
      await updateAdminUser(id, {
        full_name: data.name,
        email: data.email,
        phone_number: data.phone || data.mobile,
        credits: data.credits,
        subscription_plan: data.plan
      })
      await refreshData()
    } catch (e) {
      console.warn("Backend user update synced locally only:", e)
    }
  }

  const deleteUser = async (id: string) => {
    const userToDelete = users.find(u => u.id === id)
    setUsers(prev => prev.filter(u => u.id !== id))
    createNotification(`User deleted: ${userToDelete?.organization || id}`)

    try {
      await deleteAdminUser(id)
      await refreshData()
    } catch (e) {
      console.warn("Backend user deletion synced locally only:", e)
    }
  }

  const markAllNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const updatePricingRequest = (id: string, data: Partial<PricingRequest>) => {
    setPricingRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
    const request = pricingRequests.find(r => r.id === id)
    if (data.status) {
      createNotification(`Pricing request for ${request?.organization || id} marked as ${data.status}`)
    }
  }

  const addDemoUser = (user: DemoUser) => {
    setDemoUsers(prev => [user, ...prev])
    createNotification(`Demo request received from ${user.company}`)
  }

  const updateDemoUser = (id: string, data: Partial<DemoUser>) => {
    setDemoUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))
    const demo = demoUsers.find(d => d.id === id)
    if (data.status) {
      createNotification(`Demo user ${demo?.name} status updated to ${data.status}`)
    } else {
      createNotification(`Demo user ${demo?.name || id} details updated`)
    }
  }

  const deleteDemoUser = (id: string) => {
    const demoToDelete = demoUsers.find(d => d.id === id)
    setDemoUsers(prev => prev.filter(u => u.id !== id))
    createNotification(`Demo user deleted: ${demoToDelete?.name || id}`)
  }

  const convertDemoToUser = (demoUserId: string, plan: User["plan"], credits: number) => {
    const demoUser = demoUsers.find(u => u.id === demoUserId)
    if (!demoUser) return

    const newUser: User = {
      id: `USR-${1000 + users.length + 1}`,
      name: demoUser.name,
      email: demoUser.email,
      mobile: demoUser.phone,
      phone: demoUser.phone,
      password: "password123",
      industry: "General",
      provider: "Vobiz",
      organization: demoUser.company,
      plan: plan,
      credits: credits,
      apiKey: `cg_live_${Math.random().toString(36).substring(2, 15)}`,
      type: "Regular",
      status: "Active",
      createdAt: new Date().toISOString(),
      agents: []
    }

    addUser(newUser)
    setDemoUsers(prev => prev.filter(u => u.id !== demoUserId))
    createNotification(`Converted Demo Lead ${demoUser.name} to ${plan} Plan`)
  }

  return (
    <MockDataContext.Provider value={{
      users, dashboardStats, refreshData, addUser, updateUser, deleteUser,
      notifications, markAllNotificationsRead,
      pricingRequests, updatePricingRequest,
      demoUsers, addDemoUser, updateDemoUser, deleteDemoUser, convertDemoToUser,
    }}>
      {children}
    </MockDataContext.Provider>
  )
}

export function useMockData() {
  const context = useContext(MockDataContext)
  if (!context) throw new Error("useMockData must be used within a MockDataProvider")
  return context
}
