export type MoodScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface MoodEntry {
  id: string;
  timestamp: string;
  score: MoodScore;
  label: string;
  emoji: string;
  feelings: string[];
  triggers: string[];
  note?: string;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  tags: string[];
  moodLabel?: string;
  moodTag?: string;
  prompt?: string;
}

export interface ScreenerResult {
  id: string;
  timestamp: string;
  type: "PHQ-9" | "GAD-7" | "PSS-10";
  score: number;
  maxScore: number;
  severity: string;
  interpretation: string;
  recommendation: string;
}

export interface CBTThoughtRecord {
  id: string;
  timestamp: string;
  situation: string;
  automaticThought: string;
  emotion: string;
  cognitiveDistortion: string;
  evidenceAgainst: string;
  balancedThought: string;
  outcomeEmotion?: string;
}

export interface PTCCampusResource {
  id: string;
  title: string;
  department: string;
  contactPerson: string;
  location: string;
  email: string;
  phone: string;
  operatingHours: string;
  services: string[];
  confidentialityNotice: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface AIRecommendation {
  title: string;
  category: string;
  actionType: "breathing" | "grounding" | "ambient" | "journal" | "ptc";
  duration: string;
  reason: string;
  tip: string;
}

export interface SleepHabitEntry {
  id: string;
  date: string;
  hoursSlept: number;
  quality: "Restful" | "Fair" | "Poor" | "Restless";
  caffeineLate: boolean;
  screenBeforeBed: boolean;
  notes?: string;
}

export interface DailyHabitLog {
  id: string;
  date: string;
  completedHabits: string[];
  notes?: string;
}

export const ADMIN_EMAIL = "xiaolongbao312006@gmail.com";

export interface CampusAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  author: string;
  createdAt: string;
  active: boolean;
  category?: "guidance" | "wellness" | "academic" | "event";
}

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  institution: string;
  studentId?: string;
  yearLevel?: string;
  course?: string;
  contactNumber?: string;
  emergencyContact?: string;
  status?: "Active" | "Guidance Support" | "Alumni" | "Under Review";
  counselorNotes?: string;
  createdAt: string;
  lastLoginAt: string;
}
