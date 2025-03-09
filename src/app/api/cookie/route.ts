import { NextResponse } from "next/server";
import { validateAuthenticated } from "../auth/validate-authenticated";
import { cookies } from "next/headers";

export async function GET() {
  const cookie = (await cookies()).get("session")?.value;
  const account = validateAuthenticated({
    token: cookie as string,
    clientURL: ["*"],
  });
  return NextResponse.json(account, { status: 200 });
}
