"use server";

import { cookies } from "next/headers";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function logout(router: AppRouterInstance): Promise<void> {
  (await cookies()).delete("session");
  router.replace("/");
}
