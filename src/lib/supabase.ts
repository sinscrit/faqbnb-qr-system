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
          source_language: string
          target_language: string
          status: string
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
        Relationships: []
      }
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
          translation_status: string
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
        Relationships: []
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
          account_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          property_type_id: string
          nickname: string
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
          account_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          property_type_id?: string
          nickname?: string
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
          account_id?: string | null
        }
        Relationships: []
      }
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
          source_language: string | null
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
          source_language?: string | null
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
          source_language?: string | null
        }
        Relationships: []
      }
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
          translation_status: string
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
        Relationships: []
      }
      item_links: {
        Row: {
          id: string
          item_id: string | null
          title: string
          link_type: string
          url: string
          thumbnail_url: string | null
          display_order: number | null
          created_at: string | null
          article_id: string | null
          source_language: string | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          title: string
          link_type: string
          url: string
          thumbnail_url?: string | null
          display_order?: number | null
          created_at?: string | null
          article_id?: string | null
          source_language?: string | null
        }
        Update: {
          id?: string
          item_id?: string | null
          title?: string
          link_type?: string
          url?: string
          thumbnail_url?: string | null
          display_order?: number | null
          created_at?: string | null
          article_id?: string | null
          source_language?: string | null
        }
        Relationships: []
      }
      access_requests: {
        Row: {
          id: string
          requester_email: string
          requester_name: string | null
          account_id: string | null
          request_date: string | null
          approval_date: string | null
          approved_by: string | null
          access_code: string | null
          registration_date: string | null
          status: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
          source: string | null
          metadata: unknown | null
          denial_date: string | null
          denial_reason: string | null
          processed_by: string | null
          processed_at: string | null
          email_sent_date: string | null
          registration_completed_date: string | null
          approval_notes: string | null
        }
        Insert: {
          id?: string
          requester_email: string
          requester_name?: string | null
          account_id?: string | null
          request_date?: string | null
          approval_date?: string | null
          approved_by?: string | null
          access_code?: string | null
          registration_date?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          source?: string | null
          metadata?: unknown | null
          denial_date?: string | null
          denial_reason?: string | null
          processed_by?: string | null
          processed_at?: string | null
          email_sent_date?: string | null
          registration_completed_date?: string | null
          approval_notes?: string | null
        }
        Update: {
          id?: string
          requester_email?: string
          requester_name?: string | null
          account_id?: string | null
          request_date?: string | null
          approval_date?: string | null
          approved_by?: string | null
          access_code?: string | null
          registration_date?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          source?: string | null
          metadata?: unknown | null
          denial_date?: string | null
          denial_reason?: string | null
          processed_by?: string | null
          processed_at?: string | null
          email_sent_date?: string | null
          registration_completed_date?: string | null
          approval_notes?: string | null
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
          id?: string
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
          translation_status: string
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
        Relationships: []
      }
      accounts: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          settings: unknown | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          settings?: unknown | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          settings?: unknown | null
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
          preferred_language: string | null
          created_at: string | null
          updated_at: string | null
          is_admin: boolean | null
          profile_picture: string | null
          auth_provider: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: string | null
          preferred_language?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_admin?: boolean | null
          profile_picture?: string | null
          auth_provider?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string | null
          preferred_language?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_admin?: boolean | null
          profile_picture?: string | null
          auth_provider?: string | null
        }
        Relationships: []
      }
      account_users: {
        Row: {
          account_id: string
          user_id: string
          role: string
          invited_at: string | null
          joined_at: string | null
          created_at: string | null
        }
        Insert: {
          account_id: string
          user_id: string
          role: string
          invited_at?: string | null
          joined_at?: string | null
          created_at?: string | null
        }
        Update: {
          account_id?: string
          user_id?: string
          role?: string
          invited_at?: string | null
          joined_at?: string | null
          created_at?: string | null
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
      items: {
        Row: {
          id: string
          public_id: string
          name: string
          description: string | null
          location: string | null
          created_at: string | null
          updated_at: string | null
          qr_code_url: string | null
          qr_code_uploaded_at: string | null
          property_id: string
          tags: string[] | null
          source_language: string | null
        }
        Insert: {
          id?: string
          public_id: string
          name: string
          description?: string | null
          location?: string | null
          created_at?: string | null
          updated_at?: string | null
          qr_code_url?: string | null
          qr_code_uploaded_at?: string | null
          property_id: string
          tags?: string[] | null
          source_language?: string | null
        }
        Update: {
          id?: string
          public_id?: string
          name?: string
          description?: string | null
          location?: string | null
          created_at?: string | null
          updated_at?: string | null
          qr_code_url?: string | null
          qr_code_uploaded_at?: string | null
          property_id?: string
          tags?: string[] | null
          source_language?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fetch_and_lock_translation_job: {
        Args: {
          p_worker_id: string
        }
        Returns: {
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
        }[]
      }
      get_item_visit_analytics: {
        Args: {
          target_item_id: string
        }
        Returns: {
          last_24_hours: number | null
          last_7_days: number | null
          last_30_days: number | null
          last_365_days: number | null
          all_time: number | null
        }[]
      }
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
export const supabaseAdmin = (supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase) as ReturnType<typeof createClient<Database>>;
