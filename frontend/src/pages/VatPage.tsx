import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { vatApi } from '../services/api';
import type { VatSummary, VatPeriod } from '../types';
import { VatPeriodType } from '../types';
import {
  Loader2,
  Receipt,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  X
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const periodTypeLabels: Record<VatPeriodType, string> = {
  [VatPeriodType.Monthly]: 'Månadsvis',
  [VatPeriodType.Quarterly]: 'Kvartalsvis',
  [VatPeriodType.Yearly]: 'Årsvis',
};

export default function VatPage() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [periodType, setPeriodType] = useState<VatPeriodType>(VatPeriodType.Quarterly);
  const [vatSummary, setVatSummary] = useState<VatSummary | null>(null);
  
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<VatPeriod | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | undefined>(undefined);

  const loadVatData = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    setError(null);
    try {
      const data = await vatApi.getSummary(selectedCompany.id, year, periodType);
      setVatSummary(data);
    } catch (err) {
      console.error('Failed to load VAT data:', err);
      setError('Kunde inte ladda momsdata.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVatData();
  }, [selectedCompany, year, periodType]);

  const handleMarkAsPaid = async () => {
    if (!selectedCompany || !selectedPeriod) return;
    
    try {
      await vatApi.markAsPaid(selectedCompany.id, {
        year: selectedPeriod.year,
        period: selectedPeriod.period,
        periodType: selectedPeriod.periodType,
        paidAmount: paidAmount,
        paymentReference: paymentReference || undefined,
        notes: paymentNotes || undefined,
      });
      alert(`${selectedPeriod.periodName} ${year} markerad som betald`);
      setIsPayDialogOpen(false);
      setSelectedPeriod(null);
      setPaymentReference('');
      setPaymentNotes('');
      setPaidAmount(undefined);
      await loadVatData();
    } catch (err) {
      console.error('Failed to mark as paid:', err);
      alert('Kunde inte markera som betald.');
    }
  };

  const handleUnmarkAsPaid = async (period: VatPeriod) => {
    if (!selectedCompany) return;
    
    if (!confirm(`Vill du ångra betalningen för ${period.periodName} ${year}?`)) return;
    
    try {
      await vatApi.unmarkAsPaid(selectedCompany.id, year, period.period, periodType);
      alert(`${period.periodName} ${year} är nu inte längre markerad som betald`);
      await loadVatData();
    } catch (err) {
      console.error('Failed to unmark as paid:', err);
      alert('Kunde inte ångra betalningen.');
    }
  };

  const openPayDialog = (period: VatPeriod) => {
    setSelectedPeriod(period);
    setPaidAmount(period.vatToPay);
    setIsPayDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-neutral-500 p-4">
        <p>{error}</p>
        <button onClick={loadVatData} className="mt-4 btn-primary">Försök igen</button>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Momshantering</h1>
          <p className="text-neutral-500">{periodTypeLabels[periodType]} redovisning {year}</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={periodType}
            onChange={(e) => setPeriodType(parseInt(e.target.value) as VatPeriodType)}
            className="input w-auto"
          >
            <option value={VatPeriodType.Monthly}>Månadsvis</option>
            <option value={VatPeriodType.Quarterly}>Kvartalsvis</option>
            <option value={VatPeriodType.Yearly}>Årsvis</option>
          </select>
          <select 
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input w-auto"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {vatSummary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="card p-5 border-l-4 border-l-neutral-400">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Utgående moms</span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(vatSummary.totalOutputVat)}</p>
              <p className="text-xs text-neutral-400">Från försäljning</p>
            </div>

            <div className="card p-5 border-l-4 border-l-neutral-500">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">Ingående moms</span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(vatSummary.totalInputVat)}</p>
              <p className="text-xs text-neutral-400">Från inköp</p>
            </div>

            <div className="card p-5 border-l-4 border-l-neutral-600">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Receipt className="h-4 w-4" />
                <span className="text-sm">Moms att betala</span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">
                {formatCurrency(vatSummary.totalVatToPay)}
              </p>
              <p className="text-xs text-neutral-400">{vatSummary.totalVatToPay < 0 ? 'Fordran på SKV' : 'Skuld till SKV'}</p>
            </div>

            <div className="card p-5 border-l-4 border-l-neutral-700">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Betalt</span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(vatSummary.totalPaid)}</p>
              <p className="text-xs text-neutral-400">Totalt redovisat</p>
            </div>

            <div className="card p-5 border-l-4 border-l-neutral-900">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">Kvar att betala</span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">
                {formatCurrency(vatSummary.remaining)}
              </p>
              <p className="text-xs text-neutral-400">{vatSummary.remaining <= 0 ? 'Allt redovisat' : 'Ej redovisat'}</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 bg-neutral-50 border-b">
              <h2 className="text-lg font-medium text-neutral-900">Momsperioder {year}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Period</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Datum</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Utgående</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ingående</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Att betala</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Åtgärd</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {vatSummary.periods.map((period) => (
                    <tr key={`${period.year}-${period.period}`} className={period.isPaid ? 'bg-neutral-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-neutral-400" />
                          <span className="font-medium text-neutral-900">{period.periodName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {formatDate(period.fromDate)} → {formatDate(period.toDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-neutral-700">
                        {formatCurrency(period.outputVat)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-neutral-600">
                        {formatCurrency(period.inputVat)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-neutral-900">
                        {formatCurrency(period.vatToPay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {period.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-900 text-white">
                            <CheckCircle className="h-3 w-3" />
                            Betald
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                            <XCircle className="h-3 w-3" />
                            Ej betald
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {period.isPaid ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-neutral-500">
                              {period.paidAt && `Betald ${formatDate(period.paidAt)}`}
                            </span>
                            <button
                              onClick={() => handleUnmarkAsPaid(period)}
                              className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
                            >
                              Ångra
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openPayDialog(period)}
                            className="btn-primary text-sm py-1.5 px-3"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Markera betald
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Payment Dialog */}
      {isPayDialogOpen && selectedPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Markera {selectedPeriod.periodName} {year} som betald</h3>
              <button onClick={() => setIsPayDialogOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Moms att betala</label>
                <p className="text-xl font-semibold text-neutral-900">
                  {formatCurrency(selectedPeriod?.vatToPay || 0)}
                </p>
              </div>
              <div>
                <label htmlFor="paidAmount" className="label">Betalt belopp</label>
                <input
                  id="paidAmount"
                  type="number"
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || undefined)}
                  className="input"
                  step="0.01"
                />
              </div>
              <div>
                <label htmlFor="paymentReference" className="label">Referens</label>
                <input
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="input"
                  placeholder="OCR-nummer eller betalningsreferens"
                />
              </div>
              <div>
                <label htmlFor="paymentNotes" className="label">Anteckningar</label>
                <textarea
                  id="paymentNotes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="input"
                  placeholder="Valfria anteckningar..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t bg-neutral-50">
              <button 
                onClick={() => setIsPayDialogOpen(false)}
                className="btn-secondary"
              >
                Avbryt
              </button>
              <button 
                onClick={handleMarkAsPaid}
                className="btn-primary"
              >
                <CheckCircle className="h-4 w-4" />
                Markera som betald
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
