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
  prompt?: string;
  tags: string[];
  moodTag?: string;
}

export interface ScreenerResult {
  id: string;
  timestamp: string;
  instrument: string;
  score: number;
  severity: string;
  answers: number[];
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
  outcomeEmotion: string;
}

export interface DailyHabitLog {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  exercise: boolean;
  hydration: boolean;
  screenBreak: boolean;
  notes?: string;
}

export interface AIRecommendation {
  title: string;
  category: string;
  actionType: string;
  duration: string;
  reason: string;
  tip: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface PTCCampusResource {
  id: string;
  department: string;
  title: string;
  services: string[];
  location: string;
  hours: string;
  contactEmail: string;
  contactNumber: string;
  notes: string;
}
