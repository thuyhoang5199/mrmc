import dayjs from "dayjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { returnWithNewToken } from "../auth/return-with-new-token";
import { validateAuthenticated } from "../auth/validate-authenticated";
import { writeDataInRange } from "../utils/google";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { DATE_STRING_FORMAT, TZ } from "../constants";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export async function POST(req: NextRequest) {
  const cookie = (await cookies()).get("session")?.value;
  const { signature } = await req.json();
  const account = validateAuthenticated({
    token: cookie as string,
    clientURL: ["/signature"],
  });
  if (account instanceof NextResponse) {
    return account;
  }
  // const filePath = `signature_${account.id}.png`;
  // fs.writeFileSync(`/tmp/${filePath}`, signature, "base64");

  // const readStream = fs.createReadStream(`/tmp/${filePath}`);

  // readStream.pipe(process.stdout);

  // try {
  //   const driveClient = getDriveClient({ profileIndex: 1 });
  //   await driveClient.files.create({
  //     requestBody: {
  //       name: filePath,
  //       parents: [process.env.GOOGLE_SIGNATURE_FOLDER as string],
  //     },
  //     media: { mimeType: "image/png", body: readStream },
  //   });
  //   fs.unlinkSync(`/tmp/${filePath}`);
  // } catch (err) {
  //   console.log("Save signature error", err);
  //   return NextResponse.json(
  //     {
  //       message:
  //         "Error when save your signature, please reload page and try again",
  //     },
  //     { status: 500 }
  //   );
  // }

  const accountIndex = Number(account.index);
  await writeDataInRange({
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
    data: [
      {
        values: [
          ["True", dayjs().tz(TZ).format(DATE_STRING_FORMAT), signature],
        ],
        // values: [["True", new Date().toUTCString(), filePath]],
        range: `Answer_Overview!F${accountIndex + 1}:H${accountIndex + 1}`,
      },
    ],
  });

  return returnWithNewToken({
    account,
    nextRouter: "/result",
    responseData: { successAll: true },
  });
}
