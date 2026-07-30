"use client"

import { Suspense } from "react"
import { UserManagementTable } from "@/components/UserManagementTable"
import { UserTableSkeleton } from "@/components/UserTableSkeleton"

export default function DemoUsersPage() {
  return (
    <div className="flex flex-col gap-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demo Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage all Demo requests.
          </p>
        </div>
      </div>

      {/* Main Table Content */}
      <Suspense fallback={<UserTableSkeleton />}>
        <UserManagementTable filterType="Demo" />
      </Suspense>
    </div>
  )
}

