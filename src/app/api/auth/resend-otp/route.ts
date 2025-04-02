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
    range: `Login_Manage!A${Number(accountFromToken.index) + 1}:M${
      Number(accountFromToken.index) + 1
    }`,
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
  });

  const accountFormatted = accounts.map((item) => {
    return {
      name: get(item, "1", "1"),
      email: get(item, "5", ""),
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
  const OTPExpired = dayjs().add(15, "minute").toDate().toUTCString();

  const verifyLink = `${process.env.NEXT_PUBLIC_WEB_LINK}/verifyOTP?token=${token}`;

  await Promise.allSettled([
    sendEmail({
      email: account.email,
      subject: "Vita Imaging’s verify code",
      content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verification Code for Your Account</title><style>body{font-family:Arial,sans-serif;color:#333333;background-color:#f8f8f8;padding:20px}.email-container{background-color:#ffffff;border-radius:8px;padding:30px;max-width:600px;margin:0 auto;box-shadow:0 4px 8px rgba(0,0,0,.1)}h2{color:#067db2}p{font-size:16px;line-height:1.5}.otp{font-size:20px;font-weight:bold;color:#333333;background-color:#f1f1f1;padding:10px;border-radius:5px;display:inline-block}</style></head><body><div class="email-container"><h2>Your Verification Code</h2><p>Hi ${account.name},</p><p>We received a request to verify your identity. Use the Verification Code below to complete your action:</p><p class="otp">${passcode}</p><p><strong>Important:</strong> This Verification Code is valid for 15 minutes. After this period, the Verification Code will expire, and you will need to request a new one.</p><p>If the button above doesn't work, you can copy and paste the following link into your browser:</p><p><a href="${verifyLink}">${verifyLink}</a></p><p>If you didn't request this, please ignore this email.</p><p>Thanks,<br>Vita Imaging’s Team</p></div></body></html>`,
    }),
    writeDataInRange({
      spreadsheetId,
      data: [
        {
          range: `Login_Manage!L${Number(accountFromToken.index) + 1}:M${
            Number(accountFromToken.index) + 1
          }`,
          values: [[hashPasscode, OTPExpired]],
        },
      ],
    }),
  ]);
  return NextResponse.json({ success: true }, { status: 200 });
}
