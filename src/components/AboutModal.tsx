import React from "react";
import { X, GraduationCap, FileText, Heart, ShieldCheck, BookOpen } from "lucide-react";
import { PTCLogo } from "./PTCLogo";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onResetData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="about-capsule-modal"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="bg-teal-700 text-white px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <PTCLogo size="md" className="bg-white rounded-full p-0.5 shadow-xs" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200">
                Pateros Technological College
              </span>
              <h3 className="text-base font-bold leading-tight mt-0.5">
                MentAlly: A Personalized Mental Wellness Application
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-teal-100 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">System Analysis and Design Capsule Project</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">August 2026</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
              <div>
                <strong className="block text-slate-900">Proponent:</strong>
                <span>JABINES, ANGELOU FRANCIS</span>
              </div>
              <div>
                <strong className="block text-slate-900">Institution:</strong>
                <span>Pateros Technological College (PTC)</span>
              </div>
              <div className="col-span-2">
                <strong className="block text-slate-900">Degree:</strong>
                <span>Bachelor of Science in Information Technology</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Heart className="w-4 h-4 text-teal-600" />
              Purpose & Significance
            </h4>
            <p>
              Under Republic Act No. 11036 (Mental Health Act) and UN Sustainable Development Goal 3 (Good Health and Well-Being), MentAlly was conceived to eliminate the fragmentation of student wellness tools. It unifies mood tracking, mindful journaling, guided somatic breathing, and empathetic AI companionship into a single accessible mobile platform.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Limitations & Ethical Boundaries
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Developed for mental wellness and student self-care support only.</li>
              <li>Does not provide psychiatric medical diagnosis or clinical treatment.</li>
              <li>AI responses are non-clinical and supportive; users in crisis are directed to institutional hotlines (NCMH 1553, Hopeline PH, GAYON).</li>
            </ul>
          </div>

          {/* Privacy & Data Management */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2.5">
            <h4 className="font-bold text-teal-950 text-xs flex items-center justify-between">
              <span>Local Device Storage & Privacy</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">100% Client-Side</span>
            </h4>
            <p className="text-[11px] text-teal-900 leading-relaxed">
              MentAlly strictly stores all mood logs, journals, habits, and CBT exercises inside your browser's private offline storage. No personal reflections are sent to any remote database. You have full ownership of your records.
            </p>
            {onResetData && (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Want a fresh start?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onResetData();
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                >
                  Clear All Saved Records
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
