"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  Pie, 
  PieChart,
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Cell
} from "recharts"
import { useMockData } from "@/contexts/MockDataContext"

const COLORS = ["#6C4CF1", "#38BDF8", "#F472B6", "#10B981", "#F59E0B"]

export function AnalyticsCharts() {
  const { users, dashboardStats } = useMockData()

  // Dynamically compute plan distribution from backend or local user list
  const planDistributionData = useMemo(() => {
    if (dashboardStats?.plan_distribution && dashboardStats.plan_distribution.length > 0) {
      return dashboardStats.plan_distribution
    }
    const counts: Record<string, number> = { Starter: 0, Standard: 0, Pro: 0, Optional: 0, Demo: 0 }
    users.forEach(u => {
      if (u.plan && counts[u.plan] !== undefined) {
        counts[u.plan] += 1
      } else {
        counts["Starter"] += 1
      }
    })
    return Object.keys(counts)
      .map(plan => ({ name: plan, value: counts[plan] }))
      .filter(item => item.value > 0)
  }, [users, dashboardStats])

  // Dynamically compute total credits by plan
  const creditsByPlanData = useMemo(() => {
    if (dashboardStats?.credits_by_plan && dashboardStats.credits_by_plan.length > 0) {
      return dashboardStats.credits_by_plan
    }
    const creditsMap: Record<string, number> = { Starter: 0, Standard: 0, Pro: 0, Optional: 0, Demo: 0 }
    users.forEach(u => {
      const plan = u.plan || "Starter"
      creditsMap[plan] = (creditsMap[plan] || 0) + (u.credits || 0)
    })
    return Object.keys(creditsMap).map(plan => ({
      name: plan,
      credits: Math.round(creditsMap[plan] / 1000) // in thousands
    }))
  }, [users, dashboardStats])

  // Dynamically compute user growth trend
  const userGrowthData = useMemo(() => {
    if (dashboardStats?.user_growth && dashboardStats.user_growth.length > 0) {
      return dashboardStats.user_growth
    }
    const total = users.length
    return [
      { name: "Jan", users: Math.max(1, Math.floor(total * 0.2)) },
      { name: "Feb", users: Math.max(2, Math.floor(total * 0.35)) },
      { name: "Mar", users: Math.max(3, Math.floor(total * 0.5)) },
      { name: "Apr", users: Math.max(5, Math.floor(total * 0.65)) },
      { name: "May", users: Math.max(7, Math.floor(total * 0.8)) },
      { name: "Jun", users: Math.max(10, Math.floor(total * 0.9)) },
      { name: "Jul", users: total },
    ]
  }, [users, dashboardStats])

  // Dynamically compute revenue based on active paid plan tiers
  const revenueData = useMemo(() => {
    if (dashboardStats?.revenue_data && dashboardStats.revenue_data.length > 0) {
      return dashboardStats.revenue_data
    }
    const starterPrice = 49
    const standardPrice = 149
    const proPrice = 499

    const currentMonthlyRevenue = users.reduce((acc, u) => {
      if (u.plan === "Starter") return acc + starterPrice
      if (u.plan === "Standard") return acc + standardPrice
      if (u.plan === "Pro") return acc + proPrice
      return acc
    }, 0)

    return [
      { name: "Jan", revenue: Math.round(currentMonthlyRevenue * 0.25) },
      { name: "Feb", revenue: Math.round(currentMonthlyRevenue * 0.4) },
      { name: "Mar", revenue: Math.round(currentMonthlyRevenue * 0.55) },
      { name: "Apr", revenue: Math.round(currentMonthlyRevenue * 0.7) },
      { name: "May", revenue: Math.round(currentMonthlyRevenue * 0.85) },
      { name: "Jun", revenue: Math.round(currentMonthlyRevenue * 0.95) },
      { name: "Jul", revenue: currentMonthlyRevenue },
    ]
  }, [users, dashboardStats])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C4CF1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6C4CF1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "#6C4CF1", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="users" stroke="#6C4CF1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Credits Distribution by Plan (k)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditsByPlanData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <Tooltip 
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "#38BDF8", fontWeight: "bold" }}
                />
                <Bar dataKey="credits" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Estimated Monthly Revenue ($)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "#F472B6", fontWeight: "bold" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#F472B6" strokeWidth={3} dot={{ r: 4, fill: "#F472B6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Live Subscription Plan Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {planDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
