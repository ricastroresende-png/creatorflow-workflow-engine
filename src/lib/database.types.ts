// Auto-generated types for Supabase database
// Matches: supabase/migrations/20260202000000_initial_schema.sql

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'
export type SessionMode = 'dump' | 'processar'
export type SessionStatus = 'active' | 'archived' | 'deleted'
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          preferred_mode: SessionMode
          language: string
          data_retention_days: number
          consent_given_at: string | null
          consent_version: string
          total_sessions: number
          last_risk_level: RiskLevel
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          preferred_mode?: SessionMode
          language?: string
          data_retention_days?: number
          consent_given_at?: string | null
          consent_version?: string
          total_sessions?: number
          last_risk_level?: RiskLevel
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          preferred_mode?: SessionMode
          language?: string
          data_retention_days?: number
          consent_given_at?: string | null
          consent_version?: string
          total_sessions?: number
          last_risk_level?: RiskLevel
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          mode: SessionMode
          max_risk_level: RiskLevel
          risk_events_count: number
          emergency_triggered: boolean
          status: SessionStatus
          message_count: number
          context_summary: Record<string, unknown>
          started_at: string
          last_activity_at: string
          ended_at: string | null
          scheduled_deletion_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          mode?: SessionMode
          max_risk_level?: RiskLevel
          risk_events_count?: number
          emergency_triggered?: boolean
          status?: SessionStatus
          message_count?: number
          context_summary?: Record<string, unknown>
          started_at?: string
          last_activity_at?: string
          ended_at?: string | null
          scheduled_deletion_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          mode?: SessionMode
          max_risk_level?: RiskLevel
          risk_events_count?: number
          emergency_triggered?: boolean
          status?: SessionStatus
          message_count?: number
          context_summary?: Record<string, unknown>
          started_at?: string
          last_activity_at?: string
          ended_at?: string | null
          scheduled_deletion_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          role: MessageRole
          content: string
          mode: SessionMode
          risk_level: RiskLevel
          risk_indicators: string[]
          is_emergency_response: boolean
          tokens_input: number | null
          tokens_output: number | null
          model_used: string | null
          response_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          role: MessageRole
          content: string
          mode: SessionMode
          risk_level?: RiskLevel
          risk_indicators?: string[]
          is_emergency_response?: boolean
          tokens_input?: number | null
          tokens_output?: number | null
          model_used?: string | null
          response_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          role?: MessageRole
          content?: string
          mode?: SessionMode
          risk_level?: RiskLevel
          risk_indicators?: string[]
          is_emergency_response?: boolean
          tokens_input?: number | null
          tokens_output?: number | null
          model_used?: string | null
          response_time_ms?: number | null
          created_at?: string
        }
      }
    }
    Functions: {
      cleanup_expired_sessions: {
        Args: Record<string, never>
        Returns: number
      }
    }
    Enums: {
      risk_level: RiskLevel
      session_mode: SessionMode
      session_status: SessionStatus
      message_role: MessageRole
    }
  }
}

// Helper types for Supabase client
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience aliases
export type User = Tables<'users'>
export type Session = Tables<'sessions'>
export type Message = Tables<'messages'>

export type NewUser = InsertTables<'users'>
export type NewSession = InsertTables<'sessions'>
export type NewMessage = InsertTables<'messages'>
