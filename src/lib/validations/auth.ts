import { z } from "zod";

export const otpLoginSchema = z.object({
  email: z.string().email(),
});
