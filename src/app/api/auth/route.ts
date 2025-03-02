import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import {
  EXPIRED_TIME,
  EXPIRED_TIME_REFRESH_TOKEN,
  GOOGLE_DATA_SPREAD_SHEET_ID,
  JWT_REFRESH_TOKEN_SECRET_KEY,
  JWT_SECRET_KEY,
} from "../constants";
import { getDataInRange } from "../utils/google/common";
import { get } from "lodash";

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
    spreadsheetId: GOOGLE_DATA_SPREAD_SHEET_ID,
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
      { message: "username incorrect" },
      { status: 401 }
    );
  } else if (account.password != password) {
    return NextResponse.json(
      { message: "password incorrect" },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      username,
      id: account.id,
      name: account.name,
    },
    JWT_SECRET_KEY as string,
    { expiresIn: EXPIRED_TIME }
  );

  const refreshToken = jwt.sign(
    {
      username,
      id: account.id,
      name: account.name,
    },
    JWT_REFRESH_TOKEN_SECRET_KEY as string,
    { expiresIn: EXPIRED_TIME_REFRESH_TOKEN }
  );
  return NextResponse.json({ token, refreshToken }, { status: 200 });
}
