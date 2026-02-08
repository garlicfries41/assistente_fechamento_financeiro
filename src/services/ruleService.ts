import { supabase } from '../lib/supabase';
import type { CategoryRule } from '../types';

export const ruleService = {
    async getAll(): Promise<CategoryRule[]> {
        const { data, error } = await (supabase
            .from('category_rules') as any)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => ({
            id: row.id,
            term: row.term,
            category: row.category,
            matchType: row.match_type as 'exact' | 'contains',
            institution: row.institution || undefined,
            type: row.type as 'Entrada' | 'Saída' | undefined,
            autoConfirm: row.auto_confirm,
        }));
    },

    async create(rule: Omit<CategoryRule, 'id'>): Promise<CategoryRule> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await (supabase
            .from('category_rules') as any)
            .insert({
                user_id: user.id,
                term: rule.term,
                category: rule.category,
                match_type: rule.matchType,
                institution: rule.institution || null,
                type: rule.type || null,
                auto_confirm: rule.autoConfirm,
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            term: data.term,
            category: data.category,
            matchType: data.match_type as 'exact' | 'contains',
            institution: data.institution || undefined,
            type: data.type as 'Entrada' | 'Saída' | undefined,
            autoConfirm: data.auto_confirm,
        };
    },

    async delete(id: string): Promise<void> {
        const { error } = await (supabase
            .from('category_rules') as any)
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};
