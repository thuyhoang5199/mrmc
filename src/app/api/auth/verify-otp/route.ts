import { NextResponse } from "next/server";
import { get } from "lodash";
import { cookies } from "next/headers";
import { validateAuthenticated } from "../validate-authenticated";
import { getDataInRange } from "../../utils/google";
import dayjs from "dayjs";
import { encrypt } from "../../utils/cipher";
import { returnWithNewToken } from "../return-with-new-token";

export async function POST(req: Request) {
  const token = (await cookies()).get("session")?.value;
  const accountFromToken = validateAuthenticated({
    token: token as string,
    clientURL: ["/verifyOTP"],
  });
  if (accountFromToken instanceof NextResponse) {
    return accountFromToken;
  }
  const { otp } = await req.json();

  const accounts = await getDataInRange({
    range: `Login_Manage!G${Number(accountFromToken.index) + 1}:I${
      Number(accountFromToken.index) + 1
    }`,
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
  });

  const accountFormatted = accounts.map((item) => {
    return {
      isDefaultPassword: get(item, "0", "1"),
      otp: get(item, "1", ""),
      otpExpired: get(item, "2", ""),
    };
  });
  if (!accountFormatted || accountFormatted.length < 1) {
    return NextResponse.json({ message: "Account incorrect" }, { status: 401 });
  }
  const account = accountFormatted[0];
  const isValidOTP = account.otp == encrypt({ data: otp });
  const isOTPExpired = dayjs(account.otpExpired).diff(dayjs()) < 0;

  if (isOTPExpired) {
    return NextResponse.json(
      { message: "OTP Expired, please resend again", isOTPExpired },
      { status: 400 }
    );
  } else if (!isValidOTP) {
    return NextResponse.json(
      { message: "OTP Invalid", isOTPExpired: false },
      { status: 400 }
    );
  }
  const expiredIn = 5 * 60 * 60;
  return returnWithNewToken({
    account: accountFromToken,
    nextRouter:
      account.isDefaultPassword == "True"
        ? "/changePassword"
        : "/evaluationForm",
    expiredIn,
    responseData: { isDefaultPassword: account.isDefaultPassword },
  });
}
