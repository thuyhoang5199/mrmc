import { get } from "lodash";
import { NextResponse } from "next/server";
import { validateAuthenticated } from "../auth/validate-authenticated";
import { GOOGLE_DATA_SPREAD_SHEET_ID, LESION_LENGTH } from "../constants";
import { getDataInRange, writeDataInRange } from "../utils/google/common";

export async function GET(req: Request) {
  const requestHeaders = new Headers(req.headers);
  const account = validateAuthenticated({
    token: requestHeaders.get("Authorization"),
  });
  if (account instanceof NextResponse) {
    return account;
  }

  const answers = await getDataInRange({
    range: "Answer!A:C",
    spreadsheetId: GOOGLE_DATA_SPREAD_SHEET_ID,
  });
  answers.shift();
  answers.shift();

  const answersFormatted = answers.map((item) => {
    return {
      accountId: get(item, "0", ""),
      listLesion: get(item, "1", ""),
      currentLesion: get(item, "2", 0),
    };
  });
  const currentAnser = answersFormatted.find(
    (item) => item.accountId == account.id
  );
  let nextQuestionIndex: number;

  if (!currentAnser) {
    let index = 1;
    let listLesion: number[] = [];
    while (index <= LESION_LENGTH) {
      listLesion.push(index);
      index += 1;
    }
    listLesion = listLesion.sort(() => Math.random() - 0.5);

    const nextIndexToWrite = answers.length + 3;
    nextQuestionIndex = listLesion[0];
    await writeDataInRange({
      range: `Answer!A${nextIndexToWrite}:C${nextIndexToWrite}`,
      spreadsheetId: GOOGLE_DATA_SPREAD_SHEET_ID,
      data: [[account.id, listLesion.join("|"), nextQuestionIndex]],
    });
  } else {
    nextQuestionIndex = Number(currentAnser.currentLesion);
  }

  const questions = await getDataInRange({
    range: `Lesion_Info!A${nextQuestionIndex + 1}:H${nextQuestionIndex + 1}`,
    spreadsheetId: GOOGLE_DATA_SPREAD_SHEET_ID,
  });

  const question = questions.map((item) => {
    return {
      lesionId: get(item, "1", ""),
      patientAge: get(item, "2", 0),
      patientGender: get(item, "3", ""),
      lesionLocation: get(item, "4", ""),
      lesionSize: get(item, "5", ""),
      lesionPicture: get(item, "6", ""),
      lesionAuraResultScreen: get(item, "7", ""),
    };
  });
  return NextResponse.json(
    { nextQuestionIndex, ...question[0] },
    { status: 200 }
  );
}
