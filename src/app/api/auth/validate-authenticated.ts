import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export function validateAuthenticated({
  token,
  clientURL,
}: {
  token: string | null;
  clientURL: string[];
}) {
  try {
    if (!token) {
      const response = NextResponse.json(
        {
          message: "unauthenticated",
        },
        { status: 401 }
      );
      response.cookies.delete("session");
      return response;
    }

    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as JwtPayload;

    if (!clientURL.includes(decode.nextRouter)) {
      const response = NextResponse.json(
        {
          message: "unauthenticated",
        },
        { status: 401 }
      );
      response.cookies.delete("session");
      return response;
    }

    return {
      username: decode.username,
      id: decode.id,
      name: decode.name,
      index: decode.index,
    };
  } catch (e) {
    console.log("validate token error: ", e);
    const response = NextResponse.json(
      {
        message: "unauthenticated",
      },
      { status: 401 }
    );
    response.cookies.delete("session");
    return response;
  }
}
