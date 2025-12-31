import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { yearEndApi } from '../services/api';
import type { YearEndSummary, TaxCalculation } from '../types';
import { 
  Loader2, 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  Building2,
  Banknote,
  Receipt,
  Users,
  AlertCircle,
  CheckCircle,
  Lock
} from 'lucide-react';

export default function YearEndPage() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [yearEnd, setYearEnd] = useState<YearEndSummary | null>(null);
  const [taxCalc, setTaxCalc] = useState<TaxCalculation | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'balance' | 'tax'>('overview');
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany, selectedYear]);

  const loadData = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);
      setError(null);
      const [yearEndData, taxData] = await Promise.all([
        yearEndApi.getSummary(selectedCompany.id, selectedYear),
        yearEndApi.getTaxCalculation(selectedCompany.id, selectedYear),
      ]);
      setYearEnd(yearEndData);
      setTaxCalc(taxData);
    } catch (err) {
      console.error('Failed to load year-end data:', err);
      setError('Kunde inte ladda bokslutsdata');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseYear = async () => {
    if (!selectedCompany || !yearEnd) return;
    if (!confirm(`Är du säker på att du vill stänga räkenskapsåret ${selectedYear}? Detta kan inte ångras.`)) return;

    setClosing(true);
    try {
      const result = await yearEndApi.closeYear(selectedCompany.id, selectedYear);
      if (result.success) {
        alert(result.message);
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Failed to close year:', err);
      alert('Kunde inte stänga räkenskapsåret');
    } finally {
      setClosing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const formatPercent = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="card p-8 text-center">
          <AlertCircle className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-neutral-900 mb-2">Fel vid laddning</h2>
          <p className="text-neutral-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Bokslut & Skatt</h1>
          <p className="text-neutral-500 mt-1">Räkenskapsår {selectedYear}</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input w-32"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {yearEnd && !yearEnd.isClosed && (
            <button
              onClick={handleCloseYear}
              disabled={closing}
              className="btn-primary"
            >
              {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Stäng räkenskapsår
            </button>
          )}
          {yearEnd?.isClosed && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-md font-medium">
              <CheckCircle className="h-4 w-4" />
              Stängt
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-neutral-200">
        {[
          { id: 'overview', label: 'Översikt', icon: Calculator },
          { id: 'income', label: 'Resultaträkning', icon: TrendingUp },
          { id: 'balance', label: 'Balansräkning', icon: Building2 },
          { id: 'tax', label: 'Skatteberäkning', icon: Receipt },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && yearEnd && taxCalc && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4 border-l-4 border-l-neutral-400">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <TrendingUp className="h-4 w-4" />
                Omsättning
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(yearEnd.totalRevenue)}</p>
            </div>
            <div className="card p-4 border-l-4 border-l-neutral-500">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <TrendingDown className="h-4 w-4" />
                Kostnader
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(yearEnd.totalExpenses)}</p>
            </div>
            <div className="card p-4 border-l-4 border-l-neutral-700">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <Banknote className="h-4 w-4" />
                Årets resultat
              </div>
              <p className="text-2xl font-semibold text-neutral-900">
                {formatCurrency(yearEnd.netResult)}
              </p>
            </div>
            <div className="card p-4 border-l-4 border-l-neutral-900">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <Receipt className="h-4 w-4" />
                Totala skatter
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(taxCalc.totalTaxLiabilities)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Resultatöversikt</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Rörelseresultat</span>
                  <span className="font-medium">{formatCurrency(yearEnd.operatingResult)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Finansiella intäkter</span>
                  <span className="font-medium">{formatCurrency(yearEnd.financialIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Finansiella kostnader</span>
                  <span className="font-medium">-{formatCurrency(yearEnd.financialExpenses)}</span>
                </div>
                <hr className="border-neutral-200" />
                <div className="flex justify-between">
                  <span className="text-neutral-600">Resultat före skatt</span>
                  <span className="font-medium">{formatCurrency(yearEnd.resultBeforeTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bolagsskatt (20.6%)</span>
                  <span className="font-medium">-{formatCurrency(yearEnd.corporateTax)}</span>
                </div>
                <hr className="border-neutral-200" />
                <div className="flex justify-between text-lg">
                  <span className="font-medium text-neutral-900">Årets resultat</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(yearEnd.netResult)}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Balansöversikt</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tillgångar</span>
                  <span className="font-medium">{formatCurrency(yearEnd.totalAssets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Skulder</span>
                  <span className="font-medium">{formatCurrency(yearEnd.totalLiabilities)}</span>
                </div>
                <hr className="border-neutral-200" />
                <div className="flex justify-between text-lg">
                  <span className="font-medium text-neutral-900">Eget kapital</span>
                  <span className="font-semibold text-neutral-900">{formatCurrency(yearEnd.equity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Income Statement */}
      {activeTab === 'income' && yearEnd && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-6">
            Resultaträkning {selectedYear}
          </h3>
          
          <div className="mb-6">
            <h4 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-neutral-500" />
              Rörelsens intäkter
            </h4>
            {yearEnd.revenueAccounts.length > 0 ? (
              <div className="space-y-2 ml-6">
                {yearEnd.revenueAccounts.map((acc) => (
                  <div key={acc.accountNumber} className="flex justify-between text-sm">
                    <span className="text-neutral-600">{acc.accountNumber} {acc.accountName}</span>
                    <span className="font-medium">{formatCurrency(acc.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 ml-6">Inga bokförda intäkter (intäkter från fakturor: {formatCurrency(yearEnd.totalRevenue)})</p>
            )}
            <div className="flex justify-between mt-3 pt-3 border-t font-medium">
              <span>Summa intäkter</span>
              <span className="text-neutral-900">{formatCurrency(yearEnd.totalRevenue)}</span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-neutral-500" />
              Rörelsens kostnader
            </h4>
            {yearEnd.expenseAccounts.length > 0 ? (
              <div className="space-y-2 ml-6">
                {yearEnd.expenseAccounts.map((acc) => (
                  <div key={acc.accountNumber} className="flex justify-between text-sm">
                    <span className="text-neutral-600">{acc.accountNumber} {acc.accountName}</span>
                    <span className="font-medium">-{formatCurrency(acc.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 ml-6">Inga bokförda kostnader</p>
            )}
            <div className="flex justify-between mt-3 pt-3 border-t font-medium">
              <span>Summa kostnader</span>
              <span className="text-neutral-700">-{formatCurrency(yearEnd.totalExpenses)}</span>
            </div>
          </div>

          <div className="bg-neutral-100 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span>Rörelseresultat</span>
              <span className="font-medium">{formatCurrency(yearEnd.operatingResult)}</span>
            </div>
            <div className="flex justify-between">
              <span>Finansnetto</span>
              <span className="font-medium">{formatCurrency(yearEnd.financialIncome - yearEnd.financialExpenses)}</span>
            </div>
            <hr className="border-neutral-300" />
            <div className="flex justify-between">
              <span>Resultat före skatt</span>
              <span className="font-medium">{formatCurrency(yearEnd.resultBeforeTax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bolagsskatt</span>
              <span className="font-medium">-{formatCurrency(yearEnd.corporateTax)}</span>
            </div>
            <hr className="border-neutral-300" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Årets resultat</span>
              <span className="text-neutral-900">
                {formatCurrency(yearEnd.netResult)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Balance Sheet */}
      {activeTab === 'balance' && yearEnd && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-6">
            Balansräkning per {new Date(yearEnd.toDate).toLocaleDateString('sv-SE')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-neutral-500" />
                Tillgångar
              </h4>
              {yearEnd.assetAccounts.length > 0 ? (
                <div className="space-y-2">
                  {yearEnd.assetAccounts.map((acc) => (
                    <div key={acc.accountNumber} className="flex justify-between text-sm">
                      <span className="text-neutral-600">{acc.accountNumber} {acc.accountName}</span>
                      <span className="font-medium">{formatCurrency(acc.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">Inga bokförda tillgångar</p>
              )}
              <div className="flex justify-between mt-4 pt-3 border-t font-semibold">
                <span>Summa tillgångar</span>
                <span className="text-neutral-900">{formatCurrency(yearEnd.totalAssets)}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-neutral-500" />
                Skulder och eget kapital
              </h4>
              {yearEnd.liabilityAccounts.length > 0 ? (
                <div className="space-y-2">
                  {yearEnd.liabilityAccounts.map((acc) => (
                    <div key={acc.accountNumber} className="flex justify-between text-sm">
                      <span className="text-neutral-600">{acc.accountNumber} {acc.accountName}</span>
                      <span className="font-medium">{formatCurrency(acc.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">Inga bokförda skulder</p>
              )}
              <div className="flex justify-between mt-4 pt-3 border-t">
                <span className="font-medium">Summa skulder</span>
                <span className="font-medium">{formatCurrency(yearEnd.totalLiabilities)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Eget kapital</span>
                <span className="font-medium text-neutral-900">{formatCurrency(yearEnd.equity)}</span>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t font-semibold">
                <span>Summa skulder + EK</span>
                <span className="text-neutral-900">{formatCurrency(yearEnd.totalLiabilities + yearEnd.equity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Calculation */}
      {activeTab === 'tax' && taxCalc && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-neutral-500" />
              Bolagsskatt
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Resultat före skatt</span>
                <span className="font-medium">{formatCurrency(taxCalc.resultBeforeTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Skattesats</span>
                <span className="font-medium">{formatPercent(taxCalc.corporateTaxRate)}</span>
              </div>
              <hr className="border-neutral-200" />
              <div className="flex justify-between text-lg">
                <span className="font-medium">Bolagsskatt att betala</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(taxCalc.corporateTax)}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-neutral-500" />
              Moms
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Utgående moms (försäljning)</span>
                <span className="font-medium">{formatCurrency(taxCalc.outputVat)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Ingående moms (inköp)</span>
                <span className="font-medium">-{formatCurrency(taxCalc.inputVat)}</span>
              </div>
              <hr className="border-neutral-200" />
              <div className="flex justify-between text-lg">
                <span className="font-medium">Moms att betala/få tillbaka</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(taxCalc.vatToPay)}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-neutral-500" />
              Arbetsgivaravgifter & Personalskatter
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Totala bruttolöner</span>
                <span className="font-medium">{formatCurrency(taxCalc.totalGrossSalaries)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Arbetsgivaravgifter ({formatPercent(taxCalc.employerContributionRate)})</span>
                <span className="font-medium">{formatCurrency(taxCalc.totalEmployerContributions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Preliminärskatt (anställda)</span>
                <span className="font-medium">{formatCurrency(taxCalc.totalEmployeeTax)}</span>
              </div>
              <hr className="border-neutral-200" />
              <div className="flex justify-between text-lg">
                <span className="font-medium">Totalt att redovisa</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(taxCalc.totalEmployerContributions + taxCalc.totalEmployeeTax)}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-neutral-900 text-white">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-neutral-300" />
              Sammanfattning skatter {selectedYear}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-300">Bolagsskatt</span>
                <span className="font-medium">{formatCurrency(taxCalc.corporateTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Moms netto</span>
                <span className="font-medium">{formatCurrency(taxCalc.vatToPay)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Arbetsgivaravgifter</span>
                <span className="font-medium">{formatCurrency(taxCalc.totalEmployerContributions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Preliminärskatt anställda</span>
                <span className="font-medium">{formatCurrency(taxCalc.totalEmployeeTax)}</span>
              </div>
              <hr className="border-neutral-700" />
              <div className="flex justify-between text-xl">
                <span className="font-semibold">Totala skatteåtaganden</span>
                <span className="font-bold">{formatCurrency(taxCalc.totalTaxLiabilities)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
