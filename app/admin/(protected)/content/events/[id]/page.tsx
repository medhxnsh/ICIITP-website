import { requireAuth } from "@/lib/auth";
import { getEventById } from "@/lib/cms/events";
import { EventForm } from "@/components/admin/event-form";
import { updateEventAction } from "../actions";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import Link from "next/link";
import type { EventFormData } from "../actions";

export const metadata = { title: "Edit Event — IC IITP Admin" };
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function EditEventPage({ params }: Props) {
  await requireAuth();
  const { id } = await params;
  const raw = await getEventById(id);
  if (!raw) notFound();

  const closingDate = typeof raw.closingDate === "string" ? raw.closingDate.slice(0, 10) : null;

  const event: EventFormData = {
    slug: raw.slug,
    title: raw.title,
    tagline: raw.tagline,
    description: raw.description,
    category: raw.category,
    status: raw.status,
    autoClose: raw.autoClose,
    closingDate,
    coverImageUrl: raw.coverImageUrl,
    images: raw.images ?? (raw.coverImageUrl ? [{ url: raw.coverImageUrl, alt: "" }] : []),
    imageLayout: raw.imageLayout ?? "banner",
    applyUrl: raw.applyUrl,
    contact: raw.contact,
    published: raw.published,
    customFields: raw.customFields,
    attachments: raw.attachments ?? [],
  };

  async function save(data: EventFormData) {
    "use server";
    return updateEventAction(id, data);
  }

  return (
    <main className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/content/events" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          ← Events
        </Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <Calendar className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black truncate" style={{ color: "var(--color-brand-950)" }}>{raw.title}</h1>
      </div>
      <EventForm event={event} onSave={save} />
    </main>
  );
}
