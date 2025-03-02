import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

// 1. Specify protected and public routes
const protectedRoutes = ["/evaluationForm", "/result"];
const publicRoutes = ["/"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) {
    if (isProtectedRoute)
      return NextResponse.redirect(new URL("/", req.nextUrl));
    else return NextResponse.next();
  }
  try {
    const session = jwt.decode(cookie as string) as JwtPayload;

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session?.id) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    // 5. Redirect to /dashboard if the user is authenticated
    if (
      isPublicRoute &&
      session?.id &&
      !req.nextUrl.pathname.startsWith("/evaluationForm")
    ) {
      return NextResponse.redirect(new URL("/evaluationForm", req.nextUrl));
    }
  } catch (e) {
    console.log("unauthenticated", e);
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
