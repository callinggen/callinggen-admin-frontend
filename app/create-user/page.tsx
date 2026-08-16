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
  Mic, FileText, Upload, Plus, Trash2, ChevronRight, Check,
  Globe, ShieldCheck, Key, Cpu, ToggleLeft, Radio, Hash, UserCheck
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
  plan: z.enum(["Starter", "Standard", "Pro", "Optional", "Demo"]),
  credits: z.number().min(0, "Credits cannot be negative"),
  
  // Telephony Configuration with ALL 11 required fields
  phones: z.array(z.object({
    region: z.string().min(1, "Region / Country is required"),
    number: z.string().min(1, "Phone number is required"),
    numberType: z.string().min(1, "Number type is required"),
    provider: z.string().min(1, "Provider is required"),
    providerAccountId: z.string().optional(),
    apiKeyAuthToken: z.string().optional(),
    sipId: z.string().optional(),
    sipUsername: z.string().optional(),
    sipPassword: z.string().optional(),
    status: z.enum(["Active", "Inactive", "Pending Verification"]),
    isDefault: z.boolean(),
  })).min(1, "At least one telephone entry is required"),


  agents: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Agent name is required"),
    language: z.string().min(1, "Language is required"),
    voice: z.string().min(1, "Voice is required"),
    script: z.string().min(1, "Agent script is required")
  }))
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function CreateUserPage() {
  const router = useRouter()
  const { addUser, users } = useMockData()

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
      plan: "Starter",
      credits: 500,
      phones: [{
        region: "India (+91)",
        number: "",
        numberType: "Mobile",
        provider: "Tata Communications",
        providerAccountId: "",
        apiKeyAuthToken: "",
        sipId: "",
        sipUsername: "",
        sipPassword: "",
        status: "Active",
        isDefault: true,
      }],
      agents: [{
        id: `AGT-${Math.floor(Math.random() * 10000)}`,
        name: "",
        language: "English",
        voice: "Meera",
        script: ""
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

  const onSubmit = async (data: UserFormValues) => {
    try {
      await addUser({
        id: `USR-${1000 + users.length + 1}`,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        phone: data.phones[0]?.number || data.mobile,
        password: data.password,
        industry: data.industry,
        provider: data.phones[0]?.provider || "Tata Communications",
        organization: data.companyName,
        plan: data.plan as any,
        credits: data.credits,
        apiKey: `cg_live_${Math.random().toString(36).substring(2, 15)}`,
        type: data.plan === "Demo" ? "Demo" : "Regular",
        status: "Active",
        createdAt: new Date().toISOString(),
        agents: data.agents.map(a => ({ 
          ...a, 
          script: a.script,
          knowledgebaseDoc: "",
          status: "Active" 
        })),
        phones: data.phones.map(p => ({
          region: p.region,
          number: p.number,
          numberType: p.numberType,
          provider: p.provider,
          providerAccountId: p.providerAccountId,
          apiKeyAuthToken: p.apiKeyAuthToken,
          sipId: p.sipId,
          sipUsername: p.sipUsername,
          sipPassword: p.sipPassword,
          status: p.status,
          isDefault: p.isDefault,
        }))
      })

      toast.success(data.plan === "Demo" ? "Demo user created!" : "User created successfully!")
      router.push(data.plan === "Demo" ? "/demo" : "/users")
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error creating user account");
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
          autoComplete={props.autoComplete || "off"}
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
        <p className="text-muted-foreground mt-1 text-lg">Set up a new client account, configure subscriptions, and assign telephony credentials.</p>
      </motion.div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" autoComplete="off">
        
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
                <InputGroup label="Password" icon={Lock} type="password" autoComplete="new-password" placeholder="Create a strong password" {...form.register("password")} error={errors.password?.message} />
                <InputGroup label="Confirm Password" icon={Lock} type="password" autoComplete="new-password" placeholder="Confirm password" {...form.register("confirmPassword")} error={errors.confirmPassword?.message} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 2: Subscription Plan & Credits */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 via-transparent to-transparent p-6 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600"><CreditCard className="h-5 w-5" /></div>
                Subscription & Credit Allocation
              </CardTitle>
              <CardDescription className="mt-2 text-sm">Select subscription package and initial calling credits balance.</CardDescription>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectGroup label="Subscription Plan" icon={CreditCard} {...form.register("plan")} error={errors.plan?.message}>
                  <option value="" disabled>Select Plan</option>
                  <option value="Demo">Demo (50 Credits)</option>
                  <option value="Starter">Starter (500 Credits)</option>
                  <option value="Standard">Standard (2,000 Credits)</option>
                  <option value="Pro">Pro (5,000 Credits)</option>
                  <option value="Optional">Optional (Custom Balance)</option>
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 3: Telephony & SIP Configuration (ALL 11 Required Fields) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500/10 via-transparent to-transparent p-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600"><Phone className="h-5 w-5" /></div>
                  Telephone & SIP Credentials
                </CardTitle>
                <CardDescription className="mt-2 text-sm">Configure 1 or more telephone numbers with full region, provider, and SIP credentials.</CardDescription>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => appendPhone({
                  region: "India (+91)",
                  number: "",
                  numberType: "Mobile",
                  provider: "Tata Communications",
                  providerAccountId: "",
                  apiKeyAuthToken: "",
                  sipId: "",
                  sipUsername: "",
                  sipPassword: "",
                  status: "Active",
                  isDefault: false,
                })}
                className="gap-2 rounded-xl"
              >
                <Plus className="h-4 w-4" /> Add Telephone Number
              </Button>
            </div>
            
            <CardContent className="p-6">
              <AnimatePresence>
                {phones.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                    No telephone entries configured. Click "Add Telephone Number" to assign numbers.
                  </motion.div>
                )}
                
                <div className="space-y-6">
                  {phones.map((phoneItem, index) => (
                    <motion.div 
                      key={phoneItem.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      className="relative rounded-2xl border bg-muted/10 p-5 pt-8 space-y-5"
                    >
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-200">
                            Telephone #{index + 1}
                          </span>
                          {form.watch(`phones.${index}.isDefault`) && (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200">
                              ⭐ Default Number
                            </span>
                          )}
                        </div>
                        {phones.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePhone(index)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2 rounded-lg text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove Entry
                          </Button>
                        )}
                      </div>

                      {/* 11 Required Telephone Fields Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        {/* 1. Region / Country */}
                        <SelectGroup 
                          label="1. Region / Country *" 
                          icon={Globe} 
                          {...form.register(`phones.${index}.region`)} 
                          error={errors.phones?.[index]?.region?.message}
                        >
                          <option value="India (+91)">🇮🇳 India (+91)</option>
                          <option value="United States (+1)">🇺🇸 United States (+1)</option>
                          <option value="United Kingdom (+44)">🇬🇧 United Kingdom (+44)</option>
                          <option value="Australia (+61)">🇦🇺 Australia (+61)</option>
                          <option value="UAE (+971)">🇦🇪 UAE (+971)</option>
                          <option value="Singapore (+65)">🇸🇬 Singapore (+65)</option>
                          <option value="Global / International">🌐 Global / International</option>
                        </SelectGroup>

                        {/* 2. Phone Number */}
                        <InputGroup 
                          label="2. Phone Number *" 
                          icon={Phone} 
                          placeholder="e.g. +91 98857 33334" 
                          {...form.register(`phones.${index}.number`)} 
                          error={errors.phones?.[index]?.number?.message} 
                        />

                        {/* 3. Number Type */}
                        <SelectGroup 
                          label="3. Number Type *" 
                          icon={Radio} 
                          {...form.register(`phones.${index}.numberType`)} 
                          error={errors.phones?.[index]?.numberType?.message}
                        >
                          <option value="Mobile">Mobile / Cellular</option>
                          <option value="Toll-Free">Toll-Free (1800)</option>
                          <option value="Landline">Fixed Landline</option>
                          <option value="SIP Direct">SIP Direct Trunk</option>
                        </SelectGroup>

                        {/* 4. Provider */}
                        <SelectGroup 
                          label="4. Telephony Provider *" 
                          icon={Server} 
                          {...form.register(`phones.${index}.provider`)} 
                          error={errors.phones?.[index]?.provider?.message}
                        >
                          <option value="Tata Communications">Tata Communications (SIP)</option>
                          <option value="Twilio">Twilio Voice</option>
                          <option value="Telnyx">Telnyx SIP</option>
                          <option value="Plivo">Plivo Global</option>
                          <option value="Vobiz">Vobiz Telecom</option>
                          <option value="Custom SIP Trunk">Custom SIP Trunk</option>
                        </SelectGroup>

                        {/* 5. Provider Account ID */}
                        <InputGroup 
                          label="5. Provider Account ID" 
                          icon={Hash} 
                          placeholder="e.g. AC10992384710293" 
                          {...form.register(`phones.${index}.providerAccountId`)} 
                          error={errors.phones?.[index]?.providerAccountId?.message} 
                        />

                        {/* 6. API Key / Auth Token */}
                        <InputGroup 
                          label="6. API Key / Auth Token" 
                          icon={Key} 
                          type="password"
                          placeholder="e.g. sk_live_xxxxxxxx" 
                          {...form.register(`phones.${index}.apiKeyAuthToken`)} 
                          error={errors.phones?.[index]?.apiKeyAuthToken?.message} 
                        />

                        {/* 7. SIP ID */}
                        <InputGroup 
                          label="7. SIP ID / Trunk ID" 
                          icon={Cpu} 
                          placeholder="e.g. sip-trunk-tata-01" 
                          {...form.register(`phones.${index}.sipId`)} 
                          error={errors.phones?.[index]?.sipId?.message} 
                        />

                        {/* 8. SIP Username */}
                        <InputGroup 
                          label="8. SIP Username" 
                          icon={UserCheck} 
                          placeholder="e.g. sip_tata_user" 
                          {...form.register(`phones.${index}.sipUsername`)} 
                          error={errors.phones?.[index]?.sipUsername?.message} 
                        />

                        {/* 9. SIP Password */}
                        <InputGroup 
                          label="9. SIP Password" 
                          icon={Lock} 
                          type="password"
                          placeholder="••••••••" 
                          {...form.register(`phones.${index}.sipPassword`)} 
                          error={errors.phones?.[index]?.sipPassword?.message} 
                        />

                        {/* 10. Status */}
                        <SelectGroup 
                          label="10. Connection Status *" 
                          icon={ShieldCheck} 
                          {...form.register(`phones.${index}.status`)} 
                          error={errors.phones?.[index]?.status?.message}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Pending Verification">Pending Verification</option>
                        </SelectGroup>

                        {/* 11. Default Number Checkbox */}
                        <div className="md:col-span-2 flex items-center gap-3 pt-6">
                          <input
                            type="checkbox"
                            id={`isDefault-${index}`}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            {...form.register(`phones.${index}.isDefault`)}
                          />
                          <label htmlFor={`isDefault-${index}`} className="text-sm font-medium text-foreground cursor-pointer select-none">
                            11. Set as Default Outbound Number for this User
                          </label>
                        </div>

                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 4: AI Agent */}
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
                  id: `AGT-${Math.floor(Math.random() * 10000)}`, name: "", language: "English", voice: "Meera", script: "" 
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
                          <option value="Meera">Meera (Female)</option>
                          <option value="Raj">Raj (Male)</option>
                          <option value="Manisha">Manisha (Female)</option>
                          <option value="Karun">Karun (Male)</option>
                          <option value="Vidya">Vidya (Female)</option>
                          <option value="Hitesh">Hitesh (Male)</option>
                        </SelectGroup>

                        <div className="md:col-span-3 space-y-2">
                          <label className="text-sm font-medium leading-none text-foreground/90">Agent Script / System Prompt</label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <textarea
                              {...form.register(`agents.${index}.script`)}
                              rows={5}
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
