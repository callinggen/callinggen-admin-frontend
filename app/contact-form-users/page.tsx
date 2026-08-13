"use client"

import { CalendarDays } from "lucide-react"
import { ContactFormUsersTable } from "@/components/ContactFormUsersTable"
import { Navbar } from "@/components/Navbar"

export default function ContactFormUsersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Contact Form Users
                </h1>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                View and manage appointments booked directly from the landing page contact form. 
                These are automatically synced with your Google Calendar.
              </p>
            </div>
          </div>

          <ContactFormUsersTable />

        </div>
      </main>
    </div>
  )
}
