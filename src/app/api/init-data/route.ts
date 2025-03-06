import { NextRequest, NextResponse } from "next/server";
import { getSheetClient } from "../utils/google/common";

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
  if (Number(spreadsheet.data.sheets?.length) <= 4) {
    const answerLesion = spreadsheet.data.sheets?.find(
      (i) => i.properties?.title == "Answer_Lesion_1"
    );

    const requests: Array<any> = [];
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
  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 }
  );
}
