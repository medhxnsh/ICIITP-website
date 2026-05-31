import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateUserForm } from "./_form";

export const metadata = { title: "Add User — IC IITP Admin" };
export const dynamic  = "force-dynamic";

export default async function NewUserPage() {
  const session = await requireAuth();
  if (!session.superAdmin) redirect("/admin/users");

  return (
    <main className="p-8 max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <a href="/admin/users" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>← Users</a>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>Add user</h1>
      </div>
      <CreateUserForm />
    </main>
  );
}
