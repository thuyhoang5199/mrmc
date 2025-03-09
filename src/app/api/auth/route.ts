import { NextResponse } from "next/server";
import { getDataInRange, writeDataInRange } from "../utils/google";
import { get } from "lodash";
import { sendEmail } from "../utils/mail";
import { encrypt } from "../utils/cipher";
import dayjs from "dayjs";
import { returnWithNewToken } from "./return-with-new-token";

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
  const spreadsheetId = process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string;

  const accounts = await getDataInRange({
    range: "Login_Manage!A:G",
    spreadsheetId,
  });

  accounts.shift();

  const accountFormatted = accounts.map((item) => {
    return {
      index: get(item, "0", "1"),
      name: get(item, "1", ""),
      id: get(item, "2", ""),
      username: get(item, "3", ""),
      password: get(item, "4", ""),
      email: get(item, "5", ""),
      isDefaultPassword: get(item, "6", ""),
    };
  });
  const account = accountFormatted.find((item) => item.username == username);

  if (!account || !account.username) {
    return NextResponse.json(
      { message: "Username incorrect" },
      { status: 401 }
    );
  } else if (account.isDefaultPassword == "True") {
    if (password != account.password) {
      return NextResponse.json(
        { message: "Password incorrect" },
        { status: 401 }
      );
    }
  } else {
    const hashPassword = encrypt({ data: password });
    if (hashPassword != account.password)
      return NextResponse.json(
        { message: "Password incorrect" },
        { status: 401 }
      );
  }

  const passcode = Math.ceil(Math.random() * 99999)
    .toString()
    .padStart(6, "0");
  const hashPasscode = encrypt({ data: passcode });
  const OTPExpired = dayjs().add(5, "minute").toDate().toUTCString();

  await Promise.allSettled([
    sendEmail({
      email: account.email,
      subject: "MRMC Vita Login verify code",
      content: `<div><p>Dear ${account.name},</p><p>Your passcode is <b>${passcode}</b>. Please enter this code into the email confirmation screen.</p></div>`,
    }),
    writeDataInRange({
      spreadsheetId,
      data: [
        {
          range: `Login_Manage!H${Number(account.index) + 1}:I${
            Number(account.index) + 1
          }`,
          values: [[hashPasscode, OTPExpired]],
        },
      ],
    }),
  ]);

  const expiredIn = 5 * 60 * 60;
  return returnWithNewToken({
    account,
    nextRouter: "/verifyOTP",
    expiredIn,
    responseData: {},
  });
}
