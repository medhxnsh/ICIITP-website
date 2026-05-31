"use client";

import { useActionState } from "react";
import { submitIncubation, type FormState } from "@/app/actions/submit";
import { Field, Label, Input, Textarea, Select, SubmitButton, ErrorBanner, SuccessBanner } from "./form-field";

const STAGES = ["Idea", "Prototype", "MVP", "Revenue Stage", "Growth Stage"];

export interface SchemeOption {
  value: string;
  label: string;
}

interface Props {
  defaultScheme?: string;
  locale?: string;
  schemes?: SchemeOption[];
}

export function IncubationForm({ defaultScheme, locale = "en", schemes = [] }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitIncubation, null);

  if (state?.success) {
    return (
      <SuccessBanner message="Application received! We'll acknowledge within 3 working days. Check your email for confirmation." />
    );
  }

  return (
    <form action={action} noValidate>
      <input type="hidden" name="locale" value={locale} />

      {state && !state.success && <ErrorBanner message={state.error} />}

      <Field>
        <Label htmlFor="scheme" required>Program / Scheme</Label>
        <Select id="scheme" required defaultValue={defaultScheme ?? ""}>
          <option value="" disabled>Select a scheme</option>
          {schemes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      </Field>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <Field className="mb-0">
          <Label htmlFor="founderName" required>Founder / Contact name</Label>
          <Input id="founderName" type="text" required placeholder="Full name" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="startupName" required>Startup / venture name</Label>
          <Input id="startupName" type="text" required placeholder="As registered or planned" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <Field className="mb-0">
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" type="email" required placeholder="you@example.com" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="phone" required>Phone</Label>
          <Input id="phone" type="tel" required placeholder="+91 98765 43210" />
        </Field>
      </div>

      <Field>
        <Label htmlFor="website">Website (if any)</Label>
        <Input id="website" type="url" placeholder="https://yourstartup.com" />
      </Field>

      <Field>
        <Label htmlFor="stage" required>Current stage</Label>
        <Select id="stage" required defaultValue="">
          <option value="" disabled>Select stage</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </Field>

      <Field>
        <Label htmlFor="sectors">Sector(s)</Label>
        <Input id="sectors" type="text" placeholder="e.g. MedTech, ESDM, AgriTech (comma-separated)" />
      </Field>

      <Field>
        <Label htmlFor="oneLiner" required>One-line description</Label>
        <Input id="oneLiner" type="text" required placeholder="What your startup does in one sentence" maxLength={160} />
      </Field>

      <Field>
        <Label htmlFor="problem" required>Problem & solution</Label>
        <Textarea id="problem" required rows={4} placeholder="Describe the problem you're solving and your approach. (200–500 words is fine)" />
      </Field>

      <Field>
        <Label htmlFor="dpiitRegistered" required>DPIIT registered?</Label>
        <Select id="dpiitRegistered" required defaultValue="">
          <option value="" disabled>Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="in-progress">In progress</option>
        </Select>
      </Field>

      <SubmitButton label="Submit application" pending={pending} />
      <p className="text-xs mt-3" style={{ color: "var(--color-text-secondary)" }}>
        By submitting you agree to IC IITP reviewing your application. We do not share your data with third parties.
      </p>
    </form>
  );
}
