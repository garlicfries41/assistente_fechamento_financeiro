import { create } from 'zustand';
import type { Transaction, CategoryRule } from '../types';
import { equalsInsensitive, containsInsensitive } from '../lib/stringUtils';
import { transactionService } from '../services/transactionService';
import { ruleService } from '../services/ruleService';
import { categoryService } from '../services/categoryService';
import { supabase } from '../lib/supabase';

interface FinanceState {
    transactions: Transaction[];
    rules: CategoryRule[];
    categories: string[];
    loading: boolean;
    error: string | null;

    // Actions
    loadData: () => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    removeTransaction: (id: string) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
    importTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
    clearTransactions: () => Promise<void>;

    addRule: (rule: Omit<CategoryRule, 'id'>) => Promise<void>;
    removeRule: (id: string) => Promise<void>;

    addCategory: (category: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    transactions: [],
    rules: [],
    categories: [],
    loading: false,
    error: null,

    loadData: async () => {
        set({ loading: true, error: null });
        try {
            const [transactions, rules, categories] = await Promise.all([
                transactionService.getAll(),
                ruleService.getAll(),
                categoryService.getAll(),
            ]);

            // Seed default categories if empty
            if (categories.length === 0) {
                await categoryService.seedDefaults();
                const newCategories = await categoryService.getAll();
                set({ transactions, rules, categories: newCategories, loading: false });
            } else {
                set({ transactions, rules, categories, loading: false });
            }

            // Subscribe to real-time changes
            supabase
                .channel('db-changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'transactions' },
                    () => {
                        transactionService.getAll().then(transactions => {
                            set({ transactions });
                        });
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'category_rules' },
                    () => {
                        ruleService.getAll().then(rules => {
                            set({ rules });
                        });
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'user_categories' },
                    () => {
                        categoryService.getAll().then(categories => {
                            set({ categories });
                        });
                    }
                )
                .subscribe();

            // Cleanup subscription on unmount
            // Zustand actions can't return cleanup functions directly in this way
            // We'll store the subscription in a variable if needed or rely on app unmount
            // For now, just let it run
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    addTransaction: async (transaction) => {
        set({ loading: true, error: null });
        try {
            const { rules } = get();

            // Apply rule matching
            const matchRule = (r: CategoryRule, t: Omit<Transaction, 'id'>) => {
                if (r.institution && t.institution) {
                    if (!containsInsensitive(t.institution, r.institution)) {
                        return false;
                    }
                }

                if (r.matchType === 'exact') {
                    return equalsInsensitive(t.description, r.term);
                }
                return containsInsensitive(t.description, r.term);
            };

            const matchedRule = rules.find(r =>
                matchRule(r, transaction) &&
                (!r.type || r.type === transaction.type)
            );

            const finalTransaction = matchedRule
                ? { ...transaction, category: matchedRule.category, isPending: !matchedRule.autoConfirm }
                : { ...transaction, isPending: true };

            const newTransaction = await transactionService.create(finalTransaction);
            set(state => ({
                transactions: [newTransaction, ...state.transactions],
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    removeTransaction: async (id) => {
        set({ loading: true, error: null });
        try {
            await transactionService.delete(id);
            set(state => ({
                transactions: state.transactions.filter(t => t.id !== id),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    updateTransaction: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const updated = await transactionService.update(id, updates);
            set(state => ({
                transactions: state.transactions.map(t => t.id === id ? updated : t),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    importTransactions: async (newTransactions) => {
        set({ loading: true, error: null });
        try {
            const { rules } = get();

            const matchRule = (r: CategoryRule, t: Omit<Transaction, 'id'>) => {
                if (r.institution && t.institution) {
                    if (!containsInsensitive(t.institution, r.institution)) {
                        return false;
                    }
                }

                if (r.matchType === 'exact') {
                    return equalsInsensitive(t.description, r.term);
                }
                return containsInsensitive(t.description, r.term);
            };

            const processedTransactions = newTransactions.map(t => {
                const matchedRule = rules.find(r =>
                    matchRule(r, t) &&
                    (!r.type || r.type === t.type)
                );

                return matchedRule
                    ? { ...t, category: matchedRule.category, isPending: !matchedRule.autoConfirm }
                    : { ...t, isPending: true };
            });

            const created = await transactionService.bulkCreate(processedTransactions);
            set(state => ({
                transactions: [...created, ...state.transactions],
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    clearTransactions: async () => {
        set({ loading: true, error: null });
        try {
            await transactionService.deleteAll();
            set({ transactions: [], loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    addRule: async (rule) => {
        set({ loading: true, error: null });
        try {
            const newRule = await ruleService.create(rule);
            set(state => ({
                rules: [...state.rules, newRule],
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    removeRule: async (id) => {
        set({ loading: true, error: null });
        try {
            await ruleService.delete(id);
            set(state => ({
                rules: state.rules.filter(r => r.id !== id),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    addCategory: async (category) => {
        set({ loading: true, error: null });
        try {
            await categoryService.create(category);
            set(state => ({
                categories: [...state.categories, category].sort(),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
}));
