"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Building2,
  Mail,
  Phone,
  Briefcase
} from "lucide-react";

interface ContactUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  appointment_time: string;
  status: string;
  created_at: string;
}

export function ContactFormUsersTable() {
  const [users, setUsers] = useState<ContactUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/contact-users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch contact users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-muted-foreground border rounded-xl bg-card">
        <CalendarDays className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <p>No booked appointments yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold">User Info</th>
              <th className="px-6 py-4 font-semibold">Company & Industry</th>
              <th className="px-6 py-4 font-semibold">Appointment Time</th>
              <th className="px-6 py-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground text-sm">{user.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.company || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      <span>{user.industry || "N/A"}</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center leading-none shadow-sm">
                      <span className="text-[10px] font-bold uppercase mb-0.5">{format(new Date(user.appointment_time), "MMM")}</span>
                      <span className="text-sm font-black">{format(new Date(user.appointment_time), "dd")}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground text-sm">
                        {format(new Date(user.appointment_time), "h:mm a")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Booked {format(new Date(user.created_at), "MMM d")}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <span 
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === "booked" 
                        ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20" 
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {user.status === "booked" ? "Upcoming" : user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
