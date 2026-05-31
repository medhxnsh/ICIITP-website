"use client";

import { useActionState } from "react";
import { submitInternship, type FormState } from "@/app/actions/submit";
import { Field, Label, Input, Textarea, Select, SubmitButton, ErrorBanner, SuccessBanner } from "./form-field";

const AREAS = ["Electronics / ESDM", "MedTech / Biomedical", "Software / IoT", "Business Development", "Research & Development", "Other"];
const DURATIONS = ["4 weeks", "6 weeks", "2 months", "3 months", "6 months"];
const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Final year", "Postgraduate"];

interface Props { locale?: string }

export function InternshipForm({ locale = "en" }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitInternship, null);

  if (state?.success) {
    return <SuccessBanner message="Application submitted! We'll review and respond within 10 working days." />;
  }

  return (
    <form action={action} noValidate>
      <input type="hidden" name="locale" value={locale} />
      {state && !state.success && <ErrorBanner message={state.error} />}

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <Field className="mb-0">
          <Label htmlFor="name" required>Full name</Label>
          <Input id="name" type="text" required placeholder="As on your ID" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" type="email" required placeholder="college or personal email" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <Field className="mb-0">
          <Label htmlFor="phone" required>Phone</Label>
          <Input id="phone" type="tel" required placeholder="+91 98765 43210" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="college" required>College / University</Label>
          <Input id="college" type="text" required placeholder="Institution name" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <Field className="mb-0">
          <Label htmlFor="degree" required>Degree</Label>
          <Input id="degree" type="text" required placeholder="e.g. B.Tech Electronics" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="year" required>Current year</Label>
          <Select id="year" required defaultValue="">
            <option value="" disabled>Select</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <Field className="mb-0">
          <Label htmlFor="area" required>Area of interest</Label>
          <Select id="area" required defaultValue="">
            <option value="" disabled>Select</option>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </Field>
        <Field className="mb-0">
          <Label htmlFor="duration" required>Preferred duration</Label>
          <Select id="duration" required defaultValue="">
            <option value="" disabled>Select</option>
            {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </Field>
      </div>

      <Field>
        <Label htmlFor="linkedIn">LinkedIn profile (optional)</Label>
        <Input id="linkedIn" type="url" placeholder="https://linkedin.com/in/yourprofile" />
      </Field>

      <Field>
        <Label htmlFor="resumeNote" required>Tell us about yourself</Label>
        <Textarea id="resumeNote" required rows={4} placeholder="Brief intro — relevant projects, skills, why you want to intern at IC IITP. (You can share a resume link or Google Drive link here too.)" />
      </Field>

      <SubmitButton label="Apply for internship" pending={pending} />
      <p className="text-xs mt-3" style={{ color: "var(--color-text-secondary)" }}>
        Shortlisted candidates will be contacted by email for an interview.
      </p>
    </form>
  );
}
