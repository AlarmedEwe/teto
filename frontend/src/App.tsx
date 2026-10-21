import React, { useState } from 'react';
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
import { Plus, Sliders, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { TransactionResponseDTO, TransactionType, CreateTransactionDTO } from '@teto/types';
import { formatCurrency } from './utils/formatters.js';

export default function App() {
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

  const categories = budget?.categories || [];
  const totalIncome = budget?.totalIncome || 0;
  const totalSpent = budget?.totalSpent || 0;
  const balance = budget?.balance || 0;

  const handleOpenExpenseModal = () => {
    setEditingTransaction(null);
    setTransactionModalType(TransactionType.EXPENSE);
    setTransactionModalDescription('');
    setTransactionModalOpen(true);
  };

  const handleOpenIncomeModal = () => {
    setEditingTransaction(null);
    setTransactionModalType(TransactionType.INCOME);
    setTransactionModalDescription('Salário');
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
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onOpenIncomeTransaction={handleOpenIncomeModal}
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
              <p className="text-sm font-medium">Sincronizando tetos e metas orçamentárias...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD & TETOS */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Banner de Renda Zerada (Onboarding inicial) */}
                  {totalIncome === 0 && (
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
                          <span>Lançar Despesa</span>
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
                        {transactions.length} lançamentos registrados para este mês
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
                        <span>Nova Renda</span>
                      </button>
                      <button
                        onClick={handleOpenExpenseModal}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Novo Gasto</span>
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
                        Configuração da divisão percentual da renda doméstica
                      </p>
                    </div>
                    <button
                      onClick={() => setGoalsModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Editar Porcentagens</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                    <span className="text-xs font-semibold text-neutral-300 block">
                      Metas Padrão de Tetos:
                    </span>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      A regra original baseia-se em: <strong>Custos Fixos (30%)</strong>,{' '}
                      <strong>Investimentos (25%)</strong>, <strong>Metas (20%)</strong>,{' '}
                      <strong>Conforto (10%)</strong>, <strong>Prazeres (10%)</strong> e{' '}
                      <strong>Conhecimento (5%)</strong>.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {categories.map((c) => (
                      <div
                        key={c.categoryId}
                        className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-4 h-4 rounded-lg"
                            style={{ backgroundColor: c.colorHex }}
                          />
                          <div>
                            <h4 className="text-sm font-bold text-neutral-100">{c.name}</h4>
                            <span className="text-xs text-neutral-400">
                              Teto atual: {formatCurrency(c.ceilingAmount)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-extrabold font-mono text-amber-400">
                            {c.targetPct}%
                          </span>
                          <span className="block text-[10px] text-neutral-500">da renda</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Navegação Inferior Mobile-First */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenTransactionModal={handleOpenExpenseModal}
        onOpenIncomeTransaction={handleOpenIncomeModal}
        onOpenCsvModal={() => setCsvModalOpen(true)}
      />

      {/* Modais Globais */}
      <CategoryGoalsModal
        isOpen={goalsModalOpen}
        onClose={() => setGoalsModalOpen(false)}
        categories={categories}
        onSave={updateCategories}
      />

      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
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
