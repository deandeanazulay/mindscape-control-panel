export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          content_json: Json
          created_at: string
          framework: string
          id: string
          linked_goal_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_json?: Json
          created_at?: string
          framework: string
          id?: string
          linked_goal_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_json?: Json
          created_at?: string
          framework?: string
          id?: string
          linked_goal_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          id: string
          intensity: number | null
          next_action: string | null
          review_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          why: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          intensity?: number | null
          next_action?: string | null
          review_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          why?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          intensity?: number | null
          next_action?: string | null
          review_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          why?: string | null
        }
        Relationships: []
      }
      ideas: {
        Row: {
          content: string
          created_at: string
          id: string
          linked_goal_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          linked_goal_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          linked_goal_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moments: {
        Row: {
          content: string | null
          created_at: string
          folder: string | null
          id: string
          linked_goal_id: string | null
          state: string | null
          storage_path: string | null
          tags: string[]
          type: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          folder?: string | null
          id?: string
          linked_goal_id?: string | null
          state?: string | null
          storage_path?: string | null
          tags?: string[]
          type: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          folder?: string | null
          id?: string
          linked_goal_id?: string | null
          state?: string | null
          storage_path?: string | null
          tags?: string[]
          type?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "moments_linked_goal_id_fkey"
            columns: ["linked_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          gesture_type: string | null
          id: string
          onboarded_at: string | null
          role: string
          theme: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          gesture_type?: string | null
          id: string
          onboarded_at?: string | null
          role?: string
          theme?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          gesture_type?: string | null
          id?: string
          onboarded_at?: string | null
          role?: string
          theme?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      sleep_sessions: {
        Row: {
          ambience_sound_id: string | null
          completed: boolean
          created_at: string
          end_at: string | null
          id: string
          start_at: string
          track_id: string | null
          track_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ambience_sound_id?: string | null
          completed?: boolean
          created_at?: string
          end_at?: string | null
          id?: string
          start_at?: string
          track_id?: string | null
          track_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ambience_sound_id?: string | null
          completed?: boolean
          created_at?: string
          end_at?: string | null
          id?: string
          start_at?: string
          track_id?: string | null
          track_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_sessions_ambience_sound_id_fkey"
            columns: ["ambience_sound_id"]
            isOneToOne: false
            referencedRelation: "sounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sleep_sessions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      sounds: {
        Row: {
          audio_url: string
          category: string | null
          created_at: string
          id: string
          loop_end_ms: number | null
          loop_start_ms: number | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          category?: string | null
          created_at?: string
          id?: string
          loop_end_ms?: number | null
          loop_start_ms?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          category?: string | null
          created_at?: string
          id?: string
          loop_end_ms?: number | null
          loop_start_ms?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          audio_url: string
          created_at: string
          description: string | null
          downloadable: boolean
          duration_seconds: number | null
          id: string
          kind: Database["public"]["Enums"]["track_kind"]
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          description?: string | null
          downloadable?: boolean
          duration_seconds?: number | null
          id?: string
          kind: Database["public"]["Enums"]["track_kind"]
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          description?: string | null
          downloadable?: boolean
          duration_seconds?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["track_kind"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { uid: string }
        Returns: boolean
      }
    }
    Enums: {
      track_kind: "install" | "maintain" | "nap" | "anchor" | "morning"
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
    Enums: {
      track_kind: ["install", "maintain", "nap", "anchor", "morning"],
    },
  },
} as const
