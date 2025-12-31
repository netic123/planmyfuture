import { useEffect, useState, useMemo } from 'react';
import { useCompany } from '../context/CompanyContext';
import { reportsApi, yearEndApi } from '../services/api';
import type { Dashboard, TaxCalculation } from '../types';
import { 
  FileText, 
  Users, 
  Wallet,
  AlertCircle,
  Loader2,
  Calendar,
  Building2,
  Receipt
} from 'lucide-react';

export default function DashboardPage() {
  const { selectedCompany } = useCompany();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [taxData, setTaxData] = useState<TaxCalculation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany) {
      loadDashboard();
    }
  }, [selectedCompany]);

  const loadDashboard = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const [dashboardData, taxCalc] = await Promise.all([
        reportsApi.getDashboard(selectedCompany.id),
        yearEndApi.getTaxCalculation(selectedCompany.id, currentYear).catch(() => null),
      ]);
      setDashboard(dashboardData);
      setTaxData(taxCalc);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompact = (amount: number) => {
    if (Math.abs(amount) >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} mkr`;
    } else if (Math.abs(amount) >= 1000) {
      return `${Math.round(amount / 1000)} tkr`;
    }
    return `${Math.round(amount)} kr`;
  };

  // Beräkna kumulativt resultat och statistik
  const chartData = useMemo(() => {
    if (!dashboard?.monthlyRevenue) return null;
    
    const currentMonth = new Date().getMonth() + 1;
    const months = dashboard.monthlyRevenue;
    
    let cumulativeRevenue = 0;
    let cumulativeExpenses = 0;
    
    const data = months.map((month, index) => {
      const monthNum = index + 1;
      const isPast = monthNum <= currentMonth;
      
      if (isPast) {
        cumulativeRevenue += month.revenue;
        cumulativeExpenses += month.expenses;
      }
      
      return {
        ...month,
        monthNum,
        isPast,
        cumulativeRevenue,
        cumulativeExpenses,
        cumulativeResult: cumulativeRevenue - cumulativeExpenses,
      };
    });
    
    const pastMonths = data.filter(m => m.isPast);
    const avgRevenue = pastMonths.length > 0 
      ? pastMonths.reduce((sum, m) => sum + m.revenue, 0) / pastMonths.length 
      : 0;
    const avgExpenses = pastMonths.length > 0 
      ? pastMonths.reduce((sum, m) => sum + m.expenses, 0) / pastMonths.length 
      : 0;
    
    let projectedCumulativeRevenue = cumulativeRevenue;
    let projectedCumulativeExpenses = cumulativeExpenses;
    
    const projectedData = data.map((month) => {
      if (month.isPast) {
        return { ...month, projectedRevenue: 0, projectedExpenses: 0, projectedResult: null };
      }
      
      projectedCumulativeRevenue += avgRevenue;
      projectedCumulativeExpenses += avgExpenses;
      
      return {
        ...month,
        projectedRevenue: avgRevenue,
        projectedExpenses: avgExpenses,
        projectedResult: projectedCumulativeRevenue - projectedCumulativeExpenses,
      };
    });
    
    const allValues = projectedData.flatMap(m => [
      m.revenue, 
      m.expenses, 
      Math.abs(m.cumulativeResult),
      m.projectedResult ? Math.abs(m.projectedResult) : 0
    ]);
    const maxValue = Math.max(...allValues, 1);
    
    const rollingRevenue = pastMonths.reduce((sum, m) => sum + m.revenue, 0);
    const rollingExpenses = pastMonths.reduce((sum, m) => sum + m.expenses, 0);
    const rollingResult = rollingRevenue - rollingExpenses;
    
    return {
      months: projectedData,
      maxValue,
      currentMonth,
      avgRevenue,
      avgExpenses,
      rollingRevenue,
      rollingExpenses,
      rollingResult,
    };
  }, [dashboard]);

  if (!selectedCompany) {
    return (
      <div className="p-8">
        <div className="card p-8 text-center">
          <AlertCircle className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-neutral-900 mb-2">Inget företag valt</h2>
          <p className="text-neutral-500">Välj ett företag i menyn för att se översikten.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Översikt</h1>
        <p className="text-neutral-500 mt-1">{selectedCompany.name}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 border-l-4 border-l-neutral-900">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-neutral-500">Resultat, RÅ</span>
          </div>
          <p className={`text-2xl font-semibold ${(chartData?.rollingResult || 0) >= 0 ? 'text-neutral-900' : 'text-neutral-500'}`}>
            {formatCompact(chartData?.rollingResult || dashboard?.profit || 0)}
          </p>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Jan → Dec {new Date().getFullYear().toString().slice(-2)}
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-neutral-600">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-neutral-500">Omsättning, RÅ</span>
          </div>
          <p className="text-2xl font-semibold text-neutral-900">
            {formatCompact(chartData?.rollingRevenue || dashboard?.totalRevenue || 0)}
          </p>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Jan → Dec {new Date().getFullYear().toString().slice(-2)}
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-neutral-400">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-neutral-500">Kostnader, RÅ</span>
          </div>
          <p className="text-2xl font-semibold text-neutral-700">
            {formatCompact(chartData?.rollingExpenses || dashboard?.totalExpenses || 0)}
          </p>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Jan → Dec {new Date().getFullYear().toString().slice(-2)}
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-neutral-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-neutral-500">Obetalda fakturor</span>
          </div>
          <p className="text-2xl font-semibold text-neutral-700">{formatCompact(dashboard?.unpaidAmount || 0)}</p>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {dashboard?.unpaidInvoices || 0} fakturor
          </p>
        </div>
      </div>

      {/* Tax liability */}
      {taxData && (
        <div className="card p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-5 w-5 text-neutral-600" />
            <div>
              <h2 className="text-lg font-medium text-neutral-900">Skuld till Skatteverket</h2>
              <p className="text-sm text-neutral-500">Beräknat hittills {new Date().getFullYear()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <Building2 className="h-4 w-4" />
                Bolagsskatt (20.6%)
              </div>
              <p className="text-xl font-semibold text-neutral-900">
                {formatCurrency(taxData.corporateTax)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                På vinst: {formatCurrency(taxData.resultBeforeTax)}
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <Receipt className="h-4 w-4" />
                Moms netto
              </div>
              <p className="text-xl font-semibold text-neutral-900">
                {formatCurrency(taxData.vatToPay)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Utg: {formatCurrency(taxData.outputVat)} / Ing: {formatCurrency(taxData.inputVat)}
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <Users className="h-4 w-4" />
                Arbetsgivaravgifter
              </div>
              <p className="text-xl font-semibold text-neutral-900">
                {formatCurrency(taxData.totalEmployerContributions)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                31.4% av löner
              </p>
            </div>

            <div className="bg-neutral-900 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-300 font-medium mb-1">
                <Wallet className="h-4 w-4" />
                Totalt att betala
              </div>
              <p className="text-2xl font-semibold text-white">
                {formatCurrency(taxData.totalTaxLiabilities)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Inkl. preliminärskatt anställda
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Fakturor</p>
              <p className="text-2xl font-semibold text-neutral-900">{dashboard?.invoiceCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Kunder</p>
              <p className="text-2xl font-semibold text-neutral-900">{dashboard?.customerCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Anställda</p>
              <p className="text-2xl font-semibold text-neutral-900">{dashboard?.employeeCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-6">Månadsvis utveckling</h2>
        
        {chartData && (
          <div className="relative">
            <div className="flex">
              <div className="flex flex-col justify-between text-right pr-3 text-xs text-neutral-400 h-64">
                <span>{formatCompact(chartData.maxValue)}</span>
                <span>{formatCompact(chartData.maxValue * 0.75)}</span>
                <span>{formatCompact(chartData.maxValue * 0.5)}</span>
                <span>{formatCompact(chartData.maxValue * 0.25)}</span>
                <span>0 kr</span>
              </div>
              
              <div className="flex-1 relative h-64 border-l border-b border-neutral-200">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="border-t border-neutral-100 w-full" />
                  ))}
                </div>
                
                <div className="absolute inset-0 flex items-end px-2">
                  {chartData.months.map((month, index) => {
                    const maxMonthlyValue = Math.max(
                      ...chartData.months.map(m => Math.max(m.revenue, m.expenses, m.projectedRevenue || 0, m.projectedExpenses || 0)),
                      1
                    );
                    const barMaxHeight = 60;
                    const revenueHeight = (month.revenue / maxMonthlyValue) * barMaxHeight;
                    const expenseHeight = (month.expenses / maxMonthlyValue) * barMaxHeight;
                    const projectedRevenueHeight = month.projectedRevenue 
                      ? (month.projectedRevenue / maxMonthlyValue) * barMaxHeight 
                      : 0;
                    const projectedExpenseHeight = month.projectedExpenses
                      ? (month.projectedExpenses / maxMonthlyValue) * barMaxHeight
                      : 0;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div className="flex gap-1 items-end w-full justify-center px-1">
                          {month.isPast ? (
                            <>
                              <div 
                                className="flex-1 max-w-[24px] bg-neutral-800 rounded-t-sm transition-all duration-300 hover:bg-neutral-700 cursor-pointer"
                                style={{ 
                                  height: month.revenue > 0 ? `${Math.max(revenueHeight, 4)}%` : '3px',
                                  minHeight: month.revenue > 0 ? '8px' : '3px'
                                }}
                                title={`Omsättning: ${formatCurrency(month.revenue)}`}
                              />
                              <div 
                                className="flex-1 max-w-[24px] bg-neutral-400 rounded-t-sm transition-all duration-300 hover:bg-neutral-500 cursor-pointer"
                                style={{ 
                                  height: month.expenses > 0 ? `${Math.max(expenseHeight, 4)}%` : '3px',
                                  minHeight: month.expenses > 0 ? '8px' : '3px'
                                }}
                                title={`Kostnader: ${formatCurrency(month.expenses)}`}
                              />
                            </>
                          ) : (
                            <>
                              <div 
                                className="flex-1 max-w-[24px] bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-t-sm"
                                style={{ 
                                  height: projectedRevenueHeight > 0 ? `${Math.max(projectedRevenueHeight, 4)}%` : '3px',
                                  minHeight: '3px'
                                }}
                                title={`Est. omsättning: ${formatCurrency(month.projectedRevenue || 0)}`}
                              />
                              <div 
                                className="flex-1 max-w-[24px] bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-t-sm"
                                style={{ 
                                  height: projectedExpenseHeight > 0 ? `${Math.max(projectedExpenseHeight, 4)}%` : '3px',
                                  minHeight: '3px'
                                }}
                                title={`Est. kostnader: ${formatCurrency(month.projectedExpenses || 0)}`}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
                  {(() => {
                    const pastMonths = chartData.months.filter(m => m.isPast);
                    if (pastMonths.length < 2) return null;
                    
                    const points = pastMonths.map((month, idx) => {
                      const x = (idx + 0.5) / chartData.months.length * 100;
                      const y = 100 - (month.cumulativeResult / chartData.maxValue) * 100;
                      return `${x},${Math.max(5, Math.min(95, y))}`;
                    });
                    
                    return (
                      <polyline
                        fill="none"
                        stroke="#171717"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points.join(' ')}
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })()}
                  
                  {(() => {
                    const lastPast = chartData.months.filter(m => m.isPast).slice(-1)[0];
                    const futureMonths = chartData.months.filter(m => !m.isPast && m.projectedResult);
                    if (!lastPast || futureMonths.length === 0) return null;
                    
                    const startX = (chartData.currentMonth - 0.5) / chartData.months.length * 100;
                    const startY = 100 - (lastPast.cumulativeResult / chartData.maxValue) * 100;
                    
                    const points = [`${startX},${Math.max(5, Math.min(95, startY))}`];
                    
                    futureMonths.forEach((month, idx) => {
                      const x = (chartData.currentMonth + idx + 0.5) / chartData.months.length * 100;
                      const y = 100 - ((month.projectedResult || 0) / chartData.maxValue) * 100;
                      points.push(`${x},${Math.max(5, Math.min(95, y))}`);
                    });
                    
                    return (
                      <polyline
                        fill="none"
                        stroke="#737373"
                        strokeWidth="2"
                        strokeDasharray="6,4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points.join(' ')}
                        opacity="0.7"
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })()}
                  
                  {chartData.months.filter(m => m.isPast).map((month, idx) => {
                    const x = (idx + 0.5) / chartData.months.length * 100;
                    const y = 100 - (month.cumulativeResult / chartData.maxValue) * 100;
                    return (
                      <g key={idx} className="cursor-pointer">
                        <circle
                          cx={`${x}%`}
                          cy={`${Math.max(5, Math.min(95, y))}%`}
                          r="5"
                          fill="#171717"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <title>Resultat: {formatCurrency(month.cumulativeResult)}</title>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
            
            <div className="flex mt-2 ml-12">
              {chartData.months.map((month, index) => (
                <div key={index} className="flex-1 text-center">
                  <span className={`text-xs font-medium ${
                    month.monthNum === chartData.currentMonth 
                      ? 'text-neutral-900 font-semibold' 
                      : month.isPast 
                        ? 'text-neutral-500' 
                        : 'text-neutral-300'
                  }`}>
                    {month.monthName.substring(0, 3).charAt(0).toUpperCase() + month.monthName.substring(1, 3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm bg-neutral-800"></div>
            <span className="text-sm text-neutral-500">Omsättning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm bg-neutral-400"></div>
            <span className="text-sm text-neutral-500">Kostnader</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-neutral-900 rounded"></div>
            <div className="w-4 h-0.5 border-t-2 border-dashed border-neutral-500"></div>
            <span className="text-sm text-neutral-500">Resultat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
