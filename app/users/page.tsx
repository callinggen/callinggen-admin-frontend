"use client"

import { Suspense, useState } from "react"
import { UserManagementTable } from "@/components/UserManagementTable"
import { UserTableSkeleton } from "@/components/UserTableSkeleton"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { UserFormModal } from "@/components/UserFormModal"

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all CallingGen platform users.
          </p>
        </div>
      </div>

      {/* Main Table Content */}
      <Suspense fallback={<UserTableSkeleton />}>
        <UserManagementTable filterType="Regular" />
      </Suspense>
    </div>
  )
}

