import { NextResponse } from "next/server";
import { getDataInRange, writeDataInRange } from "../../utils/google";
import { get } from "lodash";
import { sendEmail } from "../../utils/mail";
import { encrypt } from "../../utils/cipher";
import dayjs from "dayjs";
import { cookies } from "next/headers";
import { validateAuthenticated } from "../validate-authenticated";

export async function POST() {
  const token = (await cookies()).get("session")?.value;
  const accountFromToken = validateAuthenticated({
    token: token as string,
    clientURL: ["/verifyOTP"],
  });
  if (accountFromToken instanceof NextResponse) {
    return accountFromToken;
  }
  const spreadsheetId = process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string;

  const accounts = await getDataInRange({
    range: `Login_Manage!F${Number(accountFromToken.index) + 1}:F${
      Number(accountFromToken.index) + 1
    }`,
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
  });

  const accountFormatted = accounts.map((item) => {
    return {
      email: get(item, "0", "1"),
    };
  });
  if (!accountFormatted || accountFormatted.length < 1) {
    return NextResponse.json({ message: "Account incorrect" }, { status: 401 });
  }
  const account = accountFormatted[0];

  const passcode = Math.ceil(Math.random() * 99999)
    .toString()
    .padStart(6, "0");
  const hashPasscode = encrypt({ data: passcode });
  const OTPExpired = dayjs().add(5, "minute").toDate().toUTCString();

  await Promise.allSettled([
    sendEmail({
      email: account.email,
      subject: "MRMC Vita Login verify code",
      content: `<div><p>Dear ${accountFromToken.name},</p><p>Your passcode is <b>${passcode}</b>. Please enter this code into the email confirmation screen.</p></div>`,
    }),
    writeDataInRange({
      spreadsheetId,
      data: [
        {
          range: `Login_Manage!H${Number(accountFromToken.index) + 1}:I${
            Number(accountFromToken.index) + 1
          }`,
          values: [[hashPasscode, OTPExpired]],
        },
      ],
    }),
  ]);
  return NextResponse.json({ success: true }, { status: 200 });
}
