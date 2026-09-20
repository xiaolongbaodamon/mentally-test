import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, updateProfile, deleteUser as deleteAuthUser, signOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBPdikZ-AyD4LYK_6TCg03Qz_Pn333CUVc",
  authDomain: "mentally-d266c.firebaseapp.com",
  projectId: "mentally-d266c",
  storageBucket: "mentally-d266c.firebasestorage.app",
  messagingSenderId: "1012506248517",
  appId: "1:1012506248517:web:f7d2a3b78545ed31a7aa2c",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Set custom parameters so it always prompts account chooser if multiple Google accounts exist
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const db = getFirestore(app);

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase Firestore is currently offline or unreachable.");
      return false;
    }
    // Any other error (like permission-denied) still means server was contacted successfully
    return true;
  }
}

// ---------------------------------------------------------
// Firestore Operations & User Profile Management
// ---------------------------------------------------------
import {
  collection,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import type {
  MoodEntry,
  JournalEntry,
  ScreenerResult,
  CBTThoughtRecord,
  DailyHabitLog,
  CampusAnnouncement,
  UserProfileData,
} from "../types";

export type { UserProfileData };

/**
 * Ensures or updates the user profile record in Firestore
 */
export async function syncUserProfile(user: User): Promise<UserProfileData> {
  const userRef = doc(db, "users", user.uid);
  const nowIso = new Date().toISOString();

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const existing = snap.data() as UserProfileData;
      const updated: Partial<UserProfileData> = {
        lastLoginAt: nowIso,
        displayName: user.displayName || existing.displayName || "Student",
        email: user.email || existing.email,
        photoURL: user.photoURL || existing.photoURL,
      };
      await setDoc(userRef, updated, { merge: true });
      return { ...existing, ...updated };
    } else {
      const newProfile: UserProfileData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "Student",
        photoURL: user.photoURL || null,
        institution: "Pateros Technological College",
        createdAt: nowIso,
        lastLoginAt: nowIso,
        status: "Active",
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    console.warn("Firestore syncUserProfile notice:", err);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "Student",
      photoURL: user.photoURL || null,
      institution: "Pateros Technological College",
      createdAt: nowIso,
      lastLoginAt: nowIso,
      status: "Active",
    };
  }
}

/**
 * Updates a user's profile in Firestore and syncs auth profile if needed.
 * Triggers instant real-time updates to Admin Panel without refresh!
 */
export async function updateUserProfileInFirestore(
  userId: string,
  updates: Partial<UserProfileData>
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // If currentUser is updating their own displayName or photoURL, update Firebase Auth too
    if (auth.currentUser && auth.currentUser.uid === userId) {
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (updates.displayName !== undefined && updates.displayName !== null) {
        authUpdates.displayName = updates.displayName;
      }
      if (updates.photoURL !== undefined) {
        authUpdates.photoURL = updates.photoURL || undefined;
      }
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(auth.currentUser, authUpdates);
      }
    }
  } catch (err) {
    console.warn("updateUserProfileInFirestore error:", err);
    throw err;
  }
}

/**
 * Real-time listener for a specific user's profile document.
 * Updates instantly whenever changes occur!
 */
