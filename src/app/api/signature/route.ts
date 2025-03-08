import fs from "fs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { validateAuthenticated } from "../auth/validate-authenticated";
import { getDriveClient, writeDataInRange } from "../utils/google/common";
export async function POST(req: NextRequest) {
  const cookie = (await cookies()).get("session")?.value;
  const { signature } = await req.json();
  const account = validateAuthenticated({
    token: cookie as string,
  });
  if (account instanceof NextResponse) {
    return account;
  }
  const filePath = `signature_${account.id}.png`;
  fs.writeFileSync(`/tmp/${filePath}`, signature, "base64");

  const readStream = fs.createReadStream(`/tmp/${filePath}`);

  readStream.pipe(process.stdout);

  try {
    const driveClient = getDriveClient({ profileIndex: 1 });
    await driveClient.files.create({
      requestBody: {
        name: filePath,
        parents: [process.env.GOOGLE_SIGNATURE_FOLDER as string],
      },
      media: { mimeType: "image/png", body: readStream },
    });
    fs.unlinkSync(`/tmp/${filePath}`);
  } catch (err) {
    console.log("Save signature error", err);
    return NextResponse.json(
      {
        message:
          "Error when save your signature, please reload page and try again",
      },
      { status: 500 }
    );
  }

  const accountIndex = Number(account.index);
  await writeDataInRange({
    spreadsheetId: process.env.GOOGLE_DATA_SPREAD_SHEET_ID as string,
    data: [
      {
        values: [["True", new Date().toUTCString(), filePath]],
        range: `Answer_Overview!F${accountIndex + 1}:H${accountIndex + 1}`,
      },
    ],
  });

  return NextResponse.json(
    {
      successAll: true,
    },
    { status: 200 }
  );
}
