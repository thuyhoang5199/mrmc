import { google } from "googleapis";
import { get } from "lodash";
import { GOOGLE_PROFILES } from "../../constants";

export async function getDataInRange({
  range,
  spreadsheetId,
  profileIndex = 0,
}: {
  range: string;
  spreadsheetId: string;
  profileIndex?: number;
}): Promise<Array<unknown>> {
  try {
    const sheets = getSheet({ profileIndex });
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
  profileIndex = 0,
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
    const sheets = getSheet({ profileIndex });
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
    return [];
  }
}

function getSheet({ profileIndex }: { profileIndex: number }) {
  if (profileIndex > GOOGLE_PROFILES.length - 1) {
    throw new Error(
      "Could not connect to server, please try again in a few minutes"
    );
  }
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_PROFILES[profileIndex],
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth: auth });
  return sheets;
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
