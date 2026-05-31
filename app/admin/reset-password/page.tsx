import { ResetPasswordForm } from "./_form";

export const metadata = { title: "Reset Password — IC IITP Admin" };

export default function ResetPasswordPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#f2faf5" }}
    >
      <div className="mb-8 text-center">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 font-black text-white text-xl"
          style={{ backgroundColor: "var(--color-brand-800)" }}
          aria-hidden="true"
        >
          IC
        </div>
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-800)" }}>
          IC IITP Staff Portal
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-body)" }}>
          Incubation Centre, IIT Patna
        </p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#e8f0e0] p-8">
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-brand-950)" }}>
          Enter your OTP
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-body)" }}>
          Check the recovery email configured on the server for your 6-digit code. The code expires in 15 minutes.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
