import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { personalFinanceApi } from '../services/api';
import type { PersonalFinanceSummary, BudgetSummary } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Home,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Plus,
  Calendar,
  Building2,
  Landmark,
  Banknote
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

export default function PersonalDashboard() {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState<PersonalFinanceSummary | null>(null);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, budgetData] = await Promise.all([
        personalFinanceApi.getSummary(),
        personalFinanceApi.getBudgetSummary()
      ]);
      setSummary(summaryData);
      setBudget(budgetData);
    } catch (err) {
      console.error('Failed to load personal finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLocale = () => i18n.language === 'sv' ? 'sv-SE' : 'en-US';

  // Generate monthly projections for the next 24 months
  const monthlyProjections = useMemo(() => {
    if (!summary) return [];
    const monthlyBalance = summary.monthlyBalance;
    const currentNetWorth = summary.netWorth;
    const projections = [];
    let cumulativeSavings = 0;
    
    const now = new Date();
    for (let i = 0; i <= 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = date.toLocaleDateString(getLocale(), { month: 'short', year: '2-digit' });
      
      if (i > 0) {
        cumulativeSavings += monthlyBalance;
      }
      
      projections.push({
        month: monthName,
        savings: Math.round(cumulativeSavings),
        savingsWithInterest: Math.round(cumulativeSavings),
        netWorth: Math.round(currentNetWorth + cumulativeSavings),
        expenses: Math.round(summary.totalMonthlyExpenses * (i + 1)),
      });
    }
    return projections;
  }, [summary, getLocale]);

  // Format long-term projections for chart
  const longTermChartData = useMemo(() => {
    if (!summary) return [];
    return summary.projections.map(proj => ({
      year: `${proj.years} ${t('dashboard.yr')}`,
      years: proj.years,
      netWorth: Math.round(proj.projectedNetWorth),
      savings: Math.round(proj.projectedSavingsWithInterest),
      debt: Math.round(proj.remainingDebt),
      costs: Math.round(proj.totalCosts),
    }));
  }, [summary, i18n.language]);

  // Custom tooltip formatter
  const formatTooltipValue = (value: number | undefined) => value !== undefined ? formatCurrency(value) : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  // If no data, show onboarding screen
  if (!summary || (summary.totalAssets === 0 && summary.totalDebts === 0 && summary.totalMonthlyIncome === 0)) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="mx-auto h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
            <Wallet className="h-8 w-8 text-neutral-600" />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-3">{t('dashboard.welcome')}</h1>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            {t('dashboard.welcomeDescription')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/budget"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('dashboard.addBudget')}
            </Link>
            <Link
              to="/assets"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              <PiggyBank className="h-4 w-4" />
              {t('dashboard.addAssets')}
            </Link>
            <Link
              to="/debts"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              {t('dashboard.addDebts')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{t('dashboard.myFinances')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('dashboard.financeOverview')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">{t('dashboard.lastUpdated')}</p>
          <p className="text-sm text-neutral-600">{new Date().toLocaleDateString(getLocale())}</p>
        </div>
      </div>

      {/* Net Worth - Large widget */}
      <div className="bg-neutral-900 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-400 text-sm mb-1">{t('dashboard.netWorth')}</p>
            <p className="text-4xl font-semibold tracking-tight">
              {formatCurrency(summary.netWorth)}
            </p>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span className="text-neutral-400 text-sm">{t('dashboard.totalAssets')}: {formatCurrency(summary.totalAssets)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-neutral-500"></div>
                <span className="text-neutral-400 text-sm">{t('dashboard.totalDebts')}: {formatCurrency(summary.totalDebts)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <ArrowUpRight className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">{t('dashboard.monthlyIncome')}</span>
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(summary.totalMonthlyIncome)}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <ArrowDownRight className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">{t('dashboard.monthlyExpenses')}</span>
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(summary.totalMonthlyExpenses)}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <PiggyBank className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">{t('dashboard.monthlyBalance')}</span>
          </div>
          <p className={`text-2xl font-semibold text-neutral-900`}>
            {formatCurrency(summary.monthlyBalance)}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Savings Projection (24 months) */}
        <div className="card p-6">
          <h2 className="text-sm font-medium text-neutral-900 mb-4">
            {t('dashboard.savingsNext24Months')}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyProjections}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#171717" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#737373" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#737373" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10, fill: '#737373' }}
                  interval={3}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#737373' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelStyle={{ fontWeight: '500' }}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area 
                  type="monotone" 
                  dataKey="savingsWithInterest" 
                  name={t('dashboard.saved')}
                  stroke="#171717" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSavings)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="netWorth" 
                  name={t('dashboard.netWorth')}
                  stroke="#737373" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorNetWorth)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Long-term Net Worth Projection (60 years) */}
        <div className="card p-6">
          <h2 className="text-sm font-medium text-neutral-900 mb-4">
            {t('dashboard.netWorthOverTime')}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={longTermChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 10, fill: '#737373' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#737373' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    return `${(value / 1000).toFixed(0)}k`;
                  }}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelStyle={{ fontWeight: '500' }}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="netWorth" 
                  name={t('dashboard.netWorth')}
                  stroke="#171717" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  name={t('dashboard.totalSaved')}
                  stroke="#a3a3a3" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="debt" 
                  name={t('dashboard.remainingDebt')}
                  stroke="#737373" 
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Costs vs Savings Bar Chart */}
      <div className="card p-6">
        <h2 className="text-sm font-medium text-neutral-900 mb-4">
          {t('dashboard.costsVsSavings')}
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={longTermChartData} barGap={0}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10, fill: '#737373' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#737373' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  return `${(value / 1000).toFixed(0)}k`;
                }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelStyle={{ fontWeight: '500' }}
                contentStyle={{ borderRadius: '6px', border: '1px solid #e5e5e5', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar 
                dataKey="costs" 
                name={t('dashboard.totalCostsLabel')}
                fill="#737373" 
                radius={[3, 3, 0, 0]}
              />
              <Bar 
                dataKey="savings" 
                name={t('dashboard.totalSaved')}
                fill="#171717" 
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Budget Details */}
        {budget && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-400" />
                {t('dashboard.monthlyBudget')}
              </h2>
              <Link to="/budget" className="text-xs text-neutral-500 hover:text-neutral-900 font-medium">
                {t('dashboard.manage')}
              </Link>
            </div>
            
            <div className="space-y-1">
              {budget.expenseItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                  <span className="text-sm text-neutral-600">{item.name}</span>
                  <span className="text-sm font-medium text-neutral-900">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              {budget.expenseItems.length > 5 && (
                <p className="text-xs text-neutral-400 pt-2">+ {budget.expenseItems.length - 5} {t('dashboard.morePosts')}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">{t('dashboard.totalCosts')}</span>
                <span className="font-medium text-neutral-900">{formatCurrency(budget.totalExpenses)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-neutral-600">{t('dashboard.income')}</span>
                <span className="font-medium text-neutral-900">{formatCurrency(budget.totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-100">
                <span className="text-sm font-medium text-neutral-900">{t('dashboard.leftOver')}</span>
                <span className={`font-semibold text-neutral-900`}>
                  {formatCurrency(budget.balance)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Assets by Category */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-neutral-400" />
              {t('dashboard.assetsTitle')}
            </h2>
            <Link to="/assets" className="text-xs text-neutral-500 hover:text-neutral-900 font-medium">
              {t('dashboard.manage')}
            </Link>
          </div>

          <div className="space-y-3">
            {summary.assetsByCategory.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-neutral-100 flex items-center justify-center">
                    {getCategoryIcon(cat.categoryName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{cat.categoryName}</p>
                    <p className="text-xs text-neutral-400">{cat.accountCount} {t('dashboard.accounts')}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-neutral-900">{formatCurrency(cat.totalBalance)}</span>
              </div>
            ))}
          </div>

          {summary.assetsByCategory.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-4">{t('dashboard.noAssetsRegistered')}</p>
          )}

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-900">{t('dashboard.total')}</span>
              <span className="font-semibold text-neutral-900">{formatCurrency(summary.totalAssets)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-neutral-400" />
              {t('dashboard.debtsTitle')}
            </h2>
            <Link to="/debts" className="text-xs text-neutral-500 hover:text-neutral-900 font-medium">
              {t('dashboard.manage')}
            </Link>
          </div>

          <div className="space-y-3">
            {summary.debtsByType.map((debt, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-neutral-100 flex items-center justify-center">
                      {getDebtIcon(debt.typeName)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-neutral-900">{debt.typeName}</span>
                      <p className="text-xs text-neutral-400">
                        {t('dashboard.remaining')}: {debt.remainingPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-neutral-900">{formatCurrency(debt.totalBalance)}</span>
                </div>
                {debt.totalEquity > 0 && (
                  <p className="text-xs text-neutral-500 ml-11">{t('dashboard.equity')}: {formatCurrency(debt.totalEquity)}</p>
                )}
              </div>
            ))}
          </div>

          {summary.debtsByType.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-4">{t('dashboard.noDebtsRegistered')}</p>
          )}

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-900">{t('dashboard.totalDebtsLabel')}</span>
              <span className="font-semibold text-neutral-900">{formatCurrency(summary.totalDebts)}</span>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-neutral-400" />
              {t('dashboard.forecast')}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-500">
                  <th className="pb-2 font-medium">{t('dashboard.period')}</th>
                  <th className="pb-2 text-right font-medium">{t('dashboard.costs')}</th>
                  <th className="pb-2 text-right font-medium">{t('dashboard.saved')}</th>
                  <th className="pb-2 text-right font-medium">{t('dashboard.netWorth')}</th>
                </tr>
              </thead>
              <tbody>
                {summary.projections.slice(0, 4).map((proj, idx) => (
                  <tr key={idx} className="border-t border-neutral-100">
                    <td className="py-2 text-neutral-900">{proj.years} {t('dashboard.years')}</td>
                    <td className="py-2 text-right text-neutral-600">{formatCurrency(proj.totalCosts)}</td>
                    <td className="py-2 text-right text-neutral-600">{formatCurrency(proj.totalSaved)}</td>
                    <td className="py-2 text-right font-medium text-neutral-900">{formatCurrency(proj.projectedNetWorth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Future Projections */}
      <div className="card p-6">
        <h2 className="text-sm font-medium text-neutral-900 mb-6">
          {t('dashboard.yourFuture')}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary.projections.filter(p => [5, 10, 20, 30].includes(p.years)).map((proj, idx) => (
            <div key={idx} className="text-center p-4 bg-neutral-50 rounded-lg">
              <div className="text-xs text-neutral-500 mb-1">
                {t('dashboard.inYears', { years: proj.years })}
              </div>
              <div className={`text-xl font-semibold text-neutral-900`}>
                {formatCurrency(proj.projectedNetWorth)}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {t('dashboard.netWorth')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Link to Business */}
      <div className="card p-6 bg-neutral-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-neutral-900">{t('dashboard.myBusiness')}</h3>
            <p className="text-xs text-neutral-500 mt-1">{t('dashboard.businessDescription')}</p>
          </div>
          <Link
            to="/company"
            className="px-4 py-2 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            {t('dashboard.goToMyBusiness')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(categoryName: string) {
  const iconClass = "h-4 w-4 text-neutral-600";
  switch (categoryName) {
    case 'Kontanter':
    case 'Cash': return <Banknote className={iconClass} />;
    case 'Bankkonto':
    case 'Bank Account': return <Landmark className={iconClass} />;
    case 'Sparkonto':
    case 'Savings Account': return <PiggyBank className={iconClass} />;
    case 'Investeringar':
    case 'Investments': return <TrendingUp className={iconClass} />;
    case 'Fastighet':
    case 'Property': return <Home className={iconClass} />;
    case 'Företag':
    case 'Business': return <Building2 className={iconClass} />;
    default: return <Wallet className={iconClass} />;
  }
}

function getDebtIcon(typeName: string) {
  const iconClass = "h-4 w-4 text-neutral-600";
  switch (typeName) {
    case 'Bolån':
    case 'Mortgage': return <Home className={iconClass} />;
    case 'Skatteskuld':
    case 'Tax Debt': return <Building2 className={iconClass} />;
    case 'Kreditkort':
    case 'Credit Card': return <CreditCard className={iconClass} />;
    default: return <CreditCard className={iconClass} />;
  }
}
