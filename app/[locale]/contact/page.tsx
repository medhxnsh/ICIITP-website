import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/breadcrumb";
import { MobileInfo } from "@/components/mobile-info";
import { MapPin, Phone, Mail, Clock, MessageSquare, PhoneCall } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { getPageSection } from "@/lib/cms/page-sections";
import { ContactForm } from "@/components/forms/contact-form";
import { FeedbackForm } from "@/components/forms/feedback-form";

export const revalidate = 60; // ISR: re-fetch at most once per minute

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: "Contact — IC IITP",
  description: "Get in touch with the Incubation Centre IIT Patna. Visit us at Bihta, Patna or reach out by phone or email.",
};

const D = {
  address: "Incubation Centre, IIT Patna\nAmhara Road, Bihta\nPatna, Bihar – 801103",
  enquiries_name: "Mr. Pradhan",
  enquiries_phone: "06115233547",
  incubation_name: "Mrs. Deepti Anand",
  incubation_phone: "+91 9608938788",
  email: "iciitp@iitp.ac.in",
  hours: "Monday – Friday: 9:00 AM – 5:30 PM IST",
  maps_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3596.1!2d84.8517693!3d25.5361884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed577f694d904f%3A0xec61bf6ba64170a9!2sIncubation+Centre+%5BIIT-Patna%5D!5e0!3m2!1sen!2sin!4v1716000000000!5m2!1sen!2sin",
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cms = await getPageSection("contact").catch(() => null);
  const address         = cms?.address          || D.address;
  const enquiriesName   = cms?.enquiries_name   || D.enquiries_name;
  const enquiriesPhone  = cms?.enquiries_phone  || D.enquiries_phone;
  const incubationName  = cms?.incubation_name  || D.incubation_name;
  const incubationPhone = cms?.incubation_phone || D.incubation_phone;
  const email           = cms?.email            || D.email;
  const hours           = cms?.hours            || D.hours;
  const mapsUrl         = cms?.maps_embed_url   || D.maps_embed_url;

  return (
    <>
      <div className="md:hidden"><MobileInfo page="contact" /></div>
      <div className="hidden md:block min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} variant="light" />
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
              <PhoneCall className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
              Get in Touch
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">Contact Us</h1>
            <p className="text-white/80 text-lg max-w-lg">
              Visit us at Bihta, Patna or reach out by phone or email — we&apos;re here to help.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="sr-only">Contact Us</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Reach out to the Incubation Centre IIT Patna — for incubation inquiries, lab access, partnerships, or general information.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-10">
        {/* Contact details */}
        <div className="space-y-6">
          <div className="rounded-xl p-6 space-y-6 text-white" style={{ backgroundColor: "var(--color-brand-800)" }}>

            {/* Address */}
            <div className="flex gap-4">
              <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} aria-hidden="true" />
              <div>
                <p className="font-bold mb-1" style={{ color: "var(--color-accent)" }}>Address</p>
                <p className="text-sm leading-relaxed text-white/90">
                  Incubation Centre, IIT Patna,<br />
                  Amhara Road, Bihta, Patna,<br />
                  Bihar – 801103
                </p>
              </div>
            </div>

            <div className="border-t border-white/10" />

            {/* Phone contacts */}
            <div className="flex gap-4">
              <Phone className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} aria-hidden="true" />
              <div className="space-y-3">
                <div>
                  <p className="font-bold mb-1" style={{ color: "var(--color-accent)" }}>General Enquiries</p>
                  <p className="text-sm text-white/70 mb-0.5">{enquiriesName}</p>
                  <a href={`tel:${enquiriesPhone.replace(/\s/g, "")}`} className="text-sm text-white hover:text-white/80 transition-colors">{enquiriesPhone}</a>
                </div>
                <div>
                  <p className="font-bold mb-1" style={{ color: "var(--color-accent)" }}>For Getting Incubated</p>
                  <p className="text-sm text-white/70 mb-0.5">{incubationName}</p>
                  <a href={`tel:${incubationPhone.replace(/\s/g, "")}`} className="text-sm text-white hover:text-white/80 transition-colors">{incubationPhone}</a>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10" />

            {/* Email */}
            <div className="flex gap-4">
              <Mail className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} aria-hidden="true" />
              <div>
                <p className="font-bold mb-1" style={{ color: "var(--color-accent)" }}>Write to us</p>
                <a href={`mailto:${email}`} className="text-sm text-white hover:text-white/80 transition-colors">{email}</a>
                <p className="text-xs text-white/80 mt-1">We will get back to you.</p>
              </div>
            </div>

            <div className="border-t border-white/10" />

            {/* Office hours */}
            <div className="flex gap-4">
              <Clock className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} aria-hidden="true" />
              <div>
                <p className="font-bold mb-1" style={{ color: "var(--color-accent)" }}>Office Hours</p>
                <p className="text-sm text-white/90">{hours}</p>
              </div>
            </div>

          </div>

          {/* Contact form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-bold text-lg mb-5" style={{ color: "var(--color-brand-800)" }}>Send us a message</h2>
            <ContactForm locale={locale} />
          </div>
        </div>

        {/* Map embed */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex flex-col" style={{ minHeight: 480 }}>
          <iframe
            title="IC IITP location map"
            src={mapsUrl}
            width="100%"
            height="100%"
            className="flex-1"
            style={{ border: 0, minHeight: 480 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Feedback section */}
      <section id="feedback" className="mt-12 pt-10 border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
        <div className="grid sm:grid-cols-2 gap-10 items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--color-surface-tint)" }}>
                <MessageSquare className="w-4 h-4" style={{ color: "var(--color-brand-800)" }} aria-hidden="true" />
              </span>
              <h2 className="text-2xl font-black" style={{ color: "var(--color-brand-800)" }}>Share your feedback</h2>
            </div>
            <p className="text-base mb-5" style={{ color: "var(--color-text-body)" }}>
              Suggestions, complaints, compliments — we want to hear from you.
            </p>
            <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: "var(--color-surface-tint)", border: "1px solid var(--color-input-border)" }}>
              <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-brand-800)" }} aria-hidden="true" />
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-brand-800)" }}>
                We acknowledge every submission within <strong>3 working days</strong> and respond fully within <strong>15 working days</strong>.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <FeedbackForm locale={locale} />
          </div>
        </div>
      </section>
      </div>
    </div>
    </>
  );
}
