import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/public operations with auth
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Admin client for server-side operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      item_links: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          item_id: string | null
          link_type: string
          thumbnail_url: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          item_id?: string | null
          link_type: string
          thumbnail_url?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          item_id?: string | null
          link_type?: string
          thumbnail_url?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          public_id: string
          qr_code_url: string | null
          qr_code_uploaded_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          public_id: string
          qr_code_url?: string | null
          qr_code_uploaded_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          public_id?: string
          qr_code_url?: string | null
          qr_code_uploaded_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mailing_list_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string | null
          status: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string | null
          status?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string | null
          status?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

