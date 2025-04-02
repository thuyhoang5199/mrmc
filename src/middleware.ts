import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

// 1. Specify protected and public routes
const protectedRoutes = [
  "/verifyOTP",
  "/changePassword",
  "/evaluationForm",
  "/signature",
  "/result",
];
const publicRoutes = ["/", "/forgotPassword"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = await cookies();
  let token = cookie.get("session")?.value;

  //handle for forgot password from email
  if (["/verifyOTP", "/changePassword"].includes(path)) {
    const searchParams = req.nextUrl.searchParams;
    if (searchParams.get("token")) {
      token = searchParams.get("token") as string;
      cookie.set("session", token);
    }
  }

  if (!token) {
    if (isProtectedRoute)
      return NextResponse.redirect(new URL("/", req.nextUrl));
    else return NextResponse.next();
  }

  const session = jwt.decode(token as string) as JwtPayload;

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.id) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Handle case old cookie not has nextRouter
  if (path === "undefined" || !session?.nextRouter) {
    cookie.delete("session");
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is authenticated
  if ((isPublicRoute && session?.id) || path != session?.nextRouter) {
    return NextResponse.redirect(new URL(session.nextRouter, req.nextUrl));
  }

  if (path == "/result") {
    cookie.delete("session");
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png|.*\\.jpg|.*\\.ico|.*\\.svg|.*\\.gif$).*)",
  ],
  unstable_allowDynamic: ["**/node_modules/**"],
};
