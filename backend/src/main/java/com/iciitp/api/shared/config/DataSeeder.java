package com.iciitp.api.shared.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iciitp.api.features.auth.entity.User;
import com.iciitp.api.features.auth.repository.UserRepository;
import com.iciitp.api.features.media.entity.Media;
import com.iciitp.api.features.media.repository.MediaRepository;
import com.iciitp.api.features.program.entity.Program;
import com.iciitp.api.features.program.repository.ProgramRepository;
import com.iciitp.api.features.event.entity.Event;
import com.iciitp.api.features.event.repository.EventRepository;
import com.iciitp.api.features.startup.entity.Startup;
import com.iciitp.api.features.startup.repository.StartupRepository;
import com.iciitp.api.features.lab.entity.Lab;
import com.iciitp.api.features.lab.repository.LabRepository;
import com.iciitp.api.features.news.entity.News;
import com.iciitp.api.features.news.repository.NewsRepository;
import com.iciitp.api.features.notification.entity.Notification;
import com.iciitp.api.features.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProgramRepository programRepository;
    private final MediaRepository mediaRepository;
    private final StartupRepository startupRepository;
    private final EventRepository eventRepository;
    private final LabRepository labRepository;
    private final NotificationRepository notificationRepository;
    private final NewsRepository newsRepository;

    @Value("${app.seed.admin-email:admin@iciitp.ac.in}")
    private String adminEmail;

    @Value("${app.seed.admin-password:changeme123}")
    private String adminPassword;

    @Value("${app.seed.force-reset:false}")
    private boolean forceReset;

    @Value("${app.upload.dir:./data/uploads}")
    private String uploadDir;

    @Override
    public void run(ApplicationArguments args) {
        seedAdminUser();
        seedLogos();
        seedPrograms();
        seedStartups();
        seedStaticEvents();
        seedLabs();
        seedStaticNotifications();
        fixDuplicateFeaturedNews();
    }

    // ── Admin user ─────────────────────────────────────────────────────────

    private void seedAdminUser() {
        userRepository.findByEmail(adminEmail).ifPresentOrElse(existing -> {
            boolean changed = false;
            if (!existing.isSuperAdmin()) {
                existing.setSuperAdmin(true);
                changed = true;
                log.info("Promoted existing admin to superAdmin: {}", adminEmail);
            }
            if (forceReset) {
                existing.setPasswordHash(passwordEncoder.encode(adminPassword));
                changed = true;
                log.warn("ADMIN_FORCE_RESET applied — password updated for: {}", adminEmail);
            }
            if (changed) userRepository.save(existing);
        }, () -> {
            userRepository.save(User.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(User.Role.ADMIN)
                .superAdmin(true)
                .active(true)
                .build());
            log.info("Seeded super-admin user: {}", adminEmail);
        });
    }

    // ── Logo assets ────────────────────────────────────────────────────────

    private static final Map<String, String> LOGOS = Map.of(
        "seed-dst-nidhi.svg",      "seed-logos/dst-nidhi.svg",
        "seed-meity.svg",          "seed-logos/meity.svg",
        "seed-dpiit-sisf.svg",     "seed-logos/dpiit-sisf.svg",
        "seed-idex-mod.svg",       "seed-logos/idex-mod.svg",
        "seed-birac-dbt.svg",      "seed-logos/birac-dbt.svg",
        "seed-msme.svg",           "seed-logos/msme.svg",
        "seed-startup-bihar.svg",  "seed-logos/startup-bihar.svg",
        "seed-iciitp.svg",         "seed-logos/iciitp.svg"
    );

    private final Map<String, String> logoUrls = new HashMap<>();

    private void seedLogos() {
        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);

            for (Map.Entry<String, String> entry : LOGOS.entrySet()) {
                String filename = entry.getKey();
                String classpath = entry.getValue();

                // Always ensure file exists on disk (re-copy if missing)
                Path dest = dir.resolve(filename);
                ClassPathResource res = new ClassPathResource(classpath);
                if (res.exists()) {
                    if (!Files.exists(dest)) {
                        try (InputStream in = res.getInputStream()) {
                            Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
                        }
                    }
                } else {
                    log.warn("Seed logo not found on classpath: {}", classpath);
                    continue;
                }

                String url = "/uploads/" + filename;
                logoUrls.put(filename, url);

                // Create Media record only if not already present
                if (!mediaRepository.existsByFilename(filename)) {
                    long size = Files.exists(dest) ? Files.size(dest) : 0;
                    mediaRepository.save(Media.builder()
                        .filename(filename)
                        .originalName(filename)
                        .mimeType("image/svg+xml")
                        .sizeBytes(size)
                        .diskPath(dest.toString())
                        .url(url)
                        .uploadedBy("system")
                        .build());
                    log.info("Seeded logo: {}", filename);
                } else {
                    // Still populate logoUrls map even if Media record already exists
                    mediaRepository.findByFilename(filename)
                        .ifPresent(m -> logoUrls.put(filename, m.getUrl()));
                }
            }
        } catch (IOException e) {
            log.error("Failed to seed logos: {}", e.getMessage());
        }
    }

    private String logo(String filename) {
        return logoUrls.getOrDefault(filename, "");
    }

    // ── Programs ───────────────────────────────────────────────────────────

    private void seedPrograms() {
        // Remove legacy programs that are no longer part of the programme catalogue
        for (String legacy : List.of("icitp-incubation", "genesis")) {
            programRepository.findBySlug(legacy).ifPresent(p -> {
                programRepository.deleteById(p.getId());
                log.info("Removed legacy program: {}", legacy);
            });
        }

        // PRE-INCUBATION
        seed("nidhi-prayas", "NIDHI Prayas",
            "Prototype grant to help innovators convert ideas into working prototypes.",
            "Nidhi Prayas is a Department of Science & Technology (DST) initiative under the National Initiative for Developing and Harnessing Innovations (NIDHI) programme. IC IITP is a designated Nidhi Prayas Centre. The grant supports pre-incubation activities — converting an idea or concept into a Proof-of-Concept or working prototype — over a period of 12–18 months. The 2025 call is active.",
            Program.Section.PRE_INCUBATION, nidhiPrayasExtras());

        seed("nidhi-eir", "NIDHI-EIR",
            "Entrepreneurship-in-Residence fellowship for technologists ready to build a company.",
            "Nidhi-EIR (Entrepreneur-in-Residence) is a DST-NSTEDB programme that supports promising technologists who want to transition into entrepreneurship. Fellows work full-time on their venture for 12 months at IC IITP, drawing a monthly stipend and leveraging the centre's labs, mentors, and investor network. NIDHI-EIR is part of the National Initiative for Developing and Harnessing Innovations (NIDHI) umbrella, promoted by DST to nurture knowledge-based and technology-driven startups.",
            Program.Section.PRE_INCUBATION, nidhiEirExtras());

        seed("genesis-eir", "GENESIS — EIR",
            "Gen-Next Support for Innovative Startups — MeitY's ₹490 Crore scheme for deep-tech entrepreneurs in Tier-II & Tier-III cities.",
            "Gen-Next Support for Innovative Startups (GENESIS) is an umbrella programme with an aim to boost the startup ecosystem in Tier-II & Tier-III cities in the country. Ministry of Electronics and Information Technology (MeitY) has approved implementation of the GENESIS Scheme with a budgetary outlay of ₹490 Crore for a duration of 5 years.\n\nThe scheme envisages further scaling up and sustaining the startup ecosystem — especially to discover, grow and nurture technology startups. The scheme aims to support approximately 1,600 tech startups over the course of the next 5 years.\n\nThere are 5 verticals in the GENESIS Scheme: Entrepreneur-in-Residence (EIR) Support, Pilot Funding Support, Matching Investment Support, Deep-Tech Funding Support, and Capacity Building. IC IITP is an authorised GENESIS implementation partner.",
            Program.Section.PRE_INCUBATION, genesisEirExtras());

        // INCUBATION
        seed("meity-i", "MeitY Incubation — Phase I",
            "Flagship MeitY-funded incubation at IC IITP for ESDM and ICT deep-tech startups.",
            "MeitY Incubation Phase I is the flagship government-funded incubation track at the Incubation Centre, IIT Patna. Supported by the Ministry of Electronics & Information Technology, this programme provides end-to-end support to deep-tech startups working in ESDM, Medical Electronics, and ICT — from concept to early market. Incubatees receive lab access, office space, mentoring, and linkages to funding.",
            Program.Section.INCUBATION, meityIExtras());

        seed("meity-ii", "MeitY Incubation — Phase II",
            "Advanced MeitY incubation for startups scaling proven products — Pilot and Matching Investment tracks.",
            "MeitY Incubation Phase II covers the scale-up tracks within IC IITP's MeitY partnership — the Pilot Funding and Matching Investment verticals of the GENESIS scheme. These are designed for startups that have moved past ideation and early prototyping, and now need capital and market validation support to prove commercial viability and raise their next round.",
            Program.Section.INCUBATION, meityIIExtras());

        seed("sisf", "Startup India Seed Fund (SISF)",
            "Government seed capital to prove your concept and reach early traction.",
            "The Startup India Seed Fund Scheme (SISF) is a flagship DPIIT programme with a total outlay of ₹945 Crore to provide early-stage funding to DPIIT-recognised startups. IC IITP is an approved incubator under SISF and has already supported 13 startups through this scheme. Grants cover proof-of-concept and prototype work; follow-on investment (via convertible instruments) supports market entry and early scaling.",
            Program.Section.INCUBATION, sisfExtras());

        seed("idex", "iDEX",
            "Innovations for Defence Excellence — funding for startups solving defence and aerospace technology challenges.",
            "iDEX (Innovations for Defence Excellence) is a Ministry of Defence initiative that funds startups and innovators to solve real defence technology challenges issued by the Indian Armed Forces and Defence PSUs. IC IITP acts as an implementation partner, providing infrastructure, mentoring, and technical support to startups pursuing iDEX Defence Innovation Challenges.",
            Program.Section.INCUBATION, idexExtras());

        seed("bionest", "BioNEST — ICIITP",
            "Dedicated Biotech, MedTech, and Life Sciences incubation wing at IC IITP.",
            "BioNEST-ICIITP is a 10,000 sq ft dedicated Biotech and MedTech incubation wing at IC IITP, established under the BIRAC BioNEST scheme. The wing supports startups working at the intersection of biology, medicine, electronics, and data — from bio-signal processing and medical imaging to biomarker diagnostics and novel medical materials. Incubatees gain access to state-of-the-art labs, BIRAC/DBT grant linkages, and the broader IC IITP ecosystem.",
            Program.Section.INCUBATION, bionestExtras());

        seed("startup-bihar", "Startup Bihar",
            "Bihar government's flagship startup incubation programme to build a thriving entrepreneurship ecosystem in the state.",
            "Startup Bihar is the Government of Bihar's initiative to nurture entrepreneurship across the state. IC IITP, located on the IIT Patna Bihta campus, serves as a key implementation partner — providing incubation infrastructure, mentoring, and ecosystem connections to startups from Bihar who are solving local and national challenges.",
            Program.Section.INCUBATION, startupBiharExtras());

        seed("msme", "MSME Incubation",
            "Ministry of MSME-backed incubation support for micro, small, and medium technology enterprises.",
            "IC IITP's MSME Incubation programme provides technology-focused incubation support to micro, small, and medium enterprises in partnership with the Ministry of MSME. The programme helps MSMEs adopt new technologies, develop innovative products, and access government schemes to grow their businesses sustainably.",
            Program.Section.INCUBATION, msmeExtras());

        // ACCELERATION
        seed("business-acceleration", "Business Acceleration",
            "Structured programme to help revenue-stage startups accelerate growth through investor access, market expansion, and strategic partnerships.",
            "The Business Acceleration Programme at IC IITP is designed for startups that have crossed early milestones — they have a product, users, and some revenue — and now need structured support to grow faster. Over six months, participants work with mentors, investors, and corporate partners to sharpen their strategy, expand into new markets, and raise their next round of funding.",
            Program.Section.ACCELERATION, businessAccelExtras());

        seed("technical-acceleration", "Technical Acceleration",
            "Deep technical support to help startups solve engineering bottlenecks, scale their product, and achieve production readiness.",
            "The Technical Acceleration Programme provides deep engineering support to startups that have a working product but face technical barriers to scale — whether that's hardware redesign, manufacturing readiness, regulatory certification, or software architecture. Participants get direct access to IIT Patna's research faculty, specialised labs, and a network of manufacturing and certification partners.",
            Program.Section.ACCELERATION, technicalAccelExtras());
    }

    private void seed(String slug, String title, String tagline, String about,
            Program.Section section, Map<String, Object> extras) {
        programRepository.findBySlug(slug).ifPresentOrElse(existing -> {
            boolean needsRepair = false;
            // Repair section if wiped
            if (existing.getSection() == null) {
                existing.setSection(section);
                needsRepair = true;
            }
            // Repair content if title was wiped (slug used as title = data loss from save bug)
            boolean titleIsSlug = slug.equals(existing.getTitle()) || existing.getTitle() == null || existing.getTitle().isBlank();
            if (titleIsSlug) {
                existing.setTitle(title);
                existing.setTagline(tagline);
                existing.setDescription(about);
                existing.setExtras(extras);
                needsRepair = true;
            }
            existing.setSystem(true);
            if (needsRepair) {
                programRepository.save(existing);
                log.info("Repaired system program: {}", slug);
            }
        }, () -> {
            programRepository.save(Program.builder()
                .slug(slug).title(title).tagline(tagline).description(about)
                .section(section).published(true).system(true).extras(extras)
                .build());
            log.info("Seeded system program: {}", slug);
        });
    }

    // ── Extras builders ────────────────────────────────────────────────────

    private static Map<String, Object> step(int n, String title, String desc) {
        Map<String, Object> m = new HashMap<>();
        m.put("step", n); m.put("title", title); m.put("description", desc);
        return m;
    }

    private static Map<String, Object> applyLink(String label, String href, String amount) {
        Map<String, Object> m = new HashMap<>();
        m.put("label", label); m.put("href", href); m.put("amount", amount);
        return m;
    }

    private static Map<String, Object> fv(String name, String amount, String purpose) {
        Map<String, Object> m = new HashMap<>();
        m.put("name", name); m.put("amount", amount); m.put("purpose", purpose);
        return m;
    }

    private static Map<String, Object> fv(String name, String amount, String purpose, String note) {
        Map<String, Object> m = fv(name, amount, purpose);
        m.put("note", note);
        return m;
    }

    private static Map<String, Object> funding(String type, String amount, String purpose, String structure) {
        Map<String, Object> m = new HashMap<>();
        m.put("type", type); m.put("amount", amount);
        m.put("purpose", purpose); m.put("structure", structure);
        return m;
    }

    private static Map<String, Object> whatWeTake(String type, String... terms) {
        Map<String, Object> m = new HashMap<>();
        m.put("type", type); m.put("terms", List.of(terms));
        return m;
    }

    // ── Per-program extras ─────────────────────────────────────────────────

    private Map<String, Object> nidhiPrayasExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-dst-nidhi.svg"));
        e.put("badge", "DST");
        e.put("funder", "Department of Science & Technology (DST), Govt. of India");
        e.put("status", "Open");
        e.put("statusNote", "2025 call is active. Application form available for download.");
        e.put("grant", "Up to ₹10 lakh");
        e.put("duration", "12–18 months");
        e.put("contactEmail", "nidhiprayas.ic@iitp.ac.in");
        e.put("applicationForm", "/pdfs/Appliation-Form-Nidhi-Prayas-2025with_Annexure.pdf");
        e.put("sectors", List.of("Agriculture", "Healthcare", "Clean Technology", "Energy", "Water", "IoT", "Industry 4.0"));
        e.put("objectives", List.of(
            "Support in translating an innovative idea into a prototype",
            "Provide a platform for faster experimentation and refining approaches on the idea-to-market journey",
            "Generate innovative solutions relevant to local and global problems",
            "Pre-incubation of potential ideas leading to venture creation",
            "Encourage young entrepreneurial aspirants who demonstrate problem-solving zeal and abilities"
        ));
        e.put("eligibility", List.of(
            "Individual innovators, student teams, or early-stage ventures",
            "Idea must be technology-driven with prototype potential",
            "No prior DST Nidhi Prayas or EIR support received",
            "Willingness to develop the prototype at or near IC IITP"
        ));
        e.put("support", List.of(
            "Funding assistance for prototype development (up to ₹10 lakhs)",
            "Infrastructure support — co-working space, meeting rooms, conference facility",
            "Mentorship support from domain experts",
            "Guidance in venture creation and securing further funding"
        ));
        e.put("process", List.of(
            step(1, "Download & Submit Application", "Download the application form (PDF). Fill it in and email to nidhiprayas.ic@iitp.ac.in."),
            step(2, "Screening", "Applications are screened within 4 weeks of the call-closure date. Only shortlisted participants will be notified."),
            step(3, "Evaluation & Presentation", "Shortlisted applicants pitch to the Monitoring Committee."),
            step(4, "Grant Disbursement", "Selected innovators receive milestone-linked grant up to ₹10 lakh over 12–18 months.")
        ));
        e.put("disclaimer", List.of(
            "The applications received are subject to a screening process. Only shortlisted participants will be notified about the final presentation to the Monitoring Committee.",
            "Screening will be subject to parameters beyond basic eligibility — including innovation, potential for commercialisation and venture creation, team capability, and commitment.",
            "The decision of the screening committee for approval and funding support will be final and binding.",
            "Approved applicants will be required to agree for Pre-incubation or Incubation with Incubation Centre IIT Patna as per its policies.",
            "Screening of applications will take 4 weeks from the date of closure of online applications.",
            "No suggestion or explanation with regards to applications that are not selected will be provided."
        ));
        return e;
    }

    private Map<String, Object> nidhiEirExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-dst-nidhi.svg"));
        e.put("badge", "DST NSTEDB");
        e.put("funder", "DST – National Science & Technology Entrepreneurship Development Board (NSTEDB)");
        e.put("status", "Open");
        e.put("statusNote", "Active call — download form and apply.");
        e.put("stipend", "₹10,000–₹30,000 per month");
        e.put("duration", "12 months");
        e.put("contactEmail", "nidhieir.ic@iitp.ac.in");
        e.put("applicationForm", "/pdfs/ICIITP-Nidhi-EIR-Application1-1.pdf");
        e.put("sectors", List.of("Electronics & Hardware", "Healthcare Devices", "Energy", "Agri-Tech",
            "Edu-Tech", "Robotics", "IoT & Automation", "Data Analytics", "Speech / Text / Image Analytics"));
        e.put("objectives", List.of(
            "Encourage graduating students to take up entrepreneurship by providing support as a fellowship",
            "Provide a prestigious forum for entrepreneurs to pursue ventures without additional risks",
            "Make entrepreneurship related to a technology business idea more attractive among career options",
            "Enable creation of new startups by entrepreneurs and significant progress towards raising funding"
        ));
        e.put("targetAudience", List.of(
            "First-generation innovative entrepreneurs who have no prior source of income",
            "Individuals who want to embark on an entrepreneurial journey with no prior experience",
            "Founders who want to validate an idea before committing significant resources",
            "Aspiring entrepreneurs exploring a business idea alone and looking for co-founders",
            "Those who have been unsuccessful in a prior startup attempt and want to try again"
        ));
        e.put("eligibility", List.of(
            "Must be an Indian citizen",
            "Must have completed 4 years of formal full-time UG/PG education in Science or Engineering — OR — a 3-year degree/diploma with at least 2 years of work experience",
            "Must be willing to pursue the business idea under NIDHI EIR full-time",
            "Must propose one technology business idea with a formal business plan",
            "Must demonstrate the ability to build a scalable technology startup",
            "Must be willing to register for pre-incubation or incubation at IC IITP for the entire duration"
        ));
        e.put("notEligible", List.of(
            "You are a promoter or significant shareholder (above 10%) of another company at time of applying",
            "You or your team members have previously availed of any NIDHI-EIR grant",
            "You have received similar grant support previously for the same innovative concept",
            "You or your team members are already supported under NIDHI-PRAYAS or NIDHI-EIR from any incubator"
        ));
        e.put("preferences", List.of(
            "Technology business ideas with larger technology uncertainties or long gestation periods",
            "Ideas leveraging technology or IP from publicly funded research or academic organisations",
            "Technology business ideas with considerable potential for social impact or job creation",
            "Women entrepreneurs"
        ));
        e.put("support", List.of(
            "Monthly stipend (₹10,000–₹30,000 based on profile)",
            "Office space and lab access at IC IITP",
            "Faculty and industry mentor assigned",
            "Access to IC IITP network: investors, corporates, government bodies",
            "Guidance on idea-to-product conversion and business commercialisation",
            "Linkage to follow-on funding schemes post-fellowship"
        ));
        e.put("expectedOutcomes", List.of(
            "Bring more clarity on the potential for commercialisation of the technology business idea",
            "Develop a business plan for development and commercialisation of the idea",
            "Validate industry, market, technical, and financial feasibility",
            "Find potential team members and funding sources",
            "Get incubated at IC IIT Patna for product development and commercialisation support"
        ));
        e.put("process", List.of(
            step(1, "Download & Submit Application", "Download the application form. Submit the completed application to nidhieir.ic@iitp.ac.in."),
            step(2, "Screening & Interview", "Applications are reviewed and shortlisted candidates are called for a presentation to the Monitoring Committee. Screening takes 4–8 weeks."),
            step(3, "Fellowship Offer", "Selected fellows receive an offer letter and onboard as Entrepreneurs-in-Residence at IC IITP."),
            step(4, "12-Month Residency", "Full-time residency at IC IITP. Monthly stipend disbursed subject to progress milestones.")
        ));
        e.put("notes", List.of(
            "Application to the programme does not guarantee admission.",
            "Only shortlisted participants will be notified about the final presentation to the Monitoring Committee.",
            "Screening committee decision for approval and funding support will be final and binding.",
            "Approved applicants must agree to pre-incubation or incubation at IC IIT Patna as per its policies.",
            "Screening usually takes 4–8 weeks from the application submission end date."
        ));
        return e;
    }

    private Map<String, Object> genesisEirExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-meity.svg"));
        e.put("badge", "MeitY");
        e.put("funder", "Ministry of Electronics & Information Technology (MeitY), Govt. of India");
        e.put("schemeOutlay", "₹490 Crore over 5 years (~1,600 startups)");
        e.put("grant", "Up to ₹10 lakh (EIR) · Up to ₹40 lakh (Pilot) · Up to ₹50 lakh (Matching Investment)");
        e.put("duration", "Up to 12 months (EIR)");
        e.put("contactEmail", "iciitp@iitp.ac.in");
        e.put("status", "Open");

        e.put("objectives", List.of(
            "Consolidation of MeitY startup-related schemes and assets for greater efficiency and enhanced startup support",
            "Provide Tier-II/III cities focused funding to critically support Pilot, Investment, Early-stage, and Deep-tech startups",
            "Strengthening Incubators and building stronger startup ecosystem via capacity building initiatives in Tier-II/III cities"
        ));

        e.put("domains", List.of(
            "Artificial Intelligence & Machine Learning",
            "Internet of Things (IoT)",
            "VLSI & Semiconductors",
            "Cybersecurity",
            "Blockchain",
            "Quantum Computing",
            "AR / VR / Spatial & Immersive Tech",
            "Electronic Design & Manufacturing",
            "Deep-Tech Software & Products"
        ));

        // EIR eligibility
        e.put("eligibility", List.of(
            "Only Indian citizens may apply",
            "Applicants must be full-time UG/PG students with entrepreneurial pursuits, or founders/co-founders of DPIIT-registered startups (≤ 2 years old)",
            "The EIR must be physically incubated at IC IITP",
            "Only applicants from Tier-II & Tier-III cities are eligible",
            "Must not have received significant external funding exceeding ₹10 lakh (including government grants)",
            "Must not have been previously supported under any MeitY scheme",
            "Must be working on Ideation, Concept Development, Validation / Problem-Solution Fit, Proof of Concept (PoC), or Prototyping",
            "Must be committed to working full-time on the proposed startup idea during the EIR programme duration",
            "EIR support will be extended only once under GENESIS"
        ));

        // Funding verticals
        e.put("fundingVerticals", List.of(
            fv("Entrepreneur-in-Residence (EIR) Support", "Up to ₹10 lakh",
                "Supports early-stage innovators and startups from Tier-II/III cities working on ideation, concept development, PoC, or prototyping in electronics, IT, and deep-tech"),
            fv("Pilot Funding Support", "Up to ₹40 lakh",
                "Enables DPIIT-registered startups with an MVP/working prototype to validate and deploy their solution through structured pilot projects with corporates, PSUs, and large enterprises",
                "Requires a pilot work order / purchase order from an eligible corporate, PSU, or unicorn"),
            fv("Matching Investment Support", "Up to ₹50 lakh",
                "1:1 matched investment for market-ready startups with validated solutions raising from VCs or angel investors",
                "Requires matching private or institutional investment; government grants do not count. Funding instrument is equity"),
            fv("Deep-Tech Funding Support", "Case-by-case",
                "Sustained R&D support for deep-tech ventures requiring long gestation periods in semiconductor, quantum, advanced materials, and similar domains")
        ));

        // Pilot eligibility
        e.put("pilotEligibility", List.of(
            "Must be a DPIIT-registered startup",
            "Working in ICT-related domains: IT & AI, Electronic Design & Manufacturing, Tech/Deep-tech products",
            "Must have: MVP/working prototype, viable business plan, full-time founder/co-founder",
            "Must have a pilot work order or purchase order from an eligible corporate, PSU, or unicorn",
            "Corporate pilot partners must have minimum turnover of ₹75 crore+ and at least 5 years of operations"
        ));

        // Matching Investment eligibility
        e.put("matchingEligibility", List.of(
            "Must be a registered Indian entity (Private Limited Company) with at least 51% Indian ownership",
            "Must be registered in a Tier-II or Tier-III city",
            "Must have a valid DPIIT certificate",
            "Must work on a tech-based product/software in Deep-tech, AI/ML, Cybersecurity, IoT, Blockchain, Fintech, EdTech, or HealthTech",
            "Must have a market-ready product; preference for revenue-generating startups",
            "Preference is given to startups with granted patents",
            "Must not be involved in any legal disputes",
            "Cannot be a startup previously supported under TIDE 2.0 (Scale Up) or Samridh schemes"
        ));

        e.put("support", List.of(
            "Financial assistance up to ₹50 lakh for prototype development, product creation, and scaling",
            "Mentorship from IIT Patna faculty, industry leaders, and domain experts",
            "State-of-the-art infrastructure: co-working spaces, labs, and testing centres at IC IITP",
            "Networking opportunities with investors, corporates, and government bodies",
            "Training programmes, workshops, bootcamps, and skill enhancement courses"
        ));

        e.put("applyLinks", List.of(
            applyLink("MeitY GENESIS EIR Programme — Startup Grant", "https://forms.gle/NjpT51zChStHD7AM6", "Up to ₹10 lakh"),
            applyLink("MeitY GENESIS Pilot Programme — Startup Grant", "https://forms.gle/jXWo5z6B4nPTZC2f9", "Up to ₹40 lakh"),
            applyLink("MeitY GENESIS Matching Investment Programme — Startup Grant", "https://forms.gle/rcGeBeQ32hqyWrvs9", "Up to ₹50 lakh")
        ));

        return e;
    }

    private Map<String, Object> meityIExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-meity.svg"));
        e.put("badge", "MeitY");
        e.put("funder", "Ministry of Electronics & Information Technology (MeitY), Govt. of India");
        e.put("duration", "12–24 months");
        e.put("contactEmail", "iciitp@iitp.ac.in");
        e.put("applyUrl", "https://forms.gle/N3zGMVek5rDjJRDW8");
        e.put("sectors", List.of("ESDM", "Medical Electronics", "ICT", "IoT", "Robotics", "Healthcare Devices", "Deep Tech"));
        e.put("eligibility", List.of(
            "Start-up companies, students, faculty members, or individual innovators",
            "Working in ESDM or ICT domains",
            "Technology areas include IoT, Industrial Automation, Robotics/Mechatronics, Industry 4.0, Healthcare",
            "Willingness to be associated with IIT Patna campus"
        ));
        e.put("process", List.of(
            step(1, "Preliminary Scrutiny", "Initial screening of the application for domain fit and completeness."),
            step(2, "Presentation", "Shortlisted applicants present their idea/prototype to the IC IITP screening committee."),
            step(3, "Selection", "Final selection by an expert committee. Successful applicants receive a formal offer letter."),
            step(4, "Onboarding", "Sign agreements, access lab space, and begin the incubation journey.")
        ));
        e.put("support", List.of(
            "Office and lab space at IIT Patna Bihta campus",
            "Access to specialised ESDM and electronics fabrication labs",
            "Mentorship from IIT Patna faculty and industry advisors",
            "Networking with investors, corporates, and government bodies",
            "Legal, IP, and financial support",
            "Access to IIT Patna library, compute, and testing infrastructure"
        ));
        e.put("whatWeTake", List.of(
            whatWeTake("Resident Incubation",
                "Equity: 5% preference shares",
                "Lab usage charges: only for consumables (equipment usage and manpower support are free)",
                "Security deposit (refundable): ₹20,000",
                "Rentals: as applicable if dedicated office space is required"),
            whatWeTake("Non-Resident Incubation",
                "Equity: 3% preference shares",
                "Lab usage charges: pay-per-use"),
            whatWeTake("Pre-Incubation", "No charges")
        ));
        e.put("termsNote", "The Management Committee of the Incubation Centre is empowered to change or amend the terms. Terms applicable will be specified as part of the offer letter.");
        return e;
    }

    private Map<String, Object> meityIIExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-meity.svg"));
        e.put("badge", "MeitY");
        e.put("funder", "Ministry of Electronics & Information Technology (MeitY), Govt. of India");
        e.put("grant", "Up to ₹50 lakh");
        e.put("duration", "12–18 months");
        e.put("contactEmail", "iciitp@iitp.ac.in");
        e.put("schemeOutlay", "₹490 Crore over 5 years (GENESIS scheme)");
        e.put("applyLinks", List.of(
            applyLink("Apply — GENESIS Pilot Programme", "https://forms.gle/jXWo5z6B4nPTZC2f9", "Up to ₹40 lakh"),
            applyLink("Apply — GENESIS Matching Investment", "https://forms.gle/rcGeBeQ32hqyWrvs9", "Up to ₹50 lakh")
        ));
        e.put("sectors", List.of("ESDM", "AI / ML", "IoT", "VLSI & Semiconductors", "Cybersecurity", "Deep Tech Software & Products"));
        e.put("eligibility", List.of(
            "DPIIT-registered startups with a working MVP or prototype",
            "Operating in MeitY-aligned technology domains",
            "For Matching Investment: must be raising from VCs or angel investors (government grants excluded from matching)",
            "Must not have received more than ₹10 lakh in total government grants (Pilot track)"
        ));
        e.put("support", List.of(
            "Pilot funding up to ₹40 lakh to validate and deploy solutions with corporate or PSU partners",
            "Matching investment up to ₹50 lakh for market-ready startups raising external capital",
            "Dedicated industry partner introductions and market access support",
            "Investor readiness workshops and pitch events",
            "Continued lab, office, and mentoring access"
        ));
        e.put("fundingVerticals", List.of(
            fv("Pilot Funding", "Up to ₹40 lakh",
                "Enable DPIIT-registered startups with an MVP/working prototype to validate and deploy through structured pilot projects"),
            fv("Matching Investment", "Up to ₹50 lakh",
                "1:1 matched investment for market-ready startups targeting VCs or angel investors",
                "Requires matching private or institutional investment; government grants do not count")
        ));
        return e;
    }

    private Map<String, Object> sisfExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-dpiit-sisf.svg"));
        e.put("badge", "DPIIT");
        e.put("funder", "Department for Promotion of Industry & Internal Trade (DPIIT), Govt. of India");
        e.put("schemeOutlay", "₹945 Crore");
        e.put("grant", "Up to ₹20 lakh (grant) · Up to ₹50 lakh (investment)");
        e.put("duration", "12 months (prototyping / PoC phase)");
        e.put("applyUrl", "https://seedfund.startupindia.gov.in");
        e.put("sectors", List.of("MedTech & Healthcare", "IoT & Robotics", "Defence & Space",
            "Biotechnology", "Clean Energy & Mobility", "Automobile Automation"));
        e.put("objectives", List.of(
            "Provide financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialisation",
            "Enable startups to graduate to a level where they can raise investments from angel investors or venture capitalists",
            "Support startups in accessing loans from commercial banks or financial institutions after initial traction"
        ));
        e.put("eligibility", List.of(
            "DPIIT-recognised startup",
            "Incorporated not more than 2 years before the application date",
            "At least 51% shareholding by Indian promoters",
            "Must not have received more than ₹10 lakh of monetary support under any other Government scheme",
            "Must have a business idea to develop a product or service with market fit and scope for scaling",
            "Startup must use technology in its core product, service, business model, or distribution model"
        ));
        e.put("funding", List.of(
            funding("Grant", "Up to ₹20 lakh", "Proof of Concept, prototype development, product trials", "Milestone-based disbursements"),
            funding("Investment", "Up to ₹50 lakh", "Market entry, scaling, commercialisation", "Convertible debentures or debt instrument")
        ));
        e.put("notes", List.of(
            "Seed fund shall strictly not be used by startups for creation of any facilities.",
            "The grant (up to ₹20 lakh) is disbursed in milestone-based installments.",
            "The investment tranche (up to ₹50 lakh) is provided through convertible debentures for market entry and scaling."
        ));
        e.put("process", List.of(
            step(1, "Apply on SISF Portal", "Submit application at seedfund.startupindia.gov.in. Select IC IITP as preferred incubator."),
            step(2, "Incubator Review", "IC IITP evaluates applications for domain fit and due diligence."),
            step(3, "Seed Fund Committee Approval", "Approved startups are presented to the Seed Fund Management Committee for final approval."),
            step(4, "Disbursement", "Funds released in milestone-linked tranches over the 12-month prototyping period.")
        ));
        return e;
    }

    private Map<String, Object> idexExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-idex-mod.svg"));
        e.put("badge", "MoD");
        e.put("funder", "Ministry of Defence (MoD), Govt. of India — Defence Innovation Organisation (DIO)");
        e.put("grant", "Up to ₹1.5 Crore");
        e.put("duration", "12–18 months per challenge");
        e.put("contactEmail", "iciitp@iitp.ac.in");
        e.put("applyUrl", "https://idex.gov.in");
        e.put("sectors", List.of("Defence Electronics", "Aerospace & Drones", "Cyber Security",
            "Artificial Intelligence", "Robotics & Autonomous Systems", "Advanced Materials",
            "Communications & Networking"));
        e.put("eligibility", List.of(
            "Indian startups, MSMEs, and individual innovators",
            "Must apply against a specific iDEX Defence Innovation Challenge (DIC)",
            "Technology must address a stated defence/aerospace problem",
            "Entities must not be blacklisted by any government agency"
        ));
        e.put("support", List.of(
            "Grants up to ₹1.5 Crore per challenge for R&D and prototype development",
            "Access to defence testing facilities and users for validation",
            "Mentorship from defence domain experts",
            "IP ownership remains with the innovator",
            "IC IITP infrastructure support for prototype development"
        ));
        e.put("objectives", List.of(
            "Stimulate defence technology innovation by engaging startups and MSMEs",
            "Build a pipeline of indigenous defence technology solutions",
            "Reduce import dependence in critical defence sub-systems",
            "Support Aatmanirbhar Bharat (self-reliant India) in defence"
        ));
        e.put("process", List.of(
            step(1, "Browse Open Challenges", "Visit idex.gov.in to view open Defence Innovation Challenges (DICs) from the Armed Forces and DPSUs."),
            step(2, "Apply Against a DIC", "Submit your technology solution proposal against a specific challenge."),
            step(3, "Evaluation", "iDEX evaluates and shortlists proposals. IC IITP provides technical mentoring."),
            step(4, "Grant & Development", "Selected startups receive grants up to ₹1.5 Crore and begin prototype development with IC IITP support.")
        ));
        return e;
    }

    private Map<String, Object> bionestExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-birac-dbt.svg"));
        e.put("badge", "BIRAC / DBT");
        e.put("funder", "Biotechnology Industry Research Assistance Council (BIRAC), Dept. of Biotechnology (DBT)");
        e.put("status", "Open");
        e.put("statusNote", "Call for Proposals 2 is active.");
        e.put("area", "10,000 sq ft");
        e.put("applyUrl", "https://docs.google.com/forms/d/e/1FAIpQLScBlgowT2FjVguHX_W9BLRB1Cg1c-SgP62Sqw7sDf1Sks81Pw/viewform");
        e.put("applicationForm", "/pdfs/BIRAC-BiONEST-2.pdf");
        e.put("focusAreas", List.of("Bio-Signal Processing", "Medical Imaging", "Biomedical Devices",
            "Disease Screening & Diagnostics using Biomarkers", "Materials for Medical and Other Applications"));
        e.put("eligibility", List.of(
            "Startups and companies in Biotech, MedTech, Life Sciences, or related areas",
            "Must demonstrate a technology-led innovation with a healthcare or life sciences application",
            "Startups from idea stage to early scaling are welcome"
        ));
        e.put("support", List.of(
            "Mentorship on entity registration, problem validation, product and service definition, patents, and business planning",
            "Product development support including design and prototyping",
            "Product testing support — facilities for testing devices and other products, including market trials",
            "Clinical studies support — access to partner networks for clinical validation of life sciences products"
        ));
        e.put("facilities", List.of(
            "Air-conditioned co-working incubation office space with cubicles, furniture, and internet connectivity",
            "8-seater meeting rooms with audio-visual setup, computers, and AC",
            "30-seater conference facility",
            "Dedicated rental office cabins",
            "PCB Prototyping Lab",
            "Product Design Lab",
            "3D Printing Lab",
            "Testing & Validation Lab"
        ));
        e.put("process", List.of(
            step(1, "Download & Submit Application", "Applications can be submitted through the BioNEST Call-2 application form."),
            step(2, "Domain Expert Review", "Received applications will be scrutinised by domain experts."),
            step(3, "Pitch to Selection Committee", "Shortlisted applicants will be called to pitch to the selection committee."),
            step(4, "Offer of Incubation", "Offer of incubation or support will be sent to selected startups."),
            step(5, "Sign Agreement", "An agreement is signed between the startup and IC IIT Patna."),
            step(6, "Onboarding", "Startup is onboarded and support activities are initiated.")
        ));
        e.put("notes", List.of(
            "Startups supported under ICIITP BioNEST will be assisted in applying for various grant schemes of BIRAC and DBT.",
            "IC IITP BioNEST conducts periodic investor interaction meets where companies can pitch for private investment.",
            "Startups can avail funding under various schemes at IC IIT Patna, subject to eligibility and selection criteria."
        ));
        return e;
    }

    private Map<String, Object> startupBiharExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-startup-bihar.svg"));
        e.put("badge", "Govt. Bihar");
        e.put("funder", "Government of Bihar — Department of Industries");
        e.put("contactEmail", "iciitp@iitp.ac.in");
        e.put("sectors", List.of("AgriTech", "EdTech", "HealthTech", "FinTech",
            "Manufacturing", "IT & Software", "Social Impact"));
        e.put("eligibility", List.of(
            "Startups incorporated in Bihar or founders domiciled in Bihar",
            "Early-stage ventures with a viable product or service concept",
            "Preference for startups addressing Bihar-specific challenges",
            "Open to all technology and non-technology sectors"
        ));
        e.put("support", List.of(
            "Incubation space and mentoring at IC IITP",
            "Linkages to Bihar government schemes and procurement opportunities",
            "Investor connect and pitch events",
            "Access to IIT Patna research and technical expertise",
            "Regulatory and compliance guidance for Bihar operations"
        ));
        e.put("objectives", List.of(
            "Build a robust startup and innovation ecosystem in Bihar",
            "Support first-generation entrepreneurs from Bihar",
            "Create employment opportunities through startup growth",
            "Leverage IIT Patna's research capabilities for Bihar's development"
        ));
        e.put("process", List.of(
            step(1, "Apply Online", "Submit your startup profile and idea to the Startup Bihar portal or directly to IC IITP."),
            step(2, "Review", "IC IITP reviews applications for eligibility and domain fit."),
            step(3, "Selection", "Shortlisted startups are invited for a presentation to the evaluation committee."),
            step(4, "Incubation", "Selected startups onboard at IC IITP and are connected to Bihar government schemes.")
        ));
        return e;
    }

    private Map<String, Object> msmeExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-msme.svg"));
        e.put("badge", "MoMSME");
        e.put("funder", "Ministry of Micro, Small & Medium Enterprises (MoMSME), Govt. of India");
        e.put("contactEmail", "iciitp@iitp.ac.in");
        e.put("sectors", List.of("Electronics Manufacturing", "Food Processing", "Textile Technology",
            "Automotive Components", "Pharmaceutical", "IT & ITES", "Handicrafts & Design"));
        e.put("eligibility", List.of(
            "Registered MSME enterprises with Udyam Registration",
            "Startups and entrepreneurs entering MSME-eligible sectors",
            "Preference for technology-driven or innovation-led businesses",
            "Entities that have not exceeded MSME turnover and investment thresholds"
        ));
        e.put("support", List.of(
            "Incubation space and prototyping facilities",
            "Business development and marketing support",
            "Access to government MSME schemes and credit guarantee funds",
            "Technical mentoring for product development",
            "Connections to buyers, distributors, and export networks"
        ));
        e.put("objectives", List.of(
            "Foster technology adoption and innovation in MSME sector",
            "Help MSMEs scale by leveraging IIT Patna's research and infrastructure",
            "Connect MSMEs to government schemes, procurement, and export opportunities",
            "Build sustainable and competitive micro and small enterprises"
        ));
        e.put("process", List.of(
            step(1, "Apply", "Submit your MSME profile and area of support needed to IC IITP."),
            step(2, "Assessment", "IC IITP team assesses the business for fit and support requirements."),
            step(3, "Onboarding", "Eligible MSMEs are onboarded and connected to relevant support services."),
            step(4, "Ongoing Support", "Continuous mentoring, scheme linkage, and technical support throughout the programme.")
        ));
        return e;
    }

    private Map<String, Object> businessAccelExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-iciitp.svg"));
        e.put("badge", "IC IITP");
        e.put("funder", "Incubation Centre, IIT Patna");
        e.put("duration", "6 months");
        e.put("contactEmail", "iciitp@iitp.ac.in");
        e.put("applyUrl", "https://forms.gle/N3zGMVek5rDjJRDW8");
        e.put("sectors", List.of("All Technology Sectors", "Deep Tech", "SaaS & Software",
            "Hardware & IoT", "MedTech", "AgriTech", "CleanTech"));
        e.put("eligibility", List.of(
            "Startups with early revenues or paying customers",
            "Product or service fully developed and deployed",
            "Clear path to scale — identified market, customer segments, and growth levers",
            "Willingness to engage with the acceleration programme full-time"
        ));
        e.put("support", List.of(
            "Dedicated investor relations support and warm introductions to VCs and angels",
            "Business strategy workshops and growth mentoring from industry leaders",
            "Sales and partnerships facilitation",
            "Access to IC IITP alumni and corporate network",
            "Regulatory and compliance advisory",
            "Demo day and media visibility"
        ));
        e.put("objectives", List.of(
            "Accelerate growth of revenue-stage startups through structured mentoring",
            "Connect founders to the right investors at the right time",
            "Help startups expand to new markets and build strategic partnerships",
            "Prepare companies for their Series A or major growth round"
        ));
        e.put("process", List.of(
            step(1, "Apply", "Submit application with your startup's current metrics and growth goals."),
            step(2, "Interview", "Selected applicants are interviewed by the IC IITP acceleration team."),
            step(3, "Cohort Onboarding", "Accepted startups join a cohort of 8–12 companies for the 6-month programme."),
            step(4, "Demo Day", "Programme concludes with a Demo Day for investors, corporates, and media.")
        ));
        return e;
    }

    private Map<String, Object> technicalAccelExtras() {
        Map<String, Object> e = new HashMap<>();
        e.put("logoUrl", logo("seed-iciitp.svg"));
        e.put("badge", "IC IITP");
        e.put("funder", "Incubation Centre, IIT Patna");
        e.put("duration", "6 months");
        e.put("contactEmail", "iciitp@iitp.ac.in");
        e.put("applyUrl", "https://forms.gle/N3zGMVek5rDjJRDW8");
        e.put("sectors", List.of("Electronics & Hardware", "Embedded Systems", "IoT & Robotics",
            "Medical Devices", "Clean Energy", "Advanced Manufacturing", "AI / ML Systems"));
        e.put("eligibility", List.of(
            "Startups with a working product facing engineering or manufacturing scale-up challenges",
            "Hardware or deep-tech startups preparing for mass production or certification",
            "Companies with identified technical bottlenecks that require expert intervention",
            "Preference for IC IITP alumnus companies or active incubatees"
        ));
        e.put("support", List.of(
            "Access to IC IITP's 30,000 sq ft of world-class labs including cleanroom, PCB fab, ESDM, and RF test",
            "IIT Patna faculty-led technical mentoring and co-development",
            "Product engineering reviews and redesign support",
            "Testing, certification, and regulatory compliance (BIS, CE, FCC) advisory",
            "Manufacturing partner introductions and supply chain support",
            "IP filing assistance for technical innovations"
        ));
        e.put("objectives", List.of(
            "Resolve critical engineering and manufacturing bottlenecks for hardware startups",
            "Help startups achieve production readiness and certification",
            "Leverage IIT Patna faculty expertise for deep technical problem-solving",
            "Build a bridge from prototype to manufactured product"
        ));
        e.put("process", List.of(
            step(1, "Apply with Technical Brief", "Submit a technical brief describing your product and the specific challenges you need help with."),
            step(2, "Technical Review", "IC IITP engineers and faculty review the brief for fit and capability match."),
            step(3, "Programme Design", "A custom support plan is designed based on your specific technical needs."),
            step(4, "Execution", "6-month hands-on programme with direct lab access, faculty mentoring, and regular technical reviews.")
        ));
        return e;
    }

    // ── Startups ───────────────────────────────────────────────────────────

    private void seedStartups() {
        // Remove legacy scheme records that no longer exist in the 12-programme catalogue
        for (String legacy : List.of("meity", "genesis")) {
            List<Startup> old = startupRepository.findBySchemeOrderBySortOrderAscNameAsc(legacy, org.springframework.data.domain.Pageable.unpaged()).getContent();
            if (!old.isEmpty()) {
                startupRepository.deleteAll(old);
                log.info("Removed {} legacy '{}' startups", old.size(), legacy);
            }
        }

        int created = 0;
        for (Object[] row : startupData()) {
            String name   = (String) row[0];
            String scheme = (String) row[1];
            String tagline = (String) row[2];
            @SuppressWarnings("unchecked") List<String> sectors  = (List<String>) row[3];
            @SuppressWarnings("unchecked") List<String> founders = (List<String>) row[4];
            String website = (String) row[5];
            if (startupRepository.existsByNameAndScheme(name, scheme)) continue;
            startupRepository.save(Startup.builder()
                .name(name).scheme(scheme).tagline(tagline)
                .sectorsJson(toJsonArray(sectors)).foundersJson(toJsonArray(founders))
                .website(website == null || website.isBlank() ? null : website)
                .published(true).sortOrder(0).build());
            created++;
        }
        if (created > 0) log.info("Seeded {} startups", created);
    }

    private static Object[] st(String name, String scheme, String tagline,
                                List<String> sectors, List<String> founders, String web) {
        return new Object[]{name, scheme, tagline, sectors, founders, web};
    }

    private static List<Object[]> startupData() {
        return Stream.<Object[]>of(
            // ── MeitY Phase I ─────────────────────────────────────────────────────
            st("Bionic Hope (Robo Bionics)",              "meity-i", "Affordable prosthetic limbs using robotics and bio-signals.",          List.of("Medical Devices","Robotics"),           List.of("Llewellyn D'Sa"),         null),
            st("4mirrorTech Innovatives",                 "meity-i", "Innovative tech solutions for industrial and consumer markets.",       List.of("Electronics","IoT"),                    List.of("Ankur Jaiswal"),          null),
            st("Atlamedico Techsolutions",                "meity-i", "Medical technology solutions for diagnostics and patient care.",       List.of("MedTech","Diagnostics"),                List.of(),                         null),
            st("Wityliti Automation",                     "meity-i", "Intelligent automation systems for manufacturing.",                    List.of("Automation","Industry 4.0"),            List.of(),                         null),
            st("Portable Power Technology",               "meity-i", "Compact portable power solutions for field and consumer use.",         List.of("Energy","Electronics"),                 List.of(),                         null),
            st("Silifarm Technologies",                   "meity-i", "AgriTech solutions leveraging IoT for precision farming.",             List.of("AgriTech","IoT"),                       List.of(),                         null),
            st("Innovate2automate",                       "meity-i", "Process automation and robotics for SMEs.",                           List.of("Automation","Robotics"),                List.of(),                         null),
            st("Tarudhairya Digital",                     "meity-i", "Digital transformation and enterprise solutions.",                    List.of("ICT","SaaS"),                           List.of(),                         null),
            st("Smartway Electronics",                    "meity-i", "Smart electronic systems for home and industry.",                     List.of("Electronics","Smart Devices"),          List.of(),                         null),
            st("Khojolocal",                              "meity-i", "Hyperlocal discovery platform connecting consumers and local businesses.", List.of("ICT","Marketplace"),               List.of(),                         null),
            st("Huper System",                            "meity-i", "Human-centered computing and ergonomic tech solutions.",              List.of("HCI","Electronics"),                    List.of(),                         null),
            st("RBMEDUTECH INDIA",                        "meity-i", "EdTech platforms for rural and underserved students.",                List.of("EdTech","ICT"),                         List.of(),                         null),
            st("Electro Curietech",                       "meity-i", "Novel electronic devices inspired by piezoelectric and curie-effect physics.", List.of("Electronics","Deep Tech"),    List.of("Rahul Raj"),               null),
            st("SaptKrishi Scientific",                   "meity-i", "Scientific tools and devices for agricultural research.",             List.of("AgriTech","Instrumentation"),           List.of(),                         null),
            st("Amjad Ali Healthcare (AA Health)",        "meity-i", "Accessible healthcare products and services.",                        List.of("Healthcare","MedTech"),                 List.of(),                         null),
            st("Wellth Solutions",                        "meity-i", "Digital health and wellness management platform.",                    List.of("HealthTech","SaaS"),                    List.of(),                         null),
            st("Makecept",                                "meity-i", "Rapid prototyping and concept-to-product manufacturing services.",    List.of("Manufacturing","Deep Tech"),            List.of(),                         null),
            st("Skugal Technologies",                     "meity-i", "Supply chain visibility and inventory management solutions.",         List.of("Logistics","IoT"),                      List.of(),                         null),
            st("Giscle Systems",                          "meity-i", "Geospatial intelligence and location-based analytics.",              List.of("GIS","Analytics"),                      List.of(),                         null),
            st("Sybylline Robotics",                      "meity-i", "Autonomous robotics for industrial inspection and logistics.",        List.of("Robotics","AI/ML"),                     List.of(),                         null),
            st("Urinalytics Healthcare",                  "meity-i", "Non-invasive urine diagnostics for chronic disease monitoring.",      List.of("Diagnostics","MedTech"),                List.of(),                         null),
            st("Lifegraph Biomedical Instrumentation",    "meity-i", "Biomedical instruments for clinical and research settings.",          List.of("Medical Devices","Instrumentation"),    List.of(),                         null),
            st("Scraptechies Solutions",                  "meity-i", "E-waste management and circular economy tech solutions.",             List.of("CleanTech","Sustainability"),           List.of(),                         null),
            st("KINGSHAHI INNOVATIONS",                   "meity-i", "Innovative products for rural markets and Bharat economy.",           List.of("Consumer Electronics","Rural Tech"),    List.of(),                         null),
            st("BigOHealth",                              "meity-i", "AI-driven health analytics for preventive care.",                    List.of("AI/ML","HealthTech"),                   List.of(),                         null),
            st("Techprolabz",                             "meity-i", "Professional laboratory and electronics development services.",       List.of("Electronics","Lab Tech"),               List.of(),                         null),
            // ── MeitY Phase II ────────────────────────────────────────────────────
            st("Biro Power",                              "meity-ii", "Renewable energy storage and power management solutions.",           List.of("Energy","CleanTech"),                   List.of(),                         null),
            st("Aishwarya Laxmi Agromart",                "meity-ii", "Digital agricultural marketplace for farmers and buyers.",          List.of("AgriTech","Marketplace"),               List.of(),                         null),
            st("Bhoomi AI Solutions",                     "meity-ii", "AI-powered solutions for precision agriculture.",                   List.of("AI/ML","AgriTech"),                     List.of(),                         null),
            st("Ceir Mobility",                           "meity-ii", "Smart electric mobility solutions for urban transport.",            List.of("EV","Mobility"),                        List.of("Jitendra Parit (CTO)"),   null),
            st("Cyclotron Digital",                       "meity-ii", "Digital media and content technology platforms.",                   List.of("Media Tech","ICT"),                     List.of(),                         null),
            st("Dhenutrack",                              "meity-ii", "IoT-based livestock monitoring and dairy management.",              List.of("AgriTech","IoT"),                       List.of(),                         null),
            st("Ewarn System",                            "meity-ii", "Early warning systems for natural disasters and industrial hazards.", List.of("Safety Tech","IoT"),                  List.of(),                         null),
            st("Geordana",                                "meity-ii", "Geospatial data analytics and mapping solutions.",                  List.of("GIS","Analytics"),                      List.of(),                         null),
            st("Hoverene Aerospace",                      "meity-ii", "Unmanned aerial vehicles and drone technology.",                    List.of("Aerospace","Drones"),                   List.of(),                         null),
            st("Inventuriz Labs",                         "meity-ii", "Inventive electronics and hardware development lab.",               List.of("Electronics","Deep Tech"),              List.of(),                         null),
            st("Invesalius Ortho",                        "meity-ii", "Orthopaedic implant design using 3D printing and advanced materials.", List.of("Medical Devices","3D Printing"),    List.of(),                         null),
            st("Medicfiber",                              "meity-ii", "Optical fibre-based medical sensing and diagnostics.",              List.of("Medical Devices","Photonics"),          List.of(),                         null),
            st("RF Nanocomposites",                       "meity-ii", "RF and microwave components using nanocomposite materials.",        List.of("Materials","Electronics"),              List.of(),                         null),
            st("Rhomu",                                   "meity-ii", "Connected home and building automation solutions.",                 List.of("IoT","Smart Home"),                     List.of(),                         null),
            st("Saksam Toyhouse",                         "meity-ii", "Educational toys and STEM kits for children.",                     List.of("EdTech","Consumer Products"),           List.of(),                         null),
            st("Sarva Suvidhaen",                         "meity-ii", "Integrated service delivery platform for rural communities.",       List.of("GovTech","Rural Tech"),                 List.of(),                         null),
            st("Schilling Engineering India",             "meity-ii", "Precision engineering components and systems.",                    List.of("Engineering","Manufacturing"),          List.of(),                         null),
            st("Self Shiksha",                            "meity-ii", "Self-paced vernacular learning platform.",                         List.of("EdTech","ICT"),                         List.of(),                         null),
            st("Pratri (Unizent)",                        "meity-ii", "Universal charging and power management ecosystem.",               List.of("Electronics","Energy"),                 List.of(),                         null),
            st("Deepgaze Technologies",                   "meity-ii", "Computer vision and deep learning for industrial inspection.",      List.of("AI/ML","Machine Vision"),               List.of(),                         null),
            st("Humortech",                               "meity-ii", "Human-oriented robotics for care and assistance.",                  List.of("Robotics","Healthcare"),                List.of(),                         null),
            st("Oive Indian Innovation",                  "meity-ii", "Indigenous tech innovation for Indian markets.",                    List.of("Electronics","Deep Tech"),              List.of(),                         null),
            st("Trustedwear Tech",                        "meity-ii", "Wearable electronics for health monitoring and fitness.",           List.of("Wearables","HealthTech"),               List.of(),                         null),
            st("Creatronics Healing System",              "meity-ii", "Electronic therapeutic devices for pain management.",              List.of("Medical Devices","Electronics"),         List.of(),                         null),
            st("Elevatronix",                             "meity-ii", "Elevator and lift modernisation using IoT and AI.",                 List.of("IoT","Safety Tech"),                    List.of(),                         null),
            st("Vpotential",                              "meity-ii", "Vocational training and skills development platform.",             List.of("EdTech","SkillTech"),                   List.of(),                         null),
            // ── SISF ──────────────────────────────────────────────────────────────
            st("Eigenform Dynamics",                      "sisf", "Advanced dynamics simulation and analysis tools.",                     List.of("Deep Tech","Simulation"),               List.of(),                         null),
            st("Arunoday Optimized Nexus",                "sisf", "Energy optimisation for commercial and industrial buildings.",          List.of("Energy","IoT"),                         List.of(),                         null),
            st("Tesvolts",                                "sisf", "EV charging infrastructure and battery management systems.",           List.of("EV","Energy"),                          List.of(),                         null),
            st("Trustedwear Tech",                        "sisf", "Wearable electronics for health monitoring and fitness.",              List.of("Wearables","HealthTech"),               List.of(),                         null),
            st("Medline Robotics",                        "sisf", "Surgical and rehabilitation robotics for hospitals.",                  List.of("Robotics","Medical Devices"),           List.of(),                         null),
            st("RRS Projectx Cloud",                      "sisf", "Cloud-native enterprise project management platform.",                 List.of("SaaS","Cloud"),                         List.of(),                         null),
            st("Glibz Imagetech",                         "sisf", "AI-powered image processing for retail and logistics.",               List.of("AI/ML","Machine Vision"),               List.of(),                         null),
            st("Airbuddy Aerospace",                      "sisf", "Lightweight drone systems for agriculture and surveillance.",          List.of("Aerospace","Drones"),                   List.of(),                         null),
            st("Dveck Mobility",                          "sisf", "Last-mile electric mobility solutions.",                              List.of("EV","Mobility"),                        List.of(),                         null),
            st("Clarosys Biotactical",                    "sisf", "Biosensing and bioelectronics for tactical and clinical use.",         List.of("Bioelectronics","Defense"),             List.of(),                         null),
            st("Cier Mobility",                           "sisf", "Connected electric vehicle platform for shared mobility.",            List.of("EV","IoT"),                             List.of(),                         null),
            st("DB Potential LLP",                        "sisf", "Data-driven business intelligence solutions.",                        List.of("Analytics","SaaS"),                     List.of(),                         null),
            st("Evoluto Lifesciences",                    "sisf", "Next-generation life sciences tools and diagnostics.",                List.of("Life Sciences","Diagnostics"),          List.of(),                         null),
            // ── Nidhi Prayas ──────────────────────────────────────────────────────
            st("Adiabatic Technologies",                  "nidhi-prayas", "Energy-efficient adiabatic cooling and thermal management.",   List.of("Energy","CleanTech"),                   List.of(),                         null),
            st("Anagha Innovation",                       "nidhi-prayas", "Innovative solutions for healthcare and assistive technology.", List.of("MedTech","Assistive Tech"),             List.of(),                         null),
            st("AR Village Technologies",                 "nidhi-prayas", "Augmented reality tools for rural education and training.",    List.of("AR/VR","EdTech"),                       List.of(),                         null),
            st("Bluevelocity (RED-CAPERS)",               "nidhi-prayas", "High-velocity electric vehicle powertrain solutions.",         List.of("EV","Deep Tech"),                       List.of(),                         null),
            st("CMSEFR",                                  "nidhi-prayas", "Community-focused social enterprise for rural development.",   List.of("Social Impact","Rural Tech"),           List.of(),                         null),
            st("Ecoasylum",                               "nidhi-prayas", "Eco-friendly shelter and construction technology.",           List.of("CleanTech","Construction"),             List.of(),                         null),
            st("Electroequip",                            "nidhi-prayas", "Electronic equipment and instrumentation for industrial use.", List.of("Electronics","Instrumentation"),        List.of(),                         null),
            st("Flytech",                                 "nidhi-prayas", "Lightweight drone and UAV technology for diverse applications.", List.of("Aerospace","Drones"),                List.of(),                         null),
            st("Hariyali Kart",                           "nidhi-prayas", "Green e-commerce for sustainable and organic products.",       List.of("Sustainability","E-commerce"),          List.of(),                         null),
            st("Humors Tech",                             "nidhi-prayas", "Human-centric robotics and assistive devices.",               List.of("Robotics","Assistive Tech"),            List.of(),                         null),
            st("Kingshahi Innovations",                   "nidhi-prayas", "Affordable products for Bharat's grassroots economy.",        List.of("Consumer Products","Rural Tech"),       List.of(),                         null),
            st("Mechlergy (RABOS)",                       "nidhi-prayas", "Mechanical energy harvesting and bio-inspired robotics.",      List.of("Robotics","Energy Harvesting"),         List.of(),                         null),
            st("Pacing Grass",                            "nidhi-prayas", "Smart urban landscaping and green infrastructure.",           List.of("Smart City","Sustainability"),          List.of(),                         null),
            st("Pratri",                                  "nidhi-prayas", "Universal power and charging solutions.",                     List.of("Electronics","Energy"),                 List.of(),                         null),
            st("Robos India",                             "nidhi-prayas", "Domestic robotics and automation for Indian households.",     List.of("Robotics","Consumer Products"),         List.of(),                         null),
            st("Sharang Shakti",                          "nidhi-prayas", "Renewable energy systems for rural electrification.",         List.of("Energy","Rural Tech"),                  List.of(),                         null),
            st("Vagaa Motors",                            "nidhi-prayas", "Affordable electric vehicles for tier-2 and rural markets.",  List.of("EV","Mobility"),                        List.of(),                         null),
            // ── Nidhi EIR ─────────────────────────────────────────────────────────
            st("VAGAA Motors",                            "nidhi-eir", "Affordable electric vehicles for tier-2 and rural markets.",     List.of("EV","Mobility"),                        List.of(),                         null),
            st("Square-Cut Research",                     "nidhi-eir", "Advanced materials research for next-generation electronics.",   List.of("Materials","Deep Tech"),                List.of(),                         null),
            st("Bhoomi AI",                               "nidhi-eir", "AI for smart agriculture and soil analytics.",                  List.of("AI/ML","AgriTech"),                     List.of(),                         null),
            st("AR Village Technologies",                 "nidhi-eir", "AR tools for rural education and skill development.",           List.of("AR/VR","EdTech"),                       List.of(),                         null),
            st("Bevarc Construction",                     "nidhi-eir", "Tech-driven construction and prefab building solutions.",       List.of("Construction","Deep Tech"),             List.of(),                         null),
            st("PortraitNews",                            "nidhi-eir", "AI-powered hyper-local news and content platform.",             List.of("Media Tech","AI/ML"),                   List.of(),                         null),
            st("Koshismart Fish Feeder",                  "nidhi-eir", "Automated IoT fish feeder for aquaculture.",                    List.of("AgriTech","IoT"),                       List.of(),                         null),
            st("EJY Health",                              "nidhi-eir", "Accessible digital health platform for rural populations.",     List.of("HealthTech","Rural Tech"),              List.of(),                         null),
            st("Vivicrop Farm Science",                   "nidhi-eir", "Data-driven crop science and precision farming tools.",         List.of("AgriTech","Analytics"),                 List.of(),                         null),
            st("Ecoasylum",                               "nidhi-eir", "Eco-friendly shelter and sustainable construction tech.",       List.of("CleanTech","Construction"),             List.of(),                         null),
            st("Interview Bot",                           "nidhi-eir", "AI-powered mock interview and career readiness platform.",      List.of("AI/ML","EdTech"),                       List.of(),                         null),
            st("Imaze World",                             "nidhi-eir", "Immersive AR/VR experiences for education and entertainment.",  List.of("AR/VR","EdTech"),                       List.of(),                         null),
            st("Jyoti STEM Learning (Port-O-Lab)",        "nidhi-eir", "Portable STEM labs for schools with limited infrastructure.",   List.of("EdTech","STEM"),                        List.of(),                         null),
            st("M.N.O Swadeshi India",                    "nidhi-eir", "Promoting indigenous products and Make-in-India solutions.",    List.of("Consumer Products","Manufacturing"),    List.of(),                         null),
            st("Sunlight Design LLP",                     "nidhi-eir", "Solar energy design and installation services.",               List.of("CleanTech","Solar"),                    List.of(),                         null),
            st("Recyteq Organic",                         "nidhi-eir", "Organic waste recycling and circular economy solutions.",      List.of("CleanTech","Sustainability"),           List.of(),                         null),
            st("Retake Innovation (EVEO)",                "nidhi-eir", "Electric vehicle ecosystem and charging solutions.",           List.of("EV","Mobility"),                        List.of(),                         null),
            st("STYLRAX SOLUTIONS",                       "nidhi-eir", "Fashion-tech platform combining style analytics with AI.",      List.of("AI/ML","FashionTech"),                  List.of(),                         null),
            st("Wejoy Phonfix",                           "nidhi-eir", "Mobile device repair and refurbishment platform.",             List.of("Electronics","CircularEconomy"),        List.of(),                         null),
            // ── GENESIS EIR ───────────────────────────────────────────────────────
            st("Arixolve Ventures",                       "genesis-eir", "AI-driven feedback and performance analytics platform.",      List.of("AI/ML","SaaS"),                         List.of(),                         "https://arixolve.com"),
            st("Anveshna Futurecorp",                     "genesis-eir", "Multi-agent AI for Industry 4.0 energy optimisation.",       List.of("AI/ML","Industry 4.0","Energy"),        List.of(),                         null),
            st("Jilocosmos Healthrevolution",             "genesis-eir", "AI-first healthcare platform for India's Missing Middle.",    List.of("AI/ML","HealthTech"),                   List.of(),                         "https://jilohealth.com"),
            st("MITDIP INFRASOLVA",                       "genesis-eir", "Non-destructive testing and structural health monitoring for civil infrastructure.", List.of("Deep Tech","Construction","IoT"), List.of(), null)
        ).collect(java.util.stream.Collectors.toList());
    }

    // ── Events ────────────────────────────────────────────────────────────
    // Seed the four core IC IITP events into the DB. Idempotent — skips any
    // slug that already exists so admin edits are never overwritten on restart.

    private void seedStaticEvents() {
        seedEvent("ideathon",
            "Ideathon 2.0",
            "BioTech & MedTech ideation competition with top teams winning BioNEST incubation.",
            "Ideathon 2.0 was co-organised by IC IITP and the Department of Life Science, Central University of South Bihar, Gaya. Teams submitted innovative ideas in BioTech and MedTech domains; the top 20 teams were offered BioNEST incubation at IC IITP. Cash prizes were awarded to the top three teams.",
            "Competition", "Concluded",
            "https://forms.gle/NTrATcbqD4nhDDA68",
            "iciitp@iitp.ac.in",
            Map.of(
                "shortTitle", "Ideathon",
                "organiser", "IC IITP + Dept. of Life Science, Central University of South Bihar",
                "venue", "CUSB Gaya (Central University of South Bihar, Gaya)",
                "submissionDeadline", "2025-03-20",
                "pitchDate", "2025-03-28",
                "themes", List.of("Biotechnology", "Medical Electronics", "Life Sciences", "Healthcare Innovation"),
                "prizes", List.of(
                    Map.of("position", "1st", "prize", "₹10,000"),
                    Map.of("position", "2nd", "prize", "₹7,500"),
                    Map.of("position", "3rd", "prize", "₹5,000")
                ),
                "specialAward", "Top 20 teams eligible for BioNEST incubation at IC IITP"
            ));

        seedEvent("edpi-2025",
            "Entrepreneurship Development Programme for Innovators (EDPI-2025)",
            "18-week online entrepreneurship programme for innovators and aspiring founders.",
            "EDPI-2025 is an 18-week online entrepreneurship development programme co-organised by IC IITP and Moonpreneur, a Silicon Valley-based organisation founded by IIT and IIM alumni. The programme runs every Tuesday evening and covers the complete journey from ideation to investor pitch. Participants with strong ideas are fast-tracked for IC IITP incubation.",
            "Programme", "Active",
            "https://forms.gle/tpGDpPouRDWDJ91t7",
            "gopi_ic@iitp.ac.in",
            Map.of(
                "shortTitle", "EDPI-2025",
                "organiser", "IC IITP in collaboration with Moonpreneur (Silicon Valley, IIT/IIM alumni)",
                "duration", "18 weeks",
                "schedule", "Tuesdays, 7:00 PM – 8:00 PM",
                "mode", "Online",
                "contactPhone", "+91 7970872747",
                "highlights", List.of(
                    "18-week structured entrepreneurship curriculum",
                    "Weekly live sessions every Tuesday evening",
                    "Mentors from Moonpreneur (Silicon Valley, IIT & IIM alumni)",
                    "Business model canvas, customer discovery, and pitching",
                    "IC IITP incubation pathway for standout participants"
                )
            ));

        seedEvent("medtech-school",
            "MedTech School in Health Technology Innovation",
            "One-week continuing education programme on MedTech innovation for engineers, researchers, and clinicians.",
            "The MedTech School is a one-week intensive continuing education programme (CEP) co-organised by IC IITP for engineers, medical professionals, researchers, and entrepreneurs interested in health technology innovation. Participants gain hands-on exposure to medical device design, regulatory requirements, clinical validation, and the MedTech startup ecosystem.",
            "Training", "Recurring",
            null,
            "iciitp@iitp.ac.in",
            Map.of(
                "shortTitle", "MedTech School",
                "organiser", "IC IITP",
                "duration", "1 week (CEP short-term course)",
                "topics", List.of(
                    "Health technology innovation landscape",
                    "Medical device design and regulatory pathway",
                    "Biomedical signal processing",
                    "Clinical needs assessment",
                    "Startup ecosystem and funding for MedTech"
                ),
                "fees", List.of(
                    Map.of("category", "UG/PG (Self-sponsored)", "amount", "₹3,000"),
                    Map.of("category", "Institute-sponsored participant", "amount", "₹5,000"),
                    Map.of("category", "PhD / PostDoc / Medical Resident", "amount", "₹7,000"),
                    Map.of("category", "Startup (2 participants)", "amount", "₹7,000"),
                    Map.of("category", "Industry / Academia", "amount", "₹10,000")
                ),
                "speakers", List.of(
                    Map.of("name", "Dr. Pramod Kumar Tiwari", "affiliation", "IIT Patna"),
                    Map.of("name", "Dr. Prashant Jha", "affiliation", "King's College London")
                )
            ));

        seedEvent("training-program",
            "Technical Training Programme",
            "Short-term technical training on electronics, IoT, and embedded systems for students and professionals.",
            "IC IITP conducts short-duration technical training programmes on its laboratory infrastructure and tools. These sessions are open to engineering students, faculty members, and industry professionals seeking hands-on exposure to PCB fabrication, embedded systems, IoT, 3D printing, and simulation tools. Training schedules are announced on the Notifications page.",
            "Training", "Recurring",
            null,
            "iciitp@iitp.ac.in",
            Map.of(
                "shortTitle", "Training Programme",
                "organiser", "IC IITP",
                "topics", List.of(
                    "Embedded Systems & Microcontrollers",
                    "PCB Design and Fabrication",
                    "IoT and Wireless Communication",
                    "3D Printing and Mechanical Packaging",
                    "MATLAB / Simulink for Signal Processing",
                    "Medical Electronics Fundamentals"
                ),
                "targetAudience", List.of(
                    "Engineering Students", "Faculty", "Industry Professionals", "Startups"
                )
            ));
    }

    private void seedEvent(String slug, String title, String tagline, String description,
                           String category, String status, String applyUrl, String contact,
                           Map<String, Object> extras) {
        if (eventRepository.existsBySlug(slug)) return;
        Event e = new Event();
        e.setSlug(slug);
        e.setTitle(title);
        e.setTagline(tagline);
        e.setDescription(description);
        e.setCategory(category);
        e.setStatus(status);
        e.setApplyUrl(applyUrl);
        e.setContact(contact);
        e.setPublished(true);
        e.setExtras(new HashMap<>(extras));
        eventRepository.save(e);
        log.info("Seeded event: {}", slug);
    }

    private static final List<Object[]> LAB_SEEDS = List.of(
        new Object[]{"clean-room",     "Clean Room Lab",           "Class-100 cleanroom environment for microfabrication and thin-film processing.", null},
        new Object[]{"pcb-fab",        "PCB Fabrication Lab",      "End-to-end PCB prototyping from layout milling to SMT assembly and rework.", null},
        new Object[]{"test-cal",       "Testing & Calibration Lab","High-frequency measurement and calibration infrastructure for electronic prototypes.", null},
        new Object[]{"mech-packaging", "Mechanical Packaging Lab", "3D printing, laser cutting, and injection moulding for rapid enclosure and product prototyping.", null},
        new Object[]{"esdm",           "ESDM Lab",                 "Embedded systems and electronics development lab with microcontrollers, sensors, and IoT tooling.", null},
        new Object[]{"design-sim",     "Design & Simulation Lab",  "Software tools for electronic design automation, mechanical CAD, and embedded simulation.", null}
    );

    private void seedLabs() {
        for (Object[] seed : LAB_SEEDS) {
            String slug = (String) seed[0];
            if (!labRepository.existsBySlug(slug)) {
                labRepository.save(Lab.builder()
                    .slug(slug)
                    .title((String) seed[1])
                    .tagline((String) seed[2])
                    .description((String) seed[3])
                    .build());
                log.info("Seeded lab: {}", slug);
            }
        }
    }

    private String toJsonArray(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try {
            return new ObjectMapper().writeValueAsString(list);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            return null;
        }
    }

    // ── Static Notifications ───────────────────────────────────────────────

    private void seedStaticNotifications() {
        seedNotification("call-for-proposals",
            "Call for Proposals – Nidhi Prayas 2025 & BioNEST Call-2",
            "Active calls for proposals: Nidhi Prayas 2025 (DST grant up to ₹10 lakh) and BioNEST Call-2 (BIRAC/DBT MedTech incubation).",
            "Incubation Centre IIT Patna, on behalf of, IIT Patna Vishleshan I hub Foundation invites applications for support under NIDHI-EIR scheme of the NSTEDB, DST working in Cyber Physical System, especially on speech, video, and text analytics and related areas.",
            "Call for Proposals",
            "iciitp@iitp.ac.in",
            null,
            "2025-05-01",
            null,
            Map.of("proposalsTable", List.of(
                Map.of("sn", 1, "title", "Call for applications for DST NIDHI PRAYAS at Incubation Centre IIT Patna.",
                    "moreDetailsUrl", "/programs/nidhi-prayas", "detailsUrl", "/uploads/Appliation-Form-Nidhi-Prayas-2025with_Annexure.pdf"),
                Map.of("sn", 2, "title", "Call for proposal-2 for BioNEST at Incubation Centre IIT Patna.",
                    "moreDetailsUrl", "/programs/bionest", "detailsUrl", "/uploads/BIRAC-BiONEST-2.pdf"),
                Map.of("sn", 3, "title", "Call for applications for NIDHI-EIR at Incubation Centre IIT Patna.",
                    "moreDetailsUrl", "/programs/nidhi-eir", "detailsUrl", "/uploads/ICIITP-Nidhi-EIR-Application1-1.pdf"),
                Map.of("sn", 4, "title", "Notice: Postponing the shortlisting of applications received for NIDHI EIR and NIDHI PRAYAS Scheme for TIH IIT Patna.",
                    "detailsUrl", "/uploads/letter_postpone_TIH.pdf"),
                Map.of("sn", 5, "title", "Call for applications for NIDHI PRAYAS at TIH IIT Patna: Last date for Submission is 30th Jan. 2023.",
                    "note", "*Use Firefox or Microsoft browser to download the Application Form",
                    "detailsUrl", "/uploads/call-for-proposal_Nidhi-Prayas.pdf",
                    "applicationFormUrl", "/uploads/Nidhi-Prayas-AppliationForm-.docx"),
                Map.of("sn", 6, "title", "Call for applications for NIDHI-EIR at TIH IIT Patna: Last date for Submission is 30th Jan. 2023.",
                    "detailsUrl", "/uploads/Nidhi-EIR-Application.pdf"),
                Map.of("sn", 7, "title", "Call for proposal in the domain of Electronics System Design and Manufacturing (Deadline: 15th August 2022)",
                    "detailsUrl", "/uploads/ICIITP-Nidhi-EIR-Application.pdf")
            ))
        );

        seedNotification("careers",
            "Recruitment – Various Positions at IC IITP",
            "IC IITP invites applications for various administrative and technical positions. Deadline: 18 January 2026.",
            "With the support of State Govt. of Bihar this IC will be a joint effort with MeitY Government of India. The State govt. will provide matching funds and its agencies like Bihar State Electronics Development Corporation Ltd. (BELTRON) will also collaborate.\n\nThe Incubation Centre, IIT Patna (IC IITP) invites applications from eligible candidates for various positions. The roles span administration, technical operations, incubation management, and programme coordination. Interested candidates should download the application form and submit it via email to iciitp@iitp.ac.in before the deadline.\n\nNote: Please use Mozilla Firefox or Internet Explorer for downloading Word (.docx) files.",
            "Careers",
            "iciitp@iitp.ac.in",
            null,
            "2025-11-01",
            "2026-01-18",
            Map.of("recruitmentTable", List.of(
                Map.of("sn", 1, "position", "Various Positions", "notificationDate", "26.12.2025", "deadline", "18.01.2026", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/IC-IIT-Patna_Recruitment_26.12.2025.pdf", "type", "PDF"),
                        Map.of("label", "Application Form", "url", "/uploads/Application-form_ICIITP.docx", "type", "DOCX")
                    )),
                Map.of("sn", 2, "position", "Audit Officer – Consultancy Based", "notificationDate", "—", "deadline", "26.07.2025", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/Notification_Consultant.pdf", "type", "PDF"),
                        Map.of("label", "Shortlisted Candidates", "url", "/uploads/Shortlisted-Candidates-List.pdf", "type", "PDF"),
                        Map.of("label", "Shortlisted (Updated)", "url", "/uploads/Shortlisted-applications_website.pdf", "type", "PDF"),
                        Map.of("label", "Selected List (Result)", "url", "/uploads/Result_CAO_Web.pdf", "type", "PDF")
                    )),
                Map.of("sn", 3, "position", "Internship Opportunities", "notificationDate", "09.2025", "deadline", "—", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Internship Application", "url", "/uploads/Internship-application.pdf", "type", "PDF"),
                        Map.of("label", "Apply Now", "url", "https://shorturl.at/Nexyn", "type", "Link"),
                        Map.of("label", "Selected Interns List", "url", "/uploads/Selected-Interns-1.pdf", "type", "PDF")
                    )),
                Map.of("sn", 4, "position", "Internship Opportunities (MSME Idea Hackathon)", "notificationDate", "06.2025", "deadline", "—", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/Internship_MSME-Idea-Hackathone-3.01.pdf", "type", "PDF"),
                        Map.of("label", "Apply Now", "url", "https://shorturl.at/Sjory", "type", "Link")
                    )),
                Map.of("sn", 5, "position", "Chief Manager-BioNEST & Scientific Officer", "notificationDate", "10.07.2024", "deadline", "19.08.2024", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/Recruitment-Notification_Chief-Sc-officer_web.pdf", "type", "PDF"),
                        Map.of("label", "Application Form", "url", "/uploads/Application_formBionest_ICIITP.docx", "type", "DOCX"),
                        Map.of("label", "Shortlisted Candidates", "url", "/uploads/Shortlisted_website-1-1.pdf", "type", "PDF"),
                        Map.of("label", "Final Selection Result", "url", "/uploads/Final-selection_web-1.pdf", "type", "PDF")
                    )),
                Map.of("sn", 6, "position", "Executive / Sr. Executive – Marketing", "notificationDate", "11.06.2024", "deadline", "11.08.2024", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/Notification_Executive-marketing-bsft1.pdf", "type", "PDF"),
                        Map.of("label", "Corrigendum", "url", "/uploads/extension-approval.pdf", "type", "PDF"),
                        Map.of("label", "Application Form", "url", "/uploads/Application_formMarketing_ICIITP.docx", "type", "DOCX"),
                        Map.of("label", "Shortlisted Candidates", "url", "/uploads/ICIITP-Executive-Sr.-Executive-Marketing-Shortlisted.pdf", "type", "PDF"),
                        Map.of("label", "Result (Selected)", "url", "/uploads/Result_-Executive-marketing.pdf", "type", "PDF")
                    )),
                Map.of("sn", 7, "position", "Sr. Executive – Facility Management", "notificationDate", "21.02.2024", "deadline", "31.03.2024", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/Recruitment-Notification_Executive-FM_Web.pdf", "type", "PDF"),
                        Map.of("label", "Extension", "url", "/uploads/Extension-approval_Sr-Executive.pdf", "type", "PDF"),
                        Map.of("label", "Application Form", "url", "/uploads/Application_format_ICIITP3.docx", "type", "DOCX"),
                        Map.of("label", "Shortlisted Candidates", "url", "/uploads/Shortlisted-applications_website_2.pdf", "type", "PDF"),
                        Map.of("label", "Result (Selected)", "url", "/uploads/Result_Sr.-Executive.pdf", "type", "PDF")
                    )),
                Map.of("sn", 8, "position", "Jr. Executive / Executive – Various Positions (CEO, COO, Manager, Asst. Manager, Jr./Executive)", "notificationDate", "01.06.2023", "deadline", "07.08.2023", "status", "cancelled",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/Recruitment-Notification_IC.pdf", "type", "PDF"),
                        Map.of("label", "Application Form (PDF)", "url", "/uploads/Application_format_ICIITP.pdf", "type", "PDF"),
                        Map.of("label", "Application Form (DOCX)", "url", "/uploads/Application_format_ICIITP.docx", "type", "DOCX"),
                        Map.of("label", "Shortlisted – CEO & COO", "url", "/uploads/Shortlisted_CEO-COO.pdf", "type", "PDF"),
                        Map.of("label", "Shortlisted – Jr./Executive Level", "url", "/uploads/Shortlisted-Applications.pdf", "type", "PDF"),
                        Map.of("label", "Result (Selected)", "url", "/uploads/Result-_Accociates_Executive_IC-IITP.pdf", "type", "PDF"),
                        Map.of("label", "Cancellation Notice", "url", "/uploads/Recruitment-cancellation.pdf", "type", "PDF")
                    )),
                Map.of("sn", 9, "position", "Internship Opportunities", "notificationDate", "10.2022", "deadline", "25.10.2022", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/Notification-_-Internship-22.pdf", "type", "PDF")
                    )),
                Map.of("sn", 10, "position", "Jr. Associate/Associate and Jr. Executive/Executive – Various Positions", "notificationDate", "31.07.2022", "deadline", "10.08.2022", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/IC_Recruitment-_Notification.pdf", "type", "PDF"),
                        Map.of("label", "Application Form", "url", "/uploads/Application_Form.pdf", "type", "PDF"),
                        Map.of("label", "Shortlisted Candidates", "url", "/uploads/Shortlisted-candidates_website-3.pdf", "type", "PDF"),
                        Map.of("label", "Result (Selected)", "url", "/uploads/Selected-Candidates_-recruitment.pdf", "type", "PDF"),
                        Map.of("label", "Result – Jr. Executive/Executive", "url", "/uploads/Result_Incubation_web.pdf", "type", "PDF")
                    )),
                Map.of("sn", 11, "position", "Walk-in Interview – Asst. Manager and Executive-Programs", "notificationDate", "—", "deadline", "05.03.2022", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/Recruitment-Notification_ICIITP.pdf", "type", "PDF"),
                        Map.of("label", "Shortlisted Candidates", "url", "/uploads/Shortlisted-candidates_Website-1.pdf", "type", "PDF")
                    )),
                Map.of("sn", 12, "position", "Jr. Executive/Executive – Incubation, Marketing & Technical (Advt. Ref: ICIITP/Rect/2021/01 Dt. 22.12.2021)", "notificationDate", "22.12.2021", "deadline", "31.01.2022", "status", "closed",
                    "documents", List.of(
                        Map.of("label", "Notification", "url", "/uploads/Notification_Executive_ICIITP.pdf", "type", "PDF"),
                        Map.of("label", "Application Form", "url", "/uploads/Application_format_Recruitment.pdf", "type", "PDF"),
                        Map.of("label", "Result – Jr./Executive Positions (Temporary)", "url", "/uploads/Result_Jr-Executive-Executive-Technical-Incubation.pdf", "type", "PDF")
                    ))
            ))
        );

        seedNotification("niq-tender",
            "NIQ / Tender Notices",
            "Tender and procurement notices for IC IITP equipment and services. Published on the Central Government e-Procurement portal.",
            "All IC IITP tender and procurement notices are published on the Government of India e-Procurement portal (eprocure.gov.in). Vendors and suppliers are requested to monitor the portal for current notices.\n\nPast tenders include:\n- ICIITP/MEITY/IC-28/2020-21: Optical measurement software\n- ICIITP/MEITY/IC-37/2020-21: Desktop and laptop computers",
            "NIQ / Tender",
            "iciitp@iitp.ac.in",
            "https://eprocure.gov.in",
            "2020-01-01",
            null,
            Collections.emptyMap()
        );
    }

    private void seedNotification(String slug, String title, String summary, String body,
                                   String category, String contactEmail, String externalUrl,
                                   String validFromStr, String deadlineStr,
                                   Map<String, Object> extras) {
        if (notificationRepository.existsBySlug(slug)) return;
        Notification n = new Notification();
        n.setSlug(slug);
        n.setTitle(title);
        n.setSummary(summary);
        n.setBody(body);
        n.setCategory(category);
        n.setContactEmail(contactEmail);
        n.setExternalUrl(externalUrl);
        n.setPublished(true);
        if (validFromStr != null) {
            n.setValidFrom(java.time.LocalDate.parse(validFromStr).atStartOfDay());
        }
        if (deadlineStr != null) {
            n.setDeadline(java.time.LocalDate.parse(deadlineStr).atStartOfDay());
        }
        n.setExtras(new HashMap<>(extras));
        notificationRepository.save(n);
        log.info("Seeded notification: {}", slug);
    }

    // ── One-time data fix: ensure at most one news article is featured ──────
    private void fixDuplicateFeaturedNews() {
        List<News> featured = newsRepository.findAll().stream()
                .filter(News::isFeatured)
                .sorted(Comparator.comparing(News::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        if (featured.size() <= 1) return;
        // Keep the most-recently-updated one featured, clear the rest
        for (int i = 1; i < featured.size(); i++) {
            News n = featured.get(i);
            n.setFeatured(false);
            newsRepository.save(n);
        }
        log.info("Fixed {} duplicate featured news article(s)", featured.size() - 1);
    }
}
