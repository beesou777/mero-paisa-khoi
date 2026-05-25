import { z } from "zod";

export const debtDirectionSchema = z.enum(["owed_to_me", "i_owe"]);
export const debtStatusSchema = z.enum(["pending", "partial", "paid", "overdue"]);

export const parsedDebtSchema = z.object({
  contactName: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.string().date(),
  direction: debtDirectionSchema,
  originalInput: z.string().min(1).optional(),
});

export const createDebtSchema = parsedDebtSchema.extend({
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
  reminderEnabled: z.coerce.boolean().default(true),
  currency: z.string().min(3).max(3).default("NPR"),
});

export const partialPaymentSchema = z.object({
  debtId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  note: z.string().max(240).optional(),
});

export const updateContactSchema = z.object({
  debtId: z.string().uuid(),
  contactName: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  fullName: z.string().max(100).optional(),
  reminderTone: z.enum(["friendly", "gentle", "direct"]).default("friendly"),
  emailReminders: z.coerce.boolean().default(true),
  defaultCurrency: z.string().min(3).max(3).default("NPR"),
  defaultReminderEnabled: z.coerce.boolean().default(true),
});

export type ParsedDebtInput = z.infer<typeof parsedDebtSchema>;
export type CreateDebtInput = z.infer<typeof createDebtSchema>;
