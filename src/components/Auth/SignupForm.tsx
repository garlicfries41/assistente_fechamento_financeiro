import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface SignupFormProps {
    onToggleMode: () => void;
}

export function SignupForm({ onToggleMode }: SignupFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
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
                        Crie sua conta gratuitamente
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-green-500">
                                    Conta criada! Verifique seu email para confirmar.
                                </p>
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Confirmar Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                'Criando conta...'
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Criar Conta
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
                                Já tem uma conta? <span className="text-primary">Faça login</span>
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
