import { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { CategorySelect } from './CategorySelect';
import { Trash2, Plus, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';

// Minimal Select implementation if UI lib missing
function SimpleSelect({ value, onChange, options }: any) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {/* Arrow icon could go here */}
        </div>
    )
}

export function RulesManager() {
    const { rules, addRule, removeRule } = useFinanceStore();
    const [newTerm, setNewTerm] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newInstitution, setNewInstitution] = useState('');
    const [matchType, setMatchType] = useState<'exact' | 'contains'>('contains');
    const [ruleType, setRuleType] = useState<'Entrada' | 'Saída'>('Saída');

    const handleAdd = () => {
        if (!newTerm || !newCategory) return;
        addRule({
            term: newTerm,
            category: newCategory,
            matchType,
            type: ruleType,
            institution: newInstitution || undefined,
            autoConfirm: true
        });
        setNewTerm('');
        setNewCategory('');
        setNewInstitution('');
    };

    return (
        <Card className="w-full border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Gerenciador de Regras
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">Descrição</label>
                        <Input
                            placeholder="Ex: Uber"
                            value={newTerm}
                            onChange={e => setNewTerm(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">Instituição</label>
                        <SimpleSelect
                            value={newInstitution}
                            onChange={setNewInstitution}
                            options={[
                                { value: '', label: 'Todas' },
                                { value: 'Nubank', label: 'Nubank' },
                                { value: 'Inter', label: 'Banco Inter' },
                                { value: 'Mercado Pago', label: 'Mercado Pago' },
                                { value: 'Manual', label: 'Manual' }
                            ]}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">Comparação</label>
                        <SimpleSelect
                            value={matchType}
                            onChange={setMatchType}
                            options={[
                                { value: 'contains', label: 'Contém' },
                                { value: 'exact', label: 'É Igual a' }
                            ]}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">Tipo</label>
                        <SimpleSelect
                            value={ruleType}
                            onChange={setRuleType}
                            options={[
                                { value: 'Saída', label: 'Saída (-)' },
                                { value: 'Entrada', label: 'Entrada (+)' }
                            ]}
                        />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">Então categorizar como...</label>
                        <CategorySelect
                            value={newCategory}
                            onChange={setNewCategory}
                            placeholder="Selecione..."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Button onClick={handleAdd} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                        </Button>
                    </div>
                </div>

                {/* List */}
                <div className="rounded-md border border-zinc-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-zinc-900/50">
                            <TableRow>
                                <TableHead>Termo</TableHead>
                                <TableHead>Instituição</TableHead>
                                <TableHead>Lógica</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                                        Nenhuma regra cadastrada.
                                    </TableCell>
                                </TableRow>
                            )}
                            {rules.map(rule => (
                                <TableRow key={rule.id} className="hover:bg-zinc-900/30">
                                    <TableCell className="font-mono text-zinc-300">{rule.term}</TableCell>
                                    <TableCell className="text-zinc-400 text-sm">{rule.institution || '-'}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "text-xs px-2 py-1 rounded-full font-medium",
                                            rule.matchType === 'exact' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                                        )}>
                                            {rule.matchType === 'exact' ? 'Igual' : 'Contém'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{rule.category}</TableCell>
                                    <TableCell>
                                        <span className={cn("text-xs", rule.type === 'Entrada' ? "text-green-500" : "text-red-500")}>
                                            {rule.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeRule(rule.id)}
                                            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
