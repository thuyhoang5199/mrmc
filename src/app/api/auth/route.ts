import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { EXPIRED_TIME } from "../constants";
import { getDataInRange } from "../utils/google/common";
import { get } from "lodash";
import { serialize } from "cookie";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json(
      {
        message: "username and password are not allow empty",
      },
      { status: 400 }
    );
  }

  const accounts = await getDataInRange({
    range: "Login_Manage!B:E",
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
  });

  accounts.shift();

  const accountFormatted = accounts.map((item) => {
    return {
      name: get(item, "0", ""),
      id: get(item, "1", ""),
      username: get(item, "2", ""),
      password: get(item, "3", ""),
    };
  });
  const account = accountFormatted.find((item) => item.username == username);

  if (!account || !account.username) {
    return NextResponse.json(
      { message: "Username incorrect" },
      { status: 401 }
    );
  } else if (account.password != password) {
    return NextResponse.json(
      { message: "Password incorrect" },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      username,
      id: account.id,
      name: account.name,
    },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: EXPIRED_TIME }
  );

  const cookie = serialize("session", token, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // One week
    path: "/",
  });
  return NextResponse.json(
    { token },
    { status: 200, headers: { "Set-Cookie": cookie } }
  );
}
