export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface BackendUser {
  id: string
  raw_id?: number
  name: string
  email: string
  mobile?: string
  phone?: string
  organization?: string
  industry?: string
  plan?: string
  credits?: number
  type?: "Regular" | "Demo"
  status?: "Active" | "Inactive" | "Suspended"
  is_admin?: boolean
  createdAt?: string
  agents?: any[]
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
    }).catch(() => null)
    if (!res || !res.ok) return null
    return await res.json().catch(() => null)
  } catch {
    return null
  }
}

export async function fetchAdminUsers(): Promise<BackendUser[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }).catch(() => null)
    if (!res || !res.ok) return null
    return await res.json().catch(() => null)
  } catch {
    return null
  }
}

export interface PhonePayload {
  region: string;
  phone_number: string;
  number_type: string;
  provider_name: string;
  provider_account_id?: string;
  api_key_auth_token?: string;
  sip_id?: string;
  sip_username?: string;
  sip_password?: string;
  status: string;
  is_default: boolean;
}

export async function createAdminUser(data: {
  full_name: string;
  email: string;
  phone_number?: string;
  password?: string;
  company_name?: string;
  industry?: string;
  subscription_plan?: string;
  credits?: number;
  agent_name?: string;
  agent_language?: string;
  agent_voice?: string;
  agent_script?: string;
  phones?: PhonePayload[];
}): Promise<any> {

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

export async function updateAdminUser(userId: string, data: { full_name?: string; email?: string; phone_number?: string; credits?: number; subscription_plan?: string; status?: string }): Promise<any> {
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

export interface UserActivityStats {
  user_id: string;
  total_campaigns: number;
  today: {
    calls: number;
    successful: number;
    failed: number;
  };
}

export async function fetchUserActivity(userId: string): Promise<UserActivityStats | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/activity`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }).catch(() => null)
    if (!res || !res.ok) return null
    return await res.json().catch(() => null)
  } catch {
    return null
  }
}

export interface CampaignAggregatedStats {
  id: number;
  campaign_name: string;
  created_at: string | null;
  status: string;
  total_contacts: number;
  calls_made: number;
  successful_calls: number;
  failed_calls: number;
}

export async function fetchUserCampaigns(userId: string): Promise<CampaignAggregatedStats[]> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/campaigns`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }).catch(() => null)
    if (!res || !res.ok) return []
    return await res.json().catch(() => [])
  } catch {
    return []
  }
}
