import { get, toLower, set } from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { validateAuthenticated } from "../auth/validate-authenticated";
import { getDataInRange, writeDataInRange } from "../utils/google";
import { cookies } from "next/headers";
import { returnWithNewToken } from "../auth/return-with-new-token";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { DATE_STRING_FORMAT, TZ } from "../constants";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export async function GET() {
  const cookie = (await cookies()).get("session")?.value;
  const account = validateAuthenticated({
    token: cookie as string,
    clientURL: ["/evaluationForm"],
  });
  if (account instanceof NextResponse) {
    return account;
  }

  const accountIndex = Number(account.index);

  const answersOverview = await getDataInRange({
    range: `Answer_Overview!A${accountIndex + 1}:F${accountIndex + 1}`,
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
  });

  const answersOverviewFormatted = answersOverview.map((item) => {
    return {
      accountId: get(item, "0", ""),
      listLesion: get(item, "1", ""),
      currentLesion: get(item, "2", 0),
      isSignWhenComplete: get(item, "5", "False"),
    };
  });
  const currentAnswerOverview = answersOverviewFormatted.find(
    (item) => item.accountId == account.id
  );
  let nextQuestionIndex: number;
  let nextQuestionIndexInListQuestion = 1;

  const LESION_LENGTH = Number(process.env.LESION_LENGTH);

  if (!currentAnswerOverview) {
    let index = 1;
    let listLesion: number[] = [];
    while (index <= LESION_LENGTH) {
      listLesion.push(index);
      index += 1;
    }
    listLesion = listLesion.sort(() => Math.random() - 0.5);

    nextQuestionIndex = listLesion[0];
    await writeDataInRange({
      spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
      data: [
        {
          range: `Answer_Overview!A${accountIndex + 1}:F${accountIndex + 1}`,
          values: [
            [
              account.id,
              listLesion.join("|"),
              nextQuestionIndex,
              "0",
              "",
              "False",
            ],
          ],
        },
        {
          range: `Answer_Lesion_${nextQuestionIndex}!A${accountIndex + 2}:B${
            accountIndex + 2
          }`,
          values: [[account.id, dayjs().tz(TZ).format(DATE_STRING_FORMAT)]],
        },
      ],
    });
  } else {
    nextQuestionIndex = Number(currentAnswerOverview.currentLesion);
    nextQuestionIndexInListQuestion =
      currentAnswerOverview.listLesion
        .split("|")
        .indexOf(nextQuestionIndex.toString()) + 1;
    if (nextQuestionIndex == -1) {
      return returnWithNewToken({
        account,
        nextRouter:
          currentAnswerOverview.isSignWhenComplete == "False"
            ? "/signature"
            : "/result",
        responseData: {
          isSignWhenComplete: currentAnswerOverview.isSignWhenComplete,
          successAll: true,
        },
      });
    }
  }

  const questions = await getDataInRange({
    range: `Lesion_Info!A${nextQuestionIndex + 1}:O${nextQuestionIndex + 1}`,
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
  });

  const answerLesions = await getDataInRange({
    range: `Answer_Lesion_${nextQuestionIndex}!A${accountIndex + 2}:M${
      accountIndex + 2
    }`,
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
  });

  if (get(answerLesions, "[0][1]", "") == "") {
    await writeDataInRange({
      spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
      data: [
        {
          range: `Answer_Lesion_${nextQuestionIndex}!A${accountIndex + 2}:B${
            accountIndex + 2
          }`,
          values: [[account.id, dayjs().tz(TZ).format(DATE_STRING_FORMAT)]],
        },
      ],
    });
  }

  const answerLesion = answerLesions.map((i) => {
    const data = {};
    //lesion 1 done
    if (toLower(get(i, "5", "") as string) == "true") {
      set(data, "type", get(i, "7", ""));
      set(data, `${get(i, "7", "")}ConfidenceLevel`, get(i, "8", ""));
      set(data, `${get(i, "7", "")}LesionType`, get(i, "9", ""));
      set(data, `affectDiagnostic`, get(i, "10", ""));
      set(data, `affectConfidenceLevel`, get(i, "11", ""));
      set(data, "currentEval", 2);
    } else {
      set(data, "type", get(i, "2", ""));
      set(data, `${get(i, "2", "")}ConfidenceLevel`, get(i, "3", ""));
      set(data, `${get(i, "2", "")}LesionType`, get(i, "4", ""));
      set(data, `done`, get(i, "5", ""));
      set(data, "currentEval", 1);
    }
    set(
      data,
      "startTime",
      dayjs.tz(get(i, "1", ""), DATE_STRING_FORMAT, TZ).toDate()
    );

    return data;
  })?.[0];

  const question = questions.map((item) => {
    return {
      lesionId: get(item, "1", ""),
      patientAge: get(item, "6", 0),
      patientGender: get(item, "4", ""),
      lesionLocation: get(item, "5", ""),
      lesionSize: get(item, "7", ""),
      lesionPicture: get(item, "13", ""),
      lesionAuraResultScreen: get(item, "14", ""),
      answerLesion: answerLesion || {},
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
    clientURL: ["/evaluationForm"],
  });
  if (account instanceof NextResponse) {
    return account;
  }

  const accountIndex = Number(account.index);

  const LESION_LENGTH = Number(process.env.LESION_LENGTH);
  const answersOverview = await getDataInRange({
    range: `Answer_Overview!A${accountIndex + 1}:C${accountIndex + 1}`,
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
  });

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
    let nextQuestionIndex =
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

    // const endTime = new Date();
    // const startTimeParse = new Date(startTime);

    // const diffMs = endTime.getTime() - startTimeParse.getTime(); // milliseconds between now & Christmas
    // const diffDays = Math.floor(diffMs / 86400000); // days
    // const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    // const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    // const diffSecond = Math.round(
    //   (((diffMs % 86400000) % 3600000) % 60000) / 1000
    // ); // minutes
    // const diffTime = `${diffDays != 0 ? diffDays + " days " : ""}
    // ${diffHrs != 0 ? diffHrs + " hours " : ""}
    // ${diffMins != 0 ? diffMins + " minutes " : ""}
    // ${diffSecond != 0 ? diffSecond + " seconds " : ""}`;
    const dataWriteToRange = [];
    if (toLower(eval2?.done) == "true") {
      dataWriteToRange.push({
        values: [
          [
            nextQuestionIndex || "-1",
            percent,
            nextQuestionIndex ? "" : dayjs().tz(TZ).format(DATE_STRING_FORMAT),
          ],
        ],
        range: `Answer_Overview!C${accountIndex + 1}:E${accountIndex + 1}`,
      });
      if (nextQuestionIndex) {
        dataWriteToRange.push({
          range: `Answer_Lesion_${nextQuestionIndex}!A${accountIndex + 2}:C${
            accountIndex + 2
          }`,
          values: [[account.id, dayjs().tz(TZ).format(DATE_STRING_FORMAT)]],
        });
      }
    } else {
      nextQuestionIndex =
        listLesion[
          listLesion.findIndex(
            (item) => item == currentAnswerOverview.currentLesion.toString()
          )
        ];
    }

    const dataAnswerToWriteAnswer: Array<string> = [];
    if (eval1) {
      dataAnswerToWriteAnswer.push(
        eval1.type,
        eval1[`${eval1.type}ConfidenceLevel`],
        eval1[`${eval1.type}LesionType`],
        eval1.done,
        dayjs().tz(TZ).format(DATE_STRING_FORMAT)
      );
    }
    if (eval2) {
      dataAnswerToWriteAnswer.push(
        eval2.type,
        eval2[`${eval2.type}ConfidenceLevel`],
        eval2[`${eval2.type}LesionType`],
        eval2.affectDiagnostic,
        eval2.affectConfidenceLevel,
        eval2.done,
        dayjs().tz(TZ).format(DATE_STRING_FORMAT)
      );
    }

    dataWriteToRange.push({
      range: `Answer_Lesion_${currentAnswerOverview.currentLesion}!${
        eval1 ? "C" : "H"
      }${accountIndex + 2}:${eval1 ? "G" : "N"}${accountIndex + 2}`,
      values: [dataAnswerToWriteAnswer],
    });
    await writeDataInRange({
      spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
      data: dataWriteToRange,
    });

    //done all lesion
    if (!nextQuestionIndex) {
      return returnWithNewToken({
        account,
        nextRouter: "/signature",
        responseData: {
          isSignWhenComplete: "False",
          successAll: true,
        },
      });
    }

    const questions = await getDataInRange({
      range: `Lesion_Info!A${Number(nextQuestionIndex) + 1}:O${
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
        patientAge: get(item, "6", 0),
        patientGender: get(item, "4", ""),
        lesionLocation: get(item, "5", ""),
        lesionSize: get(item, "7", ""),
        lesionPicture: get(item, "13", ""),
        lesionAuraResultScreen: get(item, "14", ""),
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
