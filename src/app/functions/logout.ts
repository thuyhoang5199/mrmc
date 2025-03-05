"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { axiosInstance } from "../axios-instance";

export async function logout(router: AppRouterInstance): Promise<void> {
  await axiosInstance(router).post("/api/auth/logout", {});
  router.replace("/");
}
