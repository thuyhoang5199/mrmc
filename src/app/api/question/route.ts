import { get } from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { validateAuthenticated } from "../auth/validate-authenticated";
import { GOOGLE_DATA_SPREAD_SHEET_ID, LESION_LENGTH } from "../constants";
import { getDataInRange, writeDataInRange } from "../utils/google/common";
import { cookies } from "next/headers";

export async function GET() {
  const cookie = (await cookies()).get("session")?.value;
  const account = validateAuthenticated({
    token: cookie as string,
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
  const currentAnswer = answersFormatted.find(
    (item) => item.accountId == account.id
  );
  let nextQuestionIndex: number;

  if (!currentAnswer) {
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
    nextQuestionIndex = Number(currentAnswer.currentLesion);
    if (nextQuestionIndex == -1) {
      return NextResponse.json({ successAll: true }, { status: 200 });
    }
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

export async function POST(req: NextRequest) {
  const cookie = (await cookies()).get("session")?.value;
  // const { username, password } = await req.json();
  console.log(req);
  const account = validateAuthenticated({
    token: cookie as string,
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
  const currentAnswer = answersFormatted.find(
    (item) => item.accountId == account.id
  );

  if (!currentAnswer) {
    return NextResponse.json(
      {
        message:
          "Error when save your answer, please reload page and try again",
      },
      { status: 500 }
    );
  } else {
    const listLesion = currentAnswer.listLesion.split("|");
    const nextQuestionIndex =
      listLesion[
        listLesion.findIndex(
          (item) => item == currentAnswer.currentLesion.toString()
        ) + 1
      ];

    const answerIndex = answersFormatted.indexOf(currentAnswer) + 3; // +1 to goto index in excel, +2 because 2 shift
    await writeDataInRange({
      range: `Answer!C${answerIndex}:C${answerIndex}`,
      spreadsheetId: GOOGLE_DATA_SPREAD_SHEET_ID,
      data: [[nextQuestionIndex || "-1"]],
    });

    //done all lesion
    if (!nextQuestionIndex) {
      return NextResponse.json({ successAll: true }, { status: 200 });
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
}
