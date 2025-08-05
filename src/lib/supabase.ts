import { createClient } from '@supabase/supabase-js';

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
      account_users: {
        Row: {
          account_id: string
          created_at: string | null
          invited_at: string | null
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          invited_at?: string | null
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          invited_at?: string | null
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          account_id: string | null
          address: string | null
          created_at: string | null
          id: string
          nickname: string
          property_type_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          address?: string | null
          created_at?: string | null
          id?: string
          nickname: string
          property_type_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          address?: string | null
          created_at?: string | null
          id?: string
          nickname?: string
          property_type_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
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
          property_id: string
          public_id: string
          qr_code_uploaded_at: string | null
          qr_code_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          property_id: string
          public_id: string
          qr_code_uploaded_at?: string | null
          qr_code_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          property_id?: string
          public_id?: string
          qr_code_uploaded_at?: string | null
          qr_code_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      item_visits: {
        Row: {
          id: string
          ip_address: unknown | null
          item_id: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          visited_at: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          item_id?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visited_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          item_id?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_visits_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_reactions: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          item_id: string | null
          reaction_type: string
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          item_id?: string | null
          reaction_type: string
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          item_id?: string | null
          reaction_type?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_reactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      mailing_list_subscribers: {
        Row: {
          email: string
          id: string
          ip_address: string | null
          status: string | null
          subscribed_at: string | null
          user_agent: string | null
        }
        Insert: {
          email: string
          id?: string
          ip_address?: string | null
          status?: string | null
          subscribed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          email?: string
          id?: string
          ip_address?: string | null
          status?: string | null
          subscribed_at?: string | null
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser/public operations with auth
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
          // FIXED: Always set cookies for server-side authentication
          // Set as HTTP cookie for server-side access
          const maxAge = 60 * 60 * 24 * 30; // 30 days
          const isSecure = window.location.protocol === 'https:';
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=lax${isSecure ? '; secure' : ''}`;
          console.log('AUTH_COOKIE_DEBUG: Set cookie for server access:', key);
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
          // Also remove cookie
          document.cookie = `${key}=; path=/; max-age=0; SameSite=lax`;
        }
      }
    }
  }
});

// Admin client for server-side operations (only use server-side)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if service key not available

