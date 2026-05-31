import { requireAuth } from "@/lib/auth";
import { AdminSidebar } from "../_sidebar";
import { AdminTopBar } from "../_topbar";
import { AdminRightPanel } from "../_right-panel";
import { ToastProvider } from "@/components/admin/toast-provider";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <ToastProvider>
      <style>{`body { overflow: hidden; background-color: #f2faf5; }`}</style>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f2faf5" }}>
        <AdminSidebar user={user} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminTopBar />
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto min-w-0">
              {children}
            </div>
            <AdminRightPanel superAdmin={user.superAdmin} permissions={user.permissions} />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
