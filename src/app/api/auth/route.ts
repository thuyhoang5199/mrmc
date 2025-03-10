import { NextResponse } from "next/server";
import { getDataInRange, writeDataInRange } from "../utils/google";
import { get } from "lodash";
import { sendEmail } from "../utils/mail";
import { encrypt } from "../utils/cipher";
import dayjs from "dayjs";
import { returnWithNewToken } from "./return-with-new-token";
import jwt from "jsonwebtoken";
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

    const passcode = Math.ceil(Math.random() * 99999)
      .toString()
      .padStart(6, "0");
    const hashPasscode = encrypt({ data: passcode });
    const OTPExpired = dayjs().add(5, "minute").toDate().toUTCString();
    const expiredIn = 5 * 60 * 60;

    const token = jwt.sign(
      {
        username: account.username,
        id: account.id,
        name: account.name,
        index: account.index,
        nextRouter: "/verifyOTP",
        email: account.email,
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

    const verifyLink = `${process.env.NEXT_PUBLIC_WEB_LINK}/verifyOTP?token=${token}`;

    await Promise.allSettled([
      sendEmail({
        email: account.email,
        subject: "Vita Imaging’s verify code",
        content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>OTP for Your Account</title><style>body{font-family:Arial,sans-serif;color:#333333;background-color:#f8f8f8;padding:20px}.email-container{background-color:#ffffff;border-radius:8px;padding:30px;max-width:600px;margin:0 auto;box-shadow:0 4px 8px rgba(0,0,0,.1)}h2{color:#067db2}p{font-size:16px;line-height:1.5}.otp{font-size:20px;font-weight:bold;color:#333333;background-color:#f1f1f1;padding:10px;border-radius:5px;display:inline-block}</style></head><body><div class="email-container"><h2>Your OTP Code</h2><p>Hi ${account.name},</p><p>We received a request to verify your identity. Use the OTP below to complete your action:</p><p class="otp">${passcode}</p><p><strong>Important:</strong> This OTP is valid for 5 minutes. After this period, the OTP will expire, and you will need to request a new one.</p><p>If the button above doesn't work, you can copy and paste the following link into your browser:</p><p><a href="${verifyLink}">${verifyLink}</a></p><p>If you didn't request this, please ignore this email.</p><p>Thanks,<br>Vita Imaging’s Team</p></div></body></html>`,
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

    return NextResponse.json(
      { token },
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );
  } else {
    const hashPassword = encrypt({ data: password });
    if (hashPassword != account.password) {
      return NextResponse.json(
        { message: "Password incorrect" },
        { status: 401 }
      );
    }

    return returnWithNewToken({
      account,
      nextRouter: "/evaluationForm",
      responseData: {},
    });
  }
}
