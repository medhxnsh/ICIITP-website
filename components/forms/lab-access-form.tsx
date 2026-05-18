"use client";

import { useActionState } from "react";
import { submitLabAccess, type FormState } from "@/app/actions/submit";
import { Field, Label, Input, Textarea, Select, SubmitButton, ErrorBanner, SuccessBanner } from "./form-field";

const LABS = [
  "Clean Room",
  "PCB Fabrication Lab",
  "Testing & Calibration Lab",
  "Mechanical & Packaging Lab",
  "ESDM Lab",
  "Design & Simulation Lab",
];

interface Props { locale?: string; defaultLab?: string }

export function LabAccessForm({ locale = "en", defaultLab }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitLabAccess, null);

  if (state?.success) {
    return <SuccessBanner message="Request received! We'll get back to you within 5 working days." />;
  }

  return (
    <form action={action} noValidate>
      <input type="hidden" name="locale" value={locale} />
      {state && !state.success && <ErrorBanner message={state.error} />}

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <Field className="mb-0">
          <Label htmlFor="name" required>Full name</Label>
          <Input id="name" type="text" required placeholder="Your name" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" type="email" required placeholder="you@institution.ac.in" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <Field className="mb-0">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" placeholder="+91 98765 43210" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="affiliation" required>Institution / Organisation</Label>
          <Input id="affiliation" type="text" required placeholder="IIT Patna / Company name" />
        </Field>
      </div>

      <Field>
        <Label htmlFor="lab" required>Lab required</Label>
        <Select id="lab" required defaultValue={defaultLab ?? ""}>
          <option value="" disabled>Select a lab</option>
          {LABS.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
      </Field>

      <Field>
        <Label htmlFor="purpose" required>Purpose of access</Label>
        <Textarea id="purpose" required rows={3} placeholder="Briefly describe what you need access for — research project, prototype testing, equipment calibration, etc." />
      </Field>

      <Field>
        <Label htmlFor="preferredDates" required>Preferred dates</Label>
        <Input id="preferredDates" type="text" required placeholder="e.g. 1–5 July 2025, or 'flexible'" />
      </Field>

      <SubmitButton label="Request access" pending={pending} />
    </form>
  );
}
