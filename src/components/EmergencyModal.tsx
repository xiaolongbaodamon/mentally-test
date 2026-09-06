import React, { useState } from "react";
import { Phone, AlertTriangle, X, ShieldAlert, HeartHandshake, Check, ExternalLink } from "lucide-react";
import { EMERGENCY_CONTACTS } from "../data/wellnessContent";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="emergency-modal-card"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-rose-950">Immediate Support & Hotlines</h3>
              <p className="text-xs text-rose-700 font-medium">Free, confidential 24/7 assistance in the Philippines</p>
            </div>
          </div>
          <button
            id="close-emergency-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Warning */}
        <div className="px-6 py-3 bg-amber-50/80 border-b border-amber-100 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Important Safety Notice:</strong> MentAlly is an AI-assisted self-care wellness prototype for college students and does not provide clinical diagnosis, psychiatric treatments, or direct emergency dispatch. If you or someone you know is in acute danger or crisis, please contact these hotlines immediately.
          </div>
        </div>

        {/* Hotline List */}
        <div className="p-6 space-y-3.5 overflow-y-auto flex-1">
          {EMERGENCY_CONTACTS.map((contact, idx) => (
            <div
              key={idx}
              id={`emergency-contact-${idx}`}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{contact.name}</span>
                    {contact.isTollFree && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        Toll-Free
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{contact.organization} • {contact.availability}</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-600 leading-normal">{contact.description}</p>
              
              <div className="pt-1 flex items-center gap-2">
                <a
                  href={`tel:${contact.contactNumber.split("/")[0].trim()}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call: {contact.contactNumber}
                </a>
                <button
                  onClick={() => handleCopy(contact.contactNumber)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  {copiedNumber === contact.contactNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <span>Copy Info</span>
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Campus Guidance Info */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-teal-950">
              <HeartHandshake className="w-4 h-4 text-teal-700" />
              On-Campus Guidance & Student Affairs
            </div>
            <p className="text-teal-800 leading-relaxed">
              Under RA No. 11036 and CHED initiatives (Project GROWS & GAYON), your college guidance counseling office provides free and confidential student psychological consultations. You may visit your campus Student Affairs or Guidance Office.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
