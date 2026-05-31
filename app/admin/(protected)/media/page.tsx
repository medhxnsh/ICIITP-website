import { requireAuth } from "@/lib/auth";
import { FolderOpen } from "lucide-react";
import { MediaLibrary } from "@/components/admin/media-library";

export const metadata = { title: "Media — IC IITP Admin" };

export default async function MediaPage() {
  await requireAuth();
  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FolderOpen className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>Media Library</h1>
      </div>
      <MediaLibrary />
    </main>
  );
}
