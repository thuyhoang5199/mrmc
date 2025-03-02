import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import {
  EXPIRED_TIME,
  EXPIRED_TIME_REFRESH_TOKEN,
  JWT_REFRESH_TOKEN_SECRET_KEY,
  JWT_SECRET_KEY,
} from "../../constants";

export async function POST(req: Request) {
  const { refreshToken } = await req.json();
  if (!refreshToken) {
    return NextResponse.json(
      {
        message: "unauthenticated",
      },
      { status: 401 }
    );
  }
  let decode;
  try {
    decode = jwt.verify(
      refreshToken,
      JWT_REFRESH_TOKEN_SECRET_KEY
    ) as JwtPayload;
  } catch (e) {
    console.log("refresh token error: ", e);
    return NextResponse.json(
      {
        message: "unauthenticated",
      },
      { status: 401 }
    );
  }
  const token = jwt.sign(
    {
      username: decode.username,
      id: decode.id,
      name: decode.name,
    },
    JWT_SECRET_KEY,
    { expiresIn: EXPIRED_TIME }
  );

  const newRefreshToken = jwt.sign(
    {
      username: decode.username,
      id: decode.id,
      name: decode.name,
    },
    JWT_REFRESH_TOKEN_SECRET_KEY as string,
    { expiresIn: EXPIRED_TIME_REFRESH_TOKEN }
  );
  return NextResponse.json(
    { token, refreshToken: newRefreshToken },
    { status: 200 }
  );
}
