import { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { CategorySelect } from './CategorySelect';
import { Check, ArrowLeft, Wand2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';

interface CategorizationViewProps {
    onClose: () => void;
}

export function CategorizationView({ onClose }: CategorizationViewProps) {
    const { transactions } = useFinanceStore();
    const pendingTransactions = transactions.filter(t => t.isPending);

    if (pendingTransactions.length === 0) {
        return (
            <div className="text-center py-12">
                <Wand2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-300">Tudo limpo!</h3>
                <p className="text-zinc-500 mb-6">Não há transações pendentes de categorização.</p>
                <Button onClick={onClose}>Voltar para o Dashboard</Button>
            </div>
        );
    }

    return (
        <Card className="w-full border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-yellow-500" />
                    Categorizar Pendentes ({pendingTransactions.length})
                </CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-zinc-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-zinc-900/50">
                            <TableRow>
                                <TableHead className="w-[30%]">Descrição</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Fonte</TableHead>
                                <TableHead className="w-[35%]">Categoria & Regra</TableHead>
                                <TableHead className="w-[10%] text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingTransactions.map(t => (
                                <CategorizationRow key={t.id} transaction={t} />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function CategorizationRow({ transaction }: { transaction: any }) {
    const { updateTransaction, addRule } = useFinanceStore();
    const [category, setCategory] = useState(transaction.category || '');
    const [createRule, setCreateRule] = useState(false);

    const handleConfirm = () => {
        if (!category) return;

        updateTransaction(transaction.id, {
            category,
            isPending: false
        });

        if (createRule) {
            addRule({
                term: transaction.description,
                category,
                autoConfirm: true,
                matchType: 'exact', // "toda vez que eu marcar a caixa, será criada uma regra de IGUAL"
                type: transaction.type
            });
        }
    };

    return (
        <TableRow className="hover:bg-zinc-900/30">
            <TableCell className="font-medium">
                <div className="truncate max-w-[200px] md:max-w-[300px]" title={transaction.description}>
                    {transaction.description}
                </div>
            </TableCell>
            <TableCell>
                <span className={cn(
                    "font-bold",
                    transaction.type === 'Entrada' ? "text-green-500" : "text-red-500"
                )}>
                    {transaction.type === 'Saída' ? '-' : ''}
                    {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </TableCell>
            <TableCell className="text-zinc-500 text-sm">
                {transaction.institution || transaction.source}
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-2">
                    <CategorySelect
                        value={category}
                        onChange={setCategory}
                        className="h-8 bg-zinc-900 border-zinc-700"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirm();
                        }}
                    />
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={createRule}
                            onChange={e => setCreateRule(e.target.checked)}
                            className="w-3 h-3 rounded border-zinc-600 bg-zinc-800 text-primary focus:ring-primary accent-primary"
                        />
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Regra Automática (Igual)</span>
                    </label>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <Button
                    onClick={handleConfirm}
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                    disabled={!category}
                >
                    <Check className="w-4 h-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
