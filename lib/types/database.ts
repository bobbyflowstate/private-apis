export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "owner" | "guest";
          display_name: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          role?: "owner" | "guest";
          display_name?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          role?: "owner" | "guest";
          display_name?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      api_categories: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          icon: string | null;
          sort_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          icon?: string | null;
          sort_order?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          icon?: string | null;
          sort_order?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      api_requests: {
        Row: {
          id: string;
          owner_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          method: string;
          url: string;
          headers: Json | null;
          query_params: Json | null;
          body_template: Json | string | null;
          timeout_ms: number | null;
          secret_bindings: Json | null;
          requires_confirmation: boolean;
          created_at: string;
          updated_at: string | null;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          method: string;
          url: string;
          headers?: Json | null;
          query_params?: Json | null;
          body_template?: Json | string | null;
          timeout_ms?: number | null;
          secret_bindings?: Json | null;
          requires_confirmation?: boolean;
          created_at?: string;
          updated_at?: string | null;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          method?: string;
          url?: string;
          headers?: Json | null;
          query_params?: Json | null;
          body_template?: Json | string | null;
          timeout_ms?: number | null;
          secret_bindings?: Json | null;
          requires_confirmation?: boolean;
          created_at?: string;
          updated_at?: string | null;
          archived_at?: string | null;
        };
        Relationships: [];
      };
      request_parameters: {
        Row: {
          id: string;
          request_id: string;
          key: string;
          type: "string" | "number" | "boolean" | "select" | "multi-select";
          required: boolean;
          default_value: string | null;
          config: Json | null;
        };
        Insert: {
          id?: string;
          request_id: string;
          key: string;
          type: "string" | "number" | "boolean" | "select" | "multi-select";
          required?: boolean;
          default_value?: string | null;
          config?: Json | null;
        };
        Update: {
          id?: string;
          request_id?: string;
          key?: string;
          type?: "string" | "number" | "boolean" | "select" | "multi-select";
          required?: boolean;
          default_value?: string | null;
          config?: Json | null;
        };
        Relationships: [];
      };
      secret_metadata: {
        Row: {
          alias: string;
          owner_id: string;
          description: string | null;
          scopes: Json | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          alias: string;
          owner_id: string;
          description?: string | null;
          scopes?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          alias?: string;
          owner_id?: string;
          description?: string | null;
          scopes?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      request_executions: {
        Row: {
          id: string;
          request_id: string;
          owner_id: string;
          status: "success" | "failure" | "error" | "timeout";
          http_status: number | null;
          duration_ms: number | null;
          response_excerpt: string | null;
          error_message: string | null;
          executed_at: string;
          parameters_used: Json | null;
          notes: string | null;
          storage_path: string | null;
        };
        Insert: {
          id?: string;
          request_id: string;
          owner_id: string;
          status: "success" | "failure" | "error" | "timeout";
          http_status?: number | null;
          duration_ms?: number | null;
          response_excerpt?: string | null;
          error_message?: string | null;
          executed_at?: string;
          parameters_used?: Json | null;
          notes?: string | null;
          storage_path?: string | null;
        };
        Update: {
          id?: string;
          request_id?: string;
          owner_id?: string;
          status?: "success" | "failure" | "error" | "timeout";
          http_status?: number | null;
          duration_ms?: number | null;
          response_excerpt?: string | null;
          error_message?: string | null;
          executed_at?: string;
          parameters_used?: Json | null;
          notes?: string | null;
          storage_path?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
