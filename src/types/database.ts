export type DebtDirection = "owed_to_me" | "i_owe";
export type DebtStatus = "pending" | "partial" | "paid" | "overdue";
export type ReminderType = "friendly" | "due_today" | "overdue_3_days" | "overdue_weekly" | "manual";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          reminder_tone: string;
          email_reminders: boolean;
          default_currency: string;
          default_reminder_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          reminder_tone?: string;
          email_reminders?: boolean;
          default_currency?: string;
          default_reminder_enabled?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
        Relationships: [];
      };
      debts: {
        Row: {
          id: string;
          user_id: string;
          contact_id: string;
          amount: number;
          remaining_amount: number;
          currency: string;
          direction: DebtDirection;
          status: DebtStatus;
          due_date: string;
          notes: string | null;
          original_input: string | null;
          reminder_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contact_id: string;
          amount: number;
          remaining_amount: number;
          currency?: string;
          direction: DebtDirection;
          status?: DebtStatus;
          due_date: string;
          notes?: string | null;
          original_input?: string | null;
          reminder_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["debts"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          debt_id: string;
          amount: number;
          paid_at: string;
          note: string | null;
        };
        Insert: {
          id?: string;
          debt_id: string;
          amount: number;
          paid_at?: string;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      reminder_logs: {
        Row: {
          id: string;
          debt_id: string;
          email: string;
          reminder_type: ReminderType;
          sent_at: string;
          success: boolean;
        };
        Insert: {
          id?: string;
          debt_id: string;
          email: string;
          reminder_type: ReminderType;
          sent_at?: string;
          success: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["reminder_logs"]["Insert"]>;
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          debt_id: string;
          action: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          debt_id: string;
          action: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      debt_direction: DebtDirection;
      debt_status: DebtStatus;
      reminder_type: ReminderType;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type DebtWithContact = Database["public"]["Tables"]["debts"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
};