export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfileData) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const userRef = doc(db, "users", userId);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate({
          uid: snap.id,
          email: data.email || null,
          displayName: data.displayName || "Student",
          photoURL: data.photoURL || null,
          institution: data.institution || "Pateros Technological College",
          studentId: data.studentId || "",
          yearLevel: data.yearLevel || "",
          course: data.course || "",
          contactNumber: data.contactNumber || "",
          emergencyContact: data.emergencyContact || "",
          status: data.status || "Active",
          counselorNotes: data.counselorNotes || "",
          createdAt: data.createdAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt || new Date().toISOString(),
        });
      }
    },
    (err) => {
      console.warn("subscribeToUserProfile snapshot notice:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Mood Operations
 */
export async function saveMoodToFirestore(userId: string, mood: MoodEntry): Promise<void> {
  try {
    const moodRef = doc(db, "users", userId, "moods", mood.id);
    await setDoc(moodRef, {
      ...mood,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Could not save mood to Firestore:", err);
  }
}

export async function deleteMoodFromFirestore(userId: string, moodId: string): Promise<void> {
  try {
    const moodRef = doc(db, "users", userId, "moods", moodId);
    await deleteDoc(moodRef);
  } catch (err) {
    console.warn("Could not delete mood from Firestore:", err);
    throw err;
  }
}

export async function fetchMoodsFromFirestore(userId: string): Promise<MoodEntry[]> {
  try {
    const moodsCol = collection(db, "users", userId, "moods");
    const q = query(moodsCol, orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const items: MoodEntry[] = [];
    snap.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        timestamp: data.timestamp || new Date().toISOString(),
        score: data.score,
        label: data.label,
        emoji: data.emoji,
        feelings: Array.isArray(data.feelings) ? data.feelings : [],
        triggers: Array.isArray(data.triggers) ? data.triggers : [],
        note: data.note || "",
      });
    });
    return items;
  } catch (err) {
    console.warn("Could not load moods from Firestore:", err);
    return [];
  }
}

/**
 * Real-time listener for user moods.
 * Updates immediately across devices and tabs without page reload!
 */
export function subscribeToMoods(
  userId: string,
  onUpdate: (moods: MoodEntry[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const moodsCol = collection(db, "users", userId, "moods");
  const q = query(moodsCol, orderBy("timestamp", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items: MoodEntry[] = [];
      snap.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          timestamp: data.timestamp || new Date().toISOString(),
          score: data.score,
          label: data.label,
          emoji: data.emoji,
          feelings: Array.isArray(data.feelings) ? data.feelings : [],
          triggers: Array.isArray(data.triggers) ? data.triggers : [],
          note: data.note || "",
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn("subscribeToMoods snapshot notice:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Journal Operations
 */
export async function saveJournalToFirestore(userId: string, journal: JournalEntry): Promise<void> {
  try {
    const journalRef = doc(db, "users", userId, "journals", journal.id);
    await setDoc(journalRef, {
      ...journal,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Could not save journal to Firestore:", err);
  }
}

export async function deleteJournalFromFirestore(userId: string, journalId: string): Promise<void> {
  try {
    const journalRef = doc(db, "users", userId, "journals", journalId);
    await deleteDoc(journalRef);
  } catch (err) {
    console.warn("Could not delete journal from Firestore:", err);
  }
}

export async function fetchJournalsFromFirestore(userId: string): Promise<JournalEntry[]> {
  try {
    const journalsCol = collection(db, "users", userId, "journals");
    const q = query(journalsCol, orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const items: JournalEntry[] = [];
    snap.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        timestamp: data.timestamp || new Date().toISOString(),
        title: data.title || "Untitled Reflection",
        content: data.content || "",
        prompt: data.prompt,
        moodTag: data.moodTag,
        tags: Array.isArray(data.tags) ? data.tags : [],
      });
    });
    return items;
  } catch (err) {
    console.warn("Could not load journals from Firestore:", err);
    return [];
  }
}

/**
 * Real-time listener for user journals.
 * Updates immediately across devices and tabs without page reload!
 */
export function subscribeToJournals(
  userId: string,
  onUpdate: (journals: JournalEntry[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const journalsCol = collection(db, "users", userId, "journals");
  const q = query(journalsCol, orderBy("timestamp", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items: JournalEntry[] = [];
      snap.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          timestamp: data.timestamp || new Date().toISOString(),
          title: data.title || "Untitled Reflection",
          content: data.content || "",
          prompt: data.prompt,
          moodTag: data.moodTag,
          tags: Array.isArray(data.tags) ? data.tags : [],
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn("subscribeToJournals snapshot notice:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Habit Operations
 */
export async function saveHabitLogToFirestore(userId: string, habit: DailyHabitLog): Promise<void> {
  try {
    const habitRef = doc(db, "users", userId, "habits", habit.date);
    await setDoc(habitRef, {
      ...habit,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Could not save habit to Firestore:", err);
  }
}

export async function deleteHabitFromFirestore(userId: string, habitDate: string): Promise<void> {
  try {
    const habitRef = doc(db, "users", userId, "habits", habitDate);
    await deleteDoc(habitRef);
  } catch (err) {
    console.warn("Could not delete habit from Firestore:", err);
  }
}

export async function fetchHabitsFromFirestore(userId: string): Promise<DailyHabitLog[]> {
  try {
    const habitsCol = collection(db, "users", userId, "habits");
    const q = query(habitsCol, orderBy("date", "desc"));
    const snap = await getDocs(q);
    const items: DailyHabitLog[] = [];
    snap.forEach((d) => {
      items.push(d.data() as DailyHabitLog);
    });
    return items;
  } catch (err) {
    console.warn("Could not load habits from Firestore:", err);
    return [];
  }
}

/**
 * Screener Operations
 */
export async function saveScreenerToFirestore(userId: string, result: ScreenerResult): Promise<void> {
  try {
    const screenerRef = doc(db, "users", userId, "screeners", result.id);
    await setDoc(screenerRef, {
      ...result,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Could not save screener to Firestore:", err);
  }
}

export async function deleteScreenerFromFirestore(userId: string, screenerId: string): Promise<void> {
  try {
    const screenerRef = doc(db, "users", userId, "screeners", screenerId);
    await deleteDoc(screenerRef);
  } catch (err) {
    console.warn("Could not delete screener from Firestore:", err);
  }
}

export async function fetchScreenersFromFirestore(userId: string): Promise<ScreenerResult[]> {
  try {
    const screenersCol = collection(db, "users", userId, "screeners");
    const q = query(screenersCol, orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const items: ScreenerResult[] = [];
    snap.forEach((d) => {
      items.push(d.data() as ScreenerResult);
    });
    return items;
  } catch (err) {
    console.warn("Could not load screeners from Firestore:", err);
    return [];
  }
}

/**
 * CBT Records
 */
export async function saveCBTRecordToFirestore(userId: string, record: CBTThoughtRecord): Promise<void> {
  try {
    const cbtRef = doc(db, "users", userId, "cbt", record.id);
    await setDoc(cbtRef, {
      ...record,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Could not save CBT record to Firestore:", err);
  }
}

export async function deleteCBTRecordFromFirestore(userId: string, recordId: string): Promise<void> {
  try {
    const cbtRef = doc(db, "users", userId, "cbt", recordId);
    await deleteDoc(cbtRef);
  } catch (err) {
    console.warn("Could not delete CBT record from Firestore:", err);
  }
}

export async function fetchCBTRecordsFromFirestore(userId: string): Promise<CBTThoughtRecord[]> {
  try {
    const cbtCol = collection(db, "users", userId, "cbt");
    const q = query(cbtCol, orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const items: CBTThoughtRecord[] = [];
    snap.forEach((d) => {
      items.push(d.data() as CBTThoughtRecord);
    });
    return items;
  } catch (err) {
    console.warn("Could not load CBT records from Firestore:", err);
    return [];
  }
}

// ---------------------------------------------------------
// Administrator Functions (Reserved for xiaolongbao312006@gmail.com)
// ---------------------------------------------------------

/**
 * Fetch all registered / logged-in users from Firestore
 */
export async function fetchAllUsersFromFirestore(): Promise<UserProfileData[]> {
  try {
    const usersCol = collection(db, "users");
    const snap = await getDocs(usersCol);
    const users: UserProfileData[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        uid: docSnap.id,
        email: data.email || null,
        displayName: data.displayName || "Student",
        photoURL: data.photoURL || null,
        institution: data.institution || "Pateros Technological College",
        studentId: data.studentId || "",
        yearLevel: data.yearLevel || "",
        course: data.course || "",
        contactNumber: data.contactNumber || "",
        emergencyContact: data.emergencyContact || "",
        status: data.status || "Active",
        counselorNotes: data.counselorNotes || "",
        createdAt: data.createdAt || new Date().toISOString(),
        lastLoginAt: data.lastLoginAt || data.createdAt || new Date().toISOString(),
      });
    });
    // Sort by last login descending
    users.sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime());
    return users;
  } catch (err) {
    console.warn("Admin fetchAllUsersFromFirestore error:", err);
    return [];
  }
}

/**
 * Real-time listener for all users (for Administrator panel).
 * Instant updates without requiring page refresh!
 */
export function subscribeToAllUsers(
  onUpdate: (users: UserProfileData[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const usersCol = collection(db, "users");
  return onSnapshot(
    usersCol,
    (snap) => {
      const users: UserProfileData[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        users.push({
          uid: docSnap.id,
          email: data.email || null,
          displayName: data.displayName || "Student",
          photoURL: data.photoURL || null,
          institution: data.institution || "Pateros Technological College",
          studentId: data.studentId || "",
          yearLevel: data.yearLevel || "",
          course: data.course || "",
          contactNumber: data.contactNumber || "",
          emergencyContact: data.emergencyContact || "",
          status: data.status || "Active",
          counselorNotes: data.counselorNotes || "",
          createdAt: data.createdAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt || data.createdAt || new Date().toISOString(),
        });
      });
      users.sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime());
      onUpdate(users);
    },
    (err) => {
      console.warn("subscribeToAllUsers snapshot notice:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Delete a user profile document from Firestore
 */
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  } catch (err) {
    console.warn("Could not delete user from Firestore:", err);
    throw err;
  }
}

/**
 * Deletes all subcollections data for a user in Firestore (moods, journals, habits, screeners, cbt)
 */
export async function clearAllUserDataFromFirestore(userId: string): Promise<void> {
  try {
    const subcollections = ["moods", "journals", "habits", "screeners", "cbt"];
    for (const sub of subcollections) {
      const colRef = collection(db, "users", userId, sub);
      const snap = await getDocs(colRef);
      const deletes = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletes);
    }
  } catch (err) {
    console.warn("clearAllUserDataFromFirestore notice:", err);
    throw err;
  }
}

/**
 * Permanently deletes user account, profile document, and all associated mental health records
 */
export async function deleteAccountCompletely(userId: string): Promise<void> {
  try {
    // 1. Clear all subcollections (moods, journals, habits, etc.)
    await clearAllUserDataFromFirestore(userId);
    // 2. Delete main user profile document
    await deleteDoc(doc(db, "users", userId));
    // 3. Delete auth account if supported, or sign out
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await deleteAuthUser(auth.currentUser);
      } catch (authErr) {
        console.warn("Auth user deletion notice:", authErr);
        await signOut(auth);
      }
    }
  } catch (err) {
    console.error("deleteAccountCompletely error:", err);
    throw err;
  }
}

/**
 * Fetch counts of user activity (moods, journals, screeners, cbt)
 */
export async function fetchUserActivityStats(userId: string): Promise<{
  moodCount: number;
  journalCount: number;
  screenerCount: number;
  cbtCount: number;
}> {
  try {
    const [moodsSnap, journalsSnap, screenersSnap, cbtSnap] = await Promise.all([
      getDocs(collection(db, "users", userId, "moods")),
      getDocs(collection(db, "users", userId, "journals")),
      getDocs(collection(db, "users", userId, "screeners")),
      getDocs(collection(db, "users", userId, "cbt")),
    ]);

    return {
      moodCount: moodsSnap.size,
      journalCount: journalsSnap.size,
      screenerCount: screenersSnap.size,
      cbtCount: cbtSnap.size,
    };
  } catch (err) {
    console.warn("fetchUserActivityStats error:", err);
    return { moodCount: 0, journalCount: 0, screenerCount: 0, cbtCount: 0 };
  }
}

/**
 * Campus Announcements Management
 */
export async function saveAnnouncementToFirestore(announcement: CampusAnnouncement): Promise<void> {
  try {
    const annRef = doc(db, "announcements", announcement.id);
    await setDoc(annRef, {
      ...announcement,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("saveAnnouncementToFirestore error:", err);
    throw err;
  }
}

export async function fetchAnnouncementsFromFirestore(): Promise<CampusAnnouncement[]> {
  try {
    const col = collection(db, "announcements");
    const snap = await getDocs(col);
    const announcements: CampusAnnouncement[] = [];
    snap.forEach((d) => {
      const data = d.data();
      announcements.push({
        id: d.id,
        title: data.title || "Notice",
        content: data.content || "",
        priority: data.priority || "normal",
        author: data.author || "Guidance Office",
        createdAt: data.createdAt || new Date().toISOString(),
        active: data.active !== false,
        category: data.category || "guidance",
      });
    });
    announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return announcements;
  } catch (err) {
    console.warn("fetchAnnouncementsFromFirestore error:", err);
    return [];
  }
}

/**
 * Real-time listener for Campus Announcements.
 * Instant notifications across all student clients without refreshing!
 */
export function subscribeToAnnouncements(
  onUpdate: (announcements: CampusAnnouncement[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const col = collection(db, "announcements");
  return onSnapshot(
    col,
    (snap) => {
      const announcements: CampusAnnouncement[] = [];
      snap.forEach((d) => {
        const data = d.data();
        announcements.push({
          id: d.id,
          title: data.title || "Notice",
          content: data.content || "",
          priority: data.priority || "normal",
          author: data.author || "Guidance Office",
          createdAt: data.createdAt || new Date().toISOString(),
          active: data.active !== false,
          category: data.category || "guidance",
        });
      });
      announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(announcements);
    },
    (err) => {
      console.warn("subscribeToAnnouncements snapshot notice:", err);
      if (onError) onError(err);
    }
  );
}

export async function deleteAnnouncementFromFirestore(announcementId: string): Promise<void> {
  try {
    const annRef = doc(db, "announcements", announcementId);
    await deleteDoc(annRef);
  } catch (err) {
    console.warn("deleteAnnouncementFromFirestore error:", err);
    throw err;
  }
}
