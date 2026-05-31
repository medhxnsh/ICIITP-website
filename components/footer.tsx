import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExternalLink } from "./external-link";
import Image from "next/image";

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");

  return (
    <footer className="text-white no-print" style={{ backgroundColor: "#2a3a0d" }} role="contentinfo">
      {/* Main footer — 4-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Column 1: Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="rounded-full shrink-0 p-0.5"
              style={{
                background: "rgba(255,255,255,0.07)",
                boxShadow: "0 0 0 1.5px rgba(255,255,255,0.14), 0 0 18px 4px rgba(255,255,255,0.06)",
              }}
            >
              <Image
                src="/logo.png"
                alt="IC IIT Patna"
                width={52}
                height={52}
                className="rounded-full block"
              />
            </div>
            <span className="text-sm font-medium text-white/70 leading-tight">
              IIT Patna<br />Incubation Centre
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            {t("tagline")}
          </p>
          <p className="text-xs text-white/75 leading-relaxed">
            {t("address")}
          </p>
          <p className="text-xs text-white/75 mt-1">☎ {t("phone")}</p>
          <p className="text-xs text-white/75">
            ✉{" "}
            <a href={`mailto:${t("email")}`} className="hover:text-white transition-colors">
              {t("email")}
            </a>
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
            {t("links")}
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            {[
              ["/", tn("home")],
              ["/about", tn("about")],
              ["/programs", tn("programs")],
              ["/portfolio", tn("portfolio")],
              ["/facilities", tn("facilities")],
              ["/events", tn("events")],
              ["/notifications", tn("notifications")],
              ["/contact", tn("contact")],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
            Resources
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <Link href="/help" className="hover:text-white transition-colors">{tn("help")}</Link>
            </li>
            <li>
              <Link href="/downloads" className="hover:text-white transition-colors">{tn("downloads")}</Link>
            </li>
            <li>
              <ExternalLink href="https://iciitp.com/zerolab/" className="hover:text-white transition-colors">
                Zero Lab
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://iitp.ac.in/" className="hover:text-white transition-colors">
                IIT Patna
              </ExternalLink>
            </li>
          </ul>
        </div>

        {/* Column 4: Follow Us + Contact */}
        <div>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
            {t("social")}
          </h3>
          <div className="flex gap-3 mb-6">
            <a href="https://in.linkedin.com/company/ic-iitp" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="https://x.com/iciitp" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.facebook.com/iciitp/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
          <div className="text-xs text-white/75 space-y-3">
            <div>
              <p className="font-semibold text-white/70 mb-1">{t("wim")}</p>
              <a href={`mailto:${t("wimContact")}`} className="hover:text-white transition-colors">
                {t("wimContact")}
              </a>
            </div>
            <div>
              <ExternalLink href="https://india.gov.in" className="hover:text-white transition-colors">
                {t("nationalPortal")}
              </ExternalLink>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/70">
          <p>{t("ownership")} · © {new Date().getFullYear()}</p>
          <p className="flex items-center gap-2">
            Developed by Medhansh Vibhu
            <a
              href="https://www.linkedin.com/in/medhansh-vibhu-798635286/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-white/70 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a
              href="https://github.com/medhxnsh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-white/70 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
