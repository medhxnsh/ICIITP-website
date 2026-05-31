import { requireAuth } from "@/lib/auth";
import { NotificationForm } from "@/components/admin/notification-form";
import { createNotificationAction } from "../actions";
import { Bell } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "New Notification — IC IITP Admin" };

export default async function NewNotificationPage() {
  await requireAuth();
  return (
    <main className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/content/notifications" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          ← Notifications
        </Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <Bell className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>New Notification</h1>
      </div>
      <NotificationForm onSave={createNotificationAction} />
    </main>
  );
}
