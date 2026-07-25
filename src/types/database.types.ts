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
      accommodations: {
        Row: {
          cost_per_night: number
          created_at: string
          id: string
          link: string | null
          location_id: string
          name: string
          rating: number | null
          room: string | null
          type: Database["public"]["Enums"]["accommodation_type"]
          updated_at: string
        }
        Insert: {
          cost_per_night?: number
          created_at?: string
          id?: string
          link?: string | null
          location_id: string
          name: string
          rating?: number | null
          room?: string | null
          type?: Database["public"]["Enums"]["accommodation_type"]
          updated_at?: string
        }
        Update: {
          cost_per_night?: number
          created_at?: string
          id?: string
          link?: string | null
          location_id?: string
          name?: string
          rating?: number | null
          room?: string | null
          type?: Database["public"]["Enums"]["accommodation_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: true
            referencedRelation: "location_cost_summary"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "accommodations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: true
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          activity_date: string | null
          activity_time: string | null
          cost: number
          created_at: string
          duration_minutes: number | null
          id: string
          link: string | null
          location_id: string
          name: string
          updated_at: string
        }
        Insert: {
          activity_date?: string | null
          activity_time?: string | null
          cost?: number
          created_at?: string
          duration_minutes?: number | null
          id?: string
          link?: string | null
          location_id: string
          name: string
          updated_at?: string
        }
        Update: {
          activity_date?: string | null
          activity_time?: string | null
          cost?: number
          created_at?: string
          duration_minutes?: number | null
          id?: string
          link?: string | null
          location_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location_cost_summary"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "activities_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city: string
          country: string | null
          created_at: string
          end_date: string | null
          id: string
          sort_order: number
          start_date: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          sort_order?: number
          start_date?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          sort_order?: number
          start_date?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_budget_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_cost_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_monthly_budget"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          app_role: Database["public"]["Enums"]["app_role"]
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          app_role?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          app_role?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      todos: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_complete: boolean
          title: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_complete?: boolean
          title: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_complete?: boolean
          title?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_budget_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "todos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_cost_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "todos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_monthly_budget"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "todos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      transports: {
        Row: {
          cost: number
          created_at: string
          duration_minutes: number | null
          end_date: string | null
          end_location_id: string | null
          id: string
          name: string
          start_date: string | null
          start_location_id: string | null
          trip_id: string
          type: Database["public"]["Enums"]["transport_type"]
          updated_at: string
        }
        Insert: {
          cost?: number
          created_at?: string
          duration_minutes?: number | null
          end_date?: string | null
          end_location_id?: string | null
          id?: string
          name: string
          start_date?: string | null
          start_location_id?: string | null
          trip_id: string
          type?: Database["public"]["Enums"]["transport_type"]
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          duration_minutes?: number | null
          end_date?: string | null
          end_location_id?: string | null
          id?: string
          name?: string
          start_date?: string | null
          start_location_id?: string | null
          trip_id?: string
          type?: Database["public"]["Enums"]["transport_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transports_end_location_id_fkey"
            columns: ["end_location_id"]
            isOneToOne: false
            referencedRelation: "location_cost_summary"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "transports_end_location_id_fkey"
            columns: ["end_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transports_start_location_id_fkey"
            columns: ["start_location_id"]
            isOneToOne: false
            referencedRelation: "location_cost_summary"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "transports_start_location_id_fkey"
            columns: ["start_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transports_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_budget_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "transports_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_cost_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "transports_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_monthly_budget"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "transports_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transports_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_members: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["member_role"]
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_budget_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_cost_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_monthly_budget"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          buffer_cost: number
          cover_image_url: string | null
          created_at: string
          description: string | null
          destination: string | null
          end_date: string | null
          id: string
          name: string
          owner_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["trip_status"]
          updated_at: string
        }
        Insert: {
          buffer_cost?: number
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          name: string
          owner_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          updated_at?: string
        }
        Update: {
          buffer_cost?: number
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          name?: string
          owner_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      location_cost_summary: {
        Row: {
          accommodation_total: number | null
          activities_total: number | null
          location_id: string | null
          location_total: number | null
          trip_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_budget_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_cost_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_monthly_budget"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_budget_summary: {
        Row: {
          accommodation_cost: number | null
          activities_cost: number | null
          buffer_cost: number | null
          total_cost: number | null
          travel_cost: number | null
          trip_id: string | null
        }
        Relationships: []
      }
      trip_cost_summary: {
        Row: {
          locations_total: number | null
          transport_total: number | null
          trip_id: string | null
          trip_total: number | null
        }
        Relationships: []
      }
      trip_monthly_budget: {
        Row: {
          accommodation_cost: number | null
          activities_cost: number | null
          buffer_cost: number | null
          monthly_total: number | null
          months_to_departure: number | null
          total_cost: number | null
          travel_cost: number | null
          trip_id: string | null
        }
        Relationships: []
      }
      trip_summary: {
        Row: {
          accommodation_cost: number | null
          activities_cost: number | null
          buffer_cost: number | null
          countries: string[] | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          destination: string | null
          end_date: string | null
          id: string | null
          name: string | null
          owner_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["trip_status"] | null
          total_cost: number | null
          travel_cost: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_edit_trip: {
        Args: { p_trip_id: string; uid?: string }
        Returns: boolean
      }
      can_view_trip: {
        Args: { p_trip_id: string; uid?: string }
        Returns: boolean
      }
      is_admin: { Args: { uid?: string }; Returns: boolean }
      is_trip_member: {
        Args: { p_trip_id: string; uid?: string }
        Returns: boolean
      }
      is_trip_owner: {
        Args: { p_trip_id: string; uid?: string }
        Returns: boolean
      }
      location_trip_id: { Args: { p_location_id: string }; Returns: string }
      shares_trip_with: {
        Args: { other_uid: string; uid?: string }
        Returns: boolean
      }
      sync_trip_dates: { Args: { p_trip_id: string }; Returns: undefined }
      trip_is_editable: {
        Args: { p_trip_id: string; uid?: string }
        Returns: boolean
      }
    }
    Enums: {
      accommodation_type:
        | "hotel"
        | "hostel"
        | "airbnb"
        | "guesthouse"
        | "resort"
        | "other"
      app_role: "admin" | "user"
      member_role: "owner" | "member"
      transport_type:
        | "flight"
        | "train"
        | "bus"
        | "car"
        | "ferry"
        | "metro"
        | "other"
      trip_status: "planning" | "active" | "completed" | "archived"
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
      accommodation_type: [
        "hotel",
        "hostel",
        "airbnb",
        "guesthouse",
        "resort",
        "other",
      ],
      app_role: ["admin", "user"],
      member_role: ["owner", "member"],
      transport_type: [
        "flight",
        "train",
        "bus",
        "car",
        "ferry",
        "metro",
        "other",
      ],
      trip_status: ["planning", "active", "completed", "archived"],
    },
  },
} as const
