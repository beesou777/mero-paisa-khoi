import nodemailer from "nodemailer";
import { getServerEnv } from "@/lib/validations/env";

export function getMailClient() {
  const env = getServerEnv();
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error("SMTP_USER and SMTP_PASS are required to send reminder emails.");
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}
