import { requireAuth } from "@/lib/auth";
import { getNotification } from "@/lib/content";
import { notFound } from "next/navigation";
import { Bell } from "lucide-react";
import Link from "next/link";
import { StaticNotificationForm } from "./form";
import { saveStaticNotificationAction } from "./actions";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ slug: string }> }

export default async function StaticNotificationEditPage({ params }: Props) {
  await requireAuth();
  const { slug } = await params;

  let notification;
  try { notification = getNotification(slug, "en"); } catch { notFound(); }

  async function save(data: Parameters<typeof saveStaticNotificationAction>[1]) {
    "use server";
    return saveStaticNotificationAction(slug, data);
  }

  return (
    <main className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/content/notifications" className="text-sm" style={{ color: "#7a8e6a" }}>
          ← Notifications
        </Link>
        <span style={{ color: "#d4e6c4" }}>/</span>
        <Bell className="w-5 h-5" style={{ color: "#3a5214" }} />
        <h1 className="text-xl font-black truncate" style={{ color: "#1c2e06" }}>{notification.title}</h1>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>
          Static
        </span>
      </div>
      <p className="text-xs mb-8" style={{ color: "#7a8e6a" }}>
        Edit this notification page&apos;s content. Changes are saved directly to the content file and go live immediately.
      </p>

      <StaticNotificationForm slug={slug} notification={notification} onSave={save} />
    </main>
  );
}
