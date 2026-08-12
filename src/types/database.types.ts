export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ls_fixtures: {
        Row: {
          away_score: number | null
          away_team: string
          away_team_id: string
          competition_id: number
          date: string
          home_score: number | null
          home_team: string
          home_team_id: string
          id: string
          status: string
          time_status: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team: string
          away_team_id: string
          competition_id: number
          date: string
          home_score?: number | null
          home_team: string
          home_team_id: string
          id: string
          status: string
          time_status?: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team?: string
          away_team_id?: string
          competition_id?: number
          date?: string
          home_score?: number | null
          home_team?: string
          home_team_id?: string
          id?: string
          status?: string
          time_status?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      ls_h2h: {
        Row: {
          last_matches: Json
          rival_id: string
          stats: Json
          updated_at: string | null
        }
        Insert: {
          last_matches: Json
          rival_id: string
          stats: Json
          updated_at?: string | null
        }
        Update: {
          last_matches?: Json
          rival_id?: string
          stats?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      ls_squad: {
        Row: {
          age: number | null
          birthdate: string | null
          country_id: string | null
          formation_position: string | null
          height: string | null
          id: number
          is_staff: boolean | null
          name: string
          num: string | null
          position: string
          sname: string | null
          team_id: string
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          age?: number | null
          birthdate?: string | null
          country_id?: string | null
          formation_position?: string | null
          height?: string | null
          id?: number
          is_staff?: boolean | null
          name: string
          num?: string | null
          position: string
          sname?: string | null
          team_id: string
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          age?: number | null
          birthdate?: string | null
          country_id?: string | null
          formation_position?: string | null
          height?: string | null
          id?: number
          is_staff?: boolean | null
          name?: string
          num?: string | null
          position?: string
          sname?: string | null
          team_id?: string
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      ls_standings: {
        Row: {
          competition_id: number
          drawn: number
          goal_diff: number
          goals_against: number
          goals_for: number
          id: number
          lost: number
          played: number
          points: number
          rank: number
          team_id: string
          team_name: string
          updated_at: string | null
          won: number
          zone: string | null
        }
        Insert: {
          competition_id: number
          drawn: number
          goal_diff: number
          goals_against: number
          goals_for: number
          id?: number
          lost: number
          played: number
          points: number
          rank: number
          team_id: string
          team_name: string
          updated_at?: string | null
          won: number
          zone?: string | null
        }
        Update: {
          competition_id?: number
          drawn?: number
          goal_diff?: number
          goals_against?: number
          goals_for?: number
          id?: number
          lost?: number
          played?: number
          points?: number
          rank?: number
          team_id?: string
          team_name?: string
          updated_at?: string | null
          won?: number
          zone?: string | null
        }
        Relationships: []
      }
      ls_sync_dataset_meta: {
        Row: {
          dataset: string
          last_attempt_at: string | null
          last_duration_ms: number | null
          last_error: string | null
          last_record_count: number | null
          last_source: string | null
          last_success_at: string | null
          updated_at: string
        }
        Insert: {
          dataset: string
          last_attempt_at?: string | null
          last_duration_ms?: number | null
          last_error?: string | null
          last_record_count?: number | null
          last_source?: string | null
          last_success_at?: string | null
          updated_at?: string
        }
        Update: {
          dataset?: string
          last_attempt_at?: string | null
          last_duration_ms?: number | null
          last_error?: string | null
          last_record_count?: number | null
          last_source?: string | null
          last_success_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ls_sync_meta: {
        Row: {
          id: string
          last_attempt_at: string | null
          last_error: string | null
          last_source: string | null
          last_success_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          last_source?: string | null
          last_success_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          last_source?: string | null
          last_success_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      match_attendance: {
        Row: {
          attended: boolean
          created_at: string
          id: string
          match_id: string
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean
          created_at?: string
          id?: string
          match_id: string
          note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean
          created_at?: string
          id?: string
          match_id?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_match_attendance_match"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_team_id: string
          away_team_logo: string | null
          away_team_name: string
          competition: string | null
          date: string
          goals_away: number | null
          goals_home: number | null
          home_team_id: string
          home_team_logo: string | null
          home_team_name: string
          id: string
          synced_at: string
          venue: string | null
        }
        Insert: {
          away_team_id: string
          away_team_logo?: string | null
          away_team_name: string
          competition?: string | null
          date: string
          goals_away?: number | null
          goals_home?: number | null
          home_team_id: string
          home_team_logo?: string | null
          home_team_name: string
          id: string
          synced_at?: string
          venue?: string | null
        }
        Update: {
          away_team_id?: string
          away_team_logo?: string | null
          away_team_name?: string
          competition?: string | null
          date?: string
          goals_away?: number | null
          goals_home?: number | null
          home_team_id?: string
          home_team_logo?: string | null
          home_team_name?: string
          id?: string
          synced_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_ls_sync_lock: {
        Args: { p_owner: string; p_ttl_seconds?: number }
        Returns: boolean
      }
      is_username_available: {
        Args: { candidate_username: string }
        Returns: boolean
      }
      release_ls_sync_lock: { Args: { p_owner: string }; Returns: boolean }
      replace_ls_standings: {
        Args: { p_competition_id: number; p_rows: Json }
        Returns: number
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
