import { supabase } from '../lib/supabase';

export const categoryService = {
    async getAll(): Promise<string[]> {
        const { data, error } = await (supabase
            .from('user_categories') as any)
            .select('name')
            .order('name', { ascending: true })


        if (error) throw error;

        return (data || []).map((row: any) => row.name);
    },

    async create(name: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await (supabase
            .from('user_categories') as any)
            .insert({
                user_id: user.id,
                name,
            });

        if (error) {
            // Ignore duplicate errors (unique constraint)
            if (!error.message.includes('duplicate')) {
                throw error;
            }
        }
    },

    async seedDefaults(): Promise<void> {
        const { error } = await supabase.rpc('seed_default_categories');
        if (error) throw error;
    },
};
