import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Hop Yard Ale Works",
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1
          className="font-heading text-4xl font-bold mb-8"
          style={{ color: "var(--color-teal)" }}
        >
          Privacy Policy
        </h1>

        <div
          className="prose text-sm leading-relaxed space-y-6"
          style={{ color: "var(--color-ink)" }}
        >
          <p>
            <strong>Last updated:</strong> May 2026
          </p>

          <section>
            <h2
              className="font-heading text-xl font-bold mb-2"
              style={{ color: "var(--color-teal)" }}
            >
              Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as when you
              submit a contact form or sign up for our email list. This may include
              your name, email address, and any message you send us.
            </p>
          </section>

          <section>
            <h2
              className="font-heading text-xl font-bold mb-2"
              style={{ color: "var(--color-teal)" }}
            >
              How We Use Your Information
            </h2>
            <p>
              We use the information we collect to respond to your inquiries, send
              updates about events and new taps (only if you opt in), and improve
              our website.
            </p>
          </section>

          <section>
            <h2
              className="font-heading text-xl font-bold mb-2"
              style={{ color: "var(--color-teal)" }}
            >
              Analytics
            </h2>
            <p>
              This site uses Vercel Analytics, a privacy-first analytics service
              that does not use cookies and does not collect personally identifiable
              information. No cookie consent banner is required.
            </p>
          </section>

          <section>
            <h2
              className="font-heading text-xl font-bold mb-2"
              style={{ color: "var(--color-teal)" }}
            >
              Third-Party Services
            </h2>
            <p>
              Our site embeds content from Untappd (beer menu) and links to Toast
              (online ordering). These services have their own privacy policies.
            </p>
          </section>

          <section>
            <h2
              className="font-heading text-xl font-bold mb-2"
              style={{ color: "var(--color-teal)" }}
            >
              Contact
            </h2>
            <p>
              Questions? Email us at{" "}
              <a
                href="mailto:hopyardaleworks@gmail.com"
                className="underline underline-offset-2"
                style={{ color: "var(--color-seasonal-cta)" }}
              >
                hopyardaleworks@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
