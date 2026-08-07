"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMockData } from "@/contexts/MockDataContext"

export function RecentActivity() {
  const { users, notifications, dashboardStats } = useMockData()

  const recentActivities = (dashboardStats?.recent_activities && dashboardStats.recent_activities.length > 0)
    ? dashboardStats.recent_activities
    : notifications.slice(0, 5).map((n) => {
        let type = "info"
        if (n.title.toLowerCase().includes("created") || n.title.toLowerCase().includes("converted") || n.title.toLowerCase().includes("approved")) {
          type = "success"
        } else if (n.title.toLowerCase().includes("deleted") || n.title.toLowerCase().includes("suspended") || n.title.toLowerCase().includes("rejected")) {
          type = "warning"
        }
        return {
          id: n.id,
          title: n.title,
          time: n.time,
          type
        }
      })

  const recentUsers = (dashboardStats?.recent_users && dashboardStats.recent_users.length > 0)
    ? dashboardStats.recent_users.slice(0, 5).map((u) => ({
        name: u.organization || u.name,
        email: u.email,
        plan: u.plan || "Starter",
        status: u.status || "Active"
      }))
    : users.slice(0, 4).map((u) => ({
        name: u.organization,
        email: u.email,
        plan: u.plan,
        status: u.status
      }))

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mt-4">
      {/* Activity Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.4 }} 
        className="lg:col-span-1"
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-6">
                {recentActivities.map((activity, i) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    {i !== recentActivities.length - 1 && (
                      <div className="absolute left-1.5 top-5 h-full w-px bg-border" />
                    )}
                    <div className={cn(
                      "relative mt-1 h-3 w-3 shrink-0 rounded-full border-2 bg-background",
                      activity.type === "success" && "border-emerald-500",
                      activity.type === "warning" && "border-amber-500",
                      activity.type === "info" && "border-blue-500",
                    )} />
                    <div className="flex flex-col gap-1 pb-1">
                      <p className="text-sm font-medium leading-none text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Users Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.5 }} 
        className="lg:col-span-2"
      >
        <Card className="h-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            {recentUsers.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-y">
                  <tr>
                    <th className="px-6 py-3 font-medium">User / Company</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Plan</th>
                    <th className="px-6 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentUsers.map((user, i) => (
                    <tr key={`${user.email}-${i}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          user.plan === "Pro" && "bg-primary/10 text-primary",
                          user.plan === "Standard" && "bg-blue-500/10 text-blue-600",
                          user.plan === "Starter" && "bg-emerald-500/10 text-emerald-600",
                          user.plan === "Optional" && "bg-slate-500/10 text-slate-600",
                          user.plan === "Demo" && "bg-amber-500/10 text-amber-600",
                        )}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            user.status === "Active" && "bg-emerald-500",
                            user.status === "Inactive" && "bg-slate-300",
                            user.status === "Suspended" && "bg-destructive"
                          )} />
                          <span className="text-muted-foreground">{user.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No users registered yet.</p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
