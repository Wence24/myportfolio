export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_STUDIO_EMAIL = "aiakosedt@gmail.com";
const DEFAULT_STUDIO_RESET_CODE = "WDV-Studio-Reset-2419";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const resetCode =
    typeof body.resetCode === "string" ? body.resetCode.trim() : "";

  if (!email || !resetCode) {
    return Response.json(
      { error: "Studio email and recovery code are required." },
      { status: 400 }
    );
  }

  const expectedEmail = (
    process.env.STUDIO_EMAIL || DEFAULT_STUDIO_EMAIL
  ).trim().toLowerCase();
  const expectedResetCode = (
    process.env.STUDIO_RESET_CODE || DEFAULT_STUDIO_RESET_CODE
  ).trim();

  if (!expectedResetCode) {
    return Response.json(
      { error: "Studio recovery code is not configured yet." },
      { status: 503 }
    );
  }

  if (email !== expectedEmail || resetCode !== expectedResetCode) {
    return Response.json(
      { error: "The Studio email or recovery code is incorrect." },
      { status: 401 }
    );
  }

  return Response.json({ success: true });
}
