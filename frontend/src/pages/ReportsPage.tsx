import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { reportsApi } from '../services/api';
import type { IncomeStatement, BalanceSheet, VatReport } from '../types';
import { Loader2, BarChart3 } from 'lucide-react';

type ReportType = 'income' | 'balance' | 'vat';

export default function ReportsPage() {
  const { selectedCompany } = useCompany();
  const [activeReport, setActiveReport] = useState<ReportType>('income');
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [vatReport, setVatReport] = useState<VatReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany) {
      loadReports();
    }
  }, [selectedCompany, activeReport]);

  const loadReports = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);
      switch (activeReport) {
        case 'income':
          const income = await reportsApi.getIncomeStatement(selectedCompany.id);
          setIncomeStatement(income);
          break;
        case 'balance':
          const balance = await reportsApi.getBalanceSheet(selectedCompany.id);
          setBalanceSheet(balance);
          break;
        case 'vat':
          const vat = await reportsApi.getVatReport(selectedCompany.id);
          setVatReport(vat);
          break;
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const tabs = [
    { id: 'income' as ReportType, name: 'Resultaträkning' },
    { id: 'balance' as ReportType, name: 'Balansräkning' },
    { id: 'vat' as ReportType, name: 'Momsrapport' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Rapporter</h1>
        <p className="text-slate-600 mt-1">Ekonomiska rapporter och underlag</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeReport === tab.id
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : (
        <>
          {/* Income Statement */}
          {activeReport === 'income' && incomeStatement && (
            <div className="card">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Resultaträkning</h2>
                <p className="text-sm text-slate-500">
                  {new Date(incomeStatement.fromDate).toLocaleDateString('sv-SE')} - {new Date(incomeStatement.toDate).toLocaleDateString('sv-SE')}
                </p>
              </div>
              <div className="p-6">
                {/* Revenue */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Intäkter</h3>
                  {incomeStatement.revenueAccounts.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">Inga intäkter under perioden</p>
                  ) : (
                    <div className="space-y-2">
                      {incomeStatement.revenueAccounts.map((row, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-slate-600">{row.accountNumber} {row.accountName}</span>
                          <span className="font-medium text-slate-900">{formatCurrency(row.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between mt-3 pt-3 border-t border-slate-200">
                    <span className="font-medium text-slate-900">Summa intäkter</span>
                    <span className="font-bold text-slate-900">{formatCurrency(incomeStatement.totalRevenue)}</span>
                  </div>
                </div>

                {/* Expenses */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Kostnader</h3>
                  {incomeStatement.expenseAccounts.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">Inga kostnader under perioden</p>
                  ) : (
                    <div className="space-y-2">
                      {incomeStatement.expenseAccounts.map((row, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-slate-600">{row.accountNumber} {row.accountName}</span>
                          <span className="font-medium text-neutral-700">-{formatCurrency(row.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between mt-3 pt-3 border-t border-slate-200">
                    <span className="font-medium text-slate-900">Summa kostnader</span>
                    <span className="font-bold text-neutral-700">-{formatCurrency(incomeStatement.totalExpenses)}</span>
                  </div>
                </div>

                {/* Result */}
                <div className="flex justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-900">Resultat</span>
                  <span className={`font-bold text-xl ${incomeStatement.netIncome >= 0 ? 'text-neutral-900' : 'text-neutral-700'}`}>
                    {formatCurrency(incomeStatement.netIncome)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Balance Sheet */}
          {activeReport === 'balance' && balanceSheet && (
            <div className="card">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Balansräkning</h2>
                <p className="text-sm text-slate-500">
                  Per {new Date(balanceSheet.asOfDate).toLocaleDateString('sv-SE')}
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Assets */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Tillgångar</h3>
                    {balanceSheet.assets.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">Inga tillgångar</p>
                    ) : (
                      <div className="space-y-2">
                        {balanceSheet.assets.map((row, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-slate-600">{row.accountNumber} {row.accountName}</span>
                            <span className="font-medium text-slate-900">{formatCurrency(row.balance)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between mt-3 pt-3 border-t border-slate-200">
                      <span className="font-medium text-slate-900">Summa tillgångar</span>
                      <span className="font-bold text-slate-900">{formatCurrency(balanceSheet.totalAssets)}</span>
                    </div>
                  </div>

                  {/* Liabilities & Equity */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Skulder</h3>
                    {balanceSheet.liabilities.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">Inga skulder</p>
                    ) : (
                      <div className="space-y-2">
                        {balanceSheet.liabilities.map((row, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-slate-600">{row.accountNumber} {row.accountName}</span>
                            <span className="font-medium text-slate-900">{formatCurrency(row.balance)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between mt-3 pt-3 border-t border-slate-200">
                      <span className="font-medium text-slate-900">Summa skulder</span>
                      <span className="font-bold text-slate-900">{formatCurrency(balanceSheet.totalLiabilities)}</span>
                    </div>
                    <div className="flex justify-between mt-4">
                      <span className="font-medium text-slate-900">Eget kapital</span>
                      <span className="font-bold text-slate-900">{formatCurrency(balanceSheet.equity)}</span>
                    </div>
                    <div className="flex justify-between mt-3 pt-3 border-t-2 border-slate-300">
                      <span className="font-semibold text-slate-900">Summa skulder och EK</span>
                      <span className="font-bold text-slate-900">{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VAT Report */}
          {activeReport === 'vat' && vatReport && (
            <div className="card">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Momsrapport</h2>
                <p className="text-sm text-slate-500">
                  {new Date(vatReport.fromDate).toLocaleDateString('sv-SE')} - {new Date(vatReport.toDate).toLocaleDateString('sv-SE')}
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Utgående moms</p>
                      <p className="text-sm text-slate-500">Moms på försäljning</p>
                    </div>
                    <span className="text-xl font-bold text-slate-900">{formatCurrency(vatReport.outputVat)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Ingående moms</p>
                      <p className="text-sm text-slate-500">Moms på inköp (avdragsgill)</p>
                    </div>
                    <span className="text-xl font-bold text-neutral-900">-{formatCurrency(vatReport.inputVat)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg border-2 border-neutral-200">
                    <div>
                      <p className="font-semibold text-neutral-900">Moms att betala</p>
                      <p className="text-sm text-neutral-600">Utgående - ingående moms</p>
                    </div>
                    <span className={`text-2xl font-bold ${vatReport.vatToPay >= 0 ? 'text-neutral-900' : 'text-neutral-900'}`}>
                      {formatCurrency(vatReport.vatToPay)}
                    </span>
                  </div>
                </div>

                {vatReport.vatToPay < 0 && (
                  <p className="mt-4 text-sm text-neutral-900">
                    Du har moms att få tillbaka från Skatteverket.
                  </p>
                )}
              </div>
            </div>
          )}

          {!incomeStatement && !balanceSheet && !vatReport && (
            <div className="card p-8 text-center">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Inga data</h2>
              <p className="text-slate-600">Börja bokföra för att se rapporter.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

