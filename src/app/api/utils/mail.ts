import nodemailer from "nodemailer";

export async function sendEmail({
  email,
  subject,
  content,
  ccEmail,
}: {
  email: string;
  subject: string;
  content: string;
  ccEmail?: string;
}): Promise<nodemailer.SentMessageInfo> {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST as string,
    port: Number(process.env.SMTP_PORT || 465),
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const emailContent = `<!DOCTYPE html>
      <html lang='vi'>
        <head>
        <meta charset='utf-8'/><title></title>
        </head>
        <body>
          ${content}
        </body>
      </html>
      `;

  return await transport.sendMail({
    to: email, // list of receivers
    cc: ccEmail,
    from: `${process.env.SMTP_SENDER_NAME} <${
      process.env.SMTP_SENDER_EMAIL as string
    }>`, // sender address
    subject: subject, // Subject line
    html: emailContent, // HTML body content
  });
}
