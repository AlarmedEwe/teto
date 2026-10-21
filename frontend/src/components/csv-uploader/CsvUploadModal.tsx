import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { CategorySummaryItemDTO, ImportCsvResponseDTO } from '@teto/types';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategorySummaryItemDTO[];
  onImportCsv: (file: File) => Promise<ImportCsvResponseDTO>;
  onUpdateCategory: (transactionId: string, categoryId: string | null) => Promise<void>;
  onFinished: () => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  categories,
  onImportCsv,
  onUpdateCategory,
  onFinished,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportCsvResponseDTO | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Selecione um arquivo CSV de extrato ou fatura');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await onImportCsv(file);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar arquivo CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAndFinish = () => {
    setFile(null);
    setResult(null);
    onFinished();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-dropdown border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <button
          onClick={handleCloseAndFinish}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Importar Fatura (CSV)</h3>
            <p className="text-xs text-neutral-400">Suporte a Nubank, Inter, Itaú com projeção de parcelas</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {!result ? (
          /* Estado 1: Seleção do Arquivo */
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-700 hover:border-amber-500/60 rounded-2xl p-8 text-center cursor-pointer transition bg-neutral-900/40 hover:bg-neutral-900/80 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileText className="w-12 h-12 text-neutral-500 group-hover:text-amber-400 mx-auto mb-2 transition" />
              <p className="text-sm font-semibold text-neutral-200">
                {file ? file.name : 'Clique para selecionar o arquivo .csv'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Extrato com colunas de data, descrição e valor
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Inteligência de Parcelamento:
              </span>
              <p>
                Transações como <code className="text-amber-400 bg-neutral-950 px-1 py-0.5 rounded">02/05</code> ou <code className="text-amber-400 bg-neutral-950 px-1 py-0.5 rounded">Parcela 2 de 5</code> criam a parcela atual e agendam automaticamente os próximos meses.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 text-sm font-semibold hover:bg-neutral-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || loading}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Processar CSV'}
              </button>
            </div>
          </div>
        ) : (
          /* Estado 2: Resumo e Conciliação Rápida */
          <div className="space-y-4 overflow-hidden flex flex-col flex-1">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl text-center">
                <span className="text-[10px] text-neutral-400 block font-medium">Lidos no CSV</span>
                <span className="text-sm font-bold text-neutral-200">{result.totalProcessed}</span>
              </div>
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-center">
                <span className="text-[10px] text-emerald-400 block font-medium">Criados (+ Projeções)</span>
                <span className="text-sm font-bold text-emerald-300">{result.transactionsCreated}</span>
              </div>
              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-center">
                <span className="text-[10px] text-amber-400 block font-medium">Sem Categoria</span>
                <span className="text-sm font-bold text-amber-300">{result.pendingCategorization}</span>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-neutral-300">
              Conciliação Rápida de Lançamentos:
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-56">
              {result.items.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neutral-200 truncate">{item.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                      <span>{formatDate(item.date)}</span>
                      {item.installmentInfo && (
                        <span className="text-amber-400 font-mono">
                          {item.installmentInfo.current}/{item.installmentInfo.total}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="font-bold text-neutral-200 shrink-0">
                    {formatCurrency(item.amount)}
                  </span>

                  <select
                    defaultValue={item.suggestedCategoryId || ''}
                    onChange={(e) => {
                      if (item.id) {
                        onUpdateCategory(item.id, e.target.value || null);
                      }
                    }}
                    className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-2 py-1 text-xs shrink-0 focus:outline-none focus:border-amber-500 max-w-32 truncate"
                  >
                    <option value="" className="text-neutral-400">Pendente</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button
              onClick={handleCloseAndFinish}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Concluir Conciliação</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
