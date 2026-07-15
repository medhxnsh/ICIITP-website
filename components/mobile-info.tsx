import { Monitor, MapPin, Phone, Mail, Clock, FlaskConical, GraduationCap, Building2, PhoneCall, Users, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

// ── Desktop-only warning banner ────────────────────────────────────────────

function DesktopBanner() {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 text-sm font-medium"
      style={{
        backgroundColor: "#1c2e06",
        color: "#f9ad4e",
        borderBottom: "1px solid #2a3a0d",
      }}
    >
      <Monitor className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <p className="leading-snug">
        You&apos;re viewing a <strong>static snapshot</strong> of this page.{" "}
        For live updates, current programme status, and the full experience —{" "}
        <strong>open this on a desktop browser.</strong>
      </p>
    </div>
  );
}

// ── Shared hero ────────────────────────────────────────────────────────────

function MobileHero({
  eyebrow,
  icon: Icon,
  title,
  subtitle,
  breadcrumb,
}: {
  eyebrow: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  breadcrumb: string[];
}) {
  return (
    <div
      className="relative overflow-hidden px-4 pt-20 pb-10"
      style={{
        background:
          "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff07 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-white/50">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-1.5">
            {i > 0 && <span>/</span>}
            <span className={i === breadcrumb.length - 1 ? "text-white/80" : ""}>{crumb}</span>
          </span>
        ))}
      </nav>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-orange-200">
        <Icon className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
        {eyebrow}
      </p>
      <h1 className="text-3xl font-black text-white leading-tight mb-3">{title}</h1>
      <p className="text-white/80 text-base leading-relaxed">{subtitle}</p>
    </div>
  );
}

// ── Section heading ────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-black mb-4" style={{ color: "var(--color-brand-950)" }}>
      {children}
    </h2>
  );
}

