import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { personalFinanceApi } from '../services/api';
import type { TaxAndPensionSummary } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Loader2,
  Receipt,
  Landmark,
  PiggyBank,
  TrendingUp,
  Calculator,
  Wallet,
  Building2,
  Info,
  HelpCircle,
  ArrowDown,
  Target,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function TaxPensionPage() {
  const { i18n } = useTranslation();
  const [summary, setSummary] = useState<TaxAndPensionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [age, setAge] = useState(30);
  const [taxRate, setTaxRate] = useState(32);
  const [showHelp, setShowHelp] = useState(false);

  const sv = i18n.language === 'sv';

  useEffect(() => {
    loadData();
  }, [age, taxRate]);

  const loadData = async () => {
    try {
      const data = await personalFinanceApi.getTaxAndPension(age, taxRate / 100);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load tax/pension data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salary breakdown for pie chart - grayscale colors
  const salaryBreakdown = useMemo(() => {
    if (!summary) return [];
    return [
      { name: sv ? 'Du får' : 'You get', value: summary.netMonthlyIncome, color: '#171717' },
      { name: sv ? 'Skatt' : 'Tax', value: summary.monthlyTax, color: '#737373' },
      { name: sv ? 'Arbetsgivaravgift' : 'Employer fee', value: summary.monthlyEmployerContributions, color: '#a3a3a3' },
      { name: sv ? 'Pension' : 'Pension', value: summary.monthlyPensionContribution, color: '#d4d4d4' },
    ].filter(item => item.value > 0);
  }, [summary, sv]);

  // Pension projection chart data
  const pensionChartData = useMemo(() => {
    if (!summary) return [];
    return summary.pensionProjections.map(p => ({
      age: `${p.age}`,
      capital: Math.round(p.projectedPensionCapital),
      monthlyPension: Math.round(p.estimatedMonthlyPension),
    }));
  }, [summary]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        <p className="text-neutral-500">{sv ? 'Räknar ut din ekonomi...' : 'Calculating your finances...'}</p>
      </div>
    );
  }

  if (!summary || summary.grossMonthlyIncome === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
            <Calculator className="h-8 w-8 text-neutral-600" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 mb-3">
            {sv ? 'Skatt & Pension' : 'Tax & Pension'}
          </h1>
          <p className="text-neutral-500 mb-6">
            {sv 
              ? 'För att se din skatteberäkning, lägg först till din inkomst i budgeten.' 
              : 'To see your tax calculation, first add your income in the budget.'}
          </p>
          <a 
            href="/budget" 
            className="btn-primary inline-flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            {sv ? 'Lägg till inkomst' : 'Add income'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {sv ? 'Din Lön & Skatt' : 'Your Salary & Tax'}
        </h1>
        <p className="text-neutral-500 mt-1">
          {sv 
            ? 'Se vad som händer med din lön' 
            : 'See what happens to your salary'}
        </p>
      </div>

      {/* Help Toggle */}
      <div className="flex">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          {showHelp 
            ? (sv ? 'Dölj förklaringar' : 'Hide explanations')
            : (sv ? 'Visa förklaringar' : 'Show explanations')}
        </button>
      </div>

      {/* Help Box */}
      {showHelp && (
        <div className="card p-6">
          <h3 className="font-medium text-neutral-900 mb-4 flex items-center gap-2">
            <Info className="h-4 w-4" />
            {sv ? 'Så här fungerar det' : 'How it works'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3">
              <Building2 className="h-5 w-5 text-neutral-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-neutral-900">{sv ? 'Arbetsgivaravgift' : 'Employer contribution'}</p>
                <p className="text-neutral-500">{sv ? 'Din arbetsgivare betalar 31.42% extra utöver din lön för socialförsäkringar.' : 'Your employer pays 31.42% extra on top of your salary for social insurance.'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Receipt className="h-5 w-5 text-neutral-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-neutral-900">{sv ? 'Skatt' : 'Tax'}</p>
                <p className="text-neutral-500">{sv ? 'Kommunalskatt (ca 32%) + statlig skatt om du tjänar över 46 200 kr/mån.' : 'Municipal tax (~32%) + state tax if you earn over 46,200 SEK/month.'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <PiggyBank className="h-5 w-5 text-neutral-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-neutral-900">{sv ? 'Pension' : 'Pension'}</p>
                <p className="text-neutral-500">{sv ? '7% av din lön går till allmän pension + tjänstepension från arbetsgivare.' : '7% of your salary goes to general pension + occupational pension from employer.'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Wallet className="h-5 w-5 text-neutral-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-neutral-900">{sv ? 'Nettolön' : 'Net salary'}</p>
                <p className="text-neutral-500">{sv ? 'Det som blir kvar och betalas ut till ditt bankkonto.' : 'What remains and is paid to your bank account.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="card p-6">
        <h2 className="font-medium text-neutral-900 mb-4">
          {sv ? 'Inställningar' : 'Settings'}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Age Slider */}
          <div>
            <label className="block text-sm text-neutral-600 mb-2">
              {sv ? 'Din ålder' : 'Your age'}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={18}
                max={70}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
              <span className="text-xl font-semibold text-neutral-900 w-12 text-center">{age}</span>
            </div>
          </div>

          {/* Tax Rate Slider */}
          <div>
            <label className="block text-sm text-neutral-600 mb-2">
              {sv ? 'Kommunalskatt' : 'Municipal tax'}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={28}
                max={36}
                step={0.5}
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
              <span className="text-xl font-semibold text-neutral-900 w-12 text-center">{taxRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Flow */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-6">
          {sv ? 'Vart går dina pengar?' : 'Where does your money go?'}
        </h2>

        <div className="max-w-xl mx-auto space-y-4">
          {/* Employer Cost */}
          <div className="bg-neutral-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-neutral-600" />
                <div>
                  <p className="text-sm text-neutral-500">
                    {sv ? 'Arbetsgivaren betalar totalt' : 'Employer pays in total'}
                  </p>
                  <p className="text-xl font-semibold text-neutral-900">
                    {formatCurrency(summary.totalEmployerCost)}
                    <span className="text-sm font-normal text-neutral-500">/mån</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow + Employer Fee */}
          <div className="flex items-center gap-3 pl-6">
            <ArrowDown className="h-5 w-5 text-neutral-400" />
            <div className="flex-1 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">{sv ? 'Arbetsgivaravgift (31.42%)' : 'Employer fee (31.42%)'}</span>
                <span className="font-medium text-neutral-700">−{formatCurrency(summary.monthlyEmployerContributions)}</span>
              </div>
            </div>
          </div>

          {/* Gross Salary */}
          <div className="bg-neutral-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-neutral-600" />
                <div>
                  <p className="text-sm text-neutral-500">
                    {sv ? 'Din bruttolön (före skatt)' : 'Your gross salary (before tax)'}
                  </p>
                  <p className="text-xl font-semibold text-neutral-900">
                    {formatCurrency(summary.grossMonthlyIncome)}
                    <span className="text-sm font-normal text-neutral-500">/mån</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow + Tax */}
          <div className="flex items-center gap-3 pl-6">
            <ArrowDown className="h-5 w-5 text-neutral-400" />
            <div className="flex-1 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">{sv ? `Skatt (${summary.effectiveTaxRate.toFixed(0)}%)` : `Tax (${summary.effectiveTaxRate.toFixed(0)}%)`}</span>
                <span className="font-medium text-neutral-700">−{formatCurrency(summary.monthlyTax)}</span>
              </div>
            </div>
          </div>

          {/* Arrow + Pension */}
          <div className="flex items-center gap-3 pl-6">
            <ArrowDown className="h-5 w-5 text-neutral-400" />
            <div className="flex-1 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">{sv ? 'Pensionsavdrag (7%)' : 'Pension deduction (7%)'}</span>
                <span className="font-medium text-neutral-700">−{formatCurrency(summary.grossMonthlyIncome * 0.07)}</span>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="bg-neutral-900 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-neutral-900" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">
                    {sv ? 'Du får på kontot' : 'You receive in your account'}
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {formatCurrency(summary.netMonthlyIncome)}
                    <span className="text-sm font-normal text-neutral-400">/mån</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-400">{sv ? 'Per år' : 'Per year'}</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(summary.netYearlyIncome)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <Building2 className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
          <p className="text-xs text-neutral-500 mb-1">{sv ? 'Arbetsgivaravgift/år' : 'Employer fee/year'}</p>
          <p className="text-lg font-semibold text-neutral-900">{formatCurrency(summary.yearlyEmployerContributions)}</p>
        </div>
        <div className="card p-4 text-center">
          <Receipt className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
          <p className="text-xs text-neutral-500 mb-1">{sv ? 'Skatt/år' : 'Tax/year'}</p>
          <p className="text-lg font-semibold text-neutral-900">{formatCurrency(summary.yearlyTax)}</p>
        </div>
        <div className="card p-4 text-center">
          <PiggyBank className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
          <p className="text-xs text-neutral-500 mb-1">{sv ? 'Pension/år' : 'Pension/year'}</p>
          <p className="text-lg font-semibold text-neutral-900">{formatCurrency(summary.yearlyPensionContribution)}</p>
        </div>
        <div className="card p-4 text-center">
          <TrendingUp className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
          <p className="text-xs text-neutral-500 mb-1">{sv ? 'Netto/år' : 'Net/year'}</p>
          <p className="text-lg font-semibold text-neutral-900">{formatCurrency(summary.netYearlyIncome)}</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">
          {sv ? 'Fördelning av arbetsgivarens kostnad' : 'Distribution of employer cost'}
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={salaryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {salaryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pension Section */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Landmark className="h-5 w-5 text-neutral-600" />
          <div>
            <h2 className="text-lg font-medium text-neutral-900">
              {sv ? 'Din Pension' : 'Your Pension'}
            </h2>
            <p className="text-sm text-neutral-500">
              {sv ? 'Prognos baserad på nuvarande sparande' : 'Projection based on current savings'}
            </p>
          </div>
        </div>

        {/* Current Pension Status */}
        <div className="bg-neutral-100 rounded-lg p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-neutral-500">{sv ? 'Nuvarande sparande' : 'Current savings'}</p>
              <p className="text-xl font-semibold text-neutral-900">{formatCurrency(summary.currentPensionSavings)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{sv ? 'Du sparar/månad' : 'You save/month'}</p>
              <p className="text-xl font-semibold text-neutral-900">{formatCurrency(summary.monthlyPensionContribution)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{sv ? 'Du sparar/år' : 'You save/year'}</p>
              <p className="text-xl font-semibold text-neutral-900">{formatCurrency(summary.yearlyPensionContribution)}</p>
            </div>
          </div>
        </div>

        {/* Pension Projection Chart */}
        <h3 className="font-medium text-neutral-700 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          {sv ? 'Pensionsutveckling' : 'Pension growth'}
        </h3>
        <div className="h-56 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pensionChartData}>
              <defs>
                <linearGradient id="colorPension" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#171717" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#171717" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="age" 
                tick={{ fontSize: 12, fill: '#737373' }}
                label={{ value: sv ? 'Ålder' : 'Age', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#737373' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  return `${(value / 1000).toFixed(0)}k`;
                }}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(label) => `${sv ? 'Ålder' : 'Age'}: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="capital" 
                name={sv ? 'Pensionskapital' : 'Pension capital'}
                stroke="#171717" 
                fillOpacity={1}
                fill="url(#colorPension)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pension Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-200">
                <th className="pb-3 font-medium text-neutral-600">{sv ? 'Ålder' : 'Age'}</th>
                <th className="pb-3 font-medium text-neutral-600 text-center">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {sv ? 'År kvar' : 'Years left'}
                </th>
                <th className="pb-3 font-medium text-neutral-600 text-right">{sv ? 'Kapital' : 'Capital'}</th>
                <th className="pb-3 font-medium text-neutral-600 text-right">{sv ? 'Per månad' : 'Per month'}</th>
              </tr>
            </thead>
            <tbody>
              {summary.pensionProjections.map((proj, idx) => (
                <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="font-medium text-neutral-900">{proj.age}</span>
                      {proj.age === 65 && (
                        <span className="text-xs bg-neutral-900 text-white px-2 py-0.5 rounded">
                          {sv ? 'Pension' : 'Retire'}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 text-center text-neutral-500">{proj.yearsFromNow}</td>
                  <td className="py-3 text-right font-medium text-neutral-900">{formatCurrency(proj.projectedPensionCapital)}</td>
                  <td className="py-3 text-right text-neutral-600">{formatCurrency(proj.estimatedMonthlyPension)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-neutral-500 mt-4 text-center">
          {sv 
            ? 'Beräkningarna antar 5% årlig avkastning och 4% uttagsregel vid pension' 
            : 'Calculations assume 5% annual return and 4% withdrawal rule at retirement'}
        </p>
      </div>

      {/* Tax Refund Info */}
      {summary.estimatedTaxRefund > 0 && (
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <Target className="h-5 w-5 text-neutral-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-neutral-900 mb-1">
                {sv ? 'Möjlig skatteåterbäring' : 'Possible tax refund'}
              </h3>
              <p className="text-sm text-neutral-500 mb-2">
                {sv 
                  ? 'Baserat på ränteavdrag från dina skulder.' 
                  : 'Based on interest deductions from your debts.'}
              </p>
              <p className="text-xl font-semibold text-neutral-900">
                +{formatCurrency(summary.estimatedTaxRefund)} <span className="text-sm font-normal text-neutral-500">{sv ? '/år' : '/year'}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
