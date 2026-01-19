import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

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
          preferred_language: string | null  // REQ-225: Account default language preference
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
          settings?: Json | null
          updated_at?: string | null
          preferred_language?: string | null  // REQ-225: Account default language preference
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          updated_at?: string | null
          preferred_language?: string | null  // REQ-225: Account default language preference
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
          preferred_language: string | null  // REQ-225: User language preference
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          preferred_language?: string | null  // REQ-225: User language preference
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          preferred_language?: string | null  // REQ-225: User language preference
        }
        Relationships: []
      }
      item_links: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          item_id: string | null
          article_id: string | null  // REQ-151: Link to article
          link_type: string
          thumbnail_url: string | null
          title: string
          url: string
          source_language: string | null  // REQ-224: Track original language for translation
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          item_id?: string | null
          article_id?: string | null  // REQ-151: Link to article
          link_type: string
          thumbnail_url?: string | null
          title: string
          url: string
          source_language?: string | null  // REQ-224: Track original language for translation
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          item_id?: string | null
          article_id?: string | null  // REQ-151: Link to article
          link_type?: string
          thumbnail_url?: string | null
          title?: string
          url?: string
          source_language?: string | null  // REQ-224: Track original language for translation
        }
        Relationships: [
          {
            foreignKeyName: "item_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_links_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "item_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      // REQ-227: Link translations table for L10N
      link_translations: {
        Row: {
          id: string
          link_id: string
          language: string
          title: string
          translation_status: string
          translated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          link_id: string
          language: string
          title: string
          translation_status?: string
          translated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          link_id?: string
          language?: string
          title?: string
          translation_status?: string
          translated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_translations_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "item_links"
            referencedColumns: ["id"]
          }
        ]
      }
      // REQ-151: Item articles table for grouped content
      item_articles: {
        Row: {
          id: string
          item_id: string
          purpose: string
          title: string
          description: string | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
          source_language: string | null  // REQ-224: Track original language for translation
        }
        Insert: {
          id?: string
          item_id: string
          purpose: string
          title: string
          description?: string | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
          source_language?: string | null  // REQ-224: Track original language for translation
        }
        Update: {
          id?: string
          item_id?: string
          purpose?: string
          title?: string
          description?: string | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
          source_language?: string | null  // REQ-224: Track original language for translation
        }
        Relationships: [
          {
            foreignKeyName: "item_articles_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
      // REQ-227: Article translations table for L10N
      article_translations: {
        Row: {
          id: string
          article_id: string
          language: string
          title: string
          description: string | null
          translation_status: string
          translated_at: string | null
          reviewed_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          article_id: string
          language: string
          title: string
          description?: string | null
          translation_status?: string
          translated_at?: string | null
          reviewed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          article_id?: string
          language?: string
          title?: string
          description?: string | null
          translation_status?: string
          translated_at?: string | null
          reviewed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "item_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_translations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
          source_language: string | null  // REQ-224: Track original language for translation
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
          source_language?: string | null  // REQ-224: Track original language for translation
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
          source_language?: string | null  // REQ-224: Track original language for translation
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
      // REQ-227: Item translations table for L10N
      item_translations: {
        Row: {
          id: string
          item_id: string
          language: string
          name: string
          description: string | null
          translation_status: string
          translated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          item_id: string
          language: string
          name: string
          description?: string | null
          translation_status?: string
          translated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          item_id?: string
          language?: string
          name?: string
          description?: string | null
          translation_status?: string
          translated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_translations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
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
      // REQ-227: Tag translations table for L10N
      tag_translations: {
        Row: {
          id: string
          tag_key: string
          language: string
          translated_value: string
          is_system_tag: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tag_key: string
          language: string
          translated_value: string
          is_system_tag?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tag_key?: string
          language?: string
          translated_value?: string
          is_system_tag?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      // REQ-227: Translation jobs queue table for L10N
      // REQ-243: Added locked_by and locked_at for job locking support
      translation_jobs: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          source_language: string
          target_language: string
          status: string
          attempts: number | null
          error_message: string | null
          created_at: string | null
          started_at: string | null
          completed_at: string | null
          locked_by: string | null
          locked_at: string | null
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          source_language?: string
          target_language: string
          status?: string
          attempts?: number | null
          error_message?: string | null
          created_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          locked_by?: string | null
          locked_at?: string | null
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          source_language?: string
          target_language?: string
          status?: string
          attempts?: number | null
          error_message?: string | null
          created_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          locked_by?: string | null
          locked_at?: string | null
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
// Using createBrowserClient from @supabase/ssr to properly handle chunked cookies
// set by server-side code exchange (OAuth callback)
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
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

