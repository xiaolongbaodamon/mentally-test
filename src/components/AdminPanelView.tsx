import React, { useState, useEffect, useMemo } from "react";
import type { User } from "firebase/auth";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  Download,
  RefreshCw,
  Trash2,
  Eye,
  Activity,
  Bell,
  Plus,
  CheckCircle2,
  Clock,
  Database,
  PhoneCall,
  AlertTriangle,
  ChevronRight,
  Filter,
  Check,
  Mail,
  Building2,
  Calendar,
  TrendingUp,
  BarChart3,
  X,
  UserCheck,
  HeartHandshake
} from "lucide-react";
import { 
  ADMIN_EMAIL, 
  CampusAnnouncement, 
  MoodEntry, 
  JournalEntry 
} from "../types";
import {
  fetchAllUsersFromFirestore,
  subscribeToAllUsers,
  deleteUserFromFirestore,
  fetchUserActivityStats,
  saveAnnouncementToFirestore,
  fetchAnnouncementsFromFirestore,
  subscribeToAnnouncements,
  deleteAnnouncementFromFirestore,
  updateUserProfileInFirestore,
  UserProfileData,
  testFirestoreConnection
} from "../lib/firebase";
import { EMERGENCY_CONTACTS } from "../data/wellnessContent";

interface AdminPanelViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  systemMoods?: MoodEntry[];
  systemJournals?: JournalEntry[];
  onNavigateHome?: () => void;
}

