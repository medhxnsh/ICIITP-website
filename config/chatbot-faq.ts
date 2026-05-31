/**
 * DISHA chatbot FAQ data — edit this file to add, remove, or update Q&A entries.
 *
 * Each entry:
 *   id        — unique string identifier
 *   keywords  — phrases/words that trigger this answer (lowercase, partial matches work)
 *   question  — display label for the question
 *   answer    — the response shown to the user (supports **bold** markdown)
 *   followUps — optional suggested follow-up questions shown after the answer
 */
export interface FAQ {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  followUps?: string[];
}

export const FALLBACK =
  "I don't have a specific answer for that. Try asking about our programmes (NIDHI Prayas, NIDHI-EIR, GENESIS, MeitY, SISF, iDEX, BioNEST), facilities, how to apply, or contact details. You can also reach us at **icitp@iitp.ac.in**.";

export const FAQS: FAQ[] = [

  // ── General / About ───────────────────────────────────────────────────────
  {
    id: "what-is-iciitp",
    keywords: ["what is", "iciitp", "ic-iitp", "innovation centre", "innovation center", "about iciitp", "who are you", "tell me about", "incubation centre"],
    question: "What is IC-IITP?",
    answer:
      "**IC IITP** (Incubation Centre, IIT Patna) is India's leading ESDM and Medical Electronics Incubator, located on the 500+ acre campus of IIT Patna at Bihta, Patna. It is a ₹47.10 Crore collaboration between the Government of India (47%) and the Government of Bihar (53%), registered as IC IITP Society (Reg. No. 987, 2015–16). The centre offers 12 programmes spanning pre-incubation, incubation, and acceleration.",
    followUps: ["What is IC-IITP's vision?", "What programs are available?", "What facilities does IC-IITP have?"],
  },
  {
    id: "vision-mission",
    keywords: ["vision", "mission", "goal", "objective", "purpose", "aim"],
    question: "What is IC-IITP's vision?",
    answer:
      "IC IITP's **vision** is to be India's premier incubator for Electronics, ESDM (Electronic Systems Design & Manufacturing), and Medical Electronics — bridging the gap between academic research and market-ready products. The **mission** is to nurture startups from idea to market by providing world-class infrastructure, mentorship, and funding linkages, while contributing to the Aatmanirbhar Bharat initiative.",
    followUps: ["What facilities does IC-IITP have?", "How many startups has IC-IITP supported?"],
  },
  {
    id: "location",
    keywords: ["location", "address", "where", "campus", "bihta", "patna", "iit patna", "how to reach", "directions"],
    question: "Where is IC-IITP located?",
    answer:
      "IC IITP is located on the **IIT Patna campus at Bihta**, Patna — Bihar. The campus spans 500+ acres. The nearest airport is **Jay Prakash Narayan International Airport, Patna** (~30 km). The nearest railway station is **Bihta Railway Station** (~2 km from campus). By road, the campus is about 35–40 km from Patna city centre via NH-30.",
    followUps: ["What are IC-IITP's office hours?", "What is the contact email?"],
  },
  {
    id: "contact",
    keywords: ["contact", "email", "phone", "reach", "number", "call", "write", "office hours"],
    question: "How do I contact IC-IITP?",
    answer:
      "You can reach IC IITP through:\n\n**Email:** iciitp@iitp.ac.in\n**Phone:** +91 611 523 3547\n**Address:** Incubation Centre, IIT Patna, Bihta, Patna — 801103, Bihar\n\nFor programme-specific queries:\n- **Nidhi Prayas:** nidhiprayas.ic@iitp.ac.in\n- **Nidhi EIR:** nidhieir.ic@iitp.ac.in\n- All other programmes: iciitp@iitp.ac.in",
    followUps: ["Where is IC-IITP located?", "How do I apply for incubation?"],
  },
  {
    id: "startup-count",
    keywords: ["how many startups", "portfolio", "startups supported", "incubated startups", "companies", "how many companies"],
    question: "How many startups has IC-IITP supported?",
    answer:
      "IC IITP has supported **50+ startups** across all stages — pre-incubation, incubation, and acceleration. Notable programmes by startup count include: SISF (13 startups), GENESIS (4+ startups), BioNEST (multiple cohorts). The portfolio spans MedTech, Robotics, ESDM, AgriTech, EdTech, and Deep Tech.",
    followUps: ["What programs are available?", "How do I apply for incubation?"],
  },

  // ── Programs — Overview ───────────────────────────────────────────────────
  {
    id: "programs-overview",
    keywords: ["all programs", "list programs", "what programs", "all schemes", "list schemes", "which programs", "programmes available", "12 programs", "12 programmes"],
    question: "What programs are available at IC-IITP?",
    answer:
      "IC IITP runs **12 programmes** across three stages:\n\n**Pre-Incubation:**\n1. Nidhi Prayas (DST) — up to ₹10L grant\n2. Nidhi EIR (DST NSTEDB) — ₹10K–30K/month stipend\n3. GENESIS EIR (MeitY) — up to ₹10L\n\n**Incubation:**\n4. MeitY Phase I — seed support & lab access\n5. MeitY Phase II / GENESIS Pilot & Matching — up to ₹50L\n6. SISF (DPIIT) — up to ₹50L\n7. iDEX (Ministry of Defence) — up to ₹1.5 Crore\n8. BioNEST (BIRAC/DBT) — MedTech & biotech\n9. Startup Bihar — for Bihar-based founders\n10. MSME Incubation — for registered MSMEs\n\n**Acceleration:**\n11. Business Acceleration — 6-month growth programme\n12. Technical Acceleration — engineering & manufacturing scale-up",
    followUps: ["Which program is right for me?", "What is Nidhi Prayas?", "What is SISF?", "What is GENESIS?"],
  },
  {
    id: "which-program",
    keywords: ["which program", "right program", "suitable program", "which scheme", "which should i apply", "best program for me", "recommend"],
    question: "Which program is right for me?",
    answer:
      "Here's a quick guide:\n\n• **Idea / concept stage** → Nidhi Prayas, Nidhi EIR, or GENESIS EIR\n• **Working prototype, early startup** → MeitY Phase I, SISF, or BioNEST (if MedTech/biotech)\n• **DPIIT-registered, ready to pilot** → GENESIS Pilot (up to ₹40L) or SISF investment tranche\n• **Raising investment** → GENESIS Matching Investment (up to ₹50L)\n• **Defence / aerospace tech** → iDEX (up to ₹1.5 Crore)\n• **Based in Bihar** → Startup Bihar programme\n• **Registered MSME** → MSME Incubation\n• **Revenue-stage startup** → Business Acceleration (6 months)\n• **Hardware/manufacturing scale-up** → Technical Acceleration\n\nFor a personalised recommendation, email iciitp@iitp.ac.in.",
    followUps: ["How do I apply for incubation?", "What is SISF?", "What is GENESIS?"],
  },

  // ── Pre-Incubation Programmes ─────────────────────────────────────────────
  {
    id: "nidhi-prayas",
    keywords: ["nidhi prayas", "prayas", "dst prayas", "10 lakh grant", "prototype grant", "pre-incubation grant"],
    question: "What is Nidhi Prayas?",
    answer:
      "**Nidhi Prayas** is a DST (Dept. of Science & Technology) programme that provides grants of **up to ₹10 lakh** to convert an innovative idea into a working prototype or Proof-of-Concept.\n\n**Duration:** 12–18 months\n**Contact:** nidhiprayas.ic@iitp.ac.in\n\n**Sectors:** Agriculture, Healthcare, Clean Energy, IoT, Industry 4.0, Water\n\n**Eligibility:**\n• Individual innovators, student teams, or early-stage ventures\n• Idea must be technology-driven\n• Must not have received prior DST Nidhi Prayas or EIR support\n• Willingness to develop the prototype at or near IC IITP\n\n**Support:** Grant up to ₹10L, co-working space, mentorship, guidance on venture creation.",
    followUps: ["How do I apply for Nidhi Prayas?", "What is Nidhi EIR?", "What is GENESIS?"],
  },
  {
    id: "nidhi-prayas-apply",
    keywords: ["apply nidhi prayas", "nidhi prayas application", "nidhi prayas form", "prayas form"],
    question: "How do I apply for Nidhi Prayas?",
    answer:
      "**To apply for Nidhi Prayas:**\n1. Download the application form: **/pdfs/Appliation-Form-Nidhi-Prayas-2025with_Annexure.pdf**\n2. Fill it in and email to **nidhiprayas.ic@iitp.ac.in**\n3. Applications are screened within **4 weeks** of the call-closure date\n4. Only shortlisted applicants are notified and called to pitch to the Monitoring Committee\n5. Selected innovators receive a milestone-linked grant of up to ₹10L over 12–18 months\n\n**Note:** The decision of the screening committee is final. No feedback is provided for non-selected applications.",
    followUps: ["What is Nidhi Prayas?", "What is Nidhi EIR?"],
  },
  {
    id: "nidhi-eir",
    keywords: ["nidhi eir", "entrepreneur in residence", "eir", "stipend", "monthly stipend", "fellowship", "nidhi fellowship"],
    question: "What is Nidhi EIR?",
    answer:
      "**Nidhi EIR** (Entrepreneur-in-Residence) is a DST-NSTEDB fellowship for aspiring tech entrepreneurs. Fellows work full-time on their startup idea for **12 months** at IC IITP, receiving a monthly stipend.\n\n**Stipend:** ₹10,000–₹30,000/month (based on profile)\n**Duration:** 12 months\n**Contact:** nidhieir.ic@iitp.ac.in\n\n**Eligibility:**\n• Indian citizen\n• Completed 4-year UG/PG in Science or Engineering (or 3-year degree + 2 years work experience)\n• Must commit full-time to the business idea\n• Must not already be a significant shareholder (>10%) in another company\n• Must not have previously received NIDHI-EIR or NIDHI-PRAYAS support\n\n**Preference for:** Women entrepreneurs, deep-tech ideas, social impact ventures",
    followUps: ["How do I apply for Nidhi EIR?", "What is Nidhi Prayas?", "What is GENESIS EIR?"],
  },
  {
    id: "genesis",
    keywords: ["genesis", "genesis eir", "genesis pilot", "genesis matching", "meity genesis", "tier 2", "tier 3", "tier ii", "tier iii", "490 crore"],
    question: "What is GENESIS?",
    answer:
      "**GENESIS** (Gen-Next Support for Innovative Startups) is a **₹490 Crore MeitY scheme** to boost startups in Tier-II & Tier-III cities. IC IITP is an authorised GENESIS implementation partner.\n\n**4 funding verticals:**\n1. **EIR Support** — up to ₹10 lakh (ideation/PoC stage)\n2. **Pilot Funding** — up to ₹40 lakh (MVP + corporate pilot work order required)\n3. **Matching Investment** — up to ₹50 lakh (1:1 match with VC/angel funding)\n4. **Deep-Tech Support** — case-by-case for long-gestation deep tech\n\n**Domains:** AI/ML, IoT, VLSI, Cybersecurity, Blockchain, AR/VR, Electronics, Deep Tech\n\n**Key requirement for EIR:** Applicant must be from a Tier-II or Tier-III city. IC IITP has already incubated 4 startups under GENESIS.",
    followUps: ["How do I apply for GENESIS?", "What is the GENESIS Pilot programme?", "What is GENESIS Matching Investment?"],
  },
  {
    id: "genesis-apply",
    keywords: ["apply genesis", "genesis application", "genesis form", "genesis eir apply", "genesis pilot apply", "genesis matching apply"],
    question: "How do I apply for GENESIS?",
    answer:
      "**GENESIS Application Links:**\n\n• **EIR Programme** (up to ₹10L): forms.gle/NjpT51zChStHD7AM6\n• **Pilot Programme** (up to ₹40L): forms.gle/jXWo5z6B4nPTZC2f9\n• **Matching Investment** (up to ₹50L): forms.gle/rcGeBeQ32hqyWrvs9\n\nFor queries: **iciitp@iitp.ac.in**\n\n**Note for Pilot track:** You need a pilot work order/purchase order from a corporate with ₹75Cr+ turnover and 5+ years of operations.\n**Note for Matching track:** Private/institutional investment only counts — government grants do not qualify as matching.",
    followUps: ["What is GENESIS?", "What is GENESIS eligibility?"],
  },

  // ── Incubation Programmes ─────────────────────────────────────────────────
  {
    id: "meity-incubation",
    keywords: ["meity incubation", "meity phase 1", "meity phase i", "meity phase one", "meity programme", "ministry electronics incubation"],
    question: "What is MeitY Incubation Phase I?",
    answer:
      "**MeitY Incubation Phase I** is IC IITP's flagship government-funded incubation track, supported by the Ministry of Electronics & Information Technology.\n\n**Duration:** 12–24 months\n**Seed Fund:** Up to ₹10 lakh (offered to eligible startups)\n\n**Sectors:** ESDM, Medical Electronics, ICT, IoT, Robotics, Healthcare Devices, Deep Tech\n\n**Eligibility:** Startups, students, faculty, or innovators working in ESDM or ICT domains\n\n**Terms:**\n• Resident Incubation: 5% preference shares + ₹20,000 refundable deposit\n• Non-Resident: 3% preference shares, pay-per-use labs\n• Pre-Incubation (3 months): No charges\n\n**Apply:** forms.gle/N3zGMVek5rDjJRDW8",
    followUps: ["How does incubation selection work?", "What is MeitY Phase II?", "What facilities are available?"],
  },
  {
    id: "sisf",
    keywords: ["sisf", "startup india seed fund", "seed fund", "dpiit", "945 crore", "20 lakh grant", "50 lakh investment", "convertible debentures"],
    question: "What is SISF (Startup India Seed Fund)?",
    answer:
      "**SISF** (Startup India Seed Fund Scheme) is a **₹945 Crore DPIIT programme**. IC IITP is an approved incubator and has supported **13 startups** under SISF.\n\n**Funding:**\n• **Grant:** Up to ₹20 lakh (milestone-based, for PoC & prototype)\n• **Investment:** Up to ₹50 lakh (convertible debentures, for market entry & scaling)\n\n**Sectors:** MedTech, IoT, Robotics, Defence, Biotech, Clean Energy, Auto\n\n**Eligibility:**\n• DPIIT-recognised startup\n• Incorporated ≤ 2 years before application\n• At least 51% Indian promoter shareholding\n• Not received >₹10L under other government schemes\n• Must use technology in core product, service, or business model\n\n**Apply:** seedfund.startupindia.gov.in — select IC IITP as preferred incubator",
    followUps: ["How does SISF funding work?", "Who is eligible for SISF?", "What is GENESIS?"],
  },
  {
    id: "idex",
    keywords: ["idex", "defence", "defense", "innovations for defence excellence", "ministry of defence", "mod", "defence startup", "dic", "defence innovation challenge", "1.5 crore", "aerospace"],
    question: "What is iDEX?",
    answer:
      "**iDEX** (Innovations for Defence Excellence) is a Ministry of Defence initiative that funds startups solving real defence technology challenges from the Indian Armed Forces and Defence PSUs.\n\n**Grant:** Up to ₹1.5 Crore per challenge\n**Duration:** 12–18 months per challenge\n\n**Sectors:** Defence Electronics, Drones, Cybersecurity, AI, Robotics, Advanced Materials, Communications\n\n**How it works:**\n1. Browse open Defence Innovation Challenges (DICs) at idex.gov.in\n2. Apply against a specific challenge\n3. IC IITP provides infrastructure and mentoring support\n4. Selected startups receive up to ₹1.5 Cr grant\n\n**Key benefit:** IP ownership remains with the innovator.\n\n**Apply:** idex.gov.in | Queries: iciitp@iitp.ac.in",
    followUps: ["What is GENESIS?", "What is SISF?", "What facilities are available for defence tech?"],
  },
  {
    id: "bionest",
    keywords: ["bionest", "bio nest", "birac", "dbt", "biotech", "medtech", "biomedical", "life sciences", "bio-signal", "medical imaging", "10000 sq ft"],
    question: "What is BioNEST?",
    answer:
      "**BioNEST-ICIITP** is a dedicated **10,000 sq ft** Biotech and MedTech incubation wing at IC IITP, established under the BIRAC (Biotechnology Industry Research Assistance Council) BioNEST scheme. Call for Proposals 2 is currently active.\n\n**Focus Areas:** Bio-Signal Processing, Medical Imaging, Biomedical Devices, Disease Diagnostics using Biomarkers, Medical Materials\n\n**Eligibility:** Startups in Biotech, MedTech, Life Sciences — from idea stage to early scaling\n\n**Facilities:** Co-working spaces, 8-seater meeting rooms, 30-seater conference room, PCB Prototyping Lab, Product Design Lab, 3D Printing Lab, Testing & Validation Lab\n\n**Support:** Mentorship, product development, clinical studies access, BIRAC/DBT grant linkages, investor meets\n\n**Apply:** Download the BioNEST Call-2 form at /pdfs/BIRAC-BiONEST-2.pdf or apply via the Google Form on our website.",
    followUps: ["How do I apply for BioNEST?", "What labs are available?", "What is SISF?"],
  },
  {
    id: "startup-bihar",
    keywords: ["startup bihar", "bihar", "bihar government", "government of bihar", "bihar startup", "bihar founders", "domicile"],
    question: "What is the Startup Bihar programme?",
    answer:
      "**Startup Bihar** is the Government of Bihar's entrepreneurship initiative. IC IITP is a key implementation partner, providing incubation infrastructure and mentoring to Bihar-based startups.\n\n**Sectors:** AgriTech, EdTech, HealthTech, FinTech, Manufacturing, IT, Social Impact\n\n**Eligibility:**\n• Startups incorporated in Bihar, OR\n• Founders domiciled in Bihar\n• Early-stage ventures with a viable concept\n• Preference for startups addressing Bihar-specific challenges\n\n**Support:** Lab & office space at IC IITP, links to Bihar government schemes, investor connect, IIT Patna research access, compliance guidance\n\n**Apply:** Email iciitp@iitp.ac.in with your startup profile",
    followUps: ["How do I apply?", "What other programs are available?"],
  },
  {
    id: "msme",
    keywords: ["msme", "micro small medium", "udyam", "msme incubation", "ministry msme", "momse", "small enterprise", "manufacturing"],
    question: "What is the MSME Incubation programme?",
    answer:
      "**MSME Incubation** at IC IITP supports registered Micro, Small & Medium Enterprises in partnership with the Ministry of MSME, helping them adopt new technologies and develop innovative products.\n\n**Sectors:** Electronics Manufacturing, Food Processing, Textile Tech, Auto Components, Pharma, IT & ITES, Handicrafts\n\n**Eligibility:**\n• Registered MSME with Udyam Registration\n• Preference for technology-driven businesses\n• Must not exceed MSME turnover/investment thresholds\n\n**Support:** Incubation space, prototyping facilities, business development, MSME scheme linkages, technical mentoring, buyer/distributor connections\n\n**Apply:** Email iciitp@iitp.ac.in",
    followUps: ["What other programs are available?", "What facilities are available?"],
  },

  // ── Acceleration Programmes ───────────────────────────────────────────────
  {
    id: "business-acceleration",
    keywords: ["business acceleration", "acceleration programme", "accelerator", "growth programme", "revenue stage", "demo day"],
    question: "What is the Business Acceleration programme?",
    answer:
      "The **Business Acceleration Programme** is a 6-month structured programme for startups that already have a product, paying customers, and some revenue — and need to grow faster.\n\n**Duration:** 6 months\n**Cohort size:** 8–12 companies\n\n**Sectors:** All tech sectors — SaaS, Hardware/IoT, MedTech, AgriTech, Deep Tech\n\n**Eligibility:**\n• Startups with early revenues or paying customers\n• Product fully developed and deployed\n• Clear path to scale identified\n\n**Support:** Investor relations & VC introductions, growth mentoring, sales & partnerships, corporate network access, regulatory advisory, Demo Day\n\n**Apply:** forms.gle/N3zGMVek5rDjJRDW8",
    followUps: ["What is the Technical Acceleration programme?", "What is the difference between incubation and acceleration?"],
  },
  {
    id: "technical-acceleration",
    keywords: ["technical acceleration", "technical programme", "engineering support", "manufacturing scale", "hardware scale", "certification", "bis", "product engineering"],
    question: "What is the Technical Acceleration programme?",
    answer:
      "The **Technical Acceleration Programme** provides deep engineering support to startups with a working product that face technical barriers to scale — hardware redesign, manufacturing readiness, regulatory certification, or software architecture challenges.\n\n**Duration:** 6 months (customised programme per startup)\n\n**Sectors:** Electronics, Embedded Systems, IoT, Medical Devices, Clean Energy, Advanced Manufacturing, AI/ML\n\n**Eligibility:**\n• Working product facing engineering or manufacturing scale-up challenges\n• Hardware / deep-tech startups preparing for mass production or certification\n• Preference for IC IITP alumnus companies or active incubatees\n\n**Support:** IIT Patna lab access (cleanroom, PCB fab, ESDM, RF test), faculty-led mentoring, product engineering reviews, BIS/CE/FCC certification advisory, manufacturing partner introductions, IP filing support\n\n**Apply:** forms.gle/N3zGMVek5rDjJRDW8",
    followUps: ["What facilities are available?", "What is the Business Acceleration programme?"],
  },

  // ── Application process ───────────────────────────────────────────────────
  {
    id: "how-to-apply",
    keywords: ["how to apply", "apply for incubation", "application process", "apply now", "how do i apply", "apply online"],
    question: "How do I apply for incubation?",
    answer:
      "**General application process for most IC IITP programmes:**\n1. Visit the **Programs** page and choose the scheme that fits your startup stage\n2. Click **Apply Now** — this opens the relevant Google Form\n3. Fill in your startup details, idea description, and supporting documents\n4. Applications are reviewed on a rolling or cohort basis (programme-specific)\n5. Shortlisted applicants are called for a presentation/pitch to the screening committee\n6. Selected startups receive an offer letter and onboard at IC IITP\n\n**Programme-specific contacts:**\n• Nidhi Prayas: nidhiprayas.ic@iitp.ac.in\n• Nidhi EIR: nidhieir.ic@iitp.ac.in\n• All other programmes: iciitp@iitp.ac.in",
    followUps: ["Which program is right for me?", "What documents do I need?", "How long does selection take?"],
  },
  {
    id: "selection-timeline",
    keywords: ["how long", "selection time", "screening time", "how long does it take", "when will i hear", "response time", "4 weeks", "8 weeks"],
    question: "How long does the selection process take?",
    answer:
      "Typical timelines vary by programme:\n\n• **Nidhi Prayas:** ~4 weeks from application closure\n• **Nidhi EIR:** 4–8 weeks from submission\n• **GENESIS:** 3–6 weeks (varies by vertical)\n• **SISF:** Reviewed quarterly by the Seed Fund Management Committee\n• **MeitY / BioNEST / iDEX:** 4–8 weeks\n• **Acceleration programmes:** 2–4 weeks\n\nOnly **shortlisted applicants are notified**. No feedback is provided for non-selected applications.",
    followUps: ["How do I apply?", "What documents do I need?"],
  },

  // ── Facilities & Labs ─────────────────────────────────────────────────────
  {
    id: "facilities",
    keywords: ["facilities", "labs", "laboratory", "equipment", "lab access", "infrastructure", "what labs", "cleanroom", "pcb", "esdm", "test lab"],
    question: "What facilities does IC-IITP have?",
    answer:
      "IC IITP has **30,000+ sq ft** of world-class facilities across 6 labs:\n\n1. **Clean Room** — ISO Class 7 cleanroom for semiconductor fabrication, MEMS, and nanotechnology\n2. **ESDM Lab** — Electronic Systems Design & Manufacturing; PCB design/assembly, SMT soldering, X-ray inspection\n3. **PCB Fabrication Lab** — In-house PCB prototyping, CNC PCB machining, chemical etching\n4. **Design & Simulation Lab** — CAD/CAE, EDA tools, circuit simulation, FPGA prototyping\n5. **Mechanical Packaging Lab** — 3D printing (FDM, SLA), CNC machining, rapid prototyping\n6. **Testing & Calibration Lab** — EMI/EMC testing, environmental chambers, RF test, oscilloscopes, spectrum analysers\n\nPlus **BioNEST** (10,000 sq ft) with dedicated biotech/MedTech equipment.",
    followUps: ["Who can access IC-IITP labs?", "How do I book lab equipment?", "What is BioNEST?"],
  },
  {
    id: "lab-access",
    keywords: ["who can access labs", "lab booking", "lab access", "external access", "non-incubatee", "lab charges"],
    question: "Who can access IC-IITP labs?",
    answer:
      "**Lab access is primarily for IC IITP incubatees.** However:\n\n• **External researchers and academic collaborators** may request access by writing to iciitp@iitp.ac.in\n• **Resident incubatees:** Lab equipment usage and manpower support are **free**; charges apply only for consumables\n• **Non-resident incubatees:** Pay-per-use basis\n• **External parties:** Case-by-case — contact iciitp@iitp.ac.in with your requirement\n\nFor lab bookings and schedules, contact the IC IITP lab managers directly via the main email.",
    followUps: ["What facilities does IC-IITP have?", "How do I apply for incubation?"],
  },
  {
    id: "cleanroom",
    keywords: ["clean room", "cleanroom", "semiconductor", "mems", "nanotechnology", "class 7", "iso class"],
    question: "What is the IC-IITP Clean Room?",
    answer:
      "The **IC IITP Clean Room** is an **ISO Class 7** controlled environment for advanced fabrication. It supports:\n\n• Semiconductor device fabrication\n• MEMS (Micro-Electro-Mechanical Systems) development\n• Nanotechnology research and device prototyping\n• Thin-film deposition and photolithography\n\nThe cleanroom is one of the few such facilities available to startups in Eastern India. Access is available to incubatees and academic collaborators.",
    followUps: ["What other facilities are available?", "How do I get lab access?"],
  },
  {
    id: "coworking",
    keywords: ["office space", "co-working", "coworking", "desk space", "workspace", "cabin", "conference room", "meeting room"],
    question: "Does IC-IITP provide office space?",
    answer:
      "Yes. IC IITP provides the following workspace options:\n\n• **Co-working spaces** — open desks, cubicles, furniture, internet connectivity (AC)\n• **Dedicated rental cabins** — private offices for teams\n• **8-seater meeting rooms** — with AV setup, computers, and AC\n• **30-seater conference facility** — for pitches, events, investor meets\n\nWorkspace is available to all incubatees. For resident incubation, a refundable security deposit of ₹20,000 applies. Rental charges apply if a dedicated cabin is required.",
    followUps: ["What are IC-IITP's incubation terms?", "How do I apply for incubation?"],
  },

  // ── Eligibility & Common Questions ───────────────────────────────────────
  {
    id: "student-apply",
    keywords: ["student", "can students apply", "college student", "undergraduate", "postgraduate", "phd", "faculty", "professor"],
    question: "Can students or faculty apply?",
    answer:
      "**Yes!** IC IITP welcomes applications from:\n\n• **Students** (UG, PG, PhD) — especially for Nidhi Prayas, Nidhi EIR, and GENESIS EIR\n• **Faculty members** — for MeitY Incubation and technology-transfer-based startups\n• **Individual innovators** — for most pre-incubation programmes\n• **Startup teams** — for all incubation and acceleration programmes\n\nSome programmes (like SISF) require a DPIIT-registered entity, while others (like Nidhi Prayas) are open to individuals without a registered company.",
    followUps: ["Which program is right for me?", "What is Nidhi Prayas?", "What is Nidhi EIR?"],
  },
  {
    id: "dpiit",
    keywords: ["dpiit", "dpiit recognition", "dpiit registered", "startup recognition", "startup certificate", "recognised startup"],
    question: "Do I need DPIIT recognition to apply?",
    answer:
      "It **depends on the programme:**\n\n• **Not required:** Nidhi Prayas, Nidhi EIR, MeitY Incubation Phase I, BioNEST, Startup Bihar, MSME, Acceleration programmes\n• **Required:** SISF (must be DPIIT-recognised), GENESIS Pilot (must be DPIIT-registered), GENESIS Matching Investment (must be DPIIT-registered Private Limited Company)\n\nYou can apply for DPIIT recognition at **startupindia.gov.in** — it's free and typically takes 2–3 weeks.",
    followUps: ["What is SISF?", "What is GENESIS?", "How do I apply for incubation?"],
  },
  {
    id: "equity",
    keywords: ["equity", "shares", "stake", "how much equity", "equity taken", "equity requirement", "preference shares"],
    question: "Does IC-IITP take equity?",
    answer:
      "For **MeitY Incubation**, IC IITP's standard terms are:\n\n• **Resident Incubation:** 5% preference shares + ₹20,000 refundable security deposit\n• **Non-Resident Incubation:** 3% preference shares, pay-per-use labs\n• **Pre-Incubation (3 months):** No charges, no equity\n\nFor **grant-based programmes** (Nidhi Prayas, SISF grant track, GENESIS EIR), **no equity** is taken — funds are non-dilutive grants.\n\nFor **GENESIS Matching Investment** and **SISF investment track**, funding is via equity or convertible debentures as per scheme norms.\n\nThe Management Committee is empowered to revise terms — the specific terms applicable to you will be stated in your offer letter.",
    followUps: ["What are the incubation terms?", "What is SISF?", "What is GENESIS?"],
  },
  {
    id: "funding-amounts",
    keywords: ["how much funding", "grant amount", "how much money", "how much grant", "maximum grant", "funding available"],
    question: "How much funding can I get?",
    answer:
      "Funding ranges by programme:\n\n| Programme | Max Funding |\n|---|---|\n| Nidhi Prayas | ₹10 lakh (grant) |\n| Nidhi EIR | ₹10K–30K/month stipend |\n| GENESIS EIR | ₹10 lakh |\n| GENESIS Pilot | ₹40 lakh |\n| GENESIS Matching | ₹50 lakh |\n| MeitY Phase I | ₹10 lakh (seed) |\n| SISF Grant | ₹20 lakh |\n| SISF Investment | ₹50 lakh |\n| iDEX | ₹1.5 Crore |\n| BioNEST | Via BIRAC/DBT schemes |\n| Startup Bihar | As per scheme |\n| MSME | As per scheme |",
    followUps: ["Which program is right for me?", "What is iDEX?", "What is SISF?"],
  },

  // ── About DISHA ────────────────────────────────────────────────────────────
  {
    id: "about-disha",
    keywords: ["who is disha", "what is disha", "disha guide", "disha chatbot", "how does disha work", "disha assistant"],
    question: "What is DISHA?",
    answer:
      "**DISHA** (Digital Information & Support Hub Assistant) is IC IITP's built-in website guide — available on every page via the chat button at the bottom-right corner.\n\nDISHA is a **knowledge-based guide**, not an AI — it answers questions from a curated database covering all IC IITP programmes, facilities, eligibility criteria, funding amounts, and application processes.\n\n**DISHA can help with:**\n• Information on all 12 IC IITP programmes\n• Eligibility and funding amounts for each scheme\n• How to apply and what to expect\n• Lab and facility details\n• Contact information and directions\n\n**DISHA cannot:** Access real-time data, check your application status, or handle complex queries. For those, email iciitp@iitp.ac.in.",
    followUps: ["What programs are available?", "How do I contact IC-IITP?"],
  },

  // ── Downloads & Website ───────────────────────────────────────────────────
  {
    id: "downloads",
    keywords: ["download", "pdf", "form", "application form", "brochure", "annual report", "document", "downloadable"],
    question: "Where can I find downloadable forms and documents?",
    answer:
      "All downloadable documents are on the **Downloads page** (/downloads). This includes:\n\n• Application forms for Nidhi Prayas, Nidhi EIR, BioNEST\n• Brochures and scheme documents\n• Annual reports\n• Policy documents\n\nIf a link is broken, email iciitp@iitp.ac.in with the page URL and document name.",
    followUps: ["How do I apply for Nidhi Prayas?", "How do I apply for BioNEST?"],
  },
  {
    id: "notifications",
    keywords: ["notifications", "careers", "jobs", "vacancies", "tender", "niq", "procurement", "call for proposals", "announcements"],
    question: "Where can I find job openings and tenders?",
    answer:
      "All IC IITP notifications are on the **Notifications page** (/notifications). Categories include:\n\n• **Careers** — recruitment notices, walk-in interviews, project positions\n• **NIQ / Tender** — procurement notices published on the Government e-Procurement portal (eprocure.gov.in)\n• **Call for Proposals** — open innovation and grant calls\n\nNew notices are published regularly — check the page or email iciitp@iitp.ac.in to be added to the mailing list.",
    followUps: ["How do I contact IC-IITP?", "Where are downloads?"],
  },
  {
    id: "events",
    keywords: ["events", "workshops", "training", "conference", "hackathon", "ideathon", "medtech", "edpi", "upcoming events"],
    question: "What events does IC-IITP organise?",
    answer:
      "IC IITP organises a range of events including:\n\n• **Training programmes** — technology and entrepreneurship workshops\n• **Competitions** — Ideathons, Hackathons (e.g. MSME Idea Hackathon)\n• **Conferences** — EDPI (Electronic Design & Product Innovation)\n• **MedTech Innovation Schools** — focused on medical device startups\n• **Investor meets** — BioNEST investor interaction sessions\n• **Demo Days** — acceleration cohort pitch events\n\nUpcoming and past events are listed on the **Events page** (/events).",
    followUps: ["How do I apply for incubation?", "What programs are available?"],
  },
  {
    id: "portfolio",
    keywords: ["portfolio", "startups list", "incubated startups", "portfolio companies", "success stories", "alumni"],
    question: "Where can I see IC-IITP's portfolio startups?",
    answer:
      "The **Portfolio page** (/portfolio) lists all startups incubated at IC IITP, filterable by programme:\n\n• Nidhi Prayas startups\n• Nidhi EIR startups\n• GENESIS startups\n• MeitY Phase I & II\n• SISF startups (13+ supported)\n• iDEX startups\n• BioNEST companies\n• Startup Bihar portfolio\n\nEach startup card shows the name, sector, programme, and website.",
    followUps: ["How do I apply to become a portfolio startup?", "What programs are available?"],
  },
  {
    id: "governance",
    keywords: ["governance", "governing board", "board of directors", "management", "who runs", "leadership", "committee"],
    question: "Who governs IC-IITP?",
    answer:
      "IC IITP is governed by a **Governing Board** comprising representatives from the Government of India, Government of Bihar, IIT Patna, and industry. The centre also has a **Management Committee** for day-to-day operations, and an **Evaluation Committee** of domain experts that screens incubation applications.\n\nDetails of the Governing Board and Evaluation Team are on the **About** pages (/about/governance and /about/evaluation-team).",
    followUps: ["What is IC-IITP?", "How do I contact IC-IITP?"],
  },
  {
    id: "feedback",
    keywords: ["feedback", "complaint", "broken link", "website issue", "bug", "problem with website", "report issue"],
    question: "How do I report a website issue or give feedback?",
    answer:
      "Use the **Feedback / Contact page** (/contact) to report website issues, broken links, or share suggestions. You can also email **iciitp@iitp.ac.in** with the page URL and a description of the issue. We aim to resolve reported issues within 10 working days.",
    followUps: ["How do I contact IC-IITP?"],
  },
];
