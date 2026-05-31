import { requireAuth } from "@/lib/auth";
import { EventForm } from "@/components/admin/event-form";
import { createEventAction } from "../actions";
import { Calendar } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "New Event — IC IITP Admin" };

export default async function NewEventPage() {
  await requireAuth();
  return (
    <main className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/content/events"
          className="text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ← Events
        </Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <Calendar className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>New Event</h1>
      </div>
      <EventForm onSave={createEventAction} />
    </main>
  );
}
