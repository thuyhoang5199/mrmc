import { NextRequest, NextResponse } from "next/server";
import {
  getDataInRange,
  getSheetClient,
  writeDataInRange,
} from "../utils/google/common";

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get("x-access-token");
  const profileId = req.headers.get("x-profile-id");
  if (
    !accessToken ||
    !profileId ||
    accessToken != process.env.ACCESS_TOKEN ||
    profileId != process.env.PROFILE_ID
  ) {
    return NextResponse.json(
      {
        message: "unauthenticated",
      },
      { status: 401 }
    );
  }
  const spreadsheetId = process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string;

  const sheetClient = getSheetClient({ profileIndex: 1 });
  const spreadsheet = await sheetClient.spreadsheets.get({
    spreadsheetId,
    includeGridData: false,
  });

  //#region  init sheet answer lesion
  if (Number(spreadsheet.data.sheets?.length) <= 4) {
    const answerLesion = spreadsheet.data.sheets?.find(
      (i) => i.properties?.title == "Answer_Lesion_1"
    );

    const requests = [];
    for (let i = 2; i <= Number(process.env.LESION_LENGTH); i++) {
      requests.push({
        duplicateSheet: {
          newSheetName: `Answer_Lesion_${i}`,
          sourceSheetId: answerLesion?.properties?.sheetId,
          insertSheetIndex: i + 3,
        },
      });
    }
    await sheetClient.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        includeSpreadsheetInResponse: false,
        responseIncludeGridData: false,
        responseRanges: null,
        requests,
      },
    });
  }
  //#endregion

  //#region generate lesion answer overview
  const sheetLoginManager = await getDataInRange({
    range: "Login_Manage!A:C",
    spreadsheetId,
  });

  const sheetAnswerOverview = await getDataInRange({
    range: "Answer_Overview!A:A",
    spreadsheetId,
  });

  // console.log(sheetLoginManager);

  if (sheetAnswerOverview.length != sheetLoginManager.length) {
    const LESION_LENGTH = Number(process.env.LESION_LENGTH);
    sheetLoginManager.shift();
    const answerOverviewData = sheetLoginManager.map((item) => {
      let index = 1;
      let listLesion: number[] = [];
      while (index <= LESION_LENGTH) {
        listLesion.push(index);
        index += 1;
      }
      listLesion = listLesion.sort(() => Math.random() - 0.5);
      const nextQuestionIndex = listLesion[0];
      return [
        item[2],
        listLesion.join("|"),
        nextQuestionIndex,
        "0",
        "",
        "False",
      ];
    });

    await writeDataInRange({
      spreadsheetId,
      data: [
        {
          range: `Answer_Overview!A2:F${answerOverviewData.length + 2}`,
          values: answerOverviewData,
        },
      ],
    });
  }

  //#endregion

  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 }
  );
}
