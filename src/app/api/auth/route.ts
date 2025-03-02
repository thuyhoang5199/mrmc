import jwt from "jsonwebtoken";

const EXPIRED_TIME = "1 days";
const EXPIRED_TIME_REFRESH_TOKEN = "30 days";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const token = jwt.sign(
    {
      username,
    },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: EXPIRED_TIME }
  );

  const refreshToken = jwt.sign(
    {
      username,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET_KEY as string,
    { expiresIn: EXPIRED_TIME_REFRESH_TOKEN }
  );

  return Response.json({ token, refreshToken });
}
