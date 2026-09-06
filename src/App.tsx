import React, { useState, useEffect, useMemo } from "react";
import { 
  Home, 
  Heart, 
  BookOpen, 
  Wind, 
  Bot, 
  BarChart3, 
  GraduationCap,
  ClipboardCheck,
  BrainCircuit,
  Moon,
  Headphones,
  Building2,
  Lock,
  EyeOff,
  Trash2
} from "lucide-react";
import {
  Header,
  DashboardView,
  MoodTracker,
  JournalView,
  SelfCareActivities,
  AIAssistant,
  ReportsView,
  EmergencyModal,
  AboutModal,
  PTCGuidanceDirectory,
  StandardizedScreener,
  CBTWorksheet,
  SleepHabitsTracker,
  GuidedVoiceMeditation,
  PrivacyShield,
  AuthScreen,
  MentAllyLogo,
} from "./components";
import { MoodEntry, JournalEntry, ScreenerResult } from "./types";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  auth,
  testFirestoreConnection,
  syncUserProfile,
  saveMoodToFirestore,
  fetchMoodsFromFirestore,
  saveJournalToFirestore,
  deleteJournalFromFirestore,
  fetchJournalsFromFirestore,
} from "./lib/firebase";

export type MainTab = 
  | "dashboard" 
  | "mood" 
  | "journal" 
  | "screener" 
  | "cbt" 
  | "habits" 
  | "activities" 
  | "meditation" 
  | "ptc" 
  | "ai" 
  | "reports";

// Sanitizer helpers to remove any legacy demo mock data
const sanitizeSavedMoods = (raw: any[]): MoodEntry[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter((m) => m && m.id !== "m-1" && m.id !== "m-2");
};

const sanitizeSavedJournals = (raw: any[]): JournalEntry[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter((j) => j && j.id !== "j-1");
};

