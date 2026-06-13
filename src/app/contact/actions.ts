"use server";

import { Resend } from "resend";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string }
  | { status: "not_configured" };

const SUBJECTS = [
  "General question",
  "Private event / large group",
  "Media & partnerships",
  "Other",
];

const LOCATIONS = ["Appleton", "Menomonee Falls"];

/**
 * Routing rules:
 *   "Media & partnerships"  →  CONTACT_MEDIA_EMAIL  (owner/management)
 *   All other subjects
 *     + Appleton             →  CONTACT_APPLETON_EMAIL
 *     + Menomonee Falls      →  CONTACT_FALLS_EMAIL
 */
function resolveToEmail(subject: string, location: string): string | null {
  if (subject === "Media & partnerships") {
    return process.env.CONTACT_MEDIA_EMAIL ?? null;
  }
  if (location === "Appleton") {
    return process.env.CONTACT_APPLETON_EMAIL ?? null;
  }
  if (location === "Menomonee Falls") {
    return process.env.CONTACT_FALLS_EMAIL ?? null;
  }
  return null;
}

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const subject = (formData.get("subject") as string | null)?.trim() ?? "";
  const message = (formData.get("message") as string | null)?.trim() ?? "";
  const location = (formData.get("location") as string | null)?.trim() ?? "";

  if (!name || !email || !subject || !message || !location) {
    return { status: "error", message: "Please fill in all required fields." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (!SUBJECTS.includes(subject)) {
    return { status: "error", message: "Please select a valid subject." };
  }
  if (!LOCATIONS.includes(location)) {
    return { status: "error", message: "Please select a location." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = resolveToEmail(subject, location);

  if (!apiKey || !toEmail) {
    console.log("[Contact form — not yet wired to Resend]", {
      name, email, subject, location, message,
      missingKey: !apiKey,
      missingToEmail: !toEmail,
    });
    return { status: "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "Hop Yard Website <noreply@hopyardaleworks.com>",
      to: toEmail,
      replyTo: email,
      subject: `[hopyardaleworks.com] ${subject} — ${location} — from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p style="white-space:pre-wrap">${message}</p>
      `,
    });
    return { status: "success" };
  } catch (err) {
    console.error("[Contact form] Resend error:", err);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again.",
    };
  }
}
