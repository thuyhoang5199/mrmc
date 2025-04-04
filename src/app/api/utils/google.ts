import { google } from "googleapis";
import { get } from "lodash";

//#region Google sheet
export async function getDataInRange({
  range,
  spreadsheetId,
  profileIndex = 1, //start with 1
}: {
  range: string;
  spreadsheetId: string;
  profileIndex?: number;
}): Promise<Array<unknown>> {
  try {
    const sheets = getSheetClient({ profileIndex });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return get(res, "data.values", []);
  } catch (e) {
    //todo: retry change profile and get data again
    console.log("getDataInRange Error: ", e);
    if (get(e, "status") === 429) {
      await sleep(3000);
      return await getDataInRange({
        range,
        spreadsheetId,
        profileIndex: (profileIndex += 1),
      });
    }
    return [];
  }
}

export async function writeDataInRange({
  spreadsheetId,
  profileIndex = 1,
  data,
}: {
  spreadsheetId: string;
  profileIndex?: number;
  data: Array<{
    range: string;
    values: Array<Array<string>>;
  }>;
}): Promise<unknown> {
  try {
    const sheets = getSheetClient({ profileIndex });
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        data: data.map((item) => ({
          majorDimension: "ROWS",
          ...item,
        })),
        valueInputOption: "RAW",
      },
    });
  } catch (e) {
    //todo: retry change profile and get data again
    console.log("writeDataInRange Error: ", e);
    if (get(e, "status") == 429) {
      await sleep(3000);
      return await writeDataInRange({
        spreadsheetId,
        profileIndex: (profileIndex += 1),
        data,
      });
    }
    throw new Error("Cannot save data into database, please try again");
  }
}

export function getSheetClient({ profileIndex }: { profileIndex: number }) {
  if (profileIndex > Number(process.env.GOOGLE_PROFILE_LENGTH)) {
    throw new Error(
      "Could not connect to server, please try again in a few minutes"
    );
  }
  const credentials = {
    type: "service_account",
    project_id: process.env[`GOOGLE_PROFILE_PROJECT_ID_${profileIndex}`],
    private_key_id:
      process.env[`GOOGLE_PROFILE_PRIVATE_KEY_ID_${profileIndex}`],
    private_key: process.env[
      `GOOGLE_PROFILE_PRIVATE_KEY_${profileIndex}`
    ]?.replace(/\\n/g, "\n"),
    client_email: process.env[`GOOGLE_PROFILE_CLIENT_EMAIL_${profileIndex}`],
    client_id: process.env[`GOOGLE_PROFILE_CLIENT_ID_${profileIndex}`],
    universe_domain: "googleapis.com",
  };
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth: auth });
  return sheets;
}

export function getColumnNameByIndex(n: number) {
  const ordA = "A".charCodeAt(0);
  const ordZ = "Z".charCodeAt(0);
  const len = ordZ - ordA + 1;

  let s = "";
  while (n >= 0) {
    s = String.fromCharCode((n % len) + ordA) + s;
    n = Math.floor(n / len) - 1;
  }
  return s;
}
//#endregion

//#region Google drive

export function getDriveClient({ profileIndex }: { profileIndex: number }) {
  if (profileIndex > Number(process.env.GOOGLE_PROFILE_LENGTH)) {
    throw new Error(
      "Could not connect to server, please try again in a few minutes"
    );
  }
  const credentials = {
    type: "service_account",
    project_id: process.env[`GOOGLE_PROFILE_PROJECT_ID_${profileIndex}`],
    private_key_id:
      process.env[`GOOGLE_PROFILE_PRIVATE_KEY_ID_${profileIndex}`],
    private_key: process.env[
      `GOOGLE_PROFILE_PRIVATE_KEY_${profileIndex}`
    ]?.replace(/\\n/g, "\n"),
    client_email: process.env[`GOOGLE_PROFILE_CLIENT_EMAIL_${profileIndex}`],
    client_id: process.env[`GOOGLE_PROFILE_CLIENT_ID_${profileIndex}`],
    universe_domain: "googleapis.com",
  };
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const sheets = google.drive({ version: "v3", auth: auth });
  return sheets;
}
//#endregion

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
