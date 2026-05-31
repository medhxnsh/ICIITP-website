import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SkipLink } from "@/components/a11y/skip-link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ChatWidget } from "@/components/chat-widget";


interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: {
      default: t("siteTitle"),
      template: `%s · ${t("siteTitleShort")}`,
    },
    description: t("defaultDescription"),
    keywords: t("keywords"),
    metadataBase: new URL("https://iciitp.com"),
    openGraph: {
      siteName: t("siteTitle"),
      locale,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: t("siteTitle") }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og.png"],
    },
    icons: {
      icon: "/icon.png",
      apple: "/icon.png",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <SkipLink />
      <Nav />
      <main id="main-content" tabIndex={-1} className="flex flex-col min-h-screen">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </NextIntlClientProvider>
  );
}
