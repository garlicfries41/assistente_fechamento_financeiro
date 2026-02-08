import { useState, useEffect } from 'react'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { FileImporter } from './components/FileImporter'
import { CategorizationView } from './components/CategorizationView'
import { RulesManager } from './components/RulesManager'
import { AuthGuard } from './components/Auth/AuthGuard'
import { useFinanceStore } from './store/useFinanceStore'
import { Wand2, Settings, LayoutDashboard } from 'lucide-react'
import { Button } from './components/ui/Button'
import { cn } from './lib/utils'

function AppContent() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'categorization'>('dashboard');
  const [activeTab, setActiveTab] = useState<'app' | 'settings'>('app');
  const { transactions, loadData, loading } = useFinanceStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingCount = transactions.filter(t => t.isPending).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      {/* Top Navigation Bar */}
      <nav className="w-full bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Financeiro v3
          </span>
          <div className="flex bg-zinc-900 rounded-lg p-1 gap-1">
            <button
              onClick={() => { setActiveTab('app'); setViewMode('dashboard'); }}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'app' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Aplicação
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'settings' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Settings className="w-4 h-4" />
              Configurações
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full max-w-4xl space-y-8 p-4 md:p-8 mt-4">

        {activeTab === 'settings' ? (
          <RulesManager />
        ) : viewMode === 'categorization' ? (
          <CategorizationView onClose={() => setViewMode('dashboard')} />
        ) : (
          <>
            <header className="mb-4 text-center">
              <h1 className="text-3xl font-black text-center mb-2">
                Visão Geral
              </h1>

              {pendingCount > 0 && (
                <Button
                  onClick={() => setViewMode('categorization')}
                  className="mx-auto flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold animate-pulse shadow-lg shadow-yellow-900/20"
                >
                  <Wand2 className="w-4 h-4" />
                  Revisar {pendingCount} Pendentes
                </Button>
              )}
            </header>

            <TransactionForm />
            <div className="grid gap-8">
              <FileImporter />
              <TransactionList />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  );
}

export default App
