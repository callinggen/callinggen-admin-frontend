"use client"

import { Suspense } from "react"
import { DemoLeadsTable } from "@/components/DemoLeadsTable"

export default function TestUsersPage() {
  return (
    <div className="flex flex-col gap-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage all test call requests from the website.
          </p>
        </div>
      </div>

      {/* Main Table Content */}
      <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-2xl" />}>
        <DemoLeadsTable />
      </Suspense>
    </div>
  )
}
