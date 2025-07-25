import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser/public operations with auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
          // Also set as HTTP cookie for server-side access
          const maxAge = 60 * 60 * 24 * 30; // 30 days
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=lax; secure=${window.location.protocol === 'https:'}`;
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
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if service key not available

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
      users: {
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
      property_types: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          user_id: string
          property_type_id: string
          nickname: string
          address: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          property_type_id: string
          nickname: string
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          property_type_id?: string
          nickname?: string
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
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
          property_id: string
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
          property_id: string
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
          property_id?: string
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
          item_id: string | null
          visited_at: string | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          referrer: string | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          visited_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          referrer?: string | null
        }
        Update: {
          id?: string
          item_id?: string | null
          visited_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          referrer?: string | null
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
          id: string
          item_id: string | null
          reaction_type: string
          ip_address: string | null
          session_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          reaction_type: string
          ip_address?: string | null
          session_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          item_id?: string | null
          reaction_type?: string
          ip_address?: string | null
          session_id?: string | null
          created_at?: string | null
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

