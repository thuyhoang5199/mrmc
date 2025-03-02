import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../constants";

export function validateAuthenticated({ token }: { token: string | null }) {
  try {
    if (!token) {
      return NextResponse.json(
        {
          message: "token is required",
        },
        { status: 401 }
      );
    }
    const [, tokenIgnoreBearer] = token.split(" ");
    if (!token) {
      return NextResponse.json(
        {
          message: "token is required",
        },
        { status: 401 }
      );
    }

    const decode = jwt.verify(tokenIgnoreBearer, JWT_SECRET_KEY) as JwtPayload;
    return {
      username: decode.username,
      id: decode.id,
      name: decode.name,
    };
  } catch (e) {
    console.log("validate token error: ", e);
    return NextResponse.json(
      {
        message: "unauthenticated",
      },
      { status: 401 }
    );
  }
}
