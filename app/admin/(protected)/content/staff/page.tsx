import { requireAuth } from "@/lib/auth";
import { getAdminStaffSections } from "@/lib/cms/staff";
import { StaffManager } from "@/components/admin/staff-manager";

export const metadata = { title: "Staff — IC IITP Admin" };
export const dynamic = "force-dynamic";

export default async function StaffPage() {
  await requireAuth();
  const sections = await getAdminStaffSections();
  return (
    <main className="p-6">
      <StaffManager initial={sections} />
    </main>
  );
}
