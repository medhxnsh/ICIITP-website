import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/breadcrumb";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
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
  phone: "+91 611 523 3547",
  email: "icitp@iitp.ac.in",
  hours: "Monday – Friday: 9:00 AM – 5:30 PM IST",
  maps_embed_url: "https://maps.google.com/maps?q=IIT+Patna+Incubation+Centre+Bihta+Bihar&z=17&output=embed",
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cms = await getPageSection("contact").catch(() => null);
  const address  = cms?.address        || D.address;
  const phone    = cms?.phone          || D.phone;
  const email    = cms?.email          || D.email;
  const hours    = cms?.hours          || D.hours;
  const mapsUrl  = cms?.maps_embed_url || D.maps_embed_url;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <header className="mb-10">
        <h1 className="text-4xl font-black mb-3" style={{ color: "#3a5214" }}>
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Reach out to the Incubation Centre IIT Patna — for incubation inquiries, lab access, partnerships, or general information.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Contact details */}
        <div className="space-y-6">
          <div className="rounded-xl p-6 space-y-6 text-white" style={{ backgroundColor: "#3a5214" }}>

            {/* Address */}
            <div className="flex gap-4">
              <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#f79420" }} aria-hidden="true" />
              <div>
                <p className="font-bold mb-1" style={{ color: "#f79420" }}>Address</p>
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
              <Phone className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#f79420" }} aria-hidden="true" />
              <div className="space-y-3">
                <div>
                  <p className="font-bold mb-1" style={{ color: "#f79420" }}>General Enquiries</p>
                  <p className="text-sm text-white/70 mb-0.5">Mr. Pradhan</p>
                  <a href="tel:06115233547" className="text-sm text-white hover:text-white/80 transition-colors">06115233547</a>
                </div>
                <div>
                  <p className="font-bold mb-1" style={{ color: "#f79420" }}>For Getting Incubated</p>
                  <p className="text-sm text-white/70 mb-0.5">Mrs. Deepti Anand</p>
                  <a href="tel:+919608938788" className="text-sm text-white hover:text-white/80 transition-colors">+91 9608938788</a>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10" />

            {/* Email */}
            <div className="flex gap-4">
              <Mail className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#f79420" }} aria-hidden="true" />
              <div>
                <p className="font-bold mb-1" style={{ color: "#f79420" }}>Write to us</p>
                <a href="mailto:iciitp@iitp.ac.in" className="text-sm text-white hover:text-white/80 transition-colors">iciitp@iitp.ac.in</a>
                <p className="text-xs text-white/60 mt-1">We will get back to you.</p>
              </div>
            </div>

            <div className="border-t border-white/10" />

            {/* Office hours */}
            <div className="flex gap-4">
              <Clock className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#f79420" }} aria-hidden="true" />
              <div>
                <p className="font-bold mb-1" style={{ color: "#f79420" }}>Office Hours</p>
                <p className="text-sm text-white/90">{hours}</p>
              </div>
            </div>

          </div>

          {/* Contact form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-bold text-lg mb-5" style={{ color: "#3a5214" }}>Send us a message</h2>
            <ContactForm locale={locale} />
          </div>
        </div>

        {/* Map embed placeholder */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex flex-col">
          <iframe
            title="IC IITP location on Google Maps"
            src={mapsUrl}
            width="100%"
            height="100%"
            className="min-h-[400px] flex-1"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Feedback section */}
      <section id="feedback" className="mt-12 pt-10 border-t" style={{ borderColor: "#e8f0e0" }}>
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#f0f7e6" }}>
                <MessageSquare className="w-4 h-4" style={{ color: "#3a5214" }} aria-hidden="true" />
              </span>
              <h2 className="text-2xl font-black" style={{ color: "#3a5214" }}>Share your feedback</h2>
            </div>
            <p className="text-base mb-5" style={{ color: "#5a6644" }}>
              Suggestions, complaints, compliments — we want to hear from you.
            </p>
            <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: "#f0f7e6", border: "1px solid #d4e6c4" }}>
              <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#3a5214" }} aria-hidden="true" />
              <p className="text-sm leading-relaxed" style={{ color: "#3a5214" }}>
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
  );
}
