import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  sort_order: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  youtube_url: string;
  thumbnail: string;
  sort_order: number;
}

export interface UserProgress {
  completed: boolean;
  completed_at: Timestamp | null;
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export const getCourses = async (): Promise<Course[]> => {
  const q = query(collection(db, "courses"), orderBy("sort_order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
};

export const getCourse = async (courseId: string): Promise<Course | null> => {
  const snap = await getDoc(doc(db, "courses", courseId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Course;
};

export const createCourse = async (data: Omit<Course, "id">): Promise<string> => {
  const ref = await addDoc(collection(db, "courses"), { ...data, created_at: serverTimestamp() });
  return ref.id;
};

export const updateCourse = async (courseId: string, data: Partial<Omit<Course, "id">>) => {
  await updateDoc(doc(db, "courses", courseId), data);
};

export const deleteCourse = async (courseId: string) => {
  await deleteDoc(doc(db, "courses", courseId));
};

// ─── Modules ──────────────────────────────────────────────────────────────────

export const getModules = async (courseId: string): Promise<Module[]> => {
  const q = query(collection(db, "courses", courseId, "modules"), orderBy("sort_order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Module));
};

export const getModule = async (courseId: string, moduleId: string): Promise<Module | null> => {
  const snap = await getDoc(doc(db, "courses", courseId, "modules", moduleId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Module;
};

export const createModule = async (courseId: string, data: Omit<Module, "id">): Promise<string> => {
  const ref = await addDoc(collection(db, "courses", courseId, "modules"), data);
  return ref.id;
};

export const updateModule = async (
  courseId: string,
  moduleId: string,
  data: Partial<Omit<Module, "id">>
) => {
  await updateDoc(doc(db, "courses", courseId, "modules", moduleId), data);
};

export const deleteModule = async (courseId: string, moduleId: string) => {
  await deleteDoc(doc(db, "courses", courseId, "modules", moduleId));
};

// ─── Videos ───────────────────────────────────────────────────────────────────

export const getVideos = async (courseId: string, moduleId: string): Promise<Video[]> => {
  const q = query(
    collection(db, "courses", courseId, "modules", moduleId, "videos"),
    orderBy("sort_order")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Video));
};

export const getVideo = async (courseId: string, moduleId: string, videoId: string): Promise<Video | null> => {
  const snap = await getDoc(doc(db, "courses", courseId, "modules", moduleId, "videos", videoId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Video;
};

export const createVideo = async (
  courseId: string,
  moduleId: string,
  data: Omit<Video, "id">
): Promise<string> => {
  const ref = await addDoc(
    collection(db, "courses", courseId, "modules", moduleId, "videos"),
    data
  );
  return ref.id;
};

export const updateVideo = async (
  courseId: string,
  moduleId: string,
  videoId: string,
  data: Partial<Omit<Video, "id">>
) => {
  await updateDoc(doc(db, "courses", courseId, "modules", moduleId, "videos", videoId), data);
};

export const deleteVideo = async (courseId: string, moduleId: string, videoId: string) => {
  await deleteDoc(doc(db, "courses", courseId, "modules", moduleId, "videos", videoId));
};

// ─── User Progress ────────────────────────────────────────────────────────────

export const getUserProgress = async (userId: string): Promise<Record<string, boolean>> => {
  const snap = await getDocs(collection(db, "users", userId, "progress"));
  const result: Record<string, boolean> = {};
  snap.docs.forEach((d) => {
    result[d.id] = (d.data() as UserProgress).completed;
  });
  return result;
};

export const setVideoProgress = async (
  userId: string,
  videoId: string,
  completed: boolean
) => {
  await setDoc(doc(db, "users", userId, "progress", videoId), {
    completed,
    completed_at: completed ? serverTimestamp() : null,
  });
};