// ── Stat pill ──────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-xl p-4 text-center border"
      style={{
        backgroundColor: "var(--color-brand-50)",
        borderColor: "var(--color-brand-200)",
      }}
    >
      <p className="text-2xl font-black" style={{ color: "var(--color-brand-800)" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABOUT
// ═══════════════════════════════════════════════════════════════════════════

function AboutSection() {
  const domains = [
    "Electronic System Design & Manufacturing (ESDM)",
    "Medical Electronics & MedTech",
    "Information & Communication Technology (ICT)",
    "Biotechnology & Life Sciences",
    "IoT & Cyber Physical Systems",
    "Artificial Intelligence & Deep Tech",
  ];

  const partners = [
    "IIT Patna", "MeitY", "DST / NSTEDB", "DPIIT (Startup India Seed Fund)",
    "BIRAC / DBT", "Govt. of Bihar (IT, Industries & S&T Depts.)",
    "MSME Govt. of India", "AIIMS Delhi & AIIMS Patna",
    "Indian Angel Network", "NIELIT Patna", "CII Bihar",
    "King's College London", "IIT Bombay", "IIT Madras",
    "Central University of South Bihar", "Moonpreneur",
  ];

  const sharedSpaces = [
    "Air-conditioned co-working space",
    "8-seater meeting rooms",
    "30-seater conference facility",
    "Dedicated rental office cabins",
    "BioNEST co-working and lab wing (10,000 sq ft)",
    "Class-100 Clean Room (under expansion)",
  ];

  return (
    <div className="px-4 py-8 space-y-10" style={{ backgroundColor: "var(--color-surface)" }}>

      {/* Vision & Mission */}
      <section>
        <SectionHeading>Vision &amp; Mission</SectionHeading>
        <div className="space-y-4">
          <div
            className="rounded-xl p-5 text-white"
            style={{ backgroundColor: "var(--color-brand-800)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-2">Vision</p>
            <p className="text-sm leading-relaxed">
              Be the leading technology business incubator in the country for the development of products and intellectual property (IP) in the area of Electronic System Design and Manufacturing (ESDM) with a special focus on Medical Electronics.
            </p>
          </div>
          <div
            className="rounded-xl p-5 border"
            style={{
              backgroundColor: "var(--color-brand-50)",
              borderColor: "var(--color-brand-200)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>Mission</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
              We are particularly keen to work with companies who, through their innovative solutions, will make healthcare accessible and affordable to the common man.
            </p>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section>
        <SectionHeading>Key Numbers</SectionHeading>
        <div className="grid grid-cols-2 gap-3">
          <StatCard value="₹47.10 Cr" label="Total Undertaking" />
          <StatCard value="500+ Acres" label="IIT Patna Campus" />
          <StatCard value="100+" label="Startups Supported" />
          <StatCard value="12" label="Incubation Schemes" />
          <StatCard value="1,000+" label="B-Plans Screened" />
          <StatCard value="25" label="Patents Facilitated" />
          <StatCard value="600+" label="Funding Transactions" />
          <StatCard value="6" label="Specialised Labs" />
        </div>
      </section>

      {/* Background */}
      <section>
        <SectionHeading>Background</SectionHeading>
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--color-text-body)" }}>
          <p>
            The Incubation Centre, IIT Patna (IC IITP) is a result of a collaboration between the Government of India (47%) and the Government of Bihar (53%), constituting a ₹47.10 Crore undertaking tied to India&apos;s MAKE IN INDIA initiative. It is registered as the IC IITP Society (Reg. No. 987, 2015–16).
          </p>
          <p>
            Located on IIT Patna&apos;s 500+ acre campus at Bihta, Patna, the centre operates across three primary domains: Electronic System Design &amp; Manufacturing (ESDM), Medical Electronics, and Information &amp; Communication Technology (ICT). It supports startups through mentoring, access to technical facilities, office space, and seed funding.
          </p>
          <p>
            Since inception, IC IITP has screened over 1,000 business plans, supported 100+ startups across twelve incubation schemes, facilitated 25 patent filings, and deployed seed capital through 600+ funding transactions.
          </p>
        </div>
      </section>

      {/* Infrastructure */}
      <section>
        <SectionHeading>Infrastructure</SectionHeading>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            ["30,000 sq ft", "Total Facility Area"],
            ["10,000 sq ft", "BioNEST Wing"],
            ["6", "Specialised Labs"],
            ["30-Seater", "Conference Room"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-lg p-3 text-center border"
              style={{
                backgroundColor: "var(--color-brand-50)",
                borderColor: "var(--color-brand-200)",
              }}
            >
              <p className="text-lg font-black" style={{ color: "var(--color-brand-800)" }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
        <ul className="space-y-2">
          {sharedSpaces.map((item) => (
            <li
              key={item}
              className="flex gap-2 items-start text-sm p-3 rounded-lg border"
              style={{
                backgroundColor: "var(--color-surface-alt)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-subtle)",
              }}
            >
              <span style={{ color: "var(--color-brand-600)" }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Focus Domains */}
      <section>
        <SectionHeading>Focus Domains</SectionHeading>
        <div className="flex flex-wrap gap-2">
          {domains.map((d) => (
            <span
              key={d}
              className="text-xs px-3 py-1.5 rounded-full border font-medium"
              style={{
                backgroundColor: "var(--color-brand-50)",
                borderColor: "var(--color-brand-300)",
                color: "var(--color-brand-800)",
              }}
            >
              {d}
            </span>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section>
        <SectionHeading>Partners &amp; Collaborators</SectionHeading>
        <ul className="grid grid-cols-2 gap-2">
          {partners.map((p) => (
            <li
              key={p}
              className="text-xs py-2 px-3 rounded-lg border"
              style={{
                backgroundColor: "var(--color-surface-alt)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-subtle)",
              }}
            >
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Sub-pages */}
      <section>
        <SectionHeading>Our People</SectionHeading>
        <div className="space-y-3">
          {[
            { href: "/about/governance", title: "Governing Society", desc: "17 members including Director IIT Patna, Government of India (MeitY) nominees, Government of Bihar nominees, and independent industry and investment representatives." },
            { href: "/about/evaluation-team", title: "Project Evaluation Team", desc: "14 domain experts from IIT Patna, IIT Bombay, IIT Madras, King's College London, and the investment community who evaluate and guide incubated startups." },
            { href: "/about/staff", title: "IC IITP Staff", desc: "18-member operational team spanning incubation management, laboratory operations, technical support, and administration." },
          ].map(({ href, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start justify-between gap-3 p-4 rounded-xl border"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div>
                <p className="font-bold text-sm mb-1" style={{ color: "var(--color-brand-950)" }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-subtle)" }}>{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--color-brand-600)" }} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRAMS
// ═══════════════════════════════════════════════════════════════════════════

function ProgramsSection() {
  const sections = [
    {
      key: "PRE_INCUBATION",
      title: "Pre-Incubation",
      subtitle: "Idea → Prototype",
      accentColor: "#f79420",
      bg: "#fff8f0",
      border: "#f9ad4e40",
      description: "Early-stage support for innovators with an idea or early prototype. Grants, stipends, and mentorship to help you build your first working proof-of-concept.",
      programs: [
        {
          slug: "nidhi-prayas",
          name: "NIDHI Prayas",
          badge: "DST NIDHI",
          funder: "Dept. of Science & Technology, Govt. of India",
          grant: "₹2.5 Lakh",
          duration: "12 months",
          tagline: "Seed grant for early-stage innovators to develop a proof-of-concept prototype.",
          highlights: [
            "₹2.5L grant for PoC development",
            "12-month incubation period",
            "Access to IC IITP lab infrastructure",
            "Mentoring by IIT Patna faculty & industry experts",
            "Support for patent filing",
          ],
        },
        {
          slug: "nidhi-eir",
          name: "NIDHI EIR",
          badge: "DST NSTEDB",
          funder: "Dept. of Science & Technology, Govt. of India",
          grant: "₹30,000/month stipend",
          duration: "12 months",
          tagline: "Entrepreneur-in-Residence programme for aspiring deep-tech founders with a compelling idea.",
          highlights: [
            "₹30,000/month stipend for 12 months",
            "Full lab and co-working access",
            "Mentorship and ideation support",
            "Bridge to NIDHI Prayas / formal incubation",
          ],
        },
      ],
    },
    {
      key: "INCUBATION",
      title: "Incubation",
      subtitle: "Prototype → Market",
      accentColor: "#3a5214",
      bg: "#f0f7e6",
      border: "#3a521430",
      description: "Full-stack incubation with seed funding, lab access, mentoring, and legal support to take your validated prototype to a market-ready product.",
      programs: [
        {
          slug: "meity",
          name: "MeitY Scheme",
          badge: "MeitY",
          funder: "Ministry of Electronics & Information Technology, Govt. of India",
          grant: "Up to ₹20 Lakh",
          duration: "18–24 months",
          tagline: "Seed funding and incubation support for ESDM-focused startups under MeitY's national initiative.",
          highlights: [
            "Up to ₹20L seed grant",
            "Full lab access — Clean Room, PCB Fab, Testing & Cal",
            "Faculty mentors from IIT Patna",
            "Business development and investor connects",
          ],
        },
        {
          slug: "meity-i",
          name: "MeitY-I (Structured)",
          badge: "MeitY",
          funder: "Ministry of Electronics & Information Technology, Govt. of India",
          grant: "Tiered grant — up to ₹25 Lakh",
          duration: "24 months",
          tagline: "Structured incubation track with milestoned disbursement for hardware-focused deep-tech startups.",
          highlights: [
            "Milestone-linked tiered grant structure",
            "Equity-free for seed tranche",
            "Access to IC IITP ESDM infrastructure",
            "Market readiness and go-to-market support",
          ],
        },
        {
          slug: "genesis",
          name: "Genesis",
          badge: "MeitY",
          funder: "Ministry of Electronics & Information Technology, Govt. of India",
          grant: "Equity + grant hybrid",
          duration: "24 months",
          tagline: "MeitY-backed acceleration programme for startups targeting global ESDM markets.",
          highlights: [
            "Equity participation model",
            "Deep mentoring from C-level industry leaders",
            "Global market linkages",
            "Investor demo days",
          ],
        },
        {
          slug: "genesis-eir",
          name: "Genesis EIR",
          badge: "MeitY",
          funder: "Ministry of Electronics & Information Technology, Govt. of India",
          grant: "Monthly stipend",
          duration: "12 months",
          tagline: "Entrepreneur-in-Residence track under the Genesis programme for hardware-focused innovators.",
          highlights: [
            "Structured EIR track under Genesis umbrella",
            "Access to Genesis network and mentors",
            "Path to full Genesis incubation",
          ],
        },
        {
          slug: "sisf",
          name: "SISF",
          badge: "DPIIT",
          funder: "DPIIT, Startup India Seed Fund",
          grant: "Up to ₹20 Lakh",
          duration: "18 months",
          tagline: "Startup India Seed Fund for early revenue-stage startups across all deep-tech domains.",
          highlights: [
            "Up to ₹20L seed fund (equity-free tranche available)",
            "Open to all technology domains",
            "Fast-track application process",
          ],
        },
        {
          slug: "bionest",
          name: "BioNEST",
          badge: "DBT BioNEST",
          funder: "Dept. of Biotechnology / BIRAC, Govt. of India",
          grant: "Wet-lab access + grant support",
          duration: "12–24 months",
          tagline: "Biotech and medical technology incubation within IC IITP's dedicated 10,000 sq ft BioNEST wing.",
          highlights: [
            "10,000 sq ft dedicated BioNEST facility",
            "Wet lab and bioscience infrastructure",
            "BIRAC / DBT network access",
            "Connections to AIIMS Delhi, AIIMS Patna",
          ],
        },
        {
          slug: "idex",
          name: "iDEX",
          badge: "iDEX",
          funder: "Ministry of Defence, Govt. of India",
          grant: "Up to ₹1.5 Crore",
          duration: "Project-based",
          tagline: "Innovations for Defence Excellence — funding for dual-use defence and aerospace technology startups.",
          highlights: [
            "Up to ₹1.5 Cr project grant",
            "Defence DPIIT recognition pathway",
            "Access to DRDO / defence procurement network",
            "Dual-use (civilian + defence) tech eligible",
          ],
        },
        {
          slug: "startup-bihar",
          name: "Startup Bihar",
          badge: "Govt. Bihar",
          funder: "Govt. of Bihar — IT, Industries & S&T Departments",
          grant: "State grant + facilities",
          duration: "12–18 months",
          tagline: "Bihar government initiative implemented by IC IITP to nurture entrepreneurs across the state.",
          highlights: [
            "State-backed grant support",
            "Incubation space and lab access",
            "Mentoring from IIT Patna faculty",
            "Connections to Bihar industry ecosystem",
          ],
        },
        {
          slug: "msme",
          name: "MSME Scheme",
          badge: "MSME",
          funder: "Ministry of Micro, Small & Medium Enterprises, Govt. of India",
          grant: "Project-based support",
          duration: "Ongoing",
          tagline: "MSME-backed incubation and technology development support for manufacturing-focused startups.",
          highlights: [
            "MSME recognition and certification support",
            "Technical infrastructure access",
            "Industry linkages for manufacturing scale-up",
          ],
        },
        {
          slug: "incubation",
          name: "IC IITP General Incubation",
          badge: "IC IITP",
          funder: "Incubation Centre, IIT Patna",
          grant: "Infrastructure + mentoring",
          duration: "12–24 months",
          tagline: "IC IITP's own incubation track for technology startups not covered under any sponsored scheme.",
          highlights: [
            "Co-working and office space",
            "Access to all IC IITP labs",
            "IIT Patna faculty mentorship",
            "Investor and partner network access",
          ],
        },
      ],
    },
    {
      key: "ACCELERATION",
      title: "Acceleration",
      subtitle: "Market → Scale",
      accentColor: "#1e3209",
      bg: "#e8f5ee",
      border: "#1e320930",
      description: "Structured acceleration for startups with early revenue, helping them grow faster through business development, investor access, and technical scaling.",
      programs: [],
    },
  ];

  return (
    <div className="px-4 py-8 space-y-10" style={{ backgroundColor: "var(--color-surface)" }}>

      {/* Journey overview */}
      <section>
        <SectionHeading>Incubation Journey</SectionHeading>
        <div className="flex items-center gap-0">
          {[
            { label: "Pre-Incubation", sub: "Idea → Prototype", color: "#f79420" },
            { label: "Incubation", sub: "Prototype → Market", color: "#3a5214" },
            { label: "Acceleration", sub: "Market → Scale", color: "#1e3209" },
          ].map((stage, i, arr) => (
            <div key={stage.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <p className="text-[10px] font-bold text-center leading-tight" style={{ color: stage.color }}>{stage.label}</p>
                <p className="text-[9px] text-center leading-tight" style={{ color: "var(--color-muted)" }}>{stage.sub}</p>
              </div>
              {i < arr.length - 1 && (
                <div className="w-4 h-px shrink-0 mx-1" style={{ backgroundColor: "var(--color-border)" }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Each section */}
      {sections.map((sec) => (
        <section key={sec.key}>
          <div
            className="rounded-2xl p-5 border"
            style={{ backgroundColor: sec.bg, borderColor: sec.border }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-lg font-black" style={{ color: "var(--color-brand-950)" }}>{sec.title}</h2>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: sec.accentColor + "18", color: sec.accentColor }}
                  >
                    {sec.subtitle}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-body)" }}>{sec.description}</p>
              </div>
            </div>

            {sec.programs.length === 0 ? (
              <p className="text-sm italic" style={{ color: "var(--color-placeholder)" }}>
                Visit the desktop site for currently active acceleration programmes.
              </p>
            ) : (
              <div className="space-y-4">
                {sec.programs.map((prog) => (
                  <div
                    key={prog.slug}
                    className="rounded-xl p-4 border bg-white"
                    style={{ borderColor: sec.accentColor + "28" }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5"
                          style={{ backgroundColor: sec.accentColor + "18", color: sec.accentColor }}
                        >
                          {prog.badge}
                        </span>
                        <h3 className="font-bold text-sm" style={{ color: "var(--color-brand-950)" }}>{prog.name}</h3>
                      </div>
                      {prog.grant && (
                        <span className="text-xs font-bold shrink-0 mt-0.5" style={{ color: sec.accentColor }}>{prog.grant}</span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--color-text-subtle)" }}>{prog.tagline}</p>
                    <p className="text-[10px] mb-2" style={{ color: "var(--color-muted)" }}>
                      Funder: {prog.funder} · Duration: {prog.duration}
                    </p>
                    <ul className="space-y-1">
                      {prog.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-xs" style={{ color: "var(--color-text-subtle)" }}>
                          <CheckCircle className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "var(--color-brand-600)" }} aria-hidden="true" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Apply CTA */}
      <section>
        <div
          className="rounded-2xl p-5 text-white text-center"
          style={{ backgroundColor: "var(--color-brand-800)" }}
        >
          <p className="font-bold text-base mb-1">Ready to apply?</p>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
            Visit the desktop site or email us to start your application.
          </p>
          <a
            href="mailto:iciitp@iitp.ac.in"
            className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl bg-white"
            style={{ color: "var(--color-brand-800)" }}
          >
            iciitp@iitp.ac.in
          </a>
        </div>
      </section>

      <p className="text-xs text-center pb-2" style={{ color: "var(--color-placeholder)" }}>
        Programme details, grant amounts, and availability subject to change. Visit desktop for live status.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FACILITIES
// ═══════════════════════════════════════════════════════════════════════════

function FacilitiesSection() {
  const labs = [
    {
      slug: "clean-room",
      title: "Clean Room Lab",
      tagline: "Class-100 cleanroom environment for microfabrication and thin-film processing.",
      area: "Part of 30,000 sq ft facility",
      labClass: "Class 100",
      equipment: [
        { name: "Deionised Water System", purpose: "Ultra-pure water for wafer cleaning and chemical processing" },
        { name: "Mask Aligner & Exposure System", purpose: "Photolithography for micro-scale patterning" },
        { name: "RF Sputtering System", purpose: "Radio-frequency physical vapour deposition of thin films" },
        { name: "DC Sputtering System", purpose: "Direct-current sputtering for conductive thin films" },
        { name: "Thermal Evaporation System", purpose: "Resistance-heated evaporation of metals and dielectrics" },
        { name: "E-Beam Evaporation System", purpose: "Electron-beam evaporation for high-purity thin-film deposition" },
        { name: "Spin Coater", purpose: "Uniform photoresist and thin-film coating on substrates" },
        { name: "Hot Plate / Oven", purpose: "Photoresist baking and annealing processes" },
        { name: "Wet Bench (Chemical Hood)", purpose: "Wet chemical etching, cleaning, and surface preparation" },
        { name: "Optical Microscope", purpose: "Inspection of microfabricated structures and defects" },
      ],
    },
    {
      slug: "design-sim",
      title: "Design & Simulation Lab",
      tagline: "Software tools for electronic design automation, mechanical CAD, and embedded simulation.",
      area: null,
      labClass: null,
      equipment: [
        { name: "MATLAB / Simulink", purpose: "Mathematical modelling, signal processing, and control system simulation" },
        { name: "SolidWorks", purpose: "3D mechanical CAD, FEA structural analysis, and product design" },
        { name: "Proteus Design Suite (ISIS + ARES)", purpose: "Electronic schematic capture, PCB layout, and embedded simulation" },
        { name: "ANSYS (Academic)", purpose: "Finite element analysis for structural, thermal, and fluid dynamics" },
        { name: "Cadence Virtuoso / Allegro (Academic)", purpose: "Analog/mixed-signal IC design and PCB layout" },
        { name: "LTspice / Multisim", purpose: "SPICE-based electronic circuit simulation" },
        { name: "Python / TensorFlow / PyTorch Workstations", purpose: "Machine learning model development and training" },
        { name: "AutoCAD", purpose: "2D/3D drafting for product and enclosure design" },
        { name: "COMSOL Multiphysics (Academic)", purpose: "Multi-physics simulation for sensors, MEMS, and biomedical devices" },
        { name: "High-Performance Computing Workstations", purpose: "GPU-accelerated computation for simulation and deep learning" },
      ],
    },
    {
      slug: "pcb-fab",
      title: "PCB Fabrication Lab",
      tagline: "End-to-end PCB prototyping from layout milling to SMT assembly and rework.",
      area: null,
      labClass: null,
      equipment: [
        { name: "LPKF PROTOMAT S103", purpose: "High-precision PCB milling and drilling for rapid prototyping" },
        { name: "LPKF Protoprint S", purpose: "Solder paste printer for SMT assembly preparation" },
        { name: "ERSA HR600/2 BGA Rework Station", purpose: "BGA and fine-pitch component rework and reballing" },
        { name: "Reflow Oven", purpose: "SMT solder reflow for PCB assembly" },
        { name: "Hot Air Rework Station", purpose: "SMD component removal and placement" },
        { name: "Stereo Zoom Microscope", purpose: "PCB inspection and solder joint quality assessment" },
        { name: "UV Exposure Unit", purpose: "Photo-sensitised PCB layer exposure" },
        { name: "PCB Etching Tank", purpose: "Chemical etching of copper for PCB traces" },
        { name: "CNC Drilling Machine", purpose: "Through-hole drilling for multi-layer PCBs" },
        { name: "Pick and Place Machine", purpose: "Automated SMT component placement" },
        { name: "PCB Router", purpose: "Board singulation and edge routing" },
        { name: "Laminator", purpose: "Dry-film lamination for PCB processing" },
        { name: "Digital Soldering Station", purpose: "Temperature-controlled manual soldering" },
        { name: "ESD Workbenches", purpose: "Electrostatic-safe assembly environment" },
        { name: "PCB Cleaning System", purpose: "Post-solder flux removal and board cleaning" },
      ],
    },
    {
      slug: "esdm",
      title: "ESDM Lab",
      tagline: "Embedded systems and electronics development lab with microcontrollers, sensors, and IoT tooling.",
      area: null,
      labClass: null,
      equipment: [
        { name: "Arduino Development Boards (Uno, Mega, Nano)", purpose: "Rapid embedded prototyping and IoT development" },
        { name: "Raspberry Pi (4B, CM4)", purpose: "Single-board computers for IoT edge and ML inference" },
        { name: "STM32 / ESP32 / RISC-V Dev Kits", purpose: "ARM and RISC-V microcontroller development and evaluation" },
        { name: "FPGA Development Boards (Xilinx / Intel)", purpose: "Hardware description language prototyping and acceleration" },
        { name: "Sensor Suite", purpose: "Temperature, humidity, pressure, gas, motion, proximity, and optical sensors for prototyping" },
        { name: "RF Module Kit (LoRa, Zigbee, BLE, NB-IoT)", purpose: "Wireless connectivity prototyping for IoT devices" },
        { name: "Motor Driver & Actuator Kit", purpose: "DC, stepper, and servo motor control for robotics and automation" },
        { name: "Power Electronics Evaluation Kits", purpose: "SMPS, DC-DC converter, and battery management system prototyping" },
        { name: "JTAG / SWD Debuggers", purpose: "In-circuit debugging and programming of embedded targets" },
        { name: "Prototype Breadboards & Jumper Kit", purpose: "Rapid circuit assembly without soldering" },
      ],
    },
    {
      slug: "mech-packaging",
      title: "Mechanical Packaging Lab",
      tagline: "3D printing, laser cutting, and injection moulding for rapid enclosure and product prototyping.",
      area: null,
      labClass: null,
      equipment: [
        { name: "Kodama Trinus 3D Printer", purpose: "FDM/SLA dual 3D printing for small-format parts" },
        { name: "Prusa i3 MK3S+", purpose: "High-reliability FDM 3D printing for functional prototypes" },
        { name: "Raise3D Pro 2 Plus", purpose: "Large-format dual-extrusion FDM printing for enclosures" },
        { name: "CO₂ Laser Cutter / Engraver", purpose: "Precision cutting and engraving of acrylic, wood, and sheet metal" },
        { name: "Injection Moulding Machine (bench-top)", purpose: "Small-batch thermoplastic injection moulding for enclosures" },
        { name: "CNC Milling Machine", purpose: "Subtractive machining of aluminium and polymer parts" },
        { name: "Hand Tools & Precision Drill Press", purpose: "Mechanical assembly and rework" },
        { name: "Vacuum Former", purpose: "Thermoforming of plastic sheets for custom enclosures" },
        { name: "Filament Dryer / Storage", purpose: "Moisture-controlled 3D printing filament storage" },
      ],
    },
    {
      slug: "test-cal",
      title: "Testing & Calibration Lab",
      tagline: "High-frequency measurement and calibration infrastructure for electronic prototypes.",
      area: null,
      labClass: null,
      equipment: [
        { name: "Tektronix DSA 8300 Digital Serial Analyzer Sampling Oscilloscope", purpose: "High-speed serial data signal integrity measurement up to 70 GHz" },
        { name: "Vector Network Analyzer (VNA)", purpose: "S-parameter measurement for RF and microwave circuits" },
        { name: "Spectrum Analyzer", purpose: "Frequency-domain analysis and EMI pre-compliance testing" },
        { name: "Digital Storage Oscilloscope (DSO)", purpose: "Time-domain waveform capture and analysis" },
        { name: "Arbitrary Waveform Generator (AWG)", purpose: "Stimulus signal generation for device testing" },
        { name: "DC Power Supply (Bench, multi-channel)", purpose: "Regulated power for prototypes under test" },
        { name: "LCR Meter", purpose: "Precision impedance, inductance, and capacitance measurement" },
        { name: "Digital Multimeters (precision grade)", purpose: "Voltage, current, and resistance measurement" },
        { name: "Logic Analyzer", purpose: "Multi-channel digital signal capture and protocol decode" },
        { name: "Protocol Analyzer (USB / I2C / SPI / CAN)", purpose: "Embedded communication bus analysis and debugging" },
        { name: "Function / Signal Generator", purpose: "Standard waveform generation for circuit testing" },
        { name: "Thermal Camera", purpose: "Infrared thermal profiling of PCBs and power devices" },
        { name: "Environmental Test Chamber", purpose: "Temperature and humidity stress testing of prototypes" },
        { name: "Calibration Standards Kit", purpose: "Reference standards for traceable calibration" },
        { name: "ESD Test Equipment", purpose: "Electrostatic discharge susceptibility testing" },
      ],
    },
  ];

  return (
    <div className="px-4 py-8 space-y-8" style={{ backgroundColor: "var(--color-surface)" }}>

      {/* Infrastructure overview */}
      <section>
        <SectionHeading>Infrastructure Overview</SectionHeading>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            ["30,000 sq ft", "Total Facility Area"],
            ["10,000 sq ft", "BioNEST Wing"],
            ["6", "Specialised Labs"],
            ["30-Seater", "Conference Room"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-xl p-4 text-center border"
              style={{ backgroundColor: "var(--color-brand-50)", borderColor: "var(--color-brand-200)" }}
            >
              <p className="text-xl font-black" style={{ color: "var(--color-brand-800)" }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Shared spaces */}
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--color-brand-950)" }}>Shared Spaces</h3>
        <ul className="space-y-2">
          {[
            "Air-conditioned co-working space",
            "8-seater meeting rooms",
            "30-seater conference facility",
            "Dedicated rental office cabins",
            "BioNEST co-working and lab wing (10,000 sq ft)",
            "Class-100 Clean Room (under expansion)",
          ].map((item) => (
            <li
              key={item}
              className="flex gap-2 items-start text-sm p-3 rounded-lg border"
              style={{ backgroundColor: "var(--color-surface-alt)", borderColor: "var(--color-border)", color: "var(--color-text-subtle)" }}
            >
              <span style={{ color: "var(--color-brand-600)" }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Each lab */}
      <section>
        <SectionHeading>Laboratories</SectionHeading>
        <div className="space-y-6">
          {labs.map((lab) => (
            <div
              key={lab.slug}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              {/* Lab header */}
              <div
                className="px-4 py-4"
                style={{ background: "linear-gradient(160deg, var(--color-hero-from), var(--color-hero-via))" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">
                  <FlaskConical className="w-3 h-3 inline mr-1 -mt-0.5" aria-hidden="true" />
                  IC IITP Laboratory
                </p>
                <h3 className="font-black text-base text-white mb-1">{lab.title}</h3>
                <p className="text-sm text-white/75">{lab.tagline}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {lab.area && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>
                      Area: {lab.area}
                    </span>
                  )}
                  {lab.labClass && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>
                      Class: {lab.labClass}
                    </span>
                  )}
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>
                    {lab.equipment.length} instruments
                  </span>
                </div>
              </div>

              {/* Equipment list */}
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>Equipment</p>
                <ul className="space-y-2.5">
                  {lab.equipment.map((item) => (
                    <li key={item.name} className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold" style={{ color: "var(--color-brand-950)" }}>{item.name}</span>
                      <span className="text-xs leading-snug" style={{ color: "var(--color-text-subtle)" }}>{item.purpose}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lab access */}
              <div
                className="mx-4 mb-4 p-3 rounded-xl border"
                style={{ backgroundColor: "var(--color-surface-tint)", borderColor: "var(--color-input-border)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-brand-800)" }}>Lab Access & Booking</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-body)" }}>
                  Incubatees at IC IITP have priority access to all laboratory facilities. External researchers and companies may request lab access through our online form.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════════════════════════════════════════

function ContactSection() {
  return (
    <div className="px-4 py-8 space-y-8" style={{ backgroundColor: "var(--color-surface)" }}>

      {/* Main contact card */}
      <section>
        <SectionHeading>Get in Touch</SectionHeading>
        <div
          className="rounded-2xl p-5 text-white space-y-5"
          style={{ backgroundColor: "var(--color-brand-800)" }}
        >
          {/* Address */}
          <div className="flex gap-3.5">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f79420" }} aria-hidden="true" />
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: "#f79420" }}>Address</p>
              <p className="text-sm leading-relaxed text-white/90">
                Incubation Centre, IIT Patna<br />
                Amhara Road, Bihta<br />
                Patna, Bihar – 801103
              </p>
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Phone */}
          <div className="flex gap-3.5">
            <Phone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f79420" }} aria-hidden="true" />
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold mb-0.5" style={{ color: "#f79420" }}>General Enquiries</p>
                <p className="text-xs text-white/70">Mr. Pradhan</p>
                <a href="tel:06115233547" className="text-sm text-white hover:text-white/80 transition-colors">
                  06115233547
                </a>
              </div>
              <div>
                <p className="text-xs font-bold mb-0.5" style={{ color: "#f79420" }}>For Getting Incubated</p>
                <p className="text-xs text-white/70">Mrs. Deepti Anand</p>
                <a href="tel:+919608938788" className="text-sm text-white hover:text-white/80 transition-colors">
                  +91 9608938788
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Email */}
          <div className="flex gap-3.5">
            <Mail className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f79420" }} aria-hidden="true" />
            <div>
              <p className="text-xs font-bold mb-0.5" style={{ color: "#f79420" }}>Write to us</p>
              <a href="mailto:iciitp@iitp.ac.in" className="text-sm text-white hover:text-white/80 transition-colors">
                iciitp@iitp.ac.in
              </a>
              <p className="text-xs text-white/70 mt-0.5">We will get back to you.</p>
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Hours */}
          <div className="flex gap-3.5">
            <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f79420" }} aria-hidden="true" />
            <div>
              <p className="text-xs font-bold mb-0.5" style={{ color: "#f79420" }}>Office Hours</p>
              <p className="text-sm text-white/90">Monday – Friday</p>
              <p className="text-sm text-white/90">9:00 AM – 5:30 PM IST</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section>
        <SectionHeading>Quick Links</SectionHeading>
        <div className="space-y-3">
          {[
            { href: "/apply", label: "Apply for Incubation", desc: "Submit your incubation, lab access, or internship application" },
            { href: "/programs", label: "View All Programmes", desc: "Browse all 12 active incubation schemes" },
            { href: "/facilities", label: "Explore Facilities", desc: "Six specialised labs — Clean Room, PCB Fab, Testing & more" },
            { href: "/about", label: "About IC IITP", desc: "Our story, vision, mission, and team" },
          ].map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start justify-between gap-3 p-4 rounded-xl border"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div>
                <p className="text-sm font-bold mb-0.5" style={{ color: "var(--color-brand-950)" }}>{label}</p>
                <p className="text-xs leading-snug" style={{ color: "var(--color-text-subtle)" }}>{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--color-brand-600)" }} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      {/* Location note */}
      <section>
        <div
          className="rounded-xl p-4 border"
          style={{ backgroundColor: "var(--color-brand-50)", borderColor: "var(--color-brand-200)" }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-brand-800)" }}>Finding Us</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-body)" }}>
            IC IITP is located on the IIT Patna campus at Amhara Road, Bihta — approximately 30 km from Patna city centre. The campus is accessible from NH-30 (Patna–Aurangabad highway). Visit the desktop site for the interactive map and directions.
          </p>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════

const PAGE_META = {
  about: {
    eyebrow: "IIT Patna",
    icon: Building2,
    title: "About IC IITP",
    subtitle: "India's leading ESDM and Medical Electronics Incubator, located on the 500+ acre campus of IIT Patna.",
    breadcrumb: ["Home", "About IC IITP"],
  },
  programs: {
    eyebrow: "IC IITP",
    icon: GraduationCap,
    title: "Incubation Programs",
    subtitle: "IC IITP supports founders across every stage of the startup journey — from first idea to scaling a market-ready company.",
    breadcrumb: ["Home", "Programs"],
  },
  facilities: {
    eyebrow: "IC IITP Campus",
    icon: FlaskConical,
    title: "Facilities",
    subtitle: "A dedicated 30,000 sq ft building housing six state-of-the-art laboratories, a BioNEST wing, co-working spaces, and a 30-seater conference facility.",
    breadcrumb: ["Home", "Facilities"],
  },
  contact: {
    eyebrow: "Get in Touch",
    icon: PhoneCall,
    title: "Contact Us",
    subtitle: "Visit us at Bihta, Patna or reach out by phone or email — we're here to help.",
    breadcrumb: ["Home", "Contact"],
  },
} as const;

export function MobileInfo({ page }: { page: keyof typeof PAGE_META }) {
  const meta = PAGE_META[page];
  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>
      <DesktopBanner />
      <MobileHero
        eyebrow={meta.eyebrow}
        icon={meta.icon}
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumb={meta.breadcrumb}
      />
      {page === "about"      && <AboutSection />}
      {page === "programs"   && <ProgramsSection />}
      {page === "facilities" && <FacilitiesSection />}
      {page === "contact"    && <ContactSection />}
    </div>
  );
}
