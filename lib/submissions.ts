/**
 * Application submission CRUD backed by Firestore per-type collections.
 * Each type lives in its own collection (e.g. "submissions-incubation")
 * so queries never need a composite index across types.
 */
import { getDb } from "./firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export type SubmissionType =
  | "incubation"
  | "lab-access"
  | "internship"
  | "careers"
  | "feedback"
  | "contact";

export type SubmissionStatus = "pending" | "reviewing" | "accepted" | "rejected";

export interface BaseSubmission {
  id?: string;
  type: SubmissionType;
  status: SubmissionStatus;
  locale: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface IncubationSubmission extends BaseSubmission {
  type: "incubation";
  scheme: string;
  founderName: string;
  email: string;
  phone: string;
  startupName: string;
  website?: string;
  stage: string;
  sectors: string[];
  oneLiner: string;
  problem: string;
  dpiitRegistered: "yes" | "no" | "in-progress";
}

export interface LabAccessSubmission extends BaseSubmission {
  type: "lab-access";
  name: string;
  email: string;
  phone?: string;
  affiliation: string;
  lab: string;
  purpose: string;
  preferredDates?: string;
}

export interface InternshipSubmission extends BaseSubmission {
  type: "internship";
  name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  year: string;
  area: string;
  duration: string;
  linkedIn?: string;
  resumeNote: string;
}

export interface FeedbackSubmission extends BaseSubmission {
  type: "feedback";
  name?: string;
  email?: string;
  category: string;
  message: string;
  rating?: number;
}

export interface CareersSubmission extends BaseSubmission {
  type: "careers";
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: string;
  message?: string;
}

export interface ContactSubmission extends BaseSubmission {
  type: "contact";
  name: string;
  email: string;
  phone: string;
  purpose: string;
  message?: string;
}

export type Submission =
  | IncubationSubmission
  | LabAccessSubmission
  | InternshipSubmission
  | FeedbackSubmission
  | CareersSubmission
  | ContactSubmission;

// Each submission type lives in its own Firestore collection
const COLLECTION_MAP: Record<SubmissionType, string> = {
  "incubation":   "incubation-applications",
  "lab-access":   "lab-access-requests",
  "internship":   "internship-applications",
  "feedback":     "feedback",
  "careers":      "careers-applications",
  "contact":      "contact-enquiries",
};

export function collectionFor(type: SubmissionType): string {
  return COLLECTION_MAP[type];
}

export type NewSubmission = { type: SubmissionType; locale: string } & Record<string, unknown>;

export async function createSubmission(data: NewSubmission): Promise<string> {
  const col = collectionFor(data.type);
  const ref = await getDb().collection(col).add({
    ...data,
    status: "pending" as SubmissionStatus,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function getSubmissions(
  type?: SubmissionType,
  limit = 100
): Promise<(Submission & { id: string })[]> {
  const db = getDb();

  if (type) {
    const snap = await db
      .collection(collectionFor(type))
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Submission) }));
  }

  // "all" — fetch from every collection and merge, sorted by createdAt
  const all = await Promise.all(
    Object.values(COLLECTION_MAP).map((col) =>
      db.collection(col).orderBy("createdAt", "desc").limit(limit).get()
    )
  );
  return all
    .flatMap((snap) => snap.docs.map((d) => ({ id: d.id, ...(d.data() as Submission) })))
    .sort((a, b) => {
      const ta = a.createdAt instanceof Timestamp ? a.createdAt.seconds : 0;
      const tb = b.createdAt instanceof Timestamp ? b.createdAt.seconds : 0;
      return tb - ta;
    })
    .slice(0, limit);
}

export async function updateSubmissionStatus(
  id: string,
  type: SubmissionType,
  status: SubmissionStatus
): Promise<void> {
  await getDb().collection(collectionFor(type)).doc(id).update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
