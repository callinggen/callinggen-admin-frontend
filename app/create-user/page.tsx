"use client"

import React, { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  Building2, User as UserIcon, Mail, Phone, Lock, 
  CreditCard, Smartphone, Server, Bot, Languages, 
  Mic, FileText, Upload, Plus, Trash2, ChevronRight, Check
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMockData } from "@/contexts/MockDataContext"
import { cn } from "@/lib/utils"

const userFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(1, "Mobile number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  plan: z.enum(["Demo", "Starter", "Standard", "Pro", "Optional"]),
  credits: z.number().min(0, "Credits cannot be negative"),
  phones: z.array(z.object({
    number: z.string().min(1, "Phone number is required")
  })).min(1, "At least one phone number is required"),
  provider: z.string(),
  agents: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Agent name is required"),
    language: z.string().min(1, "Language is required"),
    voice: z.string().min(1, "Voice is required"),
    script: z.string().optional(),
    knowledgebaseDoc: z.string().optional()
  })).refine(agents => agents.every(a => a.script || a.knowledgebaseDoc), {
    message: "Provide either a script or a knowledgebase document",
    path: ["0", "script"]
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function CreateUserPage() {
  const router = useRouter()
  const { addUser, addDemoUser, users } = useMockData()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      plan: "Demo",
      credits: 50,
      phones: [{ number: "" }],
      provider: "Vobiz",
      agents: [{
        id: `AGT-${Math.floor(Math.random() * 10000)}`,
        name: "",
        language: "English",
        voice: "Female 1",
        script: "",
        knowledgebaseDoc: ""
      }]
    }
  })

  const { fields: agents, append, remove } = useFieldArray({
    name: "agents",
    control: form.control
  })

  const { fields: phones, append: appendPhone, remove: removePhone } = useFieldArray({
    name: "phones",
    control: form.control
  })

  const selectedPlan = form.watch("plan")
  const errors = form.formState.errors

  // Update credits when plan changes
  useEffect(() => {
    if (selectedPlan === "Demo") form.setValue("credits", 50)
    else if (selectedPlan === "Starter") form.setValue("credits", 500)
    else if (selectedPlan === "Standard") form.setValue("credits", 2000)
    else if (selectedPlan === "Pro") form.setValue("credits", 5000)
    else if (selectedPlan === "Optional") form.setValue("credits", 0)
  }, [selectedPlan, form])

  const onSubmit = (data: UserFormValues) => {
    if (data.plan === "Demo") {
      addDemoUser({
        id: `DMO-${Math.floor(Math.random() * 10000)}`,
        name: data.name,
        email: data.email,
        phone: data.mobile,
        company: data.companyName,
        role: "User",
        requestDate: new Date().toISOString(),
        status: "Pending",
        notes: "Created via Admin Create User form"
      })
      toast.success("Demo user created successfully!")
      router.push("/demo")
    } else {
      addUser({
        id: `USR-${1000 + users.length + 1}`,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        phone: data.phones.map(p => p.number).join(", "),
        password: data.password,
        industry: data.industry,
        provider: data.provider,
        organization: data.companyName,
        plan: data.plan as any,
        credits: data.credits,
        apiKey: `cg_live_${Math.random().toString(36).substring(2, 15)}`,
        type: "Regular",
        status: "Active",
        createdAt: new Date().toISOString(),
        agents: data.agents.map(a => ({ 
          ...a, 
          script: a.script || "",
          knowledgebaseDoc: a.knowledgebaseDoc || "",
          status: "Active" 
        }))
      })
      toast.success("User created successfully!")
      router.push("/users")
    }
  }

  // Custom Input Wrapper for styling consistency
  const InputGroup = ({ 
    label, icon: Icon, error, ...props 
  }: { label: string, icon?: any, error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-foreground/90">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />}
        <input
          className={cn(
            "flex h-10 w-full rounded-xl border bg-background px-3 py-2 text-sm ring-offset-background transition-all",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-9",
            error ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30" : "border-input"
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[0.8rem] font-medium text-destructive mt-1 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-destructive inline-block"/> {error}</p>}
    </div>
  )

  const SelectGroup = ({ 
    label, icon: Icon, error, children, ...props 
  }: { label: string, icon?: any, error?: string, children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-foreground/90">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />}
        <select
          className={cn(
            "flex h-10 w-full rounded-xl border bg-background px-3 py-2 text-sm ring-offset-background transition-all appearance-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
            Icon && "pl-9",
            error ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30" : "border-input"
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
        </div>
      </div>
      {error && <p className="text-[0.8rem] font-medium text-destructive mt-1 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-destructive inline-block"/> {error}</p>}
    </div>
  )

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-5xl mx-auto pt-6 px-4 sm:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
        <p className="text-muted-foreground mt-1 text-lg">Set up a new client account, configure subscriptions, and initialize their AI agents.</p>
      </motion.div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Company & Personal Details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Building2 className="h-5 w-5" /></div>
                Company & Personal Details
              </CardTitle>
              <CardDescription className="mt-2 text-sm">Basic information about the client and their organization.</CardDescription>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Company Name" icon={Building2} placeholder="e.g. Acme Corp" {...form.register("companyName")} error={errors.companyName?.message} />
                <InputGroup label="Industry / Sector" icon={Building2} placeholder="e.g. Healthcare, Real Estate" {...form.register("industry")} error={errors.industry?.message} />
                <InputGroup label="Full Name" icon={UserIcon} placeholder="e.g. Jane Doe" {...form.register("name")} error={errors.name?.message} />
                <InputGroup label="Email Address" icon={Mail} type="email" placeholder="jane@example.com" {...form.register("email")} error={errors.email?.message} />
                <InputGroup label="Mobile Number" icon={Smartphone} placeholder="+1 (555) 000-0000" {...form.register("mobile")} error={errors.mobile?.message} />
                <div className="hidden md:block"></div> {/* Spacer */}
                <InputGroup label="Password" icon={Lock} type="password" placeholder="Create a strong password" {...form.register("password")} error={errors.password?.message} />
                <InputGroup label="Confirm Password" icon={Lock} type="password" placeholder="Confirm password" {...form.register("confirmPassword")} error={errors.confirmPassword?.message} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 2: Subscription & Phone */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 via-transparent to-transparent p-6 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600"><CreditCard className="h-5 w-5" /></div>
                Subscription & Connectivity
              </CardTitle>
              <CardDescription className="mt-2 text-sm">Configure the user's plan, credits, and telephony provider.</CardDescription>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectGroup label="Subscription Plan" icon={CreditCard} {...form.register("plan")} error={errors.plan?.message}>
                  <option value="Demo">Demo</option>
                  <option value="Starter">Starter</option>
                  <option value="Standard">Standard</option>
                  <option value="Pro">Pro</option>
                  <option value="Optional">Optional (Custom)</option>
                </SelectGroup>
                
                <InputGroup 
                  label="Allocated Credits" 
                  icon={Server} 
                  type="number" 
                  {...form.register("credits", { valueAsNumber: true })} 
                  disabled={selectedPlan !== "Optional"}
                  error={errors.credits?.message} 
                  className={selectedPlan !== "Optional" ? "bg-muted/50" : ""}
                />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none text-foreground/90">Dedicated Phone Numbers</label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendPhone({ number: "" })} className="h-7 gap-1 rounded-lg px-2">
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {phones.map((phoneItem, index) => (
                      <div key={phoneItem.id} className="flex items-start gap-2">
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <input
                            className={cn(
                              "flex h-10 w-full rounded-xl border bg-background px-3 py-2 pl-9 text-sm ring-offset-background transition-all",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
                              errors.phones?.[index]?.number ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30" : "border-input"
                            )}
                            placeholder="+1 (555) 123-4567"
                            {...form.register(`phones.${index}.number`)}
                          />
                          {errors.phones?.[index]?.number?.message && <p className="text-[0.8rem] font-medium text-destructive mt-1 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-destructive inline-block"/> {errors.phones[index]?.number?.message}</p>}
                        </div>
                        {phones.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removePhone(index)} className="h-10 w-10 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <InputGroup label="Telephony Provider" icon={Server} {...form.register("provider")} readOnly className="bg-muted/50 cursor-not-allowed" error={errors.provider?.message} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 3: AI Agent */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent p-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600"><Bot className="h-5 w-5" /></div>
                  AI Agent Configuration
                </CardTitle>
                <CardDescription className="mt-2 text-sm">Set up the initial AI calling agents for this user.</CardDescription>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => append({ 
                  id: `AGT-${Math.floor(Math.random() * 10000)}`, name: "", language: "English", voice: "Female 1", script: "", knowledgebaseDoc: "" 
                })}
                className="gap-2 rounded-xl"
              >
                <Plus className="h-4 w-4" /> Add Agent
              </Button>
            </div>
            
            <CardContent className="p-6">
              <AnimatePresence>
                {agents.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                    No agents configured. Click "Add Agent" to start.
                  </motion.div>
                )}
                
                <div className="space-y-6">
                  {agents.map((agent, index) => (
                    <motion.div 
                      key={agent.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      className="relative rounded-2xl border bg-muted/10 p-5 pt-7"
                    >
                      <div className="absolute top-3 left-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-background px-2 rounded-full border shadow-sm">
                        Agent {index + 1}
                      </div>
                      
                      {agents.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                        <InputGroup label="Agent Name" icon={Bot} placeholder="e.g. Sales Assistant" {...form.register(`agents.${index}.name`)} error={errors.agents?.[index]?.name?.message} />
                        
                        <SelectGroup label="Language" icon={Languages} {...form.register(`agents.${index}.language`)} error={errors.agents?.[index]?.language?.message}>
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                          <option value="Hindi">Hindi</option>
                        </SelectGroup>
                        
                        <SelectGroup label="Voice Profile" icon={Mic} {...form.register(`agents.${index}.voice`)} error={errors.agents?.[index]?.voice?.message}>
                          <option value="Female 1">Female 1 (Professional)</option>
                          <option value="Female 2">Female 2 (Friendly)</option>
                          <option value="Male 1">Male 1 (Deep)</option>
                          <option value="Male 2">Male 2 (Energetic)</option>
                        </SelectGroup>

                        <div className="md:col-span-3 space-y-2">
                          <label className="text-sm font-medium leading-none text-foreground/90">Agent Script / System Prompt <span className="text-muted-foreground font-normal">(Optional if PDF is uploaded)</span></label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <textarea
                              {...form.register(`agents.${index}.script`)}
                              rows={3}
                              placeholder="Describe how the agent should behave, what it should say, and its goals..."
                              className={cn(
                                "flex w-full rounded-xl border bg-background px-3 py-2 pl-9 text-sm ring-offset-background transition-all resize-none",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
                                errors.agents?.[index]?.script ? "border-destructive focus-visible:border-destructive" : "border-input"
                              )}
                            />
                          </div>
                          {errors.agents?.[index]?.script?.message && <p className="text-[0.8rem] font-medium text-destructive mt-1 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-destructive inline-block"/> {errors.agents[index]?.script?.message}</p>}
                        </div>

                        <div className="md:col-span-3 space-y-2">
                          <label className="text-sm font-medium leading-none text-foreground/90">Knowledgebase Document <span className="text-muted-foreground font-normal">(Optional if Script is provided)</span></label>
                          <div className="flex items-center gap-3">
                            <label className="flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed bg-muted/30 px-3 py-2 text-sm transition-all hover:bg-muted/50 hover:border-primary/50 relative overflow-hidden group">
                              <Upload className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                {form.watch(`agents.${index}.knowledgebaseDoc`) || "Upload PDF or DOCX..."}
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    form.setValue(`agents.${index}.knowledgebaseDoc`, file.name)
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="rounded-xl px-6">
            Cancel
          </Button>
          <Button type="submit" size="lg" className="rounded-xl px-8 shadow-md">
            <Check className="mr-2 h-5 w-5" /> Create {selectedPlan === "Demo" ? "Demo User" : "User"}
          </Button>
        </div>
      </form>
    </div>
  )
}
