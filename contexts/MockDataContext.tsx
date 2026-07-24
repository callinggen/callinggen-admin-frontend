"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { User, Agent } from "@/components/UserDetailsDrawer"

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
  addUser: (user: User) => void
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
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

const INITIAL_USERS: User[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `USR-${1000 + i}`,
  name: NAMES[i % NAMES.length],
  email: `user${i}@example.com`,
  mobile: `+1 (${String(400 + i).padStart(3, "0")}) 555-0${String(100 + i).padStart(3, "0")}`,
  phone: `+1 (${String(400 + i).padStart(3, "0")}) 555-0${String(100 + i).padStart(3, "0")}`,
  password: "password123",
  industry: "Technology",
  provider: "Vobiz",
  organization: ["Acme Corp", "TechFlow", "Stark Industries", "Wayne Ent", "Globex"][i % 5],
  plan: (["Starter", "Standard", "Pro", "Optional"] as const)[i % 4],
  credits: Math.floor(Math.random() * 10000) + (i % 3 === 2 ? 50000 : 0),
  apiKey: `cg_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
  type: i % 7 === 0 ? "Demo" : "Regular",
  status: (["Active", "Active", "Active", "Inactive", "Suspended"] as const)[i % 5],
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  agents: Array.from({ length: (i % 4) }).map((_, j) => ({
    id: `AGT-${Math.floor(Math.random() * 10000)}`,
    name: `Support Bot ${j + 1}`,
    language: "English",
    voice: "Female 1",
    script: "Hello, how can I help you?",
    knowledgebaseDoc: "",
    status: ["Active", "Inactive", "Error"][j % 3] as any
  }))
}))

const INITIAL_PRICING_REQUESTS: PricingRequest[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `PR-${2000 + i}`,
  name: NAMES[i % NAMES.length],
  organization: ORGS[i % ORGS.length],
  email: `contact${i}@${ORGS[i % ORGS.length].toLowerCase().replace(/\s/g, "")}.com`,
  creditsSelected: [10000, 25000, 50000, 100000, 250000][i % 5],
  type: (["Monthly", "Annual", "Custom"] as const)[i % 3],
  status: (["Pending", "Pending", "Approved", "Rejected", "Pending"] as const)[i % 5],
  message: `We are interested in the ${["Pro", "Enterprise", "Custom"][i % 3]} plan for our team of ${(i + 1) * 5} members. Please let us know the best pricing options available.`,
  requestedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
}))

const INITIAL_DEMO_USERS: DemoUser[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `DMO-${3000 + i}`,
  name: NAMES[(i + 3) % NAMES.length],
  email: `demo${i}@${ORGS[(i + 2) % ORGS.length].toLowerCase().replace(/\s/g, "")}.com`,
  phone: `+1 (${String(400 + i).padStart(3, "0")}) 555-0${String(100 + i).padStart(3, "0")}`,
  company: ORGS[(i + 2) % ORGS.length],
  role: ["CEO", "CTO", "VP Sales", "Product Manager", "Head of Ops", "Founder"][i % 6],
  requestDate: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  status: (["Pending", "Demo Scheduled", "Completed", "Converted", "Expired", "Pending", "Demo Scheduled"] as const)[i % 7],
  notes: i % 3 === 0 ? `Interested in AI calling for their ${["sales", "support", "outreach"][i % 3]} team. High priority lead.` : "",
  scheduledAt: i % 3 === 1 ? new Date(Date.now() + i * 86400000).toISOString() : undefined,
}))

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "New User Created", time: "2 mins ago", read: false },
  { id: "2", title: "Pricing Request Received", time: "1 hr ago", read: false },
  { id: "3", title: "Credits Updated", time: "3 hrs ago", read: false },
  { id: "4", title: "Demo Scheduled", time: "5 hrs ago", read: false },
  { id: "5", title: "API Key Generated", time: "1 day ago", read: false },
]

const MockDataContext = createContext<MockDataContextType | undefined>(undefined)

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)
  const [pricingRequests, setPricingRequests] = useState<PricingRequest[]>(INITIAL_PRICING_REQUESTS)
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>(INITIAL_DEMO_USERS)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on client side mount
  useEffect(() => {
    const localUsers = localStorage.getItem("callinggen_users")
    const localNotifications = localStorage.getItem("callinggen_notifications")
    const localPricing = localStorage.getItem("callinggen_pricing_requests")
    const localDemos = localStorage.getItem("callinggen_demo_users")

    if (localUsers) setUsers(JSON.parse(localUsers))
    if (localNotifications) setNotifications(JSON.parse(localNotifications))
    if (localPricing) setPricingRequests(JSON.parse(localPricing))
    if (localDemos) setDemoUsers(JSON.parse(localDemos))

    setIsHydrated(true)
  }, [])

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

  const addUser = (user: User) => {
    setUsers(prev => [user, ...prev])
    createNotification(`New user account created: ${user.organization}`)
  }

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))
    const orgName = data.organization || id
    createNotification(`User account details updated: ${orgName}`)
  }

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id)
    setUsers(prev => prev.filter(u => u.id !== id))
    createNotification(`User deleted: ${userToDelete?.organization || id}`)
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
      password: "password123", // Dummy password
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

    setUsers(prev => [newUser, ...prev])
    setDemoUsers(prev => prev.filter(u => u.id !== demoUserId))
    createNotification(`Converted Demo Lead ${demoUser.name} to ${plan} Plan`)
  }

  return (
    <MockDataContext.Provider value={{
      users, addUser, updateUser, deleteUser,
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

