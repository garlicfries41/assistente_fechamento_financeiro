import { useFinanceStore } from '../store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Trash2, Download, CheckCircle, Trash } from 'lucide-react';
import * as Papa from 'papaparse';

export function TransactionList() {
    const { transactions, removeTransaction, clearTransactions } = useFinanceStore();

    // const getOwnerName = (id: string) => owners.find(o => o.id === id)?.name || 'Desconhecido';

    const handleExport = () => {
        if (transactions.length === 0) return;

        // Flatten data for CSV
        const data = transactions.map(t => ({
            Data: new Date(t.date).toLocaleDateString('pt-BR'),
            Tipo: t.type || 'Saída', // Default for legacy data
            Descrição: t.description,
            Valor: t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).replace('.', ''), // Force comma
            Categoria: '', // Blank as requested
            Fonte: t.institution ? `${t.institution}` : t.source || 'Manual',
            // Owners removed
        }));

        const csv = Papa.unparse(data, { quotes: true, delimiter: ';' }); // Use semicolon for Excel BR compatibility

        // Trigger download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (transactions.length === 0) {
        return (
            <Card className="w-full border-dashed border-zinc-800 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center p-8 text-zinc-500">
                    <p>Nenhuma transação lançada.</p>
                </CardContent>
            </Card>
        );
    }

    // Sort by date desc
    const sortedTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

    return (
        <Card className="w-full border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Histórico de Gastos</CardTitle>
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
                                clearTransactions();
                            }
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        <Trash className="w-4 h-4" />
                        Limpar Histórico
                    </Button>
                    <Button onClick={handleExport} {...({ variant: "outline", size: "sm" } as any)} className="gap-2">
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left text-xs font-medium text-zinc-400">
                                <th className="pb-3 pl-2">Data</th>
                                <th className="pb-3">Descrição</th>
                                <th className="pb-3">Tipo</th>
                                <th className="pb-3">Fonte</th>
                                <th className="pb-3 text-right">Valor</th>
                                <th className="pb-3 text-center w-[60px]">Status</th>
                                <th className="pb-3 w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {sortedTransactions.map((t) => (
                                <tr key={t.id} className="group border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                                    <td className="py-3 pl-2 font-mono text-zinc-400">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 font-medium max-w-[200px] truncate" title={t.description}>
                                        {t.description}
                                    </td>
                                    <td className="py-3">
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                            t.type === 'Entrada' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                                "bg-red-500/10 text-red-500 border border-red-500/20"
                                        )}>
                                            {t.type || (t.amount > 0 ? 'Entrada' : 'Saída') /* Fallback */}
                                        </span>
                                    </td>
                                    <td className="py-3 text-xs text-zinc-500">
                                        {t.institution || t.source || 'Manual'}
                                    </td>
                                    <td className={cn(
                                        "py-3 text-right font-medium",
                                        t.type === 'Entrada' ? "text-green-400" : "text-white"
                                    )}>
                                        R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 text-center">
                                        {!t.isPending && (
                                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                                        )}
                                    </td>
                                    <td className="py-3 text-right">
                                        <Button
                                            {...({ variant: "ghost", size: "icon" } as any)}
                                            className="h-8 w-8 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeTransaction(t.id)}
                                            {...({} as any)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

// Utility for cn needed if not imported or create separated
import { cn } from '../lib/utils';
