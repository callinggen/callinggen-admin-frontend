"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMockData } from "@/contexts/MockDataContext"
import { User, Agent } from "./UserDetailsDrawer"

const userSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  organization: z.string().min(1, "Organization is required"),
  plan: z.enum(["Starter", "Standard", "Pro", "Optional", "Demo"]),
  topUpCredits: z.string().optional().refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 50), { message: "Minimum top-up is 50 credits" }),
  agents: z.array(z.object({
    id: z.string().min(1, "Agent ID is required"),
    name: z.string().min(1, "Agent Name is required"),
    status: z.enum(["Active", "Inactive", "Error"])
  }))
})

type UserFormValues = z.infer<typeof userSchema>

type UserFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userToEdit?: User
}

export function UserFormModal({ open, onOpenChange, userToEdit }: UserFormModalProps) {
  const { addUser, updateUser, users } = useMockData()
  const isEditing = !!userToEdit

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: "",
      email: "",
      password: "",
      organization: "",
      plan: "Starter",
      topUpCredits: "",
      agents: []
    }
  })

  const { fields: agents, append, remove } = useFieldArray({
    name: "agents",
    control: form.control
  })

  // Reset form when modal opens/closes or userToEdit changes
  React.useEffect(() => {
    if (open) {
      if (userToEdit) {
        form.reset({
          id: userToEdit.id,
          email: userToEdit.email,
          password: "", // Don't pre-fill password
          organization: userToEdit.organization,
          plan: userToEdit.plan,
          topUpCredits: "",
          agents: userToEdit.agents
        })
      } else {
        form.reset({
          id: `USR-${1000 + users.length + 1}`,
          email: "",
          password: "",
          organization: "",
          plan: "Starter",
          topUpCredits: "",
          agents: []
        })
      }
    }
  }, [open, userToEdit, form, users.length])

  const onSubmit = (data: UserFormValues) => {
    if (!isEditing) {
      // Mock unique ID validation
      if (users.some(u => u.id === data.id)) {
        form.setError("id", { message: "User ID already exists" })
        return
      }

      if (!data.password) {
        form.setError("password", { message: "Password is required for new users" })
        return
      }
    }

    if (isEditing && userToEdit) {
      const additionalCredits = data.topUpCredits ? Number(data.topUpCredits) : 0
      const newCredits = (userToEdit.credits || 0) + additionalCredits

      updateUser(userToEdit.id, {
        id: data.id,
        email: data.email,
        organization: data.organization,
        plan: data.plan,
        credits: newCredits,
        type: data.plan === "Demo" ? "Demo" : "Regular",
        agents: data.agents as Agent[]
      })
      toast.success(additionalCredits > 0 ? `User updated and ${additionalCredits} credits added!` : "User updated successfully!")
    } else {
      addUser({
        id: data.id,
        name: "Unknown",
        email: data.email,
        mobile: "N/A",
        phone: "N/A",
        industry: "Unknown",
        provider: "Vobiz",
        organization: data.organization,
        plan: data.plan,
        apiKey: `cg_live_${Math.random().toString(36).substring(2, 15)}`,
        type: "Regular",
        status: "Active",
        credits: 10000,
        createdAt: new Date().toISOString(),
        agents: data.agents as Agent[]
      })
      toast.success("User created successfully!")
    }
    
    onOpenChange(false)
  }

  // Helper for rendering inputs
  const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: string }>(
    ({ error, className, ...props }, ref) => (
      <div className="w-full">
        <input
          ref={ref}
          className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
          {...props}
        />
        {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
      </div>
    )
  )
  Input.displayName = "Input"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify user details and agent configurations." : "Add a new user to the CallingGen platform."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">User ID</label>
              <Input {...form.register("id")} error={form.formState.errors.id?.message} disabled={isEditing} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Organization</label>
              <Input {...form.register("organization")} error={form.formState.errors.organization?.message} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email Address</label>
              <Input type="email" {...form.register("email")} error={form.formState.errors.email?.message} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Password {isEditing && "(Leave blank to keep)"}</label>
              <Input type="password" {...form.register("password")} error={form.formState.errors.password?.message} />
            </div>
            <div className={`space-y-2 ${isEditing ? "col-span-1" : "col-span-2"}`}>
              <label className="text-sm font-medium leading-none">Selected Plan</label>
              <select 
                {...form.register("plan")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Starter">Starter</option>
                <option value="Standard">Standard</option>
                <option value="Pro">Pro</option>
                <option value="Optional">Optional</option>
                <option value="Demo">Demo</option>
              </select>
            </div>
            {isEditing && (
              <div className="space-y-2 col-span-1">
                <label className="text-sm font-medium leading-none">Top Up Credits (Optional)</label>
                <div className="flex flex-col">
                  <Input 
                    type="number" 
                    placeholder="Min 50" 
                    {...form.register("topUpCredits")} 
                    error={form.formState.errors.topUpCredits?.message} 
                  />
                  <p className="text-[0.75rem] text-muted-foreground mt-1">
                    Current: {userToEdit?.credits || 0}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none">CallingGen Agents</label>
              <Button type="button" variant="secondary" size="sm" className="h-8 gap-1" onClick={() => append({ id: `AGT-${Math.floor(Math.random() * 10000)}`, name: "", status: "Active" })}>
                <Plus className="h-3.5 w-3.5" />
                Add Agent
              </Button>
            </div>
            
            {agents.length === 0 ? (
              <div className="text-sm text-center py-4 border rounded-lg border-dashed text-muted-foreground bg-muted/20">
                No agents configured yet.
              </div>
            ) : (
              <div className="space-y-3">
                {agents.map((agent, index) => (
                  <div key={agent.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/10">
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Agent Name</label>
                        <Input {...form.register(`agents.${index}.name`)} error={form.formState.errors.agents?.[index]?.name?.message} placeholder="e.g. Sales Bot" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Agent ID</label>
                        <Input {...form.register(`agents.${index}.id`)} error={form.formState.errors.agents?.[index]?.id?.message} readOnly className="bg-muted/30" />
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="mt-5 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Create User"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