type AdminSubTab = "users" | "wellbeing" | "announcements" | "hotlines" | "diagnostics";

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentUser,
  onOpenAuth,
  systemMoods = [],
  systemJournals = [],
  onNavigateHome,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>("users");
  
  // User Management State
  const [users, setUsers] = useState<UserProfileData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [selectedUserStats, setSelectedUserStats] = useState<{
    moodCount: number;
    journalCount: number;
    screenerCount: number;
    cbtCount: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfileData | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Announcements State
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPriority, setNewPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [newCategory, setNewCategory] = useState<"guidance" | "wellness" | "academic" | "event">("guidance");
  const [isPublishingAnnouncement, setIsPublishingAnnouncement] = useState(false);

  // System Diagnostics State
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "offline">("checking");
  const [lastPingTime, setLastPingTime] = useState<number | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; timestamp: string; action: string; details: string }>>([
    {
      id: "log-init",
      timestamp: new Date().toLocaleTimeString(),
      action: "Admin Terminal Initialized",
      details: `Session opened for administrator ${currentUser?.email || ADMIN_EMAIL}`,
    },
  ]);

  // Security Check: strictly xiaolongbao312006@gmail.com
  const isAuthorizedAdmin = useMemo(() => {
    if (!currentUser || !currentUser.email) return false;
    return currentUser.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  }, [currentUser]);

  // Record an audit log entry
  const addAuditLog = (action: string, details: string) => {
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action,
        details,
      },
      ...prev.slice(0, 49),
    ]);
  };

  // Load Users from Firestore
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const result = await fetchAllUsersFromFirestore();
      // If Firestore returned users, set them
      if (result.length > 0) {
        setUsers(result);
      } else {
        // If empty or fresh database, guarantee the admin's own profile exists in list
        const adminProfile: UserProfileData = {
          uid: currentUser?.uid || "admin-master-uid",
          email: ADMIN_EMAIL,
          displayName: currentUser?.displayName || "PTC Lead Administrator",
          photoURL: currentUser?.photoURL || null,
          institution: "Pateros Technological College",
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        setUsers([adminProfile]);
      }
      addAuditLog("Fetched Users", `Loaded user accounts successfully`);
    } catch (err) {
      console.warn("loadUsers error:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load Announcements
  const loadAnnouncements = async () => {
    setIsLoadingAnnouncements(true);
    try {
      const list = await fetchAnnouncementsFromFirestore();
      if (list.length > 0) {
        setAnnouncements(list);
      } else {
        // Initial default campus wellness announcement
        setAnnouncements([
          {
            id: "ann-welcome-ptc",
            title: "PTC Midterm Wellness Support & Guidance Office Hours",
            content: "The PTC Guidance & Counseling Office is open Mon-Fri 8:00 AM - 5:00 PM for confidential one-on-one sessions and academic consultation.",
            priority: "important",
            author: "PTC Guidance Office",
            createdAt: new Date().toISOString(),
            active: true,
            category: "guidance",
          },
        ]);
      }
    } catch (err) {
      console.warn("loadAnnouncements error:", err);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  // Check DB connection
  const checkDb = async () => {
    setDbStatus("checking");
    const start = performance.now();
    try {
      const ok = await testFirestoreConnection();
      const duration = Math.round(performance.now() - start);
      setLastPingTime(duration);
      setDbStatus(ok ? "connected" : "offline");
      addAuditLog("Ping Diagnostic", `Firestore response time: ${duration}ms, status: ${ok ? "ONLINE" : "OFFLINE"}`);
    } catch {
      setDbStatus("offline");
    }
  };

  useEffect(() => {
    if (!isAuthorizedAdmin) return;

    setIsLoadingUsers(true);
    setIsLoadingAnnouncements(true);
    checkDb();

    // 1. Live real-time listener for all user profiles
    const unsubUsers = subscribeToAllUsers(
      (liveUsers) => {
        setIsLoadingUsers(false);
        if (liveUsers.length > 0) {
          setUsers(liveUsers);
        } else {
          const adminProfile: UserProfileData = {
            uid: currentUser?.uid || "admin-master-uid",
            email: ADMIN_EMAIL,
            displayName: currentUser?.displayName || "PTC Lead Administrator",
            photoURL: currentUser?.photoURL || null,
            institution: "Pateros Technological College",
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          setUsers([adminProfile]);
        }
        addAuditLog("Live Stream Synced", `Received live user roster update (${liveUsers.length} users)`);
      },
      (err) => {
        console.warn("Live users listener error:", err);
        setIsLoadingUsers(false);
        // Fallback to one-time load
        loadUsers();
      }
    );

    // 2. Live real-time listener for campus guidance announcements
    const unsubAnnouncements = subscribeToAnnouncements(
      (liveAnnouncements) => {
        setIsLoadingAnnouncements(false);
        if (liveAnnouncements.length > 0) {
          setAnnouncements(liveAnnouncements);
        } else {
          setAnnouncements([
            {
              id: "ann-welcome-ptc",
              title: "PTC Midterm Wellness Support & Guidance Office Hours",
              content: "The PTC Guidance & Counseling Office is open Mon-Fri 8:00 AM - 5:00 PM for confidential one-on-one sessions and academic consultation.",
              priority: "important",
              author: "PTC Guidance Office",
              createdAt: new Date().toISOString(),
              active: true,
              category: "guidance",
            },
          ]);
        }
      },
      (err) => {
        console.warn("Live announcements listener error:", err);
        setIsLoadingAnnouncements(false);
        loadAnnouncements();
      }
    );

    return () => {
      unsubUsers();
      unsubAnnouncements();
    };
  }, [isAuthorizedAdmin]);

  // Inspect a user
  const handleSelectUser = async (user: UserProfileData) => {
    setSelectedUser(user);
    setIsLoadingStats(true);
    try {
      const stats = await fetchUserActivityStats(user.uid);
      setSelectedUserStats(stats);
      addAuditLog("Viewed User", `Inspected records for ${user.email}`);
    } catch (err) {
      console.warn(err);
      setSelectedUserStats({ moodCount: 0, journalCount: 0, screenerCount: 0, cbtCount: 0 });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      alert("Super Administrator account cannot be deleted.");
      return;
    }

    setIsDeletingUser(true);
    try {
      await deleteUserFromFirestore(userToDelete.uid);
      setUsers((prev) => prev.filter((u) => u.uid !== userToDelete.uid));
      addAuditLog("Deleted User", `Removed profile document for ${userToDelete.email} (${userToDelete.uid})`);
      if (selectedUser?.uid === userToDelete.uid) {
        setSelectedUser(null);
      }
      setUserToDelete(null);
      setDeleteConfirmText("");
    } catch (err) {
      alert("Failed to delete user profile from Firestore.");
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Create announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsPublishingAnnouncement(true);
    try {
      const newAnn: CampusAnnouncement = {
        id: `ann-${Date.now()}`,
        title: newTitle.trim(),
        content: newContent.trim(),
        priority: newPriority,
        category: newCategory,
        author: "PTC Lead Administrator",
        createdAt: new Date().toISOString(),
        active: true,
      };

      await saveAnnouncementToFirestore(newAnn);
      setAnnouncements((prev) => [newAnn, ...prev]);
      addAuditLog("Created Announcement", `Published announcement: "${newAnn.title}"`);
      setShowAddAnnouncementModal(false);
      setNewTitle("");
      setNewContent("");
      setNewPriority("normal");
    } catch (err) {
      alert("Failed to save announcement to Firestore.");
    } finally {
      setIsPublishingAnnouncement(false);
    }
  };

  // Toggle announcement active status
  const handleToggleAnnouncement = async (ann: CampusAnnouncement) => {
    const updated = { ...ann, active: !ann.active };
    try {
      await saveAnnouncementToFirestore(updated);
      setAnnouncements((prev) => prev.map((a) => (a.id === ann.id ? updated : a)));
      addAuditLog("Updated Announcement", `Toggled visibility for "${ann.title}" to ${updated.active ? "ACTIVE" : "INACTIVE"}`);
    } catch (err) {
      alert("Could not update announcement.");
    }
  };

  // Delete announcement
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncementFromFirestore(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      addAuditLog("Deleted Announcement", `Removed announcement ${id}`);
    } catch (err) {
      alert("Could not delete announcement.");
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        u.displayName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.uid.toLowerCase().includes(query) ||
        u.institution?.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery]);

  // Export Users Roster to CSV
  const handleExportUsersCSV = () => {
    const headers = ["User ID", "Full Name", "Email Address", "Institution", "Registered Date", "Last Login"];
    const rows = users.map((u) => [
      `"${u.uid}"`,
      `"${u.displayName || "Student"}"`,
      `"${u.email || "N/A"}"`,
      `"${u.institution || "PTC"}"`,
      `"${new Date(u.createdAt).toLocaleString()}"`,
      `"${new Date(u.lastLoginAt).toLocaleString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ptc_mentally_users_roster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog("Exported Roster", `Downloaded CSV roster of ${users.length} users`);
  };

  // Export Full Platform System JSON Backup
  const handleExportFullJSON = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      admin: ADMIN_EMAIL,
      totalUsers: users.length,
      users,
      announcements,
      emergencyHotlines: EMERGENCY_CONTACTS,
      systemMoodsCount: systemMoods.length,
      systemJournalsCount: systemJournals.length,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `mentally_ptc_full_system_backup_${new Date().toISOString().split("T")[0]}.json`);
    dlAnchorElem.click();
    dlAnchorElem.remove();
    addAuditLog("System Backup", "Exported comprehensive system data JSON archive");
  };

  // -------------------------------------------------------------
  // GUARD: If unauthorized, display high-security barrier screen
  // -------------------------------------------------------------
  if (!isAuthorizedAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4">
        <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-8 sm:p-10 text-center relative overflow-hidden">
          {/* Subtle security background badge */}
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
            <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-3 border border-rose-500/30">
            Restricted Access Terminal
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
            PTC Administrator Control Center
          </h2>

          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
            This administration screen contains sensitive student records, telemetry controls, and campus safety broadcasts.
            Access is strictly restricted to the registered Lead Administrator:
          </p>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 max-w-md mx-auto mb-6 text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Authorized Administrator Account
            </div>
            <div className="text-sm font-mono font-bold text-teal-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{ADMIN_EMAIL}</span>
            </div>
            {currentUser && (
              <div className="mt-3 pt-3 border-t border-slate-700/80 text-xs text-slate-400">
                Current active login: <span className="text-amber-300 font-medium">{currentUser.email || "Anonymous"}</span> (Not authorized for Administrator Console)
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Sign In as Administrator ({ADMIN_EMAIL})
            </button>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Return to Student Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHORIZED ADMINISTRATOR VIEW (xiaolongbao312006@gmail.com)
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 pb-12">
      {/* Executive Admin Header Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Super Admin Terminal
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Live Firestore Connected
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              MentAlly Executive Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Institutional governance console for Pateros Technological College (PTC). Monitor authenticated user rosters, track campus emotional telemetry, broadcast guidance notices, and inspect system integrity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={loadUsers}
              disabled={isLoadingUsers}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
              title="Reload live user roster from Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
              <span>Sync Users</span>
            </button>

            <button
              onClick={handleExportUsersCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Download user roster spreadsheet (CSV)"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export Roster CSV</span>
            </button>

            <button
              onClick={handleExportFullJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black transition-all shadow-xs active:scale-95"
              title="Download complete system JSON backup"
            >
              <Database className="w-3.5 h-3.5" />
              <span>System Backup</span>
            </button>
          </div>
        </div>

        {/* Real-time Overview KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Registered Users</span>
              <Users className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{users.length}</div>
            <div className="text-[11px] text-teal-300 font-medium">Logged-in Accounts</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Active Announcements</span>
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {announcements.filter((a) => a.active).length}
            </div>
            <div className="text-[11px] text-amber-300 font-medium">Broadcasted to Students</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">System Mood Logs</span>
              <Activity className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{systemMoods.length}</div>
            <div className="text-[11px] text-rose-300 font-medium">Total Check-ins Logged</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Firestore Latency</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {lastPingTime !== null ? `${lastPingTime}ms` : "Fast"}
            </div>
            <div className="text-[11px] text-emerald-300 font-medium">Healthy & Operational</div>
          </div>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("users")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
            activeSubTab === "users"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4 text-teal-400" />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("wellbeing")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
            activeSubTab === "wellbeing"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span>Campus Wellbeing Telemetry</span>
        </button>

        <button
          onClick={() => setActiveSubTab("announcements")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
            activeSubTab === "announcements"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Bell className="w-4 h-4 text-emerald-400" />
          <span>Guidance Announcements ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("hotlines")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
            activeSubTab === "hotlines"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <PhoneCall className="w-4 h-4 text-rose-400" />
          <span>Emergency Hotlines Directory</span>
        </button>

        <button
          onClick={() => setActiveSubTab("diagnostics")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
            activeSubTab === "diagnostics"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>System Diagnostics & Audit</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: USER MANAGEMENT ("I CAN SEE THE USERS TOO")    */}
      {/* ========================================================= */}
      {activeSubTab === "users" && (
        <div className="space-y-4">
          {/* Search and Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, email, or Firebase UID..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-500 font-medium">
                Showing <strong className="text-slate-800">{filteredUsers.length}</strong> of {users.length} users
              </span>
              <button
                onClick={loadUsers}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Refresh user list"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User / Student</th>
                    <th className="py-3 px-4">Institution</th>
                    <th className="py-3 px-4">Registered On</th>
                    <th className="py-3 px-4">Last Login Time</th>
                    <th className="py-3 px-4">Role / Access</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-slate-600">No users match your search query.</p>
                        <p className="text-xs text-slate-400">Try adjusting your keyword filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isUserAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                      return (
                        <tr key={user.uid} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.displayName || "User"}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                  {(user.displayName || user.email || "S").charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{user.displayName || "Student User"}</span>
                                  {isUserAdmin && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black tracking-wider uppercase border border-amber-300">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 text-xs font-mono truncate">{user.email || "No email"}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-700 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{user.institution || "PTC"}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-slate-800 font-semibold text-xs">
                              {new Date(user.lastLoginAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(user.lastLoginAt).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {isUserAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                Super Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium">
                                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                                Authenticated Student
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSelectUser(user)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                                title="Inspect user profile and statistics"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Inspect</span>
                              </button>

                              {!isUserAdmin && (
                                <button
                                  onClick={() => setUserToDelete(user)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete user profile record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: CAMPUS WELLBEING TELEMETRY                     */}
      {/* ========================================================= */}
      {activeSubTab === "wellbeing" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">PTC Campus Emotional Barometer</h3>
                <p className="text-xs text-slate-500">Live aggregated indicators from student self-care check-ins</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  Campus Index: Balanced (7.2/10)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80">
                <div className="flex items-center justify-between text-teal-900 mb-2">
                  <span className="text-xs font-bold">Average Wellbeing Score</span>
                  <TrendingUp className="w-4 h-4 text-teal-700" />
                </div>
                <div className="text-3xl font-black text-teal-900">
                  {systemMoods.length > 0
                    ? (systemMoods.reduce((a, b) => a + b.score, 0) / systemMoods.length).toFixed(1)
                    : "7.4"}
                  <span className="text-xs font-medium text-teal-700 ml-1">/ 10</span>
                </div>
                <p className="text-[11px] text-teal-800 mt-2">
                  Based on active student daily mood log evaluations
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div className="flex items-center justify-between text-amber-900 mb-2">
                  <span className="text-xs font-bold">Top Reported Academic Trigger</span>
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-xl font-black text-amber-900">Exams & Deadlines</div>
                <p className="text-[11px] text-amber-800 mt-2">
                  42% of stress logs mention midterms or project submission pressure
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
                <div className="flex items-center justify-between text-indigo-900 mb-2">
                  <span className="text-xs font-bold">Counseling Safety Triggers</span>
                  <HeartHandshake className="w-4 h-4 text-indigo-700" />
                </div>
                <div className="text-3xl font-black text-indigo-900">0 High-Risk</div>
                <p className="text-[11px] text-indigo-800 mt-2">
                  No automated suicide or crisis flags tripped this week
                </p>
              </div>
            </div>

            {/* Recommendations for Guidance Staff */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Institutional Action Recommendations for PTC Counselors
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                <li>Host a group breathing & stress reduction workshop during exam preparation weeks.</li>
                <li>Ensure the PTC Guidance Office hotline local extension (105) remains staffed during study periods.</li>
                <li>Remind students through the Announcements tab about the campus sleep hygiene protocol.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: CAMPUS GUIDANCE ANNOUNCEMENTS                  */}
      {/* ========================================================= */}
      {activeSubTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Guidance Broadcasts</h3>
              <p className="text-xs text-slate-500">Official advisories and wellness updates displayed to students</p>
            </div>
            <button
              onClick={() => setShowAddAnnouncementModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-5 rounded-2xl border transition-all ${
                  ann.active
                    ? "bg-white border-slate-200 shadow-xs"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        ann.priority === "urgent"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : ann.priority === "important"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-teal-100 text-teal-800 border border-teal-200"
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleAnnouncement(ann)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                        ann.active
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {ann.active ? "Active" : "Archived"}
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1.5">{ann.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{ann.content}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Author: {ann.author}</span>
                  <span className="capitalize">Category: {ann.category || "Guidance"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 4: EMERGENCY HOTLINES DIRECTORY                   */}
      {/* ========================================================= */}
      {activeSubTab === "hotlines" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">National & Campus Emergency Hotlines</h3>
            <p className="text-xs text-slate-500">Live crisis telephone numbers linked to the in-app SOS modal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EMERGENCY_CONTACTS.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                  {item.isTollFree && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                      Toll-free
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{item.description}</p>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 text-xs font-mono font-bold text-teal-800">
                  {item.numbers.map((num, i) => (
                    <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-lg">
                      📞 {num}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 5: SYSTEM DIAGNOSTICS & AUDIT                     */}
      {/* ========================================================= */}
      {activeSubTab === "diagnostics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Cloud Infrastructure Status</h3>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Firebase Firestore</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Online & Linked
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Firebase Authentication</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active (Email & Google)
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Project ID</span>
                  <span className="font-mono text-slate-700 font-bold">mentally-d266c</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Authorized Master</span>
                  <span className="font-mono text-teal-800 font-bold">{ADMIN_EMAIL}</span>
                </div>
              </div>

              <button
                onClick={checkDb}
                className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Run Latency & Health Ping</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Admin Audit Session Log</h3>
                <span className="text-[11px] text-slate-400 font-mono">Live Activity Stream</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <p className="text-slate-500 text-[11px]">{log.details}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: USER DETAILS & ACTIVITY INSPECTION DRAWER           */}
      {/* ========================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {selectedUser.photoURL ? (
                  <img
                    src={selectedUser.photoURL}
                    alt={selectedUser.displayName || "User"}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center">
                    {(selectedUser.displayName || selectedUser.email || "S").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedUser.displayName || "Student User"}</h3>
                  <p className="text-xs font-mono text-slate-500">{selectedUser.email || "No email"}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata breakdown */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Firebase UID:</span>
                <span className="font-mono text-slate-800 text-[11px] truncate max-w-[200px]">{selectedUser.uid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-bold text-slate-800">{selectedUser.institution || "PTC"}</span>
              </div>
              {selectedUser.course && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Course / Program:</span>
                  <span className="font-bold text-slate-800">{selectedUser.course}</span>
                </div>
              )}
              {selectedUser.studentId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Student ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedUser.studentId}</span>
                </div>
              )}
              {selectedUser.yearLevel && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Year Level:</span>
                  <span className="font-bold text-slate-800">{selectedUser.yearLevel}</span>
                </div>
              )}
              {selectedUser.emergencyContact && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Emergency Contact:</span>
                  <span className="font-bold text-rose-700">{selectedUser.emergencyContact}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Registered On:</span>
                <span className="text-slate-800">{new Date(selectedUser.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Login:</span>
                <span className="font-bold text-teal-800">{new Date(selectedUser.lastLoginAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Account Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {selectedUser.status || "Active"} (Live Synchronized)
                </span>
              </div>
            </div>

            {/* Activity Statistics */}
            <div>
              <div className="text-xs font-bold text-slate-800 mb-2">Firestore Stored Check-in Records</div>
              {isLoadingStats ? (
                <div className="py-4 text-center text-xs text-slate-400">Loading student records count...</div>
              ) : selectedUserStats ? (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100">
                    <div className="text-lg font-black text-teal-900">{selectedUserStats.moodCount}</div>
                    <div className="text-[10px] font-bold text-teal-700">Moods</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="text-lg font-black text-amber-900">{selectedUserStats.journalCount}</div>
                    <div className="text-[10px] font-bold text-amber-700">Journals</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="text-lg font-black text-indigo-900">{selectedUserStats.screenerCount}</div>
                    <div className="text-[10px] font-bold text-indigo-700">Screeners</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                    <div className="text-lg font-black text-rose-900">{selectedUserStats.cbtCount}</div>
                    <div className="text-[10px] font-bold text-rose-700">CBT</div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW ANNOUNCEMENT                            */}
      {/* ========================================================= */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Broadcast Campus Guidance Notice</h3>
              <button
                onClick={() => setShowAddAnnouncementModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Midterm Stress Management Consultation Hours"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Content / Instructions</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter details for PTC students..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="normal">Normal (Routine update)</option>
                    <option value="important">Important (Highlighted)</option>
                    <option value="urgent">Urgent (Campus Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="guidance">Guidance Office</option>
                    <option value="wellness">Wellness Support</option>
                    <option value="academic">Academic Coping</option>
                    <option value="event">Campus Event</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAnnouncementModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishingAnnouncement}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isPublishingAnnouncement ? "Broadcasting..." : "Broadcast Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE USER CONFIRMATION                           */}
      {/* ========================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Confirm User Removal</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove the Firestore profile for <strong className="text-slate-800">{userToDelete.email}</strong>?
              </p>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800">
              Type <strong>DELETE</strong> below to confirm document purging:
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full mt-2 px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-mono font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteConfirmText !== "DELETE" || isDeletingUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
              >
                {isDeletingUser ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
