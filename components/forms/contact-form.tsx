"use client";

import { useActionState } from "react";
import { submitContact, type FormState } from "@/app/actions/submit";
import { Field, Label, Input, Textarea, Select, SubmitButton, ErrorBanner, SuccessBanner } from "./form-field";

const PURPOSES = [
  "I want to apply for incubation",
  "I want to work at IC IITP",
  "I want to feature or interview IC IITP",
  "I just want to share my opinion",
  "Partnership / Collaboration",
  "General Inquiry",
];

interface Props { locale?: string }

export function ContactForm({ locale = "en" }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitContact, null);

  if (state?.success) {
    return <SuccessBanner message="Message received! We'll get back to you within 5 working days." />;
  }

  return (
    <form action={action} noValidate className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {state && !state.success && <ErrorBanner message={state.error} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field className="mb-0">
          <Label htmlFor="name" required>Full name</Label>
          <Input id="name" type="text" required placeholder="Your name" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" type="email" required placeholder="you@example.com" />
        </Field>
      </div>

      <Field className="mb-0">
        <Label htmlFor="phone" required>Mobile number</Label>
        <Input id="phone" type="tel" required placeholder="+91 98765 43210" />
      </Field>

      <Field className="mb-0">
        <Label htmlFor="purpose" required>Purpose</Label>
        <Select id="purpose" required defaultValue="">
          <option value="" disabled>--Select--</option>
          {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
      </Field>

      <Field className="mb-0">
        <Label htmlFor="message">Message <span className="font-normal text-gray-400">(optional)</span></Label>
        <Textarea id="message" rows={3} placeholder="Anything you'd like to add…" />
      </Field>

      <SubmitButton label="Send message" pending={pending} />
    </form>
  );
}
