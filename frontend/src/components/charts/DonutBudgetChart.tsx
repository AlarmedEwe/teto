import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategorySummaryItemDTO } from '@teto/types';
import { formatCurrency } from '../../utils/formatters.js';

interface DonutBudgetChartProps {
  categories: CategorySummaryItemDTO[];
  totalSpent: number;
}

export const DonutBudgetChart: React.FC<DonutBudgetChartProps> = ({ categories, totalSpent }) => {
  // Filtrar categorias que possuem gasto para montar o donut ou exibir gráfico vazio
  const chartData = categories
    .filter((c) => c.spentAmount > 0)
    .map((c) => ({
      name: c.name,
      value: c.spentAmount,
      color: c.colorHex,
      pct: c.totalRealPct,
    }));

  const isEmpty = chartData.length === 0;

  const placeholderData = [{ name: 'Sem gastos', value: 1, color: '#262626' }];

  return (
    <div className="flex flex-col items-center justify-center w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-neutral-300">Distribuição Real do Mês</h3>
        <span className="text-xs text-neutral-500 font-mono">Metas & Tetos</span>
      </div>

      <div className="relative w-full h-56 sm:h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={isEmpty ? placeholderData : chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={88}
              paddingAngle={isEmpty ? 0 : 3}
              dataKey="value"
              stroke="none"
              animationDuration={800}
            >
              {(isEmpty ? placeholderData : chartData).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {!isEmpty && (
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-dropdown px-3 py-2 rounded-xl shadow-2xl text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                          <span className="font-semibold text-white">{data.name}</span>
                        </div>
                        <p className="text-neutral-300">{formatCurrency(data.value)}</p>
                        <p className="text-amber-400 font-mono text-[11px]">{data.pct}% do total gasto</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Centro do Donut */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Total Gasto</span>
          <span className="text-base sm:text-lg font-bold text-neutral-100">
            {formatCurrency(totalSpent)}
          </span>
          <span className="text-[10px] text-amber-500 font-medium mt-0.5">
            {isEmpty ? 'Sem despesas' : `${chartData.length} categorias`}
          </span>
        </div>
      </div>

      {/* Legenda compacta */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full mt-2 pt-3 border-t border-neutral-800/80">
        {categories.map((cat) => (
          <div key={cat.categoryId} className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.colorHex }} />
            <span className="text-xs text-neutral-300 truncate font-medium">{cat.name}</span>
            <span className="text-[10px] text-neutral-500 font-mono ml-auto">{cat.targetPct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
