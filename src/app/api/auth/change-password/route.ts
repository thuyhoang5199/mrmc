import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateAuthenticated } from "../validate-authenticated";
import { writeDataInRange } from "../../utils/google";
import { encrypt } from "../../utils/cipher";
import { returnWithNewToken } from "../return-with-new-token";

export async function POST(req: Request) {
  const token = (await cookies()).get("session")?.value;
  const accountFromToken = validateAuthenticated({
    token: token as string,
    clientURL: ["/changePassword", "/evaluationForm", "/signature"],
  });
  if (accountFromToken instanceof NextResponse) {
    return accountFromToken;
  }
  const { password } = await req.json();
  const newPassword = encrypt({ data: password });
  await writeDataInRange({
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
    data: [
      {
        range: `Login_Manage!K${Number(accountFromToken.index) + 1}:K${
          Number(accountFromToken.index) + 1
        }`,
        values: [["False"]],
      },
      {
        range: `Login_Manage!J${Number(accountFromToken.index) + 1}:J${
          Number(accountFromToken.index) + 1
        }`,
        values: [[newPassword]],
      },
    ],
  });

  return returnWithNewToken({
    account: accountFromToken,
    nextRouter: "/evaluationForm",
    responseData: {
      success: true,
    },
  });
}