// Calculate real streak strictly from actual user-recorded mood dates
const calculateRealStreak = (moodEntries: MoodEntry[]): number => {
  if (!moodEntries || moodEntries.length === 0) return 0;
  
  const dayTimestamps = Array.from(
    new Set(
      moodEntries.map((m) => new Date(m.timestamp).toISOString().split("T")[0])
    )
  ).sort().reverse();
  
  if (dayTimestamps.length === 0) return 0;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];
  
  // If the user did not check in today or yesterday, streak is zero
  if (dayTimestamps[0] !== todayStr && dayTimestamps[0] !== yesterdayStr) {
    return 0;
  }
  
  let streak = 1;
  let prevDate = new Date(dayTimestamps[0]);
  
  for (let i = 1; i < dayTimestamps.length; i++) {
    const currDate = new Date(dayTimestamps[i]);
    const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      streak++;
      prevDate = currDate;
    } else {
      break;
    }
  }
  return streak;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>("dashboard");
  const [activitiesSubTab, setActivitiesSubTab] = useState<"breathing" | "grounding" | "ambient" | "articles">("breathing");
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Firebase Auth & Live Profile State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Privacy & Camouflage Mode States
  const [isLocked, setIsLocked] = useState(false);
  const [isCamouflageActive, setIsCamouflageActive] = useState(false);

  // Local storage persisted state - defaults to clean empty arrays
  const [moods, setMoods] = useState<MoodEntry[]>(() => {
    try {
      const saved = localStorage.getItem("mentally_moods");
      return saved ? sanitizeSavedMoods(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem("mentally_journals");
      return saved ? sanitizeSavedJournals(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  // Calculate real streak from actual entries
  const streakDays = useMemo(() => calculateRealStreak(moods), [moods]);

  const [activitiesCompletedCount, setActivitiesCompletedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("mentally_activities_count");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Listen to Live Firebase Auth State
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);

      if (user) {
        setShowAuthModal(false);

        // Sync student profile to Firestore
        try {
          await syncUserProfile(user);
        } catch (err) {
          console.warn("Profile sync note:", err);
        }

        // Fetch live moods from Firestore
        try {
          const remoteMoods = await fetchMoodsFromFirestore(user.uid);
          if (remoteMoods && remoteMoods.length > 0) {
            setMoods(remoteMoods);
          }
        } catch (err) {
          console.warn("Could not load moods from Firestore:", err);
        }

        // Fetch live journals from Firestore
        try {
          const remoteJournals = await fetchJournalsFromFirestore(user.uid);
          if (remoteJournals && remoteJournals.length > 0) {
            setJournals(remoteJournals);
          }
        } catch (err) {
          console.warn("Could not load journals from Firestore:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to local storage for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem("mentally_moods", JSON.stringify(moods));
    } catch (e) {}
  }, [moods]);

  useEffect(() => {
    try {
      localStorage.setItem("mentally_journals", JSON.stringify(journals));
    } catch (e) {}
  }, [journals]);

  useEffect(() => {
    try {
      localStorage.setItem("mentally_streak", streakDays.toString());
      localStorage.setItem("mentally_activities_count", activitiesCompletedCount.toString());
    } catch (e) {}
  }, [streakDays, activitiesCompletedCount]);

  // Handlers
  const handleAddMood = (entryData: Omit<MoodEntry, "id" | "timestamp">) => {
    const newEntry: MoodEntry = {
      ...entryData,
      id: "m-" + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setMoods([newEntry, ...moods]);
    if (currentUser) {
      saveMoodToFirestore(currentUser.uid, newEntry);
    }
  };

  const handleDeleteMood = (id: string) => {
    setMoods(moods.filter((m) => m.id !== id));
  };

  const handleAddJournal = (entryData: Omit<JournalEntry, "id" | "timestamp">) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: "j-" + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setJournals([newEntry, ...journals]);
    if (currentUser) {
      saveJournalToFirestore(currentUser.uid, newEntry);
    }
  };

  const handleDeleteJournal = (id: string) => {
    setJournals(journals.filter((j) => j.id !== id));
    if (currentUser) {
      deleteJournalFromFirestore(currentUser.uid, id);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleActivityCompleted = (name: string) => {
    setActivitiesCompletedCount((prev) => prev + 1);
  };

  const handleClearAllData = () => {
    if (window.confirm("Do you want to reset MentAlly to a clean slate? This will clear all locally saved logs from this device.")) {
      localStorage.removeItem("mentally_moods");
      localStorage.removeItem("mentally_journals");
      localStorage.removeItem("mentally_habits");
      localStorage.removeItem("mentally_cbt_records");
      localStorage.removeItem("mentally_screeners");
      localStorage.removeItem("mentally_streak");
      localStorage.removeItem("mentally_activities_count");
      localStorage.removeItem("mentally_pin");
      setMoods([]);
      setJournals([]);
      setActivitiesCompletedCount(0);
      window.location.reload();
    }
  };

  const handleNavigate = (tab: MainTab, subTab?: string) => {
    setActiveTab(tab);
    if (subTab && (subTab === "breathing" || subTab === "grounding" || subTab === "ambient" || subTab === "articles")) {
      setActivitiesSubTab(subTab as any);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Initial Auth Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3.5 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-xs text-center animate-in fade-in">
          <MentAllyLogo size="lg" className="animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-slate-900">MentAlly</h3>
            <p className="text-xs text-slate-500 font-medium">Connecting to your account...</p>
          </div>
          <div className="w-6 h-6 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin mt-1" />
        </div>
      </div>
    );
  }

  // If user is not logged in, present the AuthScreen (strictly no guest sign-in)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased">
        {/* Top Banner with Attribution */}
        <div className="bg-teal-900 text-teal-100 text-[11px] sm:text-xs py-1.5 px-3 text-center font-semibold flex items-center justify-center gap-1.5 tracking-wide">
          <GraduationCap className="w-3.5 h-3.5 text-teal-300 shrink-0" />
          <span>Pateros Technological College</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-3 sm:p-6">
          <AuthScreen onSuccess={() => setShowAuthModal(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased">
      {/* Top Banner with Attribution */}
      <div className="bg-teal-900 text-teal-100 text-[11px] sm:text-xs py-1.5 px-3 text-center font-semibold flex items-center justify-center gap-1.5 tracking-wide">
        <GraduationCap className="w-3.5 h-3.5 text-teal-300 shrink-0" />
        <span>Pateros Technological College</span>
      </div>

      {/* Main Header */}
      <Header
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        streakDays={streakDays}
        isMobileFrame={isMobileFrame}
        onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onToggleCamouflage={() => setIsCamouflageActive(!isCamouflageActive)}
        onLock={() => setIsLocked(true)}
        onResetData={handleClearAllData}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Privacy Shield & Lock Overlay */}
      <PrivacyShield
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        onLock={() => setIsLocked(true)}
        isCamouflageActive={isCamouflageActive}
        onToggleCamouflage={() => setIsCamouflageActive(!isCamouflageActive)}
      />

      {/* Viewport wrapper: Either Phone Frame or Responsive Full Width */}
      <main className={`flex-1 ${isMobileFrame ? "py-4 sm:py-6 flex justify-center items-start px-2" : "max-w-6xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 pb-24"}`}>
        <div
          className={
            isMobileFrame
              ? "phone-mockup-frame w-full max-w-[420px] bg-white rounded-[36px] sm:rounded-[40px] shadow-2xl border-4 sm:border-[10px] border-slate-900 overflow-hidden flex flex-col min-h-[800px] relative pb-20"
              : "w-full"
          }
        >
          {/* Simulated Mobile Status Notch when in phone mode */}
          {isMobileFrame && (
            <div className="w-full bg-slate-900 text-white text-[10px] px-6 py-2 flex items-center justify-between font-mono shrink-0">
              <span>9:41</span>
              <div className="w-20 h-4 bg-slate-800 rounded-full" />
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Tab Navigation Pill Bar (Scrollable on smaller screens) */}
          <div className="px-1 sm:px-0 mb-4 sm:mb-6">
            <nav className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs scrollbar-none touch-pan-x">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "dashboard"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-tab-mood"
                onClick={() => setActiveTab("mood")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "mood"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Mood Track</span>
              </button>

              <button
                id="nav-tab-journal"
                onClick={() => setActiveTab("journal")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "journal"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Journal</span>
              </button>

              <button
                id="nav-tab-screener"
                onClick={() => setActiveTab("screener")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "screener"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Screeners</span>
              </button>

              <button
                id="nav-tab-cbt"
                onClick={() => setActiveTab("cbt")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "cbt"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>CBT Reframe</span>
              </button>

              <button
                id="nav-tab-habits"
                onClick={() => setActiveTab("habits")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "habits"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Sleep & Habits</span>
              </button>

              <button
                id="nav-tab-activities"
                onClick={() => setActiveTab("activities")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "activities"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Wind className="w-4 h-4" />
                <span>Self-Care</span>
              </button>

              <button
                id="nav-tab-meditation"
                onClick={() => setActiveTab("meditation")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "meditation"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Voice Meditation</span>
              </button>

              <button
                id="nav-tab-ptc"
                onClick={() => setActiveTab("ptc")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "ptc"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>PTC Guidance</span>
              </button>

              <button
                id="nav-tab-ai"
                onClick={() => setActiveTab("ai")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "ai"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Companion</span>
              </button>

              <button
                id="nav-tab-reports"
                onClick={() => setActiveTab("reports")}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] active:scale-95 ${
                  activeTab === "reports"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
              </button>
            </nav>
          </div>

          {/* Active View Router */}
          <div className={isMobileFrame ? "px-4 flex-1 overflow-y-auto" : "w-full"}>
            {activeTab === "dashboard" && (
              <DashboardView
                moods={moods}
                journals={journals}
                streakDays={streakDays}
                onNavigateTab={handleNavigate}
                onQuickLogMood={() => setActiveTab("mood")}
                isMobileFrame={isMobileFrame}
              />
            )}

            {activeTab === "mood" && (
              <MoodTracker
                moods={moods}
                onAddMood={handleAddMood}
                onDeleteMood={handleDeleteMood}
                onOpenActivitiesWithSuggestion={(action) => handleNavigate("activities", action)}
              />
            )}

            {activeTab === "journal" && (
              <JournalView
                entries={journals}
                onAddEntry={handleAddJournal}
                onDeleteEntry={handleDeleteJournal}
                currentMoodLabel={moods[0]?.label}
              />
            )}

            {activeTab === "screener" && (
              <StandardizedScreener
                onNavigateGuidance={() => setActiveTab("ptc")}
              />
            )}

            {activeTab === "cbt" && (
              <CBTWorksheet />
            )}

            {activeTab === "habits" && (
              <SleepHabitsTracker />
            )}

            {activeTab === "activities" && (
              <SelfCareActivities
                onActivityCompleted={handleActivityCompleted}
                defaultSubTab={activitiesSubTab}
              />
            )}

            {activeTab === "meditation" && (
              <GuidedVoiceMeditation />
            )}

            {activeTab === "ptc" && (
              <PTCGuidanceDirectory />
            )}

            {activeTab === "ai" && (
              <AIAssistant
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onOpenBreathing={() => handleNavigate("activities", "breathing")}
                onOpenGrounding={() => handleNavigate("activities", "grounding")}
                currentMoodLabel={moods[0]?.label}
              />
            )}

            {activeTab === "reports" && (
              <ReportsView
                moods={moods}
                journals={journals}
                streakDays={streakDays}
                activitiesCompletedCount={activitiesCompletedCount}
              />
            )}
          </div>
        </div>
      </main>

      {/* Floating Bottom Mobile Bar for touch convenience */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex items-center justify-around sm:hidden">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "dashboard" ? "text-teal-700" : "text-slate-400"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab("mood")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "mood" ? "text-teal-700" : "text-slate-400"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Mood</span>
        </button>

        <button
          onClick={() => setActiveTab("screener")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "screener" ? "text-teal-700" : "text-slate-400"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Screener</span>
        </button>

        <button
          onClick={() => setActiveTab("ptc")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "ptc" ? "text-teal-700" : "text-slate-400"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>PTC</span>
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "ai" ? "text-teal-700" : "text-slate-400"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Chat</span>
        </button>
      </div>

      {/* Modals */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onResetData={handleClearAllData}
      />
    </div>
  );
}
