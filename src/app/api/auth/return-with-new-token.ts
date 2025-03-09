import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { EXPIRED_TIME } from "../constants";

export function returnWithNewToken({
  account,
  nextRouter,
  expiredIn = EXPIRED_TIME,
  responseData,
}: {
  account: {
    username: string;
    id: string;
    name: string;
    index: string;
  };
  nextRouter:
    | "/changePassword"
    | "/evaluationForm"
    | "/signature"
    | "/verifyOTP"
    | "/result";
  expiredIn?: number;
  responseData: Record<string, unknown>;
}) {
  const token = jwt.sign(
    {
      username: account.username,
      id: account.id,
      name: account.name,
      index: account.index,
      nextRouter: nextRouter,
    },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: expiredIn }
  );

  const cookie = serialize("session", token, {
    httpOnly: true,
    secure: true,
    maxAge: expiredIn,
    path: "/",
  });

  return NextResponse.json(
    { ...responseData, token },
    {
      status: 200,
      headers: { "Set-Cookie": cookie },
    }
  );
}
