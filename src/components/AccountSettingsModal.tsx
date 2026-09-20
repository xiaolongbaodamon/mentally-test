import React, { useState, useEffect } from "react";
import { 
  X, 
  User as UserIcon, 
  Building2, 
  IdCard, 
  GraduationCap, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ShieldCheck,
  Zap
} from "lucide-react";
import type { User } from "firebase/auth";
import type { UserProfileData } from "../types";
import { updateUserProfileInFirestore } from "../lib/firebase";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  currentProfile?: UserProfileData | null;
  onProfileUpdated?: (updated: UserProfileData) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentProfile,
  onProfileUpdated,
}) => {
  const [displayName, setDisplayName] = useState("");
  const [institution, setInstitution] = useState("Pateros Technological College");
  const [course, setCourse] = useState("");
  const [studentId, setStudentId] = useState("");
  const [yearLevel, setYearLevel] = useState("1st Year");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Sync inputs with current profile data
  useEffect(() => {
    if (isOpen && currentUser) {
      setDisplayName(currentProfile?.displayName || currentUser.displayName || "");
      setInstitution(currentProfile?.institution || "Pateros Technological College");
      setCourse(currentProfile?.course || "");
      setStudentId(currentProfile?.studentId || "");
      setYearLevel(currentProfile?.yearLevel || "1st Year");
      setEmergencyContact(currentProfile?.emergencyContact || "");
      setSuccessMessage("");
      setErrorMessage("");
    }
  }, [isOpen, currentUser, currentProfile]);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage("Please enter your display name.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updates: Partial<UserProfileData> = {
        displayName: displayName.trim(),
        institution: institution.trim() || "Pateros Technological College",
        course: course.trim(),
        studentId: studentId.trim(),
        yearLevel: yearLevel.trim(),
        emergencyContact: emergencyContact.trim(),
      };

      await updateUserProfileInFirestore(currentUser.uid, updates);

      const mergedProfile: UserProfileData = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: updates.displayName || "Student",
        photoURL: currentUser.photoURL,
        institution: updates.institution || "Pateros Technological College",
        course: updates.course,
        studentId: updates.studentId,
        yearLevel: updates.yearLevel,
        emergencyContact: updates.emergencyContact,
        createdAt: currentProfile?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        status: currentProfile?.status || "Active",
      };

      if (onProfileUpdated) {
        onProfileUpdated(mergedProfile);
      }

      setSuccessMessage("Settings updated live! Instant sync active across all sessions & admin console.");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorMessage("Unable to save changes right now. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-linear-to-r from-teal-50/70 via-emerald-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">Student Account Settings</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Zap className="w-2.5 h-2.5" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[240px] sm:max-w-xs">
                {currentUser.email}
              </p>
            </div>
          </div>
          <button
            id="close-account-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Real-time sync guarantee banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-900 text-xs leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Instant Zero-Refresh Synchronization:</span> Any change you make here updates your account profile immediately on both your client and the PTC Administrator Console.
            </div>
          </div>

          {/* Feedback messages */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Full Name / Display Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="account-display-name-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Juan Dela Cruz"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm transition-all"
                required
              />
            </div>
          </div>

          {/* Institution / College */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Educational Institution
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="account-institution-input"
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g., Pateros Technological College"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm transition-all"
              />
            </div>
          </div>

          {/* Program / Course & Student ID Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Course / Program
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="account-course-input"
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g., BSIT, BSBA, BSOA"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Student ID Number
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="account-student-id-input"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g., PTC-2024-0129"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Year Level & Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Year Level
              </label>
              <select
                id="account-year-level-select"
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm transition-all"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Senior High School">Senior High School</option>
                <option value="Faculty / Staff">Faculty / Staff</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Emergency Contact / Notes
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="account-emergency-contact-input"
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Guardian name or mobile"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              id="account-modal-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all min-h-[40px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="account-modal-save-btn"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow-md hover:shadow-lg transition-all min-h-[40px] disabled:opacity-50 active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Live...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>Save Live Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
