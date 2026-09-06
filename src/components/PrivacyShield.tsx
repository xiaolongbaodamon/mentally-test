import React from "react";
import { Eye, EyeOff, Lock, Unlock } from "lucide-react";

interface PrivacyShieldProps {
  isLocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
  isCamouflageActive: boolean;
  onToggleCamouflage: () => void;
}

export const PrivacyShield: React.FC<PrivacyShieldProps> = ({ isLocked, onUnlock, onLock, isCamouflageActive, onToggleCamouflage }) => {
  if (isLocked) return <div className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center"><button onClick={onUnlock} className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white"><Unlock className="h-4 w-4" /> Unlock MentAlly</button></div>;
  return <div className="fixed bottom-20 right-4 z-40 flex gap-2"><button title={isCamouflageActive ? "Show app" : "Camouflage app"} onClick={onToggleCamouflage} className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-lg">{isCamouflageActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button><button title="Lock app" onClick={onLock} className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-lg"><Lock className="h-4 w-4" /></button></div>;
};
