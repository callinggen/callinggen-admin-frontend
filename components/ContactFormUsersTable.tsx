"use client";

import { API_BASE } from "../lib/api";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Ban,
  Plus,
  Trash2,
  FileText,
  X,
  ChevronDown
} from "lucide-react";

interface ContactUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  appointment_time: string;
  status: string; // "booked" | "upcoming" | "completed" | "no_show" | "cancelled"
  admin_notes?: string;
  created_at: string;
}

interface BlockedSlot {
  id: number;
  blocked_date: string; // YYYY-MM-DD
  slot_time?: string | null; // HH:MM
  reason?: string;
  created_at?: string;
}

export function ContactFormUsersTable() {
  const [users, setUsers] = useState<ContactUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed" | "no_show" | "cancelled">("all");
  
  // Slot Blackout Modal State
  const [showBlackoutModal, setShowBlackoutModal] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockTime, setNewBlockTime] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  // Notes Modal State
  const [selectedUserForNotes, setSelectedUserForNotes] = useState<ContactUser | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchBlockedSlots();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/contact-users`);
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

  const fetchBlockedSlots = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/blocked-slots`);
      if (response.ok) {
        const data = await response.json();
        setBlockedSlots(data);
      }
    } catch (error) {
      console.error("Failed to fetch blocked slots:", error);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/contact-users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedUserForNotes) return;
    try {
      setIsSavingNotes(true);
      const response = await fetch(`${API_BASE}/api/admin/contact-users/${selectedUserForNotes.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedUserForNotes.status,
          admin_notes: notesInput,
        }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === selectedUserForNotes.id ? { ...u, admin_notes: notesInput } : u));
        setSelectedUserForNotes(null);
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;
    try {
      setIsBlocking(true);
      const response = await fetch(`${API_BASE}/api/admin/blocked-slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocked_date: newBlockDate,
          slot_time: newBlockTime || null,
          reason: newBlockReason || "Admin Unavailable",
        }),
      });

      if (response.ok) {
        setNewBlockDate("");
        setNewBlockTime("");
        setNewBlockReason("");
        fetchBlockedSlots();
      }
    } catch (error) {
      console.error("Failed to block slot:", error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblock = async (blockId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/blocked-slots/${blockId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setBlockedSlots(prev => prev.filter(b => b.id !== blockId));
      }
    } catch (error) {
      console.error("Failed to unblock slot:", error);
    }
  };

  // Metrics Calculation
  const totalCount = users.length;
  const upcomingCount = users.filter(u => u.status === "booked" || u.status === "upcoming").length;
  const completedCount = users.filter(u => u.status === "completed" || u.status === "demo_given").length;
  const cancelledCount = users.filter(u => u.status === "no_show" || u.status === "cancelled").length;

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      user.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.industry.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "upcoming") return user.status === "booked" || user.status === "upcoming";
    if (activeTab === "completed") return user.status === "completed" || user.status === "demo_given";
    if (activeTab === "no_show") return user.status === "no_show";
    if (activeTab === "cancelled") return user.status === "cancelled";
    return true;
  });

  return (
    <div className="space-y-6">

      {/* METRIC STATS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-2xl font-extrabold mt-1">{totalCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CalendarDays className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Demos</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{upcomingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demo Given (Done)</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">No Show / Cancelled</p>
            <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{cancelledCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <XCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* FILTER & TOOLBAR HEADER */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border shadow-sm">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            All ({totalCount})
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "upcoming"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Upcoming ({upcomingCount})
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "completed"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Demo Given ({completedCount})
          </button>

          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "cancelled"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Cancelled / No Show ({cancelledCount})
          </button>
        </div>

        {/* Search & Manage Availability Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={() => setShowBlackoutModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-all whitespace-nowrap"
          >
            <Ban className="h-4 w-4" />
            <span>Manage Slot Availability</span>
          </button>
        </div>
      </div>

      {/* APPOINTMENTS TABLE */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground p-6">
            <CalendarDays className="h-10 w-10 mb-3 text-muted-foreground/40" />
            <p className="text-sm font-semibold">No appointments match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">Client Information</th>
                  <th className="px-6 py-4 font-bold">Company & Industry</th>
                  <th className="px-6 py-4 font-bold">Appointment Time (IST)</th>
                  <th className="px-6 py-4 font-bold">Update Status</th>
                  <th className="px-6 py-4 font-bold text-right">Notes & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    
                    {/* Client Info */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-foreground text-sm">{user.name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 text-primary/70" />
                          <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Company & Industry */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-bold">{user.company || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span className="px-2 py-0.5 rounded-full bg-muted border text-[11px] font-semibold">{user.industry || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Appointment Time */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center leading-none shadow-sm border border-primary/20">
                          <span className="text-[10px] font-bold uppercase mb-0.5">{format(new Date(user.appointment_time), "MMM")}</span>
                          <span className="text-base font-black">{format(new Date(user.appointment_time), "dd")}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold text-foreground text-sm">
                            {format(new Date(user.appointment_time), "h:mm a IST")}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Booked {format(new Date(user.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4">
                      <div className="relative inline-block text-left">
                        <select
                          value={user.status === "booked" ? "upcoming" : user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all ${
                            user.status === "completed" || user.status === "demo_given"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : user.status === "no_show"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              : user.status === "cancelled"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                          }`}
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="completed">Demo Given (Done)</option>
                          <option value="no_show">No Show</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    {/* Admin Notes & Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUserForNotes(user);
                          setNotesInput(user.admin_notes || "");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold transition-all"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span>{user.admin_notes ? "View/Edit Notes" : "+ Add Note"}</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADMIN NOTES MODAL */}
      {selectedUserForNotes && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-extrabold text-foreground">Demo Notes for {selectedUserForNotes.name}</h3>
              <button onClick={() => setSelectedUserForNotes(null)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <p><b>Company:</b> {selectedUserForNotes.company} • <b>Industry:</b> {selectedUserForNotes.industry}</p>
                <p><b>Appointment:</b> {format(new Date(selectedUserForNotes.appointment_time), "PPPP 'at' p")}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Internal Demo Notes / Feedback
                </label>
                <textarea
                  rows={4}
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  placeholder="E.g., Client loved the voice AI agent demo. Follow up next Tuesday regarding Pro Plan pricing..."
                  className="w-full p-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setSelectedUserForNotes(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              >
                {isSavingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLOT AVAILABILITY / BLACKOUT MANAGER MODAL */}
      {showBlackoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Ban className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">Manage Slot Availability & Blackouts</h3>
                  <p className="text-xs text-muted-foreground">Block out dates or specific time slots when you are unavailable.</p>
                </div>
              </div>
              <button onClick={() => setShowBlackoutModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Block New Date/Slot Form */}
            <form onSubmit={handleAddBlock} className="bg-muted/40 p-4 rounded-2xl border space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Block a Date or Time Slot</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newBlockDate}
                    onChange={e => setNewBlockDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">Slot Time (Optional)</label>
                  <select
                    value={newBlockTime}
                    onChange={e => setNewBlockTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs"
                  >
                    <option value="">Entire Day (All Slots)</option>
                    <option value="10:00">10:00 AM IST</option>
                    <option value="11:00">11:00 AM IST</option>
                    <option value="12:00">12:00 PM IST</option>
                    <option value="13:00">01:00 PM IST</option>
                    <option value="14:00">02:00 PM IST</option>
                    <option value="15:00">03:00 PM IST</option>
                    <option value="16:00">04:00 PM IST</option>
                    <option value="17:00">05:00 PM IST</option>
                    <option value="18:00">06:00 PM IST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">Reason (Optional)</label>
                  <input
                    type="text"
                    placeholder="Out of Office / Holiday"
                    value={newBlockReason}
                    onChange={e => setNewBlockReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isBlocking}
                className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>{isBlocking ? "Blocking..." : "Block Slot / Date"}</span>
              </button>
            </form>

            {/* Currently Blocked List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Currently Blocked Dates & Slots</h4>
              {blockedSlots.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center border rounded-xl bg-muted/20">
                  No slots currently blocked. All standard slots are active.
                </p>
              ) : (
                <div className="space-y-2">
                  {blockedSlots.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border bg-card text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                          <Ban className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            📅 {b.blocked_date} — {b.slot_time ? `⏰ ${b.slot_time} IST` : "Full Day Blocked"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{b.reason || "Unavailable"}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnblock(b.id)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Unblock Slot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end border-t pt-4">
              <button
                onClick={() => setShowBlackoutModal(false)}
                className="px-5 py-2.5 rounded-xl border text-xs font-bold hover:bg-muted"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
