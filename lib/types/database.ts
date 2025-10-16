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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      api_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          owner_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          owner_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          owner_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_categories_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_requests: {
        Row: {
          archived_at: string | null
          body_template: Json | null
          category_id: string | null
          created_at: string
          description: string | null
          headers: Json | null
          id: string
          method: string
          name: string
          owner_id: string
          query_params: Json | null
          requires_confirmation: boolean | null
          runtime_prompts: Json | null
          secret_bindings: Json | null
          timeout_ms: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          archived_at?: string | null
          body_template?: Json | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          headers?: Json | null
          id?: string
          method: string
          name: string
          owner_id: string
          query_params?: Json | null
          requires_confirmation?: boolean | null
          runtime_prompts?: Json | null
          secret_bindings?: Json | null
          timeout_ms?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          archived_at?: string | null
          body_template?: Json | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          headers?: Json | null
          id?: string
          method?: string
          name?: string
          owner_id?: string
          query_params?: Json | null
          requires_confirmation?: boolean | null
          runtime_prompts?: Json | null
          secret_bindings?: Json | null
          timeout_ms?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "api_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      request_executions: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          executed_at: string
          final_url: string | null
          http_status: number | null
          id: string
          notes: string | null
          owner_id: string
          parameters_used: Json | null
          request_body: string | null
          request_headers: Json | null
          request_id: string
          response_body: string | null
          response_excerpt: string | null
          response_headers: Json | null
          status: Database["public"]["Enums"]["request_status"]
          storage_path: string | null
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string
          final_url?: string | null
          http_status?: number | null
          id?: string
          notes?: string | null
          owner_id: string
          parameters_used?: Json | null
          request_body?: string | null
          request_headers?: Json | null
          request_id: string
          response_body?: string | null
          response_excerpt?: string | null
          response_headers?: Json | null
          status: Database["public"]["Enums"]["request_status"]
          storage_path?: string | null
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string
          final_url?: string | null
          http_status?: number | null
          id?: string
          notes?: string | null
          owner_id?: string
          parameters_used?: Json | null
          request_body?: string | null
          request_headers?: Json | null
          request_id?: string
          response_body?: string | null
          response_excerpt?: string | null
          response_headers?: Json | null
          status?: Database["public"]["Enums"]["request_status"]
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_executions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_executions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "api_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_parameters: {
        Row: {
          config: Json | null
          default_value: string | null
          id: string
          key: string
          owner_id: string
          request_id: string
          required: boolean
          type: Database["public"]["Enums"]["parameter_type"]
        }
        Insert: {
          config?: Json | null
          default_value?: string | null
          id?: string
          key: string
          owner_id: string
          request_id: string
          required?: boolean
          type?: Database["public"]["Enums"]["parameter_type"]
        }
        Update: {
          config?: Json | null
          default_value?: string | null
          id?: string
          key?: string
          owner_id?: string
          request_id?: string
          required?: boolean
          type?: Database["public"]["Enums"]["parameter_type"]
        }
        Relationships: [
          {
            foreignKeyName: "request_parameters_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_parameters_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "api_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      secret_metadata: {
        Row: {
          alias: string
          created_at: string
          description: string | null
          owner_id: string
          scopes: Json | null
          updated_at: string | null
          vault_id: string | null
        }
        Insert: {
          alias: string
          created_at?: string
          description?: string | null
          owner_id: string
          scopes?: Json | null
          updated_at?: string | null
          vault_id?: string | null
        }
        Update: {
          alias?: string
          created_at?: string
          description?: string | null
          owner_id?: string
          scopes?: Json | null
          updated_at?: string | null
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secret_metadata_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      read_secret: {
        Args: { secret_id: string }
        Returns: string
      }
      store_secret: {
        Args: { secret_name: string; secret_value: string }
        Returns: string
      }
    }
    Enums: {
      parameter_type:
        | "string"
        | "number"
        | "boolean"
        | "select"
        | "multi-select"
      request_status: "success" | "failure" | "error" | "timeout"
      user_role: "owner" | "guest"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      parameter_type: ["string", "number", "boolean", "select", "multi-select"],
      request_status: ["success", "failure", "error", "timeout"],
      user_role: ["owner", "guest"],
    },
  },
} as const
