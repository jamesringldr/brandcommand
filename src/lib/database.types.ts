export type BrandRole = 'owner' | 'brand_user'

export type ContentType = 'social' | 'blog'

export type ContentStatus =
  | 'Planned'
  | 'Editing'
  | 'Reviewing'
  | 'Ready'
  | 'Scheduled'
  | 'Posted'
  | 'Published'
  | 'Killed'

export type ConnectorProvider = 'ga4' | 'gsc' | 'meta' | 'calls'

export type ConnectorStatus = 'active' | 'error' | 'disconnected'

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
      brands: {
        Row: {
          id: string
          slug: string
          name: string
          drive_folder_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          drive_folder_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          drive_folder_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_brands: {
        Row: {
          user_id: string
          brand_id: string
          role: BrandRole
        }
        Insert: {
          user_id: string
          brand_id: string
          role: BrandRole
        }
        Update: {
          user_id?: string
          brand_id?: string
          role?: BrandRole
        }
        Relationships: []
      }
      content_items: {
        Row: {
          id: string
          brand_id: string
          type: ContentType
          status: ContentStatus
          title: string
          body: string | null
          platforms: string[] | null
          scheduled_at: string | null
          posted_at: string | null
          external_job_id: string | null
          schedule_error: string | null
          ai_critique: string | null
          campaign_id: string | null
          derived_from: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          type?: ContentType
          status?: ContentStatus
          title: string
          body?: string | null
          platforms?: string[] | null
          scheduled_at?: string | null
          posted_at?: string | null
          external_job_id?: string | null
          schedule_error?: string | null
          ai_critique?: string | null
          campaign_id?: string | null
          derived_from?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          type?: ContentType
          status?: ContentStatus
          title?: string
          body?: string | null
          platforms?: string[] | null
          scheduled_at?: string | null
          posted_at?: string | null
          external_job_id?: string | null
          schedule_error?: string | null
          ai_critique?: string | null
          campaign_id?: string | null
          derived_from?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      brand_connectors: {
        Row: {
          id: string
          brand_id: string
          provider: ConnectorProvider
          external_account_id: string | null
          credentials_ref: string | null
          status: ConnectorStatus
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          provider: ConnectorProvider
          external_account_id?: string | null
          credentials_ref?: string | null
          status?: ConnectorStatus
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          provider?: ConnectorProvider
          external_account_id?: string | null
          credentials_ref?: string | null
          status?: ConnectorStatus
          created_at?: string
        }
        Relationships: []
      }
      metric_snapshots: {
        Row: {
          id: string
          brand_id: string
          provider: ConnectorProvider
          metric_key: string
          dimension: string | null
          value: number
          period_start: string
          period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          provider: ConnectorProvider
          metric_key: string
          dimension?: string | null
          value: number
          period_start: string
          period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          provider?: ConnectorProvider
          metric_key?: string
          dimension?: string | null
          value?: number
          period_start?: string
          period_end?: string
          created_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          brand_id: string
          name: string
          strategy: string | null
          status: 'draft' | 'active' | 'completed' | 'archived'
          starts_at: string | null
          ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          strategy?: string | null
          status?: 'draft' | 'active' | 'completed' | 'archived'
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          strategy?: string | null
          status?: 'draft' | 'active' | 'completed' | 'archived'
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      brand_voice_profiles: {
        Row: {
          brand_id: string
          tone: string | null
          audience: string | null
          dos: string | null
          donts: string | null
          examples: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          tone?: string | null
          audience?: string | null
          dos?: string | null
          donts?: string | null
          examples?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          tone?: string | null
          audience?: string | null
          dos?: string | null
          donts?: string | null
          examples?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_item_assets: {
        Row: {
          id: string
          brand_id: string
          content_item_id: string
          drive_file_id: string
          url: string | null
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          content_item_id: string
          drive_file_id: string
          url?: string | null
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          content_item_id?: string
          drive_file_id?: string
          url?: string | null
          name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      ai_suggestions: {
        Row: {
          id: string
          brand_id: string
          title: string
          body: string | null
          rationale: string | null
          status: 'pending' | 'accepted' | 'rejected'
          derived_from: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          title: string
          body?: string | null
          rationale?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          derived_from?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          title?: string
          body?: string | null
          rationale?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          derived_from?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      brand_role: BrandRole
      content_type: ContentType
      content_status: ContentStatus
      connector_provider: ConnectorProvider
      connector_status: ConnectorStatus
    }
    CompositeTypes: Record<string, never>
  }
}

export type Brand = Database['public']['Tables']['brands']['Row']
export type ContentItem = Database['public']['Tables']['content_items']['Row']
export type BrandConnector = Database['public']['Tables']['brand_connectors']['Row']
export type MetricSnapshot = Database['public']['Tables']['metric_snapshots']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type BrandVoiceProfile =
  Database['public']['Tables']['brand_voice_profiles']['Row']
export type AiSuggestion = Database['public']['Tables']['ai_suggestions']['Row']
