import { useEffect, useState } from 'react';
import { personalFinanceApi } from '../services/api';
import type { Debt } from '../types';
import { DebtType } from '../types';
import { formatCurrency } from '../utils/formatters';
import FormattedNumberInput from '../components/FormattedNumberInput';
import { LabelWithTooltip } from '../components/Tooltip';
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  X,
  CreditCard,
  Home,
  Building2,
  Car,
  GraduationCap
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

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    lender: '',
    type: DebtType.Mortgage,
    originalAmount: 0,
    currentBalance: 0,
    assetValue: undefined as number | undefined,
    interestRate: 0,
    monthlyPayment: undefined as number | undefined,
    monthlyAmortization: undefined as number | undefined,
    notes: '',
    sortOrder: 0
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDebt) {
        await personalFinanceApi.updateDebt(editingDebt.id, { ...formData, isActive: true });
      } else {
        await personalFinanceApi.createDebt(formData);
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
      name: debt.name,
      lender: debt.lender || '',
      type: debt.type,
      originalAmount: debt.originalAmount,
      currentBalance: debt.currentBalance,
      assetValue: debt.assetValue,
      interestRate: debt.interestRate,
      monthlyPayment: debt.monthlyPayment,
      monthlyAmortization: debt.monthlyAmortization,
      notes: debt.notes || '',
      sortOrder: debt.sortOrder
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDebt(null);
    setFormData({
      name: '',
      lender: '',
      type: DebtType.Mortgage,
      originalAmount: 0,
      currentBalance: 0,
      assetValue: undefined,
      interestRate: 0,
      monthlyPayment: undefined,
      monthlyAmortization: undefined,
      notes: '',
      sortOrder: 0
    });
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalEquity = debts.reduce((sum, d) => sum + d.equityInAsset, 0);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-6 bg-neutral-900 text-white">
          <p className="text-neutral-400 text-sm mb-1">Total skuld</p>
          <p className="text-3xl font-semibold">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500 mb-1">Eget kapital i tillgångar</p>
          <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(totalEquity)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500 mb-1">Antal skulder</p>
          <p className="text-2xl font-semibold text-neutral-900">{debts.length}</p>
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <LabelWithTooltip 
                label="Namn" 
                tooltip="Ge lånet ett namn så du lätt känner igen det, t.ex. 'Bostadslån Nordea'" 
                required 
              />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="T.ex. Bostadslån"
                required
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Långivare" 
                tooltip="Banken eller företaget som du lånat pengar av" 
              />
              <input
                type="text"
                value={formData.lender}
                onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                className="input"
                placeholder="T.ex. SBAB, Nordea, Handelsbanken"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Typ" 
                tooltip="Vilken typ av lån är det? Detta hjälper till att kategorisera dina skulder" 
              />
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
            <div>
              <LabelWithTooltip 
                label="Lånat belopp (ursprungligt)" 
                tooltip="Hur mycket lånade du från början? T.ex. om du tog ett lån på 3 000 000 kr" 
              />
              <FormattedNumberInput
                value={formData.originalAmount}
                onChange={(val) => setFormData({ ...formData, originalAmount: val })}
                suffix="kr"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Kvar att betala" 
                tooltip="Hur mycket är kvar att betala på lånet idag? Hittas på kontoutdrag eller i din bank-app" 
                required 
              />
              <FormattedNumberInput
                value={formData.currentBalance}
                onChange={(val) => setFormData({ ...formData, currentBalance: val })}
                suffix="kr"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Bostadens marknadsvärde" 
                tooltip="Vad är bostaden värd idag? Används för att räkna ut ditt eget kapital (bostadens värde minus kvarvarande lån)" 
              />
              <FormattedNumberInput
                value={formData.assetValue || 0}
                onChange={(val) => setFormData({ ...formData, assetValue: val || undefined })}
                suffix="kr"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Ränta" 
                tooltip="Din aktuella räntesats på lånet, t.ex. 2.72%. Hittas på ditt kontoutdrag" 
              />
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
            </div>
            <div>
              <LabelWithTooltip 
                label="Avgift/mån (ej ränta/amortering)" 
                tooltip="Fasta månadsavgifter utöver ränta och amortering, t.ex. bostadsrättsavgift, försäkring, eller administrationsavgifter" 
              />
              <FormattedNumberInput
                value={formData.monthlyPayment || 0}
                onChange={(val) => setFormData({ ...formData, monthlyPayment: val || undefined })}
                suffix="kr"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Amortering/mån" 
                tooltip="Hur mycket betalar du av på lånet varje månad? Detta minskar din skuld" 
              />
              <FormattedNumberInput
                value={formData.monthlyAmortization || 0}
                onChange={(val) => setFormData({ ...formData, monthlyAmortization: val || undefined })}
                suffix="kr"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3">
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
                  <h3 className="font-medium text-neutral-900">{debt.name}</h3>
                  <p className="text-sm text-neutral-500">{debt.lender || debtTypeLabels[debt.type]}</p>
                  {debt.interestRate > 0 && (
                    <p className="text-xs text-neutral-400 mt-1">Ränta: {debt.interestRate}%</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-right">
                  <p className="text-xl font-semibold text-neutral-900">{formatCurrency(debt.currentBalance)}</p>
                  {debt.assetValue && debt.assetValue > 0 && (
                    <p className="text-sm text-neutral-600">
                      Eget kapital: {formatCurrency(debt.equityInAsset)}
                    </p>
                  )}
                  <p className="text-xs text-neutral-400">{debt.remainingPercentage.toFixed(1)}% kvar</p>
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
            {/* Progress bar */}
            {debt.originalAmount > 0 && (
              <div className="mt-4">
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 transition-all"
                    style={{ width: `${100 - debt.remainingPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {formatCurrency(debt.originalAmount - debt.currentBalance)} av {formatCurrency(debt.originalAmount)} avbetalat
                </p>
              </div>
            )}
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
