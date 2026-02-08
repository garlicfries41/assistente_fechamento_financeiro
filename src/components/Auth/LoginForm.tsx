import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LogIn, AlertCircle } from 'lucide-react';

interface LoginFormProps {
    onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                            Financeiro
                        </span>
                    </CardTitle>
                    <p className="text-zinc-400 text-center text-sm">
                        Faça login para continuar
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={loading}
                        >
                            {loading ? (
                                'Entrando...'
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Entrar
                                </>
                            )}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={onToggleMode}
                                className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                                disabled={loading}
                            >
                                Não tem uma conta? <span className="text-primary">Cadastre-se</span>
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
