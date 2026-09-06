import React from "react";
import type { User } from "firebase/auth";
import { 
  Heart, 
  ShieldAlert, 
  Smartphone, 
  Monitor, 
  Flame, 
  Info, 
  Trash2, 
  LogOut, 
  LogIn, 
  User as UserIcon 
} from "lucide-react";
import { MentAllyLogo } from "./MentAllyLogo";

interface HeaderProps {
  onOpenEmergency: () => void;
  streakDays: number;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  onOpenAbout: () => void;
  onToggleCamouflage?: () => void;
  onLock?: () => void;
  onResetData?: () => void;
  currentUser?: User | null;
  onSignOut?: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEmergency,
  streakDays,
  isMobileFrame,
  onToggleFrame,
  onOpenAbout,
  onToggleCamouflage,
  onResetData,
  currentUser,
  onSignOut,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 sm:px-6 py-2 sm:py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Modern Compact MentAlly Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <MentAllyLogo size="sm" className="hover:scale-105 transition-transform shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                Ment<span className="text-teal-700">Ally</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 bg-teal-50 text-teal-800 rounded-md border border-teal-200/80">
                PTC
              </span>
            </div>
            <p className="hidden md:block text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
              Student Mental Wellness & Self-Care
            </p>
          </div>
        </div>

        {/* Right action controls - Flexible & Device Adaptive */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Streak badge */}
          <div 
            id="streak-badge"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] sm:text-xs font-bold text-amber-900 shadow-2xs shrink-0 min-h-[36px]"
            title="Active Consecutive Check-in Streak"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span>{streakDays}d</span>
          </div>

          {/* Academic Camouflage */}
          {onToggleCamouflage && (
            <button
              id="header-camouflage-btn"
              onClick={onToggleCamouflage}
              className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0 min-h-[36px] min-w-[36px] justify-center active:scale-95"
              title="Quick Camouflage (Masks screen as PTC IT Lecture Notes)"
              aria-label="Academic Camouflage"
            >
              <span className="text-xs leading-none">📖</span>
              <span className="hidden md:inline text-[11px] font-semibold">Camouflage</span>
            </button>
          )}

          {/* Device frame switcher for testing viewports on desktop */}
          <button
            id="toggle-view-frame-btn"
            onClick={onToggleFrame}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors min-h-[36px]"
            title={isMobileFrame ? "Switch to Full Layout" : "Preview Mobile Frame"}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-[11px]">Full</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-[11px]">Phone</span>
              </>
            )}
          </button>

          {/* Quick Clear All Data / Reset */}
          {onResetData && (
            <button
              id="reset-records-btn"
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95"
              title="Clear all saved records (Fresh start)"
              aria-label="Reset all records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* About / Academic Capsule Info */}
          <button
            id="open-about-btn"
            onClick={onOpenAbout}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95"
            title="System Info & Academic Details"
            aria-label="About MentAlly"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Emergency SOS hotline */}
          <button
            id="emergency-sos-btn"
            onClick={onOpenEmergency}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-[11px] sm:text-xs font-bold shadow-xs transition-all shrink-0 min-h-[36px]"
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Crisis Lines</span>
            <span className="sm:hidden">SOS</span>
          </button>

          {/* User Account / Profile Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200 shrink-0">
              <div 
                className="flex items-center gap-1.5 p-1 sm:pr-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[36px]"
                title={`Signed in as ${currentUser.displayName || currentUser.email}`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "User"}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-teal-600 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0">
                    {(currentUser.displayName || currentUser.email || "S").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline text-[11px] font-semibold text-slate-700 max-w-[85px] truncate">
                  {currentUser.displayName?.split(" ")[0] || currentUser.email?.split("@")[0]}
                </span>
              </div>

              {onSignOut && (
                <button
                  id="header-signout-btn"
                  onClick={onSignOut}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95"
                  title="Sign out from MentAlly"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                id="header-signin-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-[11px] sm:text-xs font-bold shadow-xs transition-all shrink-0 min-h-[36px] active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
