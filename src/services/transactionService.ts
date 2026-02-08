import { supabase } from '../lib/supabase';
import type { Transaction } from '../types';

export const transactionService = {
    async getAll(): Promise<Transaction[]> {
        const { data, error } = await (supabase
            .from('transactions') as any)
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => ({
            id: row.id,
            date: row.date,
            description: row.description,
            amount: row.amount,
            type: row.type as 'Entrada' | 'Saída',
            category: row.category || undefined,
            institution: row.institution || undefined,
            isPending: row.is_pending,
        }));
    },

    async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await (supabase
            .from('transactions') as any)
            .insert({
                user_id: user.id,
                date: transaction.date,
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category || null,
                source: transaction.source || null,
                institution: transaction.institution || null,
                is_pending: transaction.isPending,
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            date: data.date,
            description: data.description,
            amount: data.amount,
            type: data.type as 'Entrada' | 'Saída',
            category: data.category || undefined,
            source: data.source || undefined,
            institution: data.institution || undefined,
            isPending: data.is_pending,
        };
    },

    async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
        const { data, error } = await (supabase
            .from('transactions') as any)
            .update({
                ...(updates.date && { date: updates.date }),
                ...(updates.description && { description: updates.description }),
                ...(updates.amount !== undefined && { amount: updates.amount }),
                ...(updates.type && { type: updates.type }),
                ...(updates.category !== undefined && { category: updates.category || null }),
                ...(updates.source !== undefined && { source: updates.source || null }),
                ...(updates.institution !== undefined && { institution: updates.institution || null }),
                ...(updates.isPending !== undefined && { is_pending: updates.isPending }),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            date: data.date,
            description: data.description,
            amount: data.amount,
            type: data.type as 'Entrada' | 'Saída',
            category: data.category || undefined,
            source: data.source || undefined,
            institution: data.institution || undefined,
            isPending: data.is_pending,
        };
    },

    async delete(id: string): Promise<void> {
        const { error } = await (supabase
            .from('transactions') as any)
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async deleteAll(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await (supabase
            .from('transactions') as any)
            .delete()
            .eq('user_id', user.id);

        if (error) throw error;
    },

    async bulkCreate(transactions: Omit<Transaction, 'id'>[]): Promise<Transaction[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await (supabase
            .from('transactions') as any)
            .insert(
                transactions.map(t => ({
                    user_id: user.id,
                    date: t.date,
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    category: t.category || null,
                    source: t.source || null,
                    institution: t.institution || null,
                    is_pending: t.isPending,
                }))
            )
            .select();

        if (error) throw error;

        return (data || []).map((row: any) => ({
            id: row.id,
            date: row.date,
            description: row.description,
            amount: row.amount,
            type: row.type as 'Entrada' | 'Saída',
            category: row.category || undefined,
            institution: row.institution || undefined,
            isPending: row.is_pending,
        }));
    },
};
