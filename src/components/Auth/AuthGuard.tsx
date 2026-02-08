import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import type { User } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-400">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return mode === 'login' ? (
            <LoginForm onToggleMode={() => setMode('signup')} />
        ) : (
            <SignupForm onToggleMode={() => setMode('login')} />
        );
    }

    return (
        <div className="relative">
            {/* Logout button */}
            <div className="absolute top-4 right-4 z-50">
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-zinc-900/50 backdrop-blur-sm border-zinc-800 hover:bg-zinc-800"
                >
                    <LogOut className="w-4 h-4" />
                    Sair
                </Button>
            </div>
            {children}
        </div>
    );
}
