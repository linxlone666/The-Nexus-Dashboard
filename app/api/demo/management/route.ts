import { applyAction, DemoError, loginShared, requireSession, snapshot, transaction } from "@/utils/demo-server";

const headers = { "Cache-Control": "no-store" };
function token(request: Request) { return request.headers.get("Authorization")?.replace(/^Bearer /, "") ?? ""; }
function failure(error: unknown) {
  if (error instanceof DemoError) return Response.json({ error: error.message }, { status: error.status, headers });
  console.error("Demo management request failed", error);
  return Response.json({ error: "Could not access shared demo data. Please try again." }, { status: 500, headers });
}
export async function GET(request: Request) {
  try {
    const result = await transaction(state => { requireSession(state, token(request)); return snapshot(state); });
    return Response.json(result, { headers });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const input = await request.json();
    if (input.action === "login") {
      if (typeof input.email !== "string" || typeof input.password !== "string") throw new DemoError("Enter your email and password.");
      return Response.json(await transaction(state => loginShared(state, input.email, input.password), true), { headers });
    }
    const result = await transaction(state => {
      if (input.action === "logout") {
        delete state.sessions[token(request)];
        return { ok: true };
      }
      if (!Array.isArray(input.args)) throw new DemoError("Invalid management request.");
      try { return applyAction(state, token(request), input); }
      catch (error) {
        if (error instanceof DemoError) throw error;
        throw new DemoError(error instanceof Error ? error.message : "Invalid management request.");
      }
    }, true);
    return Response.json(result, { headers });
  } catch (error) { return failure(error); }
}
