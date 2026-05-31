import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "./_form";
import { getMailStatusAction } from "./actions";
import { CheckCircle2, XCircle, Mail } from "lucide-react";

export const metadata = { title: "Settings — IC IITP Admin" };

export default async function SettingsPage() {
  const session = await requireAuth();
  if (!session.superAdmin) redirect("/admin");

  const mailStatus = await getMailStatusAction();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-body)" }}>
          Super-admin configuration and account security.
        </p>
      </div>

      {/* Mail status */}
      <section className="bg-white rounded-2xl border border-[#e8f0e0] p-6">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: "var(--color-brand-950)" }}>
          <Mail className="w-4 h-4" aria-hidden="true" />
          Email / SMTP status
        </h2>
        <div className="flex items-start gap-3">
          {mailStatus.configured ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--color-brand-800)" }} />
          ) : (
            <XCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--color-danger)" }} />
          )}
          <div className="text-sm" style={{ color: "var(--color-brand-950)" }}>
            {mailStatus.configured ? (
              <>
                <p className="font-medium">SMTP is configured.</p>
                {mailStatus.recoveryEmail && (
                  <p className="mt-1" style={{ color: "var(--color-text-body)" }}>
                    OTPs and submission notifications will be sent via <code className="font-mono text-xs">{mailStatus.recoveryEmail}</code>.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-medium" style={{ color: "var(--color-danger)" }}>SMTP is not configured.</p>
                <p className="mt-1" style={{ color: "var(--color-text-body)" }}>
                  Set <code className="font-mono text-xs">SMTP_HOST</code>, <code className="font-mono text-xs">SMTP_USER</code>, <code className="font-mono text-xs">SMTP_PASS</code>, <code className="font-mono text-xs">RECOVERY_EMAIL</code>, and <code className="font-mono text-xs">NOTIFY_EMAIL</code> in <code className="font-mono text-xs">config/.env</code> and restart the backend.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Change password */}
      <section className="bg-white rounded-2xl border border-[#e8f0e0] p-6">
        <h2 className="font-bold text-base mb-1" style={{ color: "var(--color-brand-950)" }}>Change password</h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-body)" }}>
          Update the password for your super-admin account.
        </p>
        <ChangePasswordForm />
      </section>

      {/* Emergency reset info */}
      <section className="bg-white rounded-2xl border border-[#e8f0e0] p-6">
        <h2 className="font-bold text-base mb-1" style={{ color: "var(--color-brand-950)" }}>Emergency password reset</h2>
        <p className="text-sm" style={{ color: "var(--color-text-body)" }}>
          If you are locked out and cannot log in, set <code className="font-mono text-xs bg-[#f2faf5] px-1 py-0.5 rounded">ADMIN_FORCE_RESET=true</code> in <code className="font-mono text-xs bg-[#f2faf5] px-1 py-0.5 rounded">config/.env</code> and restart the backend. The seeder will update the admin password to the current value of <code className="font-mono text-xs bg-[#f2faf5] px-1 py-0.5 rounded">ADMIN_PASSWORD</code>. Set <code className="font-mono text-xs bg-[#f2faf5] px-1 py-0.5 rounded">ADMIN_FORCE_RESET=false</code> again after restoring access.
        </p>
      </section>
    </div>
  );
}
