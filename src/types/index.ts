export interface Owner {
    id: string;
    name: string;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    owners?: string[]; // List of Owner IDs
    isPaid?: boolean;
    notes?: string;
    source?: 'manual' | 'csv' | 'ofx';
    institution?: string;
    isPending?: boolean;
    type: 'Entrada' | 'Saída';
}

export interface CategoryRule {
    id: string;
    term: string;
    category: string;
    autoConfirm: boolean;
    matchType: 'exact' | 'contains';
    institution?: string;
    type?: 'Entrada' | 'Saída';
}

export interface Summary {
    total: number;
    byOwner: Record<string, number>;
    byCategory: Record<string, number>;
}
