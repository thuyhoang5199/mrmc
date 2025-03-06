import { get } from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { validateAuthenticated } from "../auth/validate-authenticated";
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

  const answersOverview = await getDataInRange({
    range: "Answer_Overview!A:C",
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
  });
  answersOverview.shift();

  const answersOverviewFormatted = answersOverview.map((item) => {
    return {
      accountId: get(item, "0", ""),
      listLesion: get(item, "1", ""),
      currentLesion: get(item, "2", 0),
    };
  });
  const currentAnswer = answersOverviewFormatted.find(
    (item) => item.accountId == account.id
  );
  let nextQuestionIndex: number;
  let nextQuestionIndexInListQuestion = 1;

  const LESION_LENGTH = Number(process.env.LESION_LENGTH);

  if (!currentAnswer) {
    let index = 1;
    let listLesion: number[] = [];
    while (index <= LESION_LENGTH) {
      listLesion.push(index);
      index += 1;
    }
    listLesion = listLesion.sort(() => Math.random() - 0.5);

    const nextIndexToWrite = answersOverview.length + 2;
    nextQuestionIndex = listLesion[0];
    await writeDataInRange({
      spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
      data: [
        {
          range: `Answer_Overview!A${nextIndexToWrite}:D${nextIndexToWrite}`,
          values: [[account.id, listLesion.join("|"), nextQuestionIndex, "0"]],
        },
      ],
    });
  } else {
    nextQuestionIndex = Number(currentAnswer.currentLesion);
    nextQuestionIndexInListQuestion =
      currentAnswer.listLesion
        .split("|")
        .indexOf(nextQuestionIndex.toString()) + 1;
    if (nextQuestionIndex == -1) {
      return NextResponse.json({ successAll: true }, { status: 200 });
    }
  }

  const questions = await getDataInRange({
    range: `Lesion_Info!A${nextQuestionIndex + 1}:H${nextQuestionIndex + 1}`,
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
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
    {
      nextQuestionIndexInListQuestion,
      lesionLength: LESION_LENGTH,
      ...question[0],
      account,
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const cookie = (await cookies()).get("session")?.value;
  const { eval1, eval2 } = await req.json();
  const account = validateAuthenticated({
    token: cookie as string,
  });
  if (account instanceof NextResponse) {
    return account;
  }

  const LESION_LENGTH = Number(process.env.LESION_LENGTH);
  const answersOverview = await getDataInRange({
    range: "Answer_Overview!A:C",
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
  });
  answersOverview.shift();

  const answersOverviewFormatted = answersOverview.map((item) => {
    return {
      accountId: get(item, "0", ""),
      listLesion: get(item, "1", ""),
      currentLesion: get(item, "2", 0),
    };
  });
  const currentAnswerOverview = answersOverviewFormatted.find(
    (item) => item.accountId == account.id
  );

  if (!currentAnswerOverview) {
    return NextResponse.json(
      {
        message:
          "Error when save your answer, please reload page and try again",
      },
      { status: 500 }
    );
  } else {
    const listLesion = currentAnswerOverview.listLesion.split("|");
    const nextQuestionIndex =
      listLesion[
        listLesion.findIndex(
          (item) => item == currentAnswerOverview.currentLesion.toString()
        ) + 1
      ];
    const percent = (
      ((listLesion.findIndex(
        (item) => item == currentAnswerOverview.currentLesion.toString()
      ) +
        1) /
        Number(process.env.LESION_LENGTH || "1")) *
      100
    ).toFixed(2);

    const currentAnswerOverviewIndex =
      answersOverviewFormatted.indexOf(currentAnswerOverview) + 2; // +1 to goto index in excel, +2 because 2 shift

    await writeDataInRange({
      spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
      data: [
        {
          values: [[nextQuestionIndex || "-1", percent]],
          range: `Answer_Overview!C${currentAnswerOverviewIndex}:D${currentAnswerOverviewIndex}`,
        },
        {
          range: `Answer_Lesion_${currentAnswerOverview.currentLesion}!A${
            currentAnswerOverviewIndex + 1
          }:J${currentAnswerOverviewIndex + 1}`,
          values: [
            [
              account.id,
              eval1.type,
              eval1[`${eval1.type}ConfidenceLevel`],
              eval1[`${eval1.type}LesionType`],
              eval2.type,
              eval2[`${eval2.type}ConfidenceLevel`],
              eval2[`${eval2.type}LesionType`],
              eval2.affectDiagnostic,
              eval2.affectConfidenceLevel,
              new Date().toUTCString(),
            ],
          ],
        },
      ],
    });

    //done all lesion
    if (!nextQuestionIndex) {
      return NextResponse.json({ successAll: true }, { status: 200 });
    }

    const questions = await getDataInRange({
      range: `Lesion_Info!A${Number(nextQuestionIndex) + 1}:H${
        Number(nextQuestionIndex) + 1
      }`,
      spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
    });

    const nextQuestionIndexInListQuestion =
      currentAnswerOverview.listLesion.split("|").indexOf(nextQuestionIndex) +
      1;

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
      {
        nextQuestionIndexInListQuestion,
        lesionLength: LESION_LENGTH,
        ...question[0],
        account,
      },
      { status: 200 }
    );
  }
}
