import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/breadcrumb";
import { Link } from "@/i18n/navigation";
import {
  HelpCircle, Bot, FileText,
  Phone, Globe, ChevronDown,
} from "lucide-react";

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.help" });
  return { title: t("title"), description: t("description") };
}


const FAQS = [
  {
    q: "How do I apply for incubation?",
    a: "Visit the Programs page and choose the scheme that fits your startup stage. Each program has an 'Apply Now' button that opens the relevant Google Form. Applications are reviewed on a rolling basis.",
  },
  {
    q: "Who can apply for NIDHI Prayas funding?",
    a: "NIDHI Prayas is open to early-stage tech startups with a working prototype. You must be DPIIT-recognised or willing to register. The grant is up to ₹10 lakh, non-dilutive.",
  },
  {
    q: "Can I visit the labs without being an incubatee?",
    a: "Lab access is primarily for IC IITP incubatees. External researchers and academic collaborators may request access by writing to icitp@iitp.ac.in.",
  },
  {
    q: "What is DISHA?",
    a: "DISHA (Digital Information & Support Hub Assistant) is IC IITP's built-in knowledge guide — click the 'Ask DISHA' button at the bottom-right of any page. It can answer questions about all 12 programmes, eligibility, funding amounts, labs, facilities, and how to apply. For queries it can't answer, it will direct you to the relevant page or contact.",
  },
  {
    q: "How do I download application forms?",
    a: "All downloadable forms are on the Downloads page. PDFs open in a new tab. If a link is broken, please report it through the Feedback page or email icitp@iitp.ac.in.",
  },
  {
    q: "How do I report a website issue or broken link?",
    a: "Use the Feedback page or email icitp@iitp.ac.in with the page URL and a description of the issue. We aim to resolve reported issues within 10 working days.",
  },
];

export default async function HelpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Help" }]} variant="light" />
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 mt-6 text-orange-200">
            <HelpCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
            Support &amp; guidance
          </p>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">Help &amp; site guide</h1>
          <p className="text-white/80 text-lg max-w-lg">Frequently asked questions, the DISHA guide, and contact details for the IC IITP website.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick jump */}
        <nav aria-label="Help sections" className="flex flex-wrap gap-2 mb-10">
          {["FAQs", "DISHA guide", "Contact"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)", border: "1px solid var(--color-input-border)" }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* FAQs */}
        <section id="faqs" aria-labelledby="faq-h" className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <HelpCircle className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} aria-hidden="true" />
            <h2 id="faq-h" className="text-xl font-bold" style={{ color: "var(--color-brand-950)" }}>
              Frequently asked questions
            </h2>
          </div>
          <dl className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="rounded-xl bg-white overflow-hidden group"
                style={{ border: "1px solid var(--color-border-subtle)" }}
              >
                <summary
                  className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer text-sm font-semibold list-none"
                  style={{ color: "var(--color-brand-950)" }}
                >
                  <dt>{q}</dt>
                  <ChevronDown
                    className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180"
                    style={{ color: "var(--color-brand-600)" }}
                    aria-hidden="true"
                  />
                </summary>
                <dd
                  className="px-5 pb-4 text-sm leading-relaxed"
                  style={{ color: "var(--color-text-body)", borderTop: "1px solid #f0f7e6" }}
                >
                  <div className="pt-3">{a}</div>
                </dd>
              </details>
            ))}
          </dl>
        </section>

        {/* DISHA Guide */}
        <section id="disha-assistant" aria-labelledby="disha-h" className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <Bot className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} aria-hidden="true" />
            <h2 id="disha-h" className="text-xl font-bold" style={{ color: "var(--color-brand-950)" }}>
              DISHA — your IC IITP guide
            </h2>
          </div>
          <div className="rounded-xl bg-white p-6" style={{ border: "1px solid var(--color-border-subtle)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-body)" }}>
              <strong style={{ color: "var(--color-brand-950)" }}>DISHA</strong> (Digital Information &amp; Support Hub Assistant) is IC IITP&apos;s built-in knowledge guide. It&apos;s available on every page — look for the <strong style={{ color: "var(--color-brand-950)" }}>Ask DISHA</strong> button at the bottom-right corner.
            </p>
            <ul className="space-y-3 text-sm mb-5" style={{ color: "var(--color-text-body)" }}>
              <li className="flex gap-2"><span style={{ color: "var(--color-accent)" }}>›</span> Ask about all 12 incubation programmes — eligibility, funding amounts, duration, sectors, application process.</li>
              <li className="flex gap-2"><span style={{ color: "var(--color-accent)" }}>›</span> Get directions to the right page — labs, events, notifications, downloads, portfolio.</li>
              <li className="flex gap-2"><span style={{ color: "var(--color-accent)" }}>›</span> Ask about facilities — Clean Room, ESDM lab, BioNEST, PCB fabrication, co-working space.</li>
              <li className="flex gap-2"><span style={{ color: "var(--color-accent)" }}>›</span> Get contact details and find out how to reach the team.</li>
              <li className="flex gap-2"><span style={{ color: "var(--color-accent)" }}>›</span> Understand the difference between NIDHI Prayas, NIDHI-EIR, SISF, MeitY, GENESIS, iDEX, and other schemes.</li>
            </ul>
            <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-input-border)" }}>
              <p style={{ color: "var(--color-brand-800)" }}>
                <strong>Tip:</strong> DISHA works best with specific questions like &ldquo;What is the grant amount for NIDHI Prayas?&rdquo; or &ldquo;Which programme is right for a pre-revenue hardware startup?&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" aria-labelledby="contact-h">
          <div className="flex items-center gap-3 mb-5">
            <Phone className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} aria-hidden="true" />
            <h2 id="contact-h" className="text-xl font-bold" style={{ color: "var(--color-brand-950)" }}>
              Contact &amp; support
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: <Phone className="w-5 h-5" />, label: "Phone", value: "+91 611 523 3547", href: "tel:+916115233547" },
              { icon: <Globe className="w-5 h-5" />, label: "Email", value: "icitp@iitp.ac.in", href: "mailto:icitp@iitp.ac.in" },
              { icon: <FileText className="w-5 h-5" />, label: "Feedback form", value: "Share your thoughts", href: "/feedback" },
            ].map(({ icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-start gap-3 rounded-xl p-4 bg-white transition-shadow hover:shadow-sm"
                style={{ border: "1px solid var(--color-border-subtle)" }}
              >
                <span className="mt-0.5 shrink-0" style={{ color: "var(--color-brand-800)" }} aria-hidden="true">{icon}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--color-brand-600)" }}>{label}</p>
                  <p className="text-sm font-medium" style={{ color: "var(--color-brand-950)" }}>{value}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
