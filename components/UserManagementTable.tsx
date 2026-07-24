"use client"

import { useState, useMemo } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table"
import { Search, ChevronUp, ChevronDown, Copy, Check, MoreHorizontal, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { User, UserDetailsDrawer } from "./UserDetailsDrawer"
import { cn } from "@/lib/utils"
import { useMockData } from "@/contexts/MockDataContext"

const columnHelper = createColumnHelper<User>()

export function UserManagementTable() {
  const { users } = useMockData()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId) || null, [users, selectedUserId])

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedKey(text)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const columns = [
    columnHelper.accessor("id", {
      header: "User ID",
      cell: info => <span className="font-medium text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("organization", {
      header: "Organization",
      cell: info => (
        <div className="flex flex-col">
          <span className="font-medium">{info.getValue()}</span>
          <span className="text-xs text-muted-foreground">{info.row.original.email}</span>
        </div>
      )
    }),
    columnHelper.accessor("plan", {
      header: "Plan",
      cell: info => {
        const plan = info.getValue()
        return (
          <span className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            plan === "Pro" && "bg-primary/10 text-primary",
            plan === "Standard" && "bg-blue-500/10 text-blue-600",
            plan === "Starter" && "bg-emerald-500/10 text-emerald-600",
            plan === "Optional" && "bg-slate-500/10 text-slate-600",
            plan === "Demo" && "bg-amber-500/10 text-amber-600",
          )}>
            {plan}
          </span>
        )
      }
    }),
    columnHelper.accessor("credits", {
      header: "Remaining Credits",
      cell: info => info.getValue().toLocaleString()
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: info => {
        const status = info.getValue()
        return (
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "h-2 w-2 rounded-full",
              status === "Active" && "bg-emerald-500",
              status === "Inactive" && "bg-slate-300",
              status === "Suspended" && "bg-destructive"
            )} />
            <span className="text-sm">{status}</span>
          </div>
        )
      }
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: () => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )
    })
  ]

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users, emails, or orgs..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring transition-all"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b sticky top-0 z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={cn(
                        "px-6 py-3 font-medium whitespace-nowrap",
                        header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUp className="h-3 w-3" />,
                          desc: <ChevronDown className="h-3 w-3" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id}
                    onClick={() => setSelectedUserId(row.original.id)}
                    className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-6 py-3 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-medium text-foreground">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> of <span className="font-medium text-foreground">{table.getFilteredRowModel().rows.length}</span> users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <UserDetailsDrawer 
        user={selectedUser} 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUserId(null)} 
      />
    </div>
  )
}
