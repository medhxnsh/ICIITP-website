"use server";

import { createSubmission } from "@/lib/submissions";
import { redirect } from "next/navigation";

export type FormState = { success: true } | { success: false; error: string } | null;

export async function submitIncubation(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const scheme = formData.get("scheme") as string;
    const founderName = formData.get("founderName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const startupName = formData.get("startupName") as string;
    const stage = formData.get("stage") as string;
    const oneLiner = formData.get("oneLiner") as string;
    const problem = formData.get("problem") as string;
    const dpiitRegistered = formData.get("dpiitRegistered") as "yes" | "no" | "in-progress";
    const sectors = (formData.get("sectors") as string ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const website = (formData.get("website") as string) || undefined;
    const locale = (formData.get("locale") as string) || "en";

    if (!founderName || !email || !phone || !startupName || !scheme || !stage || !oneLiner || !problem || !dpiitRegistered) {
      return { success: false, error: "Please fill in all required fields." };
    }

    await createSubmission({
      type: "incubation",
      locale,
      scheme,
      founderName,
      email,
      phone,
      startupName,
      website,
      stage,
      sectors,
      oneLiner,
      problem,
      dpiitRegistered,
    });

    return { success: true };
  } catch (err) {
    console.error("submitIncubation error", err);
    return { success: false, error: "Something went wrong. Please try again or email icitp@iitp.ac.in." };
  }
}

export async function submitLabAccess(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const affiliation = formData.get("affiliation") as string;
    const lab = formData.get("lab") as string;
    const purpose = formData.get("purpose") as string;
    const phone = (formData.get("phone") as string) || undefined;
    const preferredDates = formData.get("preferredDates") as string;
    const locale = (formData.get("locale") as string) || "en";

    if (!name || !email || !affiliation || !lab || !purpose || !preferredDates) {
      return { success: false, error: "Please fill in all required fields." };
    }

    await createSubmission({ type: "lab-access", locale, name, email, phone, affiliation, lab, purpose, preferredDates });
    return { success: true };
  } catch (err) {
    console.error("submitLabAccess error", err);
    return { success: false, error: "Something went wrong. Please try again or email icitp@iitp.ac.in." };
  }
}

export async function submitFeedback(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const message = formData.get("message") as string;
    const category = formData.get("category") as string;
    const name = (formData.get("name") as string) || undefined;
    const email = (formData.get("email") as string) || undefined;
    const ratingRaw = formData.get("rating") as string;
    const rating = ratingRaw ? parseInt(ratingRaw, 10) : undefined;
    const locale = (formData.get("locale") as string) || "en";

    if (!message || !category) {
      return { success: false, error: "Please fill in all required fields." };
    }

    await createSubmission({ type: "feedback", locale, name, email, category, message, rating });
    return { success: true };
  } catch (err) {
    console.error("submitFeedback error", err);
    return { success: false, error: "Something went wrong. Please try again or email icitp@iitp.ac.in." };
  }
}

export async function submitInternship(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const college = formData.get("college") as string;
    const degree = formData.get("degree") as string;
    const year = formData.get("year") as string;
    const area = formData.get("area") as string;
    const duration = formData.get("duration") as string;
    const resumeNote = formData.get("resumeNote") as string;
    const linkedIn = (formData.get("linkedIn") as string) || undefined;
    const locale = (formData.get("locale") as string) || "en";

    if (!name || !email || !phone || !college || !degree || !year || !area || !duration || !resumeNote) {
      return { success: false, error: "Please fill in all required fields." };
    }

    await createSubmission({ type: "internship", locale, name, email, phone, college, degree, year, area, duration, resumeNote, linkedIn });
    return { success: true };
  } catch (err) {
    console.error("submitInternship error", err);
    return { success: false, error: "Something went wrong. Please try again or email icitp@iitp.ac.in." };
  }
}

export async function submitContact(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const purpose = formData.get("purpose") as string;
    const message = (formData.get("message") as string) || undefined;
    const locale = (formData.get("locale") as string) || "en";

    if (!name || !email || !phone || !purpose) {
      return { success: false, error: "Please fill in all required fields." };
    }

    await createSubmission({ type: "contact", locale, name, email, phone, purpose, message });
    return { success: true };
  } catch (err) {
    console.error("submitContact error", err);
    return { success: false, error: "Something went wrong. Please try again or email icitp@iitp.ac.in." };
  }
}

/**
 * Admin-only: update an application's status. Used via useFormState.
 * Requires an authenticated admin session.
 */
export async function updateStatus(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const { requireAuth } = await import("@/lib/auth");
    await requireAuth();
    const { updateSubmissionStatus } = await import("@/lib/submissions");
    const id = formData.get("id") as string;
    const type = formData.get("type") as import("@/lib/submissions").SubmissionType;
    const status = formData.get("status") as "pending" | "reviewing" | "accepted" | "rejected";
    if (!id || !type || !status) return { success: false, error: "Missing fields." };
    await updateSubmissionStatus(id, type, status);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update." };
  }
}

/**
 * Admin-only: update an application's status directly from a plain form submit.
 * Requires an authenticated admin session — without it, status mutation is denied.
 */
export async function updateStatusDirect(formData: FormData): Promise<void> {
  const { requireAuth } = await import("@/lib/auth");
  await requireAuth();
  const { revalidatePath } = await import("next/cache");
  const { updateSubmissionStatus } = await import("@/lib/submissions");
  const id = formData.get("id") as string;
  const type = formData.get("type") as import("@/lib/submissions").SubmissionType;
  const status = formData.get("status") as "pending" | "reviewing" | "accepted" | "rejected";
  if (id && type && status) {
    await updateSubmissionStatus(id, type, status);
    revalidatePath("/admin/applications");
  }
}
