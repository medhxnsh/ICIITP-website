import Image from "next/image";
import { ForgotPasswordForm } from "./_form";

export const metadata = { title: "Forgot Password — IC IITP Admin" };

export default function ForgotPasswordPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#f2faf5" }}
    >
      {/* Logo / wordmark */}
      <div className="mb-8 text-center">
        <Image
          src="/logo.png"
          alt="IC IITP"
          width={64}
          height={64}
          className="mx-auto mb-4 rounded-2xl"
        />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-800)" }}>
          IC IITP Staff Portal
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-body)" }}>
          Incubation Centre, IIT Patna
        </p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#e8f0e0] p-8">
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-brand-950)" }}>
          Reset your password
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--color-text-body)" }}>
          Enter your super-admin email. A one-time code will be sent to the recovery email configured on the server.
        </p>

        {/* Non-superadmin notice */}
        <div className="mb-5 px-3.5 py-3 rounded-lg text-sm" style={{ backgroundColor: "#fef9ec", border: "1px solid #f5e09a", color: "#7a5c00" }}>
          <span className="font-semibold">Not a super-admin?</span> Password reset is only available for the super-admin account. Contact your administrator to have your password reset.
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
