import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { LoginForm } from "./_form";

export const metadata = { title: "Sign in — IC IITP Admin" };

interface Props { searchParams: Promise<{ next?: string; reset?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const session = await getSession();
  const { next, reset } = await searchParams;
  if (session.userId) redirect(next?.startsWith("/admin") ? next : "/admin");

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

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#e8f0e0] p-8">
        <h2 className="text-lg font-bold mb-6" style={{ color: "var(--color-brand-950)" }}>
          Sign in to your account
        </h2>
        {reset === "1" && (
          <p className="text-sm rounded-lg px-3.5 py-2.5 mb-5" style={{ backgroundColor: "#f0f9e8", color: "var(--color-brand-950)" }}>
            Password reset successfully. Please sign in with your new password.
          </p>
        )}
        <LoginForm next={next} />
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: "var(--color-text-secondary)" }}>
        This portal is for IC IITP staff only.
        <br />
        Contact your administrator if you need access.
      </p>
    </div>
  );
}
