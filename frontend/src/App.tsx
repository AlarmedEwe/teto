import React, { useState, useEffect } from 'react';
import { useBudget } from './hooks/useBudget.js';
import { Header } from './components/layout/Header.js';
import { BottomNav, NavTab } from './components/layout/BottomNav.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { DonutBudgetChart } from './components/charts/DonutBudgetChart.js';
import { BudgetSummaryTable } from './components/budget/BudgetSummaryTable.js';
import { CategoryGoalsModal } from './components/budget/CategoryGoalsModal.js';
import { TransactionModal } from './components/transactions/TransactionModal.js';
import { TransactionList } from './components/transactions/TransactionList.js';
import { CsvUploadModal } from './components/csv-uploader/CsvUploadModal.js';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import { AuthView } from './components/auth/AuthView.js';
import { CreateWorkspaceModal } from './components/workspaces/CreateWorkspaceModal.js';
import { InviteMemberModal } from './components/workspaces/InviteMemberModal.js';
import { AcceptInviteView } from './components/workspaces/AcceptInviteView.js';
import { Plus, Sliders, Upload, RefreshCw, AlertCircle, Coins, Sparkles, Building2 } from 'lucide-react';
import { TransactionResponseDTO, TransactionType, CreateTransactionDTO, WorkspaceType } from '@teto/types';
import { formatCurrency } from './utils/formatters.js';

interface MainAppProps {
  initialInviteToken: string | null;
}

