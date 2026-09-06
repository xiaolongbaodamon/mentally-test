import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Send, 
  GraduationCap, 
  FileText, 
  ShieldCheck,
  Search
} from "lucide-react";
import { PTCLogo } from "./PTCLogo";
import { PTC_RESOURCES, PTC_CAMPUS_INFO } from "../data/ptcData";
import { PTCCampusResource } from "../types";

export const PTCGuidanceDirectory: React.FC = () => {
  const [selectedResource, setSelectedResource] = useState<PTCCampusResource>(PTC_RESOURCES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConsultationDraft, setShowConsultationDraft] = useState(false);

  // Email draft state
  const [studentName, setStudentName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [academicYear, setAcademicYear] = useState("BSIT - 3rd Year");
  const [reason, setReason] = useState("Academic stress & anxiety management");
  const [preferredSchedule, setPreferredSchedule] = useState("Morning (9:00 AM - 11:00 AM)");
  const [copiedDraft, setCopiedDraft] = useState(false);

  const filteredResources = PTC_RESOURCES.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateEmailText = () => {
    return `Subject: Confidential Guidance Counseling Consultation Request - ${studentName || "[Student Name]"} (${studentNumber || "[PTC Student No.]"})

Dear PTC Guidance and Counseling Center,

Good day. I am ${studentName || "[My Name]"}, an enrolled student from the ${academicYear} at Pateros Technological College (PTC).

I would like to respectfully request a confidential one-on-one consultation with a campus guidance counselor to discuss:
${reason}

My preferred consultation window is: ${preferredSchedule}.

I am reaching out via the PTC MentAlly student self-care platform under Republic Act No. 11036 and CHED Project GROWS guidelines.

Thank you very much for your continuous guidance and support to the PTC student community.

Respectfully yours,
${studentName || "[My Name]"}
Student ID: ${studentNumber || "[PTC Student ID]"}
Institute of Information and Computing Technology (IICT)
Pateros Technological College`;
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generateEmailText());
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const handleOpenEmailClient = () => {
    const subject = encodeURIComponent(`Confidential Counseling Request - ${studentName || "PTC Student"}`);
    const body = encodeURIComponent(generateEmailText());
    window.location.href = `mailto:${selectedResource.contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div id="ptc-guidance-directory" className="space-y-6 animate-in fade-in duration-200">
      {/* Institution Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <PTCLogo size="md" className="bg-white rounded-full p-0.5 shadow-md shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Campus Wellness Network</span>
              </div>
              <h3 className="text-xl font-black tracking-tight">{PTC_CAMPUS_INFO.institution}</h3>
              <p className="text-xs text-teal-100/90 max-w-xl leading-relaxed">
                {PTC_CAMPUS_INFO.institute} • {PTC_CAMPUS_INFO.address}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConsultationDraft(!showConsultationDraft)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <Mail className="w-4 h-4" />
            {showConsultationDraft ? "Hide Email Drafter" : "Prepare Appointment Email"}
          </button>
        </div>
      </div>

      {/* Appointment Email Drafter Box */}
      {showConsultationDraft && (
        <div className="bg-white rounded-2xl border-2 border-teal-500 p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Confidential Appointment Email Drafter</h4>
                <p className="text-[11px] text-slate-500">
                  Pre-fills a professional request for the PTC Guidance Office ({selectedResource.contactEmail})
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Protected by RA 11036
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Your Full Name</label>
              <input
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">PTC Student Number</label>
              <input
                type="text"
                placeholder="e.g. 2023-0145"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Year & Program</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Preferred Time Slot</label>
              <select
                value={preferredSchedule}
                onChange={(e) => setPreferredSchedule(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option>Morning (8:30 AM – 11:00 AM)</option>
                <option>Mid-day (11:00 AM – 1:00 PM)</option>
                <option>Afternoon (1:30 PM – 4:30 PM)</option>
                <option>Online / Video consultation via Google Meet</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Area of Concern (General)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Generated Email Preview:
            </span>
            <pre className="text-[11px] font-mono whitespace-pre-wrap text-slate-700 max-h-40 overflow-y-auto leading-relaxed">
              {generateEmailText()}
            </pre>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleCopyDraft}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              {copiedDraft ? "✓ Copied to Clipboard" : "Copy Email Text"}
            </button>
            <button
              onClick={handleOpenEmailClient}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Open in Mail App
            </button>
          </div>
        </div>
      )}

      {/* Resource Cards & Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Campus Unit Selector */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter PTC offices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            {filteredResources.map((res) => {
              const isSelected = selectedResource.id === res.id;
              return (
                <button
                  key={res.id}
                  onClick={() => setSelectedResource(res)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-teal-50 border-teal-500 shadow-xs ring-1 ring-teal-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-xs font-bold ${isSelected ? "text-teal-950" : "text-slate-900"}`}>
                      {res.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{res.department}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-teal-700 mt-2 font-medium">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{res.location}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Office Detailed Profile */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {selectedResource.department}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1.5">{selectedResource.title}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* Quick Contact Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-600" /> Physical Office Location
              </span>
              <p className="font-semibold text-slate-800">{selectedResource.location}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-teal-600" /> Operating Hours
              </span>
              <p className="font-semibold text-slate-800">{selectedResource.hours}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-teal-600" /> Institutional Email
              </span>
              <p className="font-semibold text-teal-700">{selectedResource.contactEmail}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3 text-teal-600" /> Landline / Trunkline
              </span>
              <p className="font-semibold text-slate-800">{selectedResource.contactNumber}</p>
            </div>
          </div>

          {/* Available Services */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Student Assistance & Services Offered
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedResource.services.map((serv, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-teal-50/40 border border-teal-100 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{serv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guidance Note */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Confidentiality Guarantee:</strong>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">{selectedResource.notes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
