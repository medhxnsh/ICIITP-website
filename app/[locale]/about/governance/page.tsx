import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getGovernance } from "@/lib/content";
import { TeamRoster } from "@/components/team-roster";
import { Breadcrumb } from "@/components/breadcrumb";
import { Users } from "lucide-react";

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: "Governing Society",
  description: "The 17-member Governing Society of IC IITP, including the Director IIT Patna, Government of India and Bihar nominees, and independent industry representatives.",
};

export default async function GovernancePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const members = getGovernance(locale);

  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Governing Society" }]} variant="light" />
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
            <Users className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
            IC IITP Leadership
          </p>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">Governing Society</h1>
          <p className="text-white/80 text-lg max-w-lg">
            {members.length} members drawn from IIT Patna leadership, Government of India (MeitY), Government of Bihar, and independent industry and investment experts.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TeamRoster members={members} caption="IC IITP Governing Society members" />
      </div>
    </div>
  );
}
