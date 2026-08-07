export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface BackendUser {
  id: string
  raw_id?: number
  name: string
  email: string
  mobile?: string
  phone?: string
  organization?: string
  plan?: string
  credits?: number
  type?: "Regular" | "Demo"
  status?: "Active" | "Inactive" | "Suspended"
  is_admin?: boolean
  createdAt?: string
}

export interface DashboardStats {
  total_users: number
  paid_users: number
  demo_users: number
  total_credits: number
  active_campaigns: number
  total_calls: number
  plan_distribution: Array<{ name: string; value: number }>
  credits_by_plan: Array<{ name: string; credits: number }>
  user_growth: Array<{ name: string; users: number }>
  revenue_data: Array<{ name: string; revenue: number }>
  recent_users: BackendUser[]
  recent_activities: Array<{ id: string; title: string; time: string; type: string }>
}

export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.warn("Failed to fetch dashboard stats from backend:", error)
    return null
  }
}

export async function fetchAdminUsers(): Promise<BackendUser[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.warn("Failed to fetch admin users from backend:", error)
    return null
  }
}

export async function createAdminUser(data: { full_name: string; email: string; phone_number?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to create user" }))
    throw new Error(err.detail || "Failed to create user")
  }
  return res.json()
}

export async function updateAdminUser(userId: string, data: { full_name?: string; email?: string; phone_number?: string; credits?: number; subscription_plan?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to update user" }))
    throw new Error(err.detail || "Failed to update user")
  }
  return res.json()
}

export async function deleteAdminUser(userId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to delete user" }))
    throw new Error(err.detail || "Failed to delete user")
  }
  return res.json()
}
