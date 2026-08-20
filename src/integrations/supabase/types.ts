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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      patients: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          frequencia: Database["public"]["Enums"]["frequencia"]
          id: string
          modalidade: Database["public"]["Enums"]["modalidade"]
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
          user_id: string
          valor_sessao: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          frequencia?: Database["public"]["Enums"]["frequencia"]
          id?: string
          modalidade?: Database["public"]["Enums"]["modalidade"]
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
          valor_sessao?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          frequencia?: Database["public"]["Enums"]["frequencia"]
          id?: string
          modalidade?: Database["public"]["Enums"]["modalidade"]
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
          valor_sessao?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          crp: string | null
          id: string
          meta_horas_semanais: number
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          crp?: string | null
          id: string
          meta_horas_semanais?: number
          nome?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          crp?: string | null
          id?: string
          meta_horas_semanais?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          duracao_min: number
          evolucao: string | null
          id: string
          modalidade: Database["public"]["Enums"]["modalidade"]
          pagamento: Database["public"]["Enums"]["pagamento_status"]
          patient_id: string
          starts_at: string
          status: Database["public"]["Enums"]["sessao_status"]
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          duracao_min?: number
          evolucao?: string | null
          id?: string
          modalidade?: Database["public"]["Enums"]["modalidade"]
          pagamento?: Database["public"]["Enums"]["pagamento_status"]
          patient_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["sessao_status"]
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          created_at?: string
          duracao_min?: number
          evolucao?: string | null
          id?: string
          modalidade?: Database["public"]["Enums"]["modalidade"]
          pagamento?: Database["public"]["Enums"]["pagamento_status"]
          patient_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["sessao_status"]
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      frequencia: "semanal" | "quinzenal" | "mensal" | "pontual"
      modalidade: "presencial" | "remoto"
      pagamento_status: "pendente" | "pago" | "atrasado" | "isento"
      sessao_status: "agendada" | "confirmada" | "realizada" | "cancelada"
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
      frequencia: ["semanal", "quinzenal", "mensal", "pontual"],
      modalidade: ["presencial", "remoto"],
      pagamento_status: ["pendente", "pago", "atrasado", "isento"],
      sessao_status: ["agendada", "confirmada", "realizada", "cancelada"],
    },
  },
} as const
