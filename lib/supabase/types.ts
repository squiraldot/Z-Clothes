export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Generated from the current Supabase schema. The public schema is empty in
// Phase 16; this type will be regenerated as application tables are introduced.
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
