import { requireAuth } from "@/lib/auth";
import { getNotificationById } from "@/lib/cms/notifications";
import { NotificationForm } from "@/components/admin/notification-form";
import { updateNotificationAction } from "../actions";
import { notFound } from "next/navigation";
import { Bell } from "lucide-react";
import Link from "next/link";
import type { NotificationFormData } from "../actions";

export const metadata = { title: "Edit Notification — IC IITP Admin" };
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function EditNotificationPage({ params }: Props) {
  await requireAuth();
  const { id } = await params;
  const notification = await getNotificationById(id);
  if (!notification) notFound();

  async function save(data: NotificationFormData) {
    "use server";
    return updateNotificationAction(id, data);
  }

  return (
    <main className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/content/notifications" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          ← Notifications
        </Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <Bell className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black truncate" style={{ color: "var(--color-brand-950)" }}>{notification.title}</h1>
      </div>
      <NotificationForm notification={notification} onSave={save} />
    </main>
  );
}
