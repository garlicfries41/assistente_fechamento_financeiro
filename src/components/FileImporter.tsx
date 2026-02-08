import React, { useRef, useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import * as Papa from 'papaparse';
import { XMLParser } from 'fast-xml-parser';
import type { Transaction } from '../types';
import { cn } from '../lib/utils';

// Local type for dropdown
type InstitutionOption = 'Nubank' | 'Mercado Pago' | 'Inter' | 'Outros';
type AccountType = 'Conta Corrente' | 'Cartão de Crédito';

export function FileImporter() {
    const { importTransactions } = useFinanceStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // User selections
    const [institution, setInstitution] = useState<InstitutionOption>('Outros');
    const [accountType, setAccountType] = useState<AccountType>('Conta Corrente');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('processing');
        setMessage(`Processando ${file.name}...`);

        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const content = event.target?.result as string;
                let newTransactions: Omit<Transaction, 'id'>[] = [];

                if (file.name.endsWith('.csv')) {
                    newTransactions = parseCSV(content);
                } else if (file.name.endsWith('.ofx') || file.name.endsWith('.xml')) {
                    newTransactions = parseOFX(content);
                } else {
                    throw new Error('Formato não suportado. Use CSV ou OFX.');
                }

                if (newTransactions.length === 0) {
                    throw new Error('Nenhuma transação encontrada. Verifique se o arquivo segue o formato do banco.');
                }

                importTransactions(newTransactions);
                setStatus('success');
                setMessage(`${newTransactions.length} transações importadas!`);

                if (fileInputRef.current) fileInputRef.current.value = '';
                setTimeout(() => {
                    setStatus('idle');
                    setMessage('');
                }, 3000);

            } catch (error) {
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'Erro ao processar arquivo.');
            }
        };

        reader.onerror = () => {
            setStatus('error');
            setMessage('Erro ao ler o arquivo.');
        };

        reader.readAsText(file);
    };

    const parseCSV = (content: string): Omit<Transaction, 'id'>[] => {
        const lines = content.split(/\r\n|\n/);
        let headerRowIndex = 0;
        let hasFoundHeader = false;

        // Headers detection
        const possibleHeaders = ['date', 'data', 'dt', 'release_date', 'posted', 'title', 'description', 'data lançamento'];

        for (let i = 0; i < Math.min(lines.length, 20); i++) {
            const line = lines[i].toLowerCase();
            if (possibleHeaders.some(h => line.includes(h))) {
                headerRowIndex = i;
                hasFoundHeader = true;
                break;
            }
        }

        const contentToParse = hasFoundHeader ? lines.slice(headerRowIndex).join('\n') : content;
        const results = Papa.parse(contentToParse, { header: true, skipEmptyLines: true });

        return results.data.map((row: any) => {
            const normalizedRow: Record<string, string> = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim()] = row[key];
            });

            // Field Mapping
            let dateStr = normalizedRow['data lançamento'] || normalizedRow['release_date'] || normalizedRow['date'] || normalizedRow['data'] || normalizedRow['dt'];

            // Inter specific: Uses 'histórico' and 'descrição'. 
            // 'Descrição' seems richer (e.g. name of person), 'Histórico' is type (Pix enviado).
            // Let's create a composite description if both exist.
            let description = normalizedRow['descrição'] || normalizedRow['description'] || normalizedRow['memo'] || normalizedRow['title'] || normalizedRow['transaction_type'] || 'Importado';

            if (institution === 'Inter' && normalizedRow['histórico']) {
                // Format: "Pix enviado - Nome da Pessoa"
                if (description && description !== 'Importado') {
                    description = `${normalizedRow['histórico']} - ${description}`;
                } else {
                    description = normalizedRow['histórico'];
                }
            }

            let amountStr = normalizedRow['valor'] || normalizedRow['amount'] || normalizedRow['transaction_net_amount'];

            // Fallbacks
            if (normalizedRow['reference_id'] && description === 'Importado') {
                description = `Ref: ${normalizedRow['reference_id']}`;
            }

            if (!dateStr || !amountStr) return null;

            // Date Parsing Logic
            let formattedDate = new Date().toISOString().split('T')[0];

            // Try DD/MM/YYYY or DD-MM-YYYY (Common in BR)
            // Regex for DD/MM/YYYY or DD-MM-YYYY
            const brDateMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
            if (brDateMatch) {
                const day = brDateMatch[1].padStart(2, '0');
                const month = brDateMatch[2].padStart(2, '0');
                const year = brDateMatch[3];
                formattedDate = `${year}-${month}-${day}`;
            } else {
                // Try Mercado Pago YYYY-MM-DD-HH... or standard ISO
                try {
                    const dateObj = new Date(dateStr);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toISOString().split('T')[0];
                    }
                } catch (e) {
                    // Keep default or fail?
                }
            }

            // Amount Normalization
            // Handle Brazilian format 1.000,00 -> 1000.00
            // If comma exists and dot doesn't, or comma is after dot -> replace strictly.
            // Simple robust approach for BR CSVs: Remove dots (thousands), replace comma with dot.
            // But beware of international formats.
            // Nubank CSV usually: "1.234,56" or "1234.56" depending on locale.
            // Let's assume input might be mixed. 
            // Better heuristic: replace all non-numeric chars except last comma/dot.

            // For now, let's stick to simple replacement which usually works for these banks in BR.
            let normalizedAmountStr = amountStr;
            if (amountStr.includes(',') && !amountStr.includes('.')) {
                // 100,00 -> 100.00
                normalizedAmountStr = amountStr.replace(',', '.');
            } else if (amountStr.includes('.') && amountStr.includes(',')) {
                // 1.000,00 -> 1000.00
                normalizedAmountStr = amountStr.replace('.', '').replace(',', '.');
            }

            let amount = parseFloat(normalizedAmountStr.replace(/[^\d.-]/g, ''));

            // --- LOGIC PER INSTITUTION & TYPE ---
            let type: 'Entrada' | 'Saída' = 'Saída'; // Default
            let category = ''; // Default blank as requested

            // Determine Type based on Sign or Description
            if (accountType === 'Cartão de Crédito') {
                // Credit Card: usually positive = expense.
                amount = Math.abs(amount);
                type = 'Saída';
                // Maybe "Pagamento de fatura" is an internal flow, but let's treat as Saída for now or user can ignore.
                // If negative in CC, it's usually a refund -> Entrada?
                if (parseFloat(normalizedAmountStr) < 0) type = 'Entrada';
            } else {
                // Conta Corrente
                // Negative = Saída, Positive = Entrada
                if (amount < 0) {
                    type = 'Saída';
                } else {
                    type = 'Entrada';
                }
                amount = Math.abs(amount); // Store absolute value
            }

            // Nubank Specifics
            if (institution === 'Nubank') {
                const lowerDesc = description.toLowerCase();

                // Transfer detection
                if (lowerDesc.includes('transferência recebida')) {
                    type = 'Entrada';
                } else if (lowerDesc.includes('transferência enviada')) {
                    type = 'Saída';
                }

                // Fix description if needed (Nubank sometimes has messy descriptions, but usually acceptable)
            }

            let finalInstitution: string = institution;
            if (accountType === 'Cartão de Crédito') {
                finalInstitution = `${institution} Cred`;
            }

            // Explicitly cast to ensure strict type matching
            const transaction: Omit<Transaction, 'id'> = {
                date: formattedDate,
                description,
                amount: amount,
                category,
                type,
                owners: [] as string[],
                isPaid: true,
                source: 'csv',
                institution: finalInstitution as any,
                notes: `Original Amount: ${amountStr}`
            };
            return transaction;
        }).filter((t): t is Omit<Transaction, 'id'> => {
            return t !== null && typeof t.amount === 'number' && !isNaN(t.amount) && t.amount !== 0;
        });
    };

    const parseOFX = (content: string): Omit<Transaction, 'id'>[] => {
        const parser = new XMLParser({ ignoreAttributes: false });
        const jsonObj = parser.parse(content);
        try {
            const bankMsgs = jsonObj.OFX?.BANKMSGSRSV1 || jsonObj.OFX?.bankmsgsrsv1;
            const stmtTrnRs = bankMsgs?.STMTTRNRS || bankMsgs?.stmttrnrs;
            const stmtRs = stmtTrnRs?.STMTRS || stmtTrnRs?.stmtrs;
            const bankTranList = stmtRs?.BANKTRANLIST || stmtRs?.banktranlist;
            let transactions = bankTranList?.STMTTRN || bankTranList?.stmttrn;

            if (!transactions) return [];
            if (!Array.isArray(transactions)) transactions = [transactions];

            return transactions.map((t: any) => {
                const amount = parseFloat(t.TRNAMT || t.trnamt);
                const dateRaw = t.DTPOSTED || t.dtposted;
                const description = t.MEMO || t.memo || t.NAME || t.name;

                let type: 'Entrada' | 'Saída' = amount > 0 ? 'Entrada' : 'Saída';

                // If CC, append Cred
                // OFX often implies bank account, but if it comes from CC, we might need a flag.
                // Assuming OFX upload respects the dropdown choice:
                let finalInstitution: string = institution;
                if (accountType === 'Cartão de Crédito') {
                    finalInstitution = `${institution} Cred`;
                }

                const transaction: Omit<Transaction, 'id'> = {
                    date: formatDateOFX(dateRaw),
                    description,
                    amount: Math.abs(amount),
                    category: '',
                    type,
                    owners: [] as string[],
                    isPaid: true,
                    source: 'ofx',
                    institution: finalInstitution as any
                };
                return transaction;
            });
        } catch (e) {
            console.error('OFX Parse Error', e);
            return [];
        }
    };

    const formatDateOFX = (dateStr: string) => {
        if (!dateStr || dateStr.length < 8) return new Date().toISOString().split('T')[0];
        const y = dateStr.substring(0, 4);
        const m = dateStr.substring(4, 6);
        const d = dateStr.substring(6, 8);
        return `${y}-${m}-${d}`;
    };

    return (
        <Card className="w-full border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Importar Extrato
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">Instituição</label>
                        <select
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value as InstitutionOption)}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                            <option value="Nubank">Nubank</option>
                            <option value="Mercado Pago">Mercado Pago</option>
                            <option value="Inter">Inter</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">Tipo de Conta</label>
                        <select
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value as AccountType)}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                            <option value="Conta Corrente">Conta Corrente / Débito</option>
                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                        </select>
                    </div>
                </div>

                <div
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                        status === 'processing' ? "border-primary/50 bg-primary/5" : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900",
                        status === 'success' ? "border-green-500/50 bg-green-500/5" : "",
                        status === 'error' ? "border-red-500/50 bg-red-500/5" : ""
                    )}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv,.ofx,.xml"
                        onChange={handleFileUpload}
                    />

                    <div className="flex flex-col items-center justify-center gap-2">
                        {status === 'idle' && (
                            <>
                                <FileText className="w-10 h-10 text-zinc-600 mb-2" />
                                <p className="text-zinc-400 font-medium">Clique para selecionar CSV ou OFX</p>
                                <p className="text-xs text-zinc-600">
                                    Importando para <strong>{institution}</strong> ({accountType})
                                </p>
                            </>
                        )}

                        {status === 'processing' && (
                            <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                <p className="text-primary font-medium">{message}</p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                                <p className="text-green-500 font-medium">{message}</p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                                <p className="text-red-500 font-medium">{message}</p>
                                <p className="text-xs text-red-400/70">Tente novamente.</p>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
