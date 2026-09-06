import type { PTCCampusResource } from "../types";

export const PTC_CAMPUS_INFO = {
  institution: "Pateros Technological College",
  institute: "Institute of Information and Computing Technology",
  address: "Pateros, Metro Manila",
};

export const PTC_RESOURCES: PTCCampusResource[] = [
  {
    id: "guidance",
    department: "Student Support",
    title: "Guidance and Counseling Center",
    services: ["Confidential counseling", "Academic support", "Referral services"],
    location: "PTC Guidance Office",
    hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    contactEmail: "guidance@ptc.edu.ph",
    contactNumber: "Contact the PTC main office",
    notes: "For urgent concerns, contact local emergency services or a trusted person immediately.",
  },
  {
    id: "student-affairs",
    department: "Student Affairs",
    title: "Office of Student Affairs",
    services: ["Student welfare assistance", "Campus concerns", "Resource referrals"],
    location: "PTC Student Affairs Office",
    hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    contactEmail: "studentaffairs@ptc.edu.ph",
    contactNumber: "Contact the PTC main office",
    notes: "The office can help connect students with appropriate campus services.",
  },
];

export const COGNITIVE_DISTORTIONS = [
  { name: "All-or-Nothing Thinking", description: "Seeing outcomes in absolute categories rather than shades of gray." },
  { name: "Catastrophizing", description: "Expecting the worst possible outcome from a difficult situation." },
  { name: "Mind Reading", description: "Assuming you know what others are thinking without evidence." },
  { name: "Overgeneralization", description: "Treating one difficult event as a pattern that will always repeat." },
  { name: "Should Statements", description: "Using rigid expectations that create guilt or pressure." },
];
