import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function TransactionForm() {
    const { addTransaction } = useFinanceStore();
    const [isExpanded, setIsExpanded] = useState(false);

    // State
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState<'Entrada' | 'Saída'>('Saída');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;

        addTransaction({
            amount: parseFloat(amount),
            description,
            category, // Optional/Empty
            type,
            date,
            owners: [], // Effectively removed
            isPaid: true,
            source: 'manual',
            institution: 'Manual'
        });

        // Reset
        setAmount('');
        setDescription('');
        setCategory('');
    };

    return (
        <Card className="w-full border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300">
            <CardHeader
                className="flex flex-row items-center justify-between cursor-pointer hover:bg-zinc-800/20"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <CardTitle className="text-xl font-bold">Nova Transação Manual</CardTitle>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
            </CardHeader>
            {isExpanded && (
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Tipo</label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        {...({ variant: type === 'Saída' ? 'default' : 'outline' } as any)}
                                        className={cn("w-full", type === 'Saída' ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "border-zinc-800")}
                                        onClick={() => setType('Saída')}
                                    >
                                        Saída
                                    </Button>
                                    <Button
                                        type="button"
                                        {...({ variant: type === 'Entrada' ? 'default' : 'outline' } as any)}
                                        className={cn("w-full", type === 'Entrada' ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : "border-zinc-800")}
                                        onClick={() => setType('Entrada')}
                                    >
                                        Entrada
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Valor</label>
                                <Input
                                    type="number"
                                    placeholder="0,00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="bg-zinc-950/50 border-zinc-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Descrição</label>
                            <Input
                                placeholder="Descrição"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="bg-zinc-950/50 border-zinc-800"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Categoria (Opcional)</label>
                                <Input
                                    placeholder="Ex: Alimentação"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="bg-zinc-950/50 border-zinc-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Data</label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="bg-zinc-950/50 border-zinc-800"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium mt-4">
                            Adicionar Transação
                        </Button>
                    </form>
                </CardContent>
            )}
        </Card>
    );
}
