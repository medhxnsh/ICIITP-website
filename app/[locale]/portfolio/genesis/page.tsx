import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPublishedStartups } from "@/lib/cms/startups";
import { StartupGrid } from "@/components/startup-grid";
import { Breadcrumb } from "@/components/breadcrumb";

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: "GENESIS Portfolio",
  description: "Startups supported by IC IITP under the GENESIS scheme.",
};

export const revalidate = 60;

export default async function PortfolioSchemePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const startups = await getPublishedStartups("genesis").catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[96px] pb-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Portfolio", href: "/portfolio" }, { label: "GENESIS" }]} />
      <header className="mb-10">
        <h1 className="text-2xl sm:text-4xl font-black text-[var(--color-brand-800)] mb-4">GENESIS Portfolio</h1>
        <p className="text-lg text-[var(--color-text-subtle)] max-w-2xl">
          {startups.length} startups supported under the GENESIS scheme.
        </p>
      </header>
      <StartupGrid startups={startups} filterScheme="genesis" />
    </div>
  );
}
