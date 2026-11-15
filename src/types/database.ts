/**
 * Supabase database types.
 *
 * Hand-maintained to mirror supabase/migrations. Once your project is linked,
 * you can regenerate with:
 *   npx supabase gen types typescript --linked > src/types/database.ts
 * (then re-export the enum aliases at the bottom of this file).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LayerType = "core_event" | "retelling" | "current_weight" | "reframe";
export type TagCategory =
  | "smell"
  | "sound"
  | "taste"
  | "touch"
  | "sight"
  | "location"
  | "person"
  | "emotion"
  | "object";
export type SessionStatus = "active" | "completed" | "expired" | "abandoned";
export type BearVariant = "honey" | "cocoa" | "chocolate" | "panda" | "polar";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      memories: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          occurred_on: string | null;
          era_label: string | null;
          context_cue: string | null;
          emotional_weight: number;
          emotional_valence: number;
          vividness: number | null;
          feeling: number | null;
          excavation_count: number;
          last_excavated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title: string;
          occurred_on?: string | null;
          era_label?: string | null;
          context_cue?: string | null;
          emotional_weight?: number;
          emotional_valence?: number;
          vividness?: number | null;
          feeling?: number | null;
          excavation_count?: number;
          last_excavated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          occurred_on?: string | null;
          era_label?: string | null;
          context_cue?: string | null;
          emotional_weight?: number;
          emotional_valence?: number;
          vividness?: number | null;
          feeling?: number | null;
          excavation_count?: number;
          last_excavated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memory_layers: {
        Row: {
          id: string;
          memory_id: string;
          user_id: string;
          layer_type: LayerType;
          content: string;
          emotional_weight: number | null;
          emotional_valence: number | null;
          vividness: number | null;
          feeling: number | null;
          version: number;
          excavation_session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          memory_id: string;
          user_id?: string;
          layer_type: LayerType;
          content: string;
          emotional_weight?: number | null;
          emotional_valence?: number | null;
          vividness?: number | null;
          feeling?: number | null;
          version?: number;
          excavation_session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          memory_id?: string;
          user_id?: string;
          layer_type?: LayerType;
          content?: string;
          emotional_weight?: number | null;
          emotional_valence?: number | null;
          vividness?: number | null;
          feeling?: number | null;
          version?: number;
          excavation_session_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_layers_memory_id_fkey";
            columns: ["memory_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memory_layers_excavation_session_id_fkey";
            columns: ["excavation_session_id"];
            isOneToOne: false;
            referencedRelation: "excavation_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      excavation_sessions: {
        Row: {
          id: string;
          memory_id: string;
          user_id: string;
          status: SessionStatus;
          duration_seconds: number;
          started_at: string;
          expires_at: string;
          ended_at: string | null;
          prediction_error_prompt: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          memory_id: string;
          user_id?: string;
          status?: SessionStatus;
          duration_seconds?: number;
          started_at?: string;
          expires_at: string;
          ended_at?: string | null;
          prediction_error_prompt?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          memory_id?: string;
          user_id?: string;
          status?: SessionStatus;
          duration_seconds?: number;
          started_at?: string;
          expires_at?: string;
          ended_at?: string | null;
          prediction_error_prompt?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "excavation_sessions_memory_id_fkey";
            columns: ["memory_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          category: TagCategory;
          label: string;
          avatar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          category: TagCategory;
          label: string;
          avatar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: TagCategory;
          label?: string;
          avatar?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      memory_tags: {
        Row: {
          memory_id: string;
          tag_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          memory_id: string;
          tag_id: string;
          user_id?: string;
          created_at?: string;
        };
        Update: {
          memory_id?: string;
          tag_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_tags_memory_id_fkey";
            columns: ["memory_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memory_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          user_id: string;
          bear_variant: BearVariant;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          bear_variant?: BearVariant;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          bear_variant?: BearVariant;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_memory: {
        Args: {
          p_title: string;
          p_occurred_on: string | null;
          p_era_label: string | null;
          p_context_cue: string | null;
          p_content: string;
          p_vividness: number;
          p_feeling: number;
          p_tags?: Json;
        };
        Returns: string;
      };
      update_recent_memory: {
        Args: {
          p_memory_id: string;
          p_title: string;
          p_occurred_on: string | null;
          p_era_label: string | null;
          p_context_cue: string | null;
          p_content: string;
          p_vividness: number;
          p_feeling: number;
          p_tags?: Json;
        };
        Returns: undefined;
      };
      set_memory_tags: {
        Args: { p_memory_id: string; p_tags: Json };
        Returns: undefined;
      };
      complete_dive: {
        Args: {
          p_session_id: string;
          p_reflection: string;
          p_vividness: number;
          p_feeling: number;
        };
        Returns: string;
      };
      start_excavation: {
        Args: {
          p_memory_id: string;
          p_duration_seconds: number;
          p_prompt: string | null;
        };
        Returns: string;
      };
      complete_excavation: {
        Args: {
          p_session_id: string;
          p_reflection: string;
          p_emotional_weight: number;
          p_emotional_valence: number;
        };
        Returns: string;
      };
      owns_memory: {
        Args: { p_memory_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      layer_type: LayerType;
      tag_category: TagCategory;
      session_status: SessionStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
