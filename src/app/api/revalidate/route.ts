import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * On-demand ISR for Sanity edits.
 *
 * Set up in Sanity (manage.sanity.io → API → Webhooks):
 *   URL:     https://<site>/api/revalidate
 *   Trigger: create, update, delete on the production dataset
 *   Secret:  same value as the SANITY_WEBHOOK_SECRET env var
 *   HTTP method: POST, projection: {_type}
 *
 * Without the secret configured this route refuses every request.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Webhook not configured" }, { status: 503 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret);
  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  // Almost every page reads from Sanity (locations, hours, FAQ, theme, photos), and the
  // root layout does too, so refresh the whole site rather than mapping types to paths.
  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, type: body?._type ?? null });
}
