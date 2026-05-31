import { requireAuth } from "@/lib/auth";
import { getPageSection } from "@/lib/cms/page-sections";
import { saveContactSectionAction } from "../actions";
import { ContactSectionForm } from "@/components/admin/contact-section-form";
import Link from "next/link";
import { Phone } from "lucide-react";

export const metadata = { title: "Edit Contact — IC IITP Admin" };

const DEFAULTS = {
  address: "Incubation Centre, IIT Patna\nAmhara Road, Bihta\nPatna, Bihar – 801103",
  enquiries_name: "Mr. Pradhan",
  enquiries_phone: "06115233547",
  incubation_name: "Mrs. Deepti Anand",
  incubation_phone: "+91 9608938788",
  email: "iciitp@iitp.ac.in",
  hours: "Monday – Friday: 9:00 AM – 5:30 PM IST",
  maps_embed_url: "https://maps.google.com/maps?q=IIT+Patna+Incubation+Centre+Bihta+Bihar&z=17&output=embed",
};

export default async function ContactEditorPage() {
  await requireAuth();
  const cms = await getPageSection("contact").catch(() => null);

  const current = {
    address:          cms?.address          || DEFAULTS.address,
    enquiries_name:   cms?.enquiries_name   || DEFAULTS.enquiries_name,
    enquiries_phone:  cms?.enquiries_phone  || DEFAULTS.enquiries_phone,
    incubation_name:  cms?.incubation_name  || DEFAULTS.incubation_name,
    incubation_phone: cms?.incubation_phone || DEFAULTS.incubation_phone,
    email:            cms?.email            || DEFAULTS.email,
    hours:            cms?.hours            || DEFAULTS.hours,
    maps_embed_url:   cms?.maps_embed_url   || DEFAULTS.maps_embed_url,
  };

  return (
    <main className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/pages" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>← Pages</Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <Phone className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>Edit Contact Page</h1>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
        Changes appear live on <a href="/contact" target="_blank" className="underline">/contact</a>.
      </p>
      <ContactSectionForm current={current} onSave={saveContactSectionAction} />
    </main>
  );
}