function MainApp({ initialInviteToken }: MainAppProps) {
  const { activeWorkspace } = useAuth();

  const {
    year,
    month,
    budget,
    transactions,
    loading,
    error,
    prevMonth,
    nextMonth,
    refresh,
    updateCategories,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    importCsv,
    updateTransactionCategory,
  } = useBudget();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionResponseDTO | null>(null);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [transactionModalDescription, setTransactionModalDescription] = useState<string>('');
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  // Modais de Workspace e Convite
  const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
  const [inviteMemberModalOpen, setInviteMemberModalOpen] = useState(false);

  // Detecção de link de convite na URL (/invite/:token)
  const [inviteToken, setInviteToken] = useState<string | null>(initialInviteToken);

  const categories = budget?.categories || [];
  const totalIncome = budget?.totalIncome || 0;
  const totalSpent = budget?.totalSpent || 0;
  const balance = budget?.balance || 0;
  const cumulativeBalance = budget?.cumulativeBalance;
  const isCumulative = activeWorkspace?.type === WorkspaceType.CUMULATIVE;

  const handleOpenExpenseModal = () => {
    setEditingTransaction(null);
    setTransactionModalType(TransactionType.EXPENSE);
    setTransactionModalDescription(isCumulative ? 'Resgate / Oportunidade' : '');
    setTransactionModalOpen(true);
  };

  const handleOpenIncomeModal = () => {
    setEditingTransaction(null);
    setTransactionModalType(TransactionType.INCOME);
    setTransactionModalDescription(isCumulative ? 'Aporte na Reserva' : 'Salário');
    setTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: TransactionResponseDTO) => {
    setEditingTransaction(tx);
    setTransactionModalType(tx.type);
    setTransactionModalDescription(tx.description);
    setTransactionModalOpen(true);
  };

  const handleSaveTransaction = async (data: CreateTransactionDTO) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await createTransaction(data);
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    await deleteTransaction(txId);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col pb-20 sm:pb-0">
      {/* Header Fixo Superior */}
      <Header
        year={year}
        month={month}
        totalIncome={totalIncome}
        totalSpent={totalSpent}
        balance={balance}
        cumulativeBalance={cumulativeBalance}
        workspaceType={activeWorkspace?.type}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onOpenIncomeTransaction={handleOpenIncomeModal}
        onOpenCreateWorkspace={() => setCreateWorkspaceModalOpen(true)}
        onOpenInviteMember={() => setInviteMemberModalOpen(true)}
      />

      {/* Conteúdo Principal com Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Desktop */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenTransactionModal={handleOpenExpenseModal}
          onOpenIncomeTransaction={handleOpenIncomeModal}
          onOpenCsvModal={() => setCsvModalOpen(true)}
        />

        {/* Área Central de Conteúdo */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Se a URL for um convite (/invite/:token) */}
          {inviteToken ? (
            <AcceptInviteView
              token={inviteToken}
              onAccepted={() => {
                setInviteToken(null);
                refresh();
              }}
            />
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={refresh}
                    className="px-3 py-1 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-xs font-semibold transition"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {loading && !budget ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-400 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
                  <p className="text-sm font-medium">Sincronizando dados orçamentários do espaço...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: DASHBOARD & TETOS */}
                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                      {/* Banner Especial de Reserva de Oportunidade (Conta Cumulativa) */}
                      {isCumulative && (
                        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                                <Coins className="w-3.5 h-3.5" />
                              </div>
                              <h4 className="text-sm font-bold text-white">
                                {activeWorkspace?.name} • Reserva de Oportunidade
                              </h4>
                            </div>
                            <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                              Nesta conta, o dinheiro guardado é cumulativo ao longo do tempo. Use novos aportes para guardar capital e registre resgates pontuais para compras de oportunidade sem afetar seu orçamento doméstico do mês.
                            </p>
                          </div>
                          <div className="text-left sm:text-right shrink-0 bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800">
                            <span className="text-[10px] text-neutral-400 block font-medium">Saldo Total da Reserva</span>
                            <span className="text-lg font-black text-emerald-400 font-mono">
                              {formatCurrency(cumulativeBalance !== undefined ? cumulativeBalance : balance)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Banner de Renda Zerada (Apenas para espaços BUDGET) */}
                      {!isCumulative && totalIncome === 0 && (
                        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                          <div>
                            <h4 className="text-sm font-bold text-emerald-400">
                              Nenhuma renda lançada este mês
                            </h4>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              Lance seu salário ou receitas como transações de renda para calcular os tetos por categoria.
                            </p>
                          </div>
                          <button
                            onClick={handleOpenIncomeModal}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition shrink-0"
                          >
                            + Lançar Salário / Renda
                          </button>
                        </div>
                      )}

                      {/* Grid Principal */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Donut Chart (Coluna Esquerda no Desktop) */}
                        <div className="lg:col-span-5 space-y-4">
                          <DonutBudgetChart categories={categories} totalSpent={totalSpent} />

                          {/* Mini Ações Desktop */}
                          <div className="hidden sm:grid grid-cols-2 gap-3">
                            <button
                              onClick={handleOpenExpenseModal}
                              className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/80 transition flex items-center justify-center gap-2 text-xs font-semibold text-neutral-200"
                            >
                              <Plus className="w-4 h-4 text-amber-500" />
                              <span>{isCumulative ? 'Novo Resgate' : 'Lançar Despesa'}</span>
                            </button>
                            <button
                              onClick={() => setCsvModalOpen(true)}
                              className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 hover:bg-neutral-800/80 transition flex items-center justify-center gap-2 text-xs font-semibold text-neutral-200"
                            >
                              <Upload className="w-4 h-4 text-blue-400" />
                              <span>Importar Fatura</span>
                            </button>
                          </div>
                        </div>

                        {/* Resumo Orçamentário em Tabela (Coluna Direita no Desktop) */}
                        <div className="lg:col-span-7">
                          <BudgetSummaryTable
                            categories={categories}
                            totalSpent={totalSpent}
                            totalIncome={totalIncome}
                            onOpenGoalsModal={() => setGoalsModalOpen(true)}
                          />
                        </div>
                      </div>

                      {/* Prévia do Extrato Recente no Dashboard */}
                      <div className="pt-6 border-t border-neutral-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-neutral-200">Últimos Lançamentos</h4>
                          <button
                            onClick={() => setActiveTab('transactions')}
                            className="text-xs text-amber-500 hover:text-amber-400 font-semibold"
                          >
                            Ver Extrato Completo →
                          </button>
                        </div>

                        <TransactionList
                          transactions={transactions.slice(0, 5)}
                          categories={categories}
                          onUpdateCategory={updateTransactionCategory}
                          onEditTransaction={handleEditTransaction}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: EXTRATO COMPLETO & PARCELAS */}
                  {activeTab === 'transactions' && (
                    <div className="space-y-4 max-w-3xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">Extrato de Transações</h3>
                          <p className="text-xs text-neutral-400">
                            {transactions.length} lançamentos registrados para este mês no espaço {activeWorkspace?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCsvModalOpen(true)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5 text-blue-400" />
                            <span>CSV</span>
                          </button>
                          <button
                            onClick={handleOpenIncomeModal}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isCumulative ? 'Novo Aporte' : 'Nova Renda'}</span>
                          </button>
                          <button
                            onClick={handleOpenExpenseModal}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isCumulative ? 'Novo Resgate' : 'Novo Gasto'}</span>
                          </button>
                        </div>
                      </div>

                      <TransactionList
                        transactions={transactions}
                        categories={categories}
                        onUpdateCategory={updateTransactionCategory}
                        onEditTransaction={handleEditTransaction}
                      />
                    </div>
                  )}

                  {/* TAB 3: METAS E CATEGORIAS */}
                  {activeTab === 'goals' && (
                    <div className="space-y-6 max-w-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">Metas & Tetos</h3>
                          <p className="text-xs text-neutral-400">
                            Configuração percentual do arcabouço fiscal do espaço {activeWorkspace?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => setGoalsModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-2"
                        >
                          <Sliders className="w-4 h-4" />
                          <span>Editar Metas</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categories.map((c) => (
                          <div
                            key={c.categoryId}
                            className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white">{c.name}</span>
                              <span className="text-xs font-mono font-bold text-amber-400">
                                {c.targetPct}%
                              </span>
                            </div>
                            <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${c.targetPct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Navegação Inferior Mobile */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenTransactionModal={handleOpenExpenseModal}
        onOpenIncomeTransaction={handleOpenIncomeModal}
        onOpenCsvModal={() => setCsvModalOpen(true)}
      />

      {/* Modais Globais */}
      <CreateWorkspaceModal
        isOpen={createWorkspaceModalOpen}
        onClose={() => setCreateWorkspaceModalOpen(false)}
      />

      <InviteMemberModal
        isOpen={inviteMemberModalOpen}
        onClose={() => setInviteMemberModalOpen(false)}
      />

      <CategoryGoalsModal
        isOpen={goalsModalOpen}
        onClose={() => setGoalsModalOpen(false)}
        categories={categories}
        onSave={updateCategories}
      />

      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        categories={categories}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        defaultDate={`${year}-${String(month).padStart(2, '0')}-01`}
        initialType={transactionModalType}
        initialDescription={transactionModalDescription}
        editingTransaction={editingTransaction}
      />

      <CsvUploadModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        categories={categories}
        onImportCsv={importCsv}
        onUpdateCategory={updateTransactionCategory}
        onFinished={refresh}
      />
    </div>
  );
}

function RootRouter() {
  const { user, loading } = useAuth();

  const [inviteToken, setInviteToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/invite\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }
    return null;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 mb-4 shadow-xl shadow-amber-500/20 animate-pulse flex items-center justify-center">
          <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
            <img src="/favicon.svg" alt="Teto" className="w-8 h-8" />
          </div>
        </div>
        <div className="text-neutral-400 text-xs font-semibold tracking-wider uppercase animate-pulse">
          Carregando Teto...
        </div>
      </div>
    );
  }

  // Quando não estiver logado, não exibe absolutamente nada do sistema além da tela de autenticação
  if (!user) {
    if (inviteToken) {
      return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
          <AcceptInviteView
            token={inviteToken}
            onAccepted={() => {
              setInviteToken(null);
              window.location.href = '/';
            }}
          />
        </div>
      );
    }
    return <AuthView inviteToken={inviteToken} />;
  }

  return <MainApp initialInviteToken={inviteToken} />;
}

export default function App() {
  return (
    <AuthProvider>
      <RootRouter />
    </AuthProvider>
  );
}
