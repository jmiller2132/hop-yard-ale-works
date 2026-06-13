"use client";

import { useActionState } from "react";
import { submitContact, type ContactFormState } from "@/app/contact/actions";

const SUBJECTS = [
  "General question",
  "Private event / large group",
  "Media & partnerships",
  "Other",
];

const LOCATIONS = ["Appleton", "Menomonee Falls"];

const initialState: ContactFormState = { status: "idle" };

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialState);

  if (state.status === "success" || state.status === "not_configured") {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
          style={{ backgroundColor: "rgba(106,191,75,0.12)" }}
        >
          ✓
        </div>
        <h2 className="font-heading text-xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>
          Message received.
        </h2>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          {state.status === "not_configured"
            ? "Thanks — your message was captured. We'll be in touch soon."
            : "Thanks for reaching out. We'll get back to you as soon as we can."}
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="rounded-2xl p-6 sm:p-8 space-y-5"
      style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
    >
      {state.status === "error" && (
        <p
          className="rounded-lg px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#b91c1c" }}
        >
          {state.message}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Name" required>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className={inputClass}
          />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Subject" required>
          <select name="subject" required className={inputClass} defaultValue="">
            <option value="" disabled>Select a topic…</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Location" required>
          <select name="location" required className={inputClass} defaultValue="">
            <option value="" disabled>Select a location…</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Message" required>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="What's on your mind?"
          className={inputClass}
          style={{ resize: "vertical" }}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg py-3 px-6 font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "var(--color-seasonal-cta)" }}
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-shadow min-h-[42px]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
        {label}
        {required && <span className="ml-0.5" style={{ color: "#dc2626" }}>*</span>}
      </span>
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid rgba(0,0,0,0.15)" }}
      >
        {children}
      </div>
    </label>
  );
}
