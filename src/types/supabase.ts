export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    description: string
                    amount: number
                    type: 'Entrada' | 'Saída'
                    category: string | null
                    source: string | null
                    institution: string | null
                    is_pending: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    description: string
                    amount: number
                    type: 'Entrada' | 'Saída'
                    category?: string | null
                    source?: string | null
                    institution?: string | null
                    is_pending?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    description?: string
                    amount?: number
                    type?: 'Entrada' | 'Saída'
                    category?: string | null
                    source?: string | null
                    institution?: string | null
                    is_pending?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            category_rules: {
                Row: {
                    id: string
                    user_id: string
                    term: string
                    category: string
                    match_type: 'exact' | 'contains'
                    institution: string | null
                    type: 'Entrada' | 'Saída' | null
                    auto_confirm: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    term: string
                    category: string
                    match_type: 'exact' | 'contains'
                    institution?: string | null
                    type?: 'Entrada' | 'Saída' | null
                    auto_confirm?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    term?: string
                    category?: string
                    match_type?: 'exact' | 'contains'
                    institution?: string | null
                    type?: 'Entrada' | 'Saída' | null
                    auto_confirm?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            user_categories: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            seed_default_categories: {
                Args: Record<PropertyKey, never>
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
