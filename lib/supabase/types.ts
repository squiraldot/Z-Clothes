export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id:string; full_name:string|null; phone:string|null; avatar_url:string|null; role:string; created_at:string; updated_at:string };
        Insert: { id:string; full_name?:string|null; phone?:string|null; avatar_url?:string|null; role?:string; created_at?:string; updated_at?:string };
        Update: { id?:string; full_name?:string|null; phone?:string|null; avatar_url?:string|null; role?:string; created_at?:string; updated_at?:string };
        Relationships: [];
      };
      wishlists: {
        Row: { user_id:string; product_id:string; created_at:string };
        Insert: { user_id:string; product_id:string; created_at?:string };
        Update: { user_id?:string; product_id?:string; created_at?:string };
        Relationships: [];
      };
      addresses: {
        Row: { id:string; user_id:string; full_name:string; phone:string; line1:string; line2:string|null; landmark:string|null; city:string; state:string; pincode:string; is_default:boolean; created_at:string; updated_at:string };
        Insert: { id?:string; user_id:string; full_name:string; phone:string; line1:string; line2?:string|null; landmark?:string|null; city:string; state:string; pincode:string; is_default?:boolean; created_at?:string; updated_at?:string };
        Update: { id?:string; user_id?:string; full_name?:string; phone?:string; line1?:string; line2?:string|null; landmark?:string|null; city?:string; state?:string; pincode?:string; is_default?:boolean; created_at?:string; updated_at?:string };
        Relationships: [];
      };
      orders: {
        Row: {
          id:string; user_id:string; order_number:string; status:string; currency:string; subtotal:number; shipping:number; total:number;
          email:string|null; created_at:string; updated_at:string; shipping_address_id:string|null; shipping_name:string|null; shipping_phone:string|null;
          shipping_line1:string|null; shipping_line2:string|null; shipping_landmark:string|null; shipping_city:string|null; shipping_state:string|null; shipping_pincode:string|null; coupon_id:string|null; coupon_code:string|null; discount:number;
        };
        Insert: {
          id?:string; user_id:string; order_number:string; status?:string; currency?:string; subtotal:number; shipping?:number; total:number;
          email?:string|null; created_at?:string; updated_at?:string; shipping_address_id?:string|null; shipping_name?:string|null; shipping_phone?:string|null;
          shipping_line1?:string|null; shipping_line2?:string|null; shipping_landmark?:string|null; shipping_city?:string|null; shipping_state?:string|null; shipping_pincode?:string|null; coupon_id?:string|null; coupon_code?:string|null; discount?:number;
        };
        Update: {
          id?:string; user_id?:string; order_number?:string; status?:string; currency?:string; subtotal?:number; shipping?:number; total?:number;
          email?:string|null; created_at?:string; updated_at?:string; shipping_address_id?:string|null; shipping_name?:string|null; shipping_phone?:string|null;
          shipping_line1?:string|null; shipping_line2?:string|null; shipping_landmark?:string|null; shipping_city?:string|null; shipping_state?:string|null; shipping_pincode?:string|null;
        };
        Relationships: [];
      };
      order_items: {
        Row: { id:string; order_id:string; product_id:string; title:string; price:number; quantity:number; image:string; color:string|null; size:string|null; created_at:string };
        Insert: { id?:string; order_id:string; product_id:string; title:string; price:number; quantity:number; image:string; color?:string|null; size?:string|null; created_at?:string };
        Update: { id?:string; order_id?:string; product_id?:string; title?:string; price?:number; quantity?:number; image?:string; color?:string|null; size?:string|null; created_at?:string };
        Relationships: [];
      };
      product_reviews: {
        Row: { id:string; user_id:string; product_id:string; order_id:string; rating:number; title:string|null; body:string|null; created_at:string; updated_at:string };
        Insert: { id?:string; user_id:string; product_id:string; order_id:string; rating:number; title?:string|null; body?:string|null; created_at?:string; updated_at?:string };
        Update: { id?:string; user_id?:string; product_id?:string; order_id?:string; rating?:number; title?:string|null; body?:string|null; created_at?:string; updated_at?:string };
        Relationships: [];
      };
      coupons: {
        Row: { id:string; code:string; discount_type:string; discount_value:number; min_subtotal:number; max_discount:number|null; starts_at:string|null; ends_at:string|null; usage_limit:number|null; per_user_limit:number; active:boolean; created_at:string; updated_at:string };
        Insert: { id?:string; code:string; discount_type:string; discount_value:number; min_subtotal?:number; max_discount?:number|null; starts_at?:string|null; ends_at?:string|null; usage_limit?:number|null; per_user_limit?:number; active?:boolean; created_at?:string; updated_at?:string };
        Update: { id?:string; code?:string; discount_type?:string; discount_value?:number; min_subtotal?:number; max_discount?:number|null; starts_at?:string|null; ends_at?:string|null; usage_limit?:number|null; per_user_limit?:number; active?:boolean; created_at?:string; updated_at?:string };
        Relationships: [];
      };
      coupon_redemptions: {
        Row: { id:string; coupon_id:string; user_id:string; order_id:string; discount_amount:number; created_at:string };
        Insert: { id?:string; coupon_id:string; user_id:string; order_id:string; discount_amount:number; created_at?:string };
        Update: { id?:string; coupon_id?:string; user_id?:string; order_id?:string; discount_amount?:number; created_at?:string };
        Relationships: [];
      };
      cart_items: {
        Row: { user_id:string; item_key:string; product_id:string; title:string; price:number; image:string; quantity:number; color:string|null; size:string|null; dodo_product_id:string|null; created_at:string; updated_at:string };
        Insert: { user_id:string; item_key:string; product_id:string; title:string; price:number; image:string; quantity:number; color?:string|null; size?:string|null; dodo_product_id?:string|null; created_at?:string; updated_at?:string };
        Update: { user_id?:string; item_key?:string; product_id?:string; title?:string; price?:number; image?:string; quantity?:number; color?:string|null; size?:string|null; dodo_product_id?:string|null; created_at?:string; updated_at?:string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};