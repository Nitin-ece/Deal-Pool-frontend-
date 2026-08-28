import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { getErrorMessage } from "../lib/errors";
import { UserProfile } from "../types";
import {
  Shield,
  ShieldAlert,
  Users,
  Search,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Lock,
  FileText,
  ShieldCheck,
  Scale,
  RefreshCw,
} from "lucide-react";

export function Admin() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<"users" | "reports">("users");

  // Dispute resolution state
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [decision, setDecision] = useState<"damage" | "dismissed" | "overcharge">("damage");
  const [damageAward, setDamageAward] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<any, UserProfile[]>("/admin/users");
      setUsers(data || []);
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to load admin user directory."));
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<any, any[]>("/admin/reports");
      setReports(data || []);
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to load admin reports."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "users") {
        fetchUsers();
      } else {
        fetchReports();
      }
    }
  }, [isAdmin, activeTab]);

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    setError(null);
    setSuccessMsg(null);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setSuccessMsg(`Role updated to ${newRole}`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to update role"));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this profile?")) return;
    setError(null);
    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccessMsg("User profile deleted.");
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to delete user profile"));
    }
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setError(null);
    setSuccessMsg(null);
    try {
      await api.patch(`/admin/reports/${selectedReport.id}/resolve`, {
        decision,
        damageAward,
        notes,
      });
      setSuccessMsg("Dispute report resolved successfully.");
      setSelectedReport(null);
      setNotes("");
      setDamageAward(0);
      fetchReports();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to resolve dispute"));
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[var(--ink)]">Admin Access Required</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          This section is restricted to accounts with the <code className="text-[var(--signal)] font-bold">admin</code> role.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/30 mb-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Platform Governance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight font-display">
            Platform Management & Disputes
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Admin oversight on authentication accounts, profiles, and contract condition disputes.
          </p>
        </div>

        <button
          onClick={activeTab === "users" ? fetchUsers : fetchReports}
          className="px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--line)] hover:bg-[var(--line)]/30 text-xs font-bold text-[var(--ink)] shadow-2xs cursor-pointer transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--line)] gap-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "users"
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "reports"
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Disputes & Reports ({reports.length})</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/30 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 p-3.5 rounded-2xl border border-rose-500/30 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Content: User Directory */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Aggregate Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--line)] shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Total Users</div>
              <div className="text-2xl font-black text-[var(--ink)] mt-1">{users.length}</div>
            </div>
            <div className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--line)] shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Administrators</div>
              <div className="text-2xl font-black text-emerald-500 mt-1">
                {users.filter((u) => u.role === "admin").length}
              </div>
            </div>
            <div className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--line)] shadow-2xs col-span-2 sm:col-span-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Active Lenders</div>
              <div className="text-2xl font-black text-[var(--ink)] mt-1">
                {users.filter((u) => (u.rating_count ?? 0) > 0).length}
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <div className="bg-[var(--surface)] rounded-3xl p-4 border border-[var(--line)] shadow-2xs">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by username or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--paper)] rounded-2xl text-xs sm:text-sm text-[var(--ink)] border border-[var(--line)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-[var(--surface)] rounded-3xl border border-[var(--line)] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--paper)] text-[var(--muted)] uppercase font-bold text-[10px] tracking-wider border-b border-[var(--line)]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[var(--muted)]">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[var(--muted)]">
                        No users match search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[var(--paper)]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            {u.profile_photo ? (
                              <img
                                src={u.profile_photo}
                                alt={u.username}
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-full object-cover border border-[var(--line)]"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[var(--paper)] text-emerald-500 font-bold text-xs flex items-center justify-center border border-[var(--line)]">
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-bold text-[var(--ink)]">{u.username}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[var(--muted)]">{u.email}</td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              u.role === "admin"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)]"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[var(--ink)] font-semibold">
                          {u.avg_rating != null
                            ? `${Number(u.avg_rating).toFixed(1)}★ (${u.rating_count})`
                            : "N/A"}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {u.role === "user" ? (
                              <button
                                type="button"
                                onClick={() => handleRoleChange(u.id, "admin")}
                                className="px-2.5 py-1 rounded-lg bg-[var(--paper)] hover:bg-[var(--signal)] hover:text-white text-[var(--ink)] text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Promote to Admin
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRoleChange(u.id, "user")}
                                disabled={u.id === user?.id}
                                className="px-2.5 py-1 rounded-lg bg-[var(--paper)] hover:bg-[var(--line)] text-[var(--muted)] text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-30"
                              >
                                Demote to User
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.id === user?.id}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-30"
                              title="Delete User Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Disputes & Reports */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--line)] shadow-2xs">
            <h3 className="font-bold text-sm text-[var(--ink)]">Active Governance Claims</h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              Analyze damage claims, overcharges, or delayed returns and release the locked escrow appropriately.
            </p>
          </div>

          <div className="space-y-3.5">
            {loading ? (
              <div className="text-center py-12 text-xs text-[var(--muted)] font-semibold">
                Loading dispute reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16 bg-[var(--surface)] rounded-3xl border border-[var(--line)] p-8">
                <p className="text-xs font-bold text-[var(--ink)]">No dispute reports found.</p>
                <p className="text-xs text-[var(--muted)] mt-1">All neighborhood exchanges are running smoothly!</p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--line)] shadow-2xs hover:border-[var(--line)]/65 transition flex flex-col md:flex-row justify-between gap-5"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {report.reason}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">
                        Report ID: <span className="font-mono">{report.id.slice(0, 8)}...</span>
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          report.status === "pending"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[var(--ink)] leading-snug">
                      Claim Description: <span className="font-normal text-[var(--muted)]">{report.description}</span>
                    </h4>

                    <div className="text-xs text-[var(--muted)] space-y-1">
                      <p>
                        Reporter UID: <span className="font-mono font-bold text-[var(--ink)]">{report.reporter_id}</span>
                      </p>
                      <p>
                        Linked Contract:{" "}
                        <a
                          href={`/contracts/${report.contract_id}`}
                          className="font-mono text-emerald-500 font-bold hover:underline"
                        >
                          {report.contract_id}
                        </a>
                      </p>
                      <p>Filed at: {new Date(report.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {report.status === "pending" && (
                    <div className="shrink-0 flex items-end">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                      >
                        Resolve Dispute
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dispute Resolution Dialog */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleResolveDispute}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-display text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-500" />
              <span>Resolve Active Dispute Claim</span>
            </h3>

            <p className="text-xs text-[var(--muted)] font-normal leading-relaxed">
              Decide the outcome of the dispute. The damage award will be deducted from the borrower's locked security deposit and transferred to the provider. The remaining deposit is refunded.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                  Resolution Outcome
                </label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs font-bold text-[var(--ink)] focus:outline-none"
                >
                  <option value="damage">Uphold Damage Claim</option>
                  <option value="dismissed">Dismiss Claim (Refund Escrow)</option>
                  <option value="overcharge">Uphold Borrower Overcharge</option>
                </select>
              </div>

              {decision === "damage" && (
                <div>
                  <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                    Damage Award Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={damageAward}
                    onChange={(e) => setDamageAward(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs font-semibold text-[var(--ink)] focus:outline-none placeholder:text-[var(--muted)]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                  Resolution Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain details of resolution decision..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-[var(--muted)] leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)]/50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !notes.trim()}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Submit Resolution Decision
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Admin;
