import { useEffect, useState } from 'react';
import { personalFinanceApi } from '../services/api';
import type { Debt } from '../types';
import { DebtType } from '../types';
import { formatCurrency } from '../utils/formatters';
import FormattedNumberInput from '../components/FormattedNumberInput';
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  X,
  CreditCard,
  Home,
  Car,
  GraduationCap,
  Building2
} from 'lucide-react';

const debtTypeLabels: Record<DebtType, string> = {
  [DebtType.Mortgage]: 'Bolån',
  [DebtType.StudentLoan]: 'Studielån',
  [DebtType.CarLoan]: 'Billån',
  [DebtType.PersonalLoan]: 'Privatlån',
  [DebtType.CreditCard]: 'Kreditkort',
  [DebtType.TaxDebt]: 'Skatteskuld',
  [DebtType.BusinessLoan]: 'Företagslån',
  [DebtType.Other]: 'Övrigt',
};

// Types that typically have an asset value
const assetDebtTypes = [DebtType.Mortgage, DebtType.CarLoan];

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState({
    type: DebtType.Mortgage,
    currentBalance: 0,
    assetValue: undefined as number | undefined,
    interestRate: 0,
    amortizationRate: undefined as number | undefined,
    monthlyPayment: undefined as number | undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await personalFinanceApi.getDebts();
      setDebts(data);
    } catch (err) {
      console.error('Failed to load debts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate monthly values in real-time
  const calculatedMonthlyInterest = formData.currentBalance * (formData.interestRate / 100) / 12;
  const calculatedMonthlyAmortization = formData.amortizationRate 
    ? formData.currentBalance * (formData.amortizationRate / 100) / 12 
    : 0;
  const calculatedEquity = formData.assetValue 
    ? formData.assetValue - formData.currentBalance 
    : 0;
  const showAssetField = assetDebtTypes.includes(formData.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        type: formData.type,
        currentBalance: formData.currentBalance,
        assetValue: formData.assetValue,
        interestRate: formData.interestRate,
        amortizationRate: formData.amortizationRate,
        monthlyPayment: formData.monthlyPayment,
      };
      
      if (editingDebt) {
        await personalFinanceApi.updateDebt(editingDebt.id, { ...payload, isActive: true });
      } else {
        await personalFinanceApi.createDebt(payload);
      }
      await loadData();
      resetForm();
    } catch (err) {
      console.error('Failed to save debt:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Är du säker på att du vill ta bort denna skuld?')) return;
    try {
      await personalFinanceApi.deleteDebt(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete debt:', err);
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      type: debt.type,
      currentBalance: debt.currentBalance,
      assetValue: debt.assetValue,
      interestRate: debt.interestRate,
      amortizationRate: debt.amortizationRate,
      monthlyPayment: debt.monthlyPayment,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDebt(null);
    setFormData({
      type: DebtType.Mortgage,
      currentBalance: 0,
      assetValue: undefined,
      interestRate: 0,
      amortizationRate: undefined,
      monthlyPayment: undefined,
    });
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalEquity = debts.reduce((sum, d) => sum + d.equityInAsset, 0);
  const totalMonthlyInterest = debts.reduce((sum, d) => sum + d.monthlyInterest, 0);
  const totalMonthlyAmortization = debts.reduce((sum, d) => sum + d.calculatedMonthlyAmortization, 0);

  const getDebtIcon = (type: DebtType) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case DebtType.Mortgage: return <Home className={iconClass} />;
      case DebtType.CarLoan: return <Car className={iconClass} />;
      case DebtType.StudentLoan: return <GraduationCap className={iconClass} />;
      case DebtType.TaxDebt: return <Building2 className={iconClass} />;
      default: return <CreditCard className={iconClass} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Skulder</h1>
          <p className="text-sm text-neutral-500 mt-1">Hantera dina lån och skulder</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Lägg till skuld
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5 bg-neutral-900 text-white">
          <p className="text-neutral-400 text-sm mb-1">Total skuld</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500 mb-1">Eget kapital</p>
          <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(totalEquity)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500 mb-1">Månadsränta</p>
          <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(totalMonthlyInterest)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500 mb-1">Månadsamortering</p>
          <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(totalMonthlyAmortization)}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-900">
              {editingDebt ? 'Redigera skuld' : 'Ny skuld'}
            </h2>
            <button onClick={resetForm} className="text-neutral-400 hover:text-neutral-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Typ av lån</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
                  className="input"
                >
                  {Object.entries(debtTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              {showAssetField && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {formData.type === DebtType.Mortgage ? "Bostadens värde" : "Tillgångens värde"}
                  </label>
                  <FormattedNumberInput
                    value={formData.assetValue || 0}
                    onChange={(val) => setFormData({ ...formData, assetValue: val || undefined })}
                    suffix="kr"
                  />
                </div>
              )}
            </div>

            {/* Row 2: Loan amount */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Kvarvarande lån (kr)</label>
              <FormattedNumberInput
                value={formData.currentBalance}
                onChange={(val) => setFormData({ ...formData, currentBalance: val })}
                suffix="kr"
              />
            </div>

            {/* Row 3: Interest and Amortization rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Ränta (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.interestRate || ''}
                    onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                    className="input pr-10"
                    step="0.01"
                    placeholder="2.72"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
                {formData.interestRate > 0 && formData.currentBalance > 0 && (
                  <p className="text-sm text-neutral-500 mt-1">
                    = {formatCurrency(calculatedMonthlyInterest)}/mån
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Amortering (%/år)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amortizationRate || ''}
                    onChange={(e) => setFormData({ ...formData, amortizationRate: parseFloat(e.target.value) || undefined })}
                    className="input pr-10"
                    step="0.01"
                    placeholder="2"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
                {formData.amortizationRate && formData.amortizationRate > 0 && formData.currentBalance > 0 && (
                  <p className="text-sm text-neutral-500 mt-1">
                    = {formatCurrency(calculatedMonthlyAmortization)}/mån
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Monthly fee */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Månadsavgift (kr)</label>
              <FormattedNumberInput
                value={formData.monthlyPayment || 0}
                onChange={(val) => setFormData({ ...formData, monthlyPayment: val || undefined })}
                suffix="kr"
              />
            </div>

            {/* Equity display */}
            {showAssetField && formData.assetValue && formData.assetValue > 0 && (
              <div className="bg-neutral-100 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Ditt eget kapital i tillgången:</span>
                  <span className="text-lg font-semibold text-neutral-900">
                    {formatCurrency(calculatedEquity)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {formatCurrency(formData.assetValue)} (värde) − {formatCurrency(formData.currentBalance)} (lån)
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">
                Avbryt
              </button>
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800">
                <Save className="h-4 w-4" />
                Spara
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Debt list */}
      <div className="space-y-4">
        {debts.map((debt) => (
          <div key={debt.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600">
                  {getDebtIcon(debt.type)}
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">{debtTypeLabels[debt.type]}</h3>
                  <div className="text-sm text-neutral-500 space-y-0.5 mt-1">
                    {debt.interestRate > 0 && (
                      <p>Ränta: {debt.interestRate}% ({formatCurrency(debt.monthlyInterest)}/mån)</p>
                    )}
                    {debt.calculatedMonthlyAmortization > 0 && (
                      <p>Amortering: {debt.amortizationRate}% ({formatCurrency(debt.calculatedMonthlyAmortization)}/mån)</p>
                    )}
                    {debt.monthlyPayment && debt.monthlyPayment > 0 && (
                      <p>Avgift: {formatCurrency(debt.monthlyPayment)}/mån</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-right">
                  <p className="text-xl font-semibold text-neutral-900">{formatCurrency(debt.currentBalance)}</p>
                  {debt.assetValue && debt.assetValue > 0 && (
                    <>
                      <p className="text-sm text-neutral-600">
                        Eget kapital: {formatCurrency(debt.equityInAsset)}
                      </p>
                      <p className="text-xs text-neutral-400">
                        Tillgångsvärde: {formatCurrency(debt.assetValue)}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(debt)} className="p-2 text-neutral-400 hover:text-neutral-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(debt.id)} className="p-2 text-neutral-400 hover:text-neutral-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {debts.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Inga skulder registrerade</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-sm text-neutral-600 hover:text-neutral-900 font-medium"
          >
            Lägg till din första skuld
          </button>
        </div>
      )}
    </div>
  );
}
