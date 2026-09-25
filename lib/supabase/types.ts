export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlists: {
        Row: { user_id: string; product_id: string; created_at: string };
        Insert: { user_id: string; product_id: string; created_at?: string };
        Update: { user_id?: string; product_id?: string; created_at?: string };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string; user_id: string; order_number: string; status: string;
          currency: string; subtotal: number; shipping: number; total: number;
          email: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; order_number: string; status?: string;
          currency?: string; subtotal: number; shipping?: number; total: number;
          email?: string | null; created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; user_id?: string; order_number?: string; status?: string;
          currency?: string; subtotal?: number; shipping?: number; total?: number;
          email?: string | null; created_at?: string; updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string; order_id: string; product_id: string; title: string;
          price: number; quantity: number; image: string; color: string | null;
          size: string | null; created_at: string;
        };
        Insert: {
          id?: string; order_id: string; product_id: string; title: string;
          price: number; quantity: number; image: string; color?: string | null;
          size?: string | null; created_at?: string;
        };
        Update: {
          id?: string; order_id?: string; product_id?: string; title?: string;
          price?: number; quantity?: number; image?: string; color?: string | null;
          size?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          user_id: string;
          item_key: string;
          product_id: string;
          title: string;
          price: number;
          image: string;
          quantity: number;
          color: string | null;
          size: string | null;
          dodo_product_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          item_key: string;
          product_id: string;
          title: string;
          price: number;
          image: string;
          quantity: number;
          color?: string | null;
          size?: string | null;
          dodo_product_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          item_key?: string;
          product_id?: string;
          title?: string;
          price?: number;
          image?: string;
          quantity?: number;
          color?: string | null;
          size?: string | null;
          dodo_product_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};