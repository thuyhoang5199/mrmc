import dayjs from "dayjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { returnWithNewToken } from "../auth/return-with-new-token";
import { validateAuthenticated } from "../auth/validate-authenticated";
import { writeDataInRange } from "../utils/google";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export async function POST() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  const account = validateAuthenticated({
    token: cookie as string,
    clientURL: ["/result"],
  });
  if (account instanceof NextResponse) {
    return account;
  }

  const LESION_LENGTH = Number(process.env.LESION_LENGTH);
  const accountIndex = Number(account.index);
  const clearAnswerData = [];
  let index = 1;
  let listLesion: number[] = [];
  while (index <= LESION_LENGTH) {
    listLesion.push(index);
    clearAnswerData.push({
      range: `Answer_Lesion_${index}!A${accountIndex + 2}:N${accountIndex + 2}`,
      values: [["", "", "", "", "", "", "", "", "", "", "", "", "", ""]],
    });
    index += 1;
  }
  listLesion = listLesion.sort(() => Math.random() - 0.5);

  const nextQuestionIndex = listLesion[0];

  clearAnswerData.push(
    {
      range: `Answer_Overview!A${accountIndex + 1}:F${accountIndex + 1}`,
      values: [
        [account.id, listLesion.join("|"), nextQuestionIndex, "0", "", "False"],
      ],
    },
    {
      range: `Login_Manage!J${accountIndex + 1}:K${accountIndex + 1}`,
      values: [["MRMC123?", "True"]],
    }
  );
  await writeDataInRange({
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
    data: clearAnswerData,
  });

  cookieStore.delete("session");
  return NextResponse.json({ success: true }, { status: 200 });
}
