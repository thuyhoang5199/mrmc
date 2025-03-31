import { NextResponse } from "next/server";
import { getDataInRange } from "../../utils/google";
import { get } from "lodash";
import { sendEmail } from "../../utils/mail";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { username } = await req.json();
  if (!username) {
    return NextResponse.json(
      {
        message: "username and password are not allow empty",
      },
      { status: 400 }
    );
  }
  const spreadsheetId = process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string;

  const accounts = await getDataInRange({
    range: "Login_Manage!A:M",
    spreadsheetId,
  });

  accounts.shift();

  const accountFormatted = accounts.map((item) => {
    return {
      index: get(item, "0", "1"),
      name: get(item, "1", ""),
      id: get(item, "7", ""),
      username: get(item, "8", ""),
      password: get(item, "9", ""),
      email: get(item, "5", ""),
      isDefaultPassword: get(item, "10", ""),
    };
  });
  const account = accountFormatted.find((item) => item.username == username);

  if (!account || !account.username) {
    return NextResponse.json(
      { message: "Username incorrect" },
      { status: 400 }
    );
  }

  const expiredIn = 60 * 60 * 60;
  const token = jwt.sign(
    {
      username: account.username,
      id: account.id,
      name: account.name,
      index: account.index,
      nextRouter: "/changePassword",
      email: account.email,
    },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: expiredIn }
  );

  const resetLink = `${process.env.NEXT_PUBLIC_WEB_LINK}/changePassword?token=${token}`;
  await sendEmail({
    email: account.email,
    subject: "Vita Imaging’s Reset Password Request",
    content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Password Reset Request</title><style>body{font-family:Arial,sans-serif;color:#333333;background-color:#f8f8f8;padding:20px}.email-container{background-color:#ffffff;border-radius:8px;padding:30px;max-width:600px;margin:0 auto;box-shadow:0 4px 8px rgba(0,0,0,.1)}h2{color:#067db2}p{font-size:16px;line-height:1.5}.reset-link{background-color:#067db2;color:#ffffff !important;padding:10px 20px;text-decoration:none;border-radius:5px;font-size:16px}.reset-link:hover{background-color:#13bed8}</style></head><body><div class="email-container"><h2>Password Reset Request</h2><p>Hi ${account.name},</p><p>We received a request to reset your password. If you didn't request this, please ignore this email.</p><p>To reset your password, click the button below:</p><a href="${resetLink}" class="reset-link">Reset Your Password</a><p>If the button above doesn't work, you can copy and paste the following link into your browser:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Thanks,<br>Vita Imaging’s Team</p></div></body></html>`,
  });

  return NextResponse.json(
    { success: true },
    {
      status: 200,
    }
  );
}
