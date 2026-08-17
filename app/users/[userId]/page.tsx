"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Activity, Bot, PhoneCall, CheckCircle2, XCircle, LayoutDashboard, BarChart3, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useMockData } from "@/contexts/MockDataContext"
import { fetchUserActivity, fetchUserCampaigns, UserActivityStats, CampaignAggregatedStats } from "@/lib/api"
import { User } from "@/components/UserDetailsDrawer"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  const { users } = useMockData()

  const [user, setUser] = useState<User | null>(null)
  const [activityStats, setActivityStats] = useState<UserActivityStats | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignAggregatedStats[]>([])
  const [isFetchingStats, setIsFetchingStats] = useState(true)
  const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(true)

  useEffect(() => {
    if (users && users.length > 0) {
      const foundUser = users.find(u => u.id === userId)
      setUser(foundUser || null)
    }
  }, [users, userId])

  useEffect(() => {
    if (user?.id) {
      setIsFetchingStats(true)
      setIsFetchingCampaigns(true)
      
      fetchUserActivity(user.id).then(data => {
        setActivityStats(data)
        setIsFetchingStats(false)
      })

      fetchUserCampaigns(user.id).then(data => {
        setCampaigns(data)
        setIsFetchingCampaigns(false)
      })
    }
  }, [user?.id])

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading User Profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/users")} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.id} • {user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant="outline" className={cn(
            "px-3 py-1 text-sm",
            user.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
            user.status === "Inactive" ? "bg-slate-50 text-slate-600 border-slate-200" :
            "bg-destructive/10 text-destructive border-destructive/20"
          )}>
            {user.status}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5 text-primary border-primary/20">
            {user.plan} Plan
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2"><BarChart3 className="h-4 w-4" /> Campaigns</TabsTrigger>
          <TabsTrigger value="billing" className="gap-2"><Receipt className="h-4 w-4" /> Billing</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining Credits</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.credits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Available balance</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isFetchingStats ? "..." : activityStats?.total_campaigns || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
                <PhoneCall className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isFetchingStats ? "..." : activityStats?.today?.calls || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate Today</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {isFetchingStats ? "..." : 
                    activityStats?.today?.calls 
                      ? Math.round((activityStats.today.successful / activityStats.today.calls) * 100) + "%" 
                      : "0%"
                  }
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activityStats?.today?.successful || 0} successful / {activityStats?.today?.failed || 0} failed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Configured Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.agents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {user.agents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-4 rounded-lg border p-4">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.language} • {agent.voice}</p>
                      </div>
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full shrink-0",
                        agent.status === "Active" ? "bg-emerald-500" : 
                        agent.status === "Inactive" ? "bg-slate-300" : "bg-destructive"
                      )} title={agent.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No agents configured.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CAMPAIGNS TAB */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {isFetchingCampaigns ? (
                <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                  Loading campaigns...
                </div>
              ) : campaigns.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No campaigns found for this user.
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total Contacts</TableHead>
                        <TableHead className="text-right">Calls Made</TableHead>
                        <TableHead className="text-right">Successful</TableHead>
                        <TableHead className="text-right">Failed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((camp) => (
                        <TableRow key={camp.id} className="hover:bg-muted/50 cursor-pointer">
                          <TableCell className="font-medium">{camp.campaign_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {camp.created_at ? new Date(camp.created_at).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "font-normal uppercase text-[10px]",
                              camp.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                              camp.status === "running" ? "bg-blue-50 text-blue-600 border-blue-200" :
                              "bg-slate-50 text-slate-600 border-slate-200"
                            )}>
                              {camp.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{camp.total_contacts}</TableCell>
                          <TableCell className="text-right">{camp.calls_made}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium">{camp.successful_calls}</TableCell>
                          <TableCell className="text-right text-destructive font-medium">{camp.failed_calls}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING TAB */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing & Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">Transaction History</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  Detailed billing and credit transaction history will be available in a future update. Current remaining balance is <strong className="text-foreground">{user.credits.toLocaleString()}</strong> credits.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
