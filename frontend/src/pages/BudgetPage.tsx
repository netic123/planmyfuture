import { useEffect, useState } from 'react';
import { personalFinanceApi } from '../services/api';
import type { PersonalBudgetItem, BudgetSummary } from '../types';
import { BudgetItemType, BudgetCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import FormattedNumberInput from '../components/FormattedNumberInput';
import { LabelWithTooltip } from '../components/Tooltip';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Save,
  X
} from 'lucide-react';

const categoryLabels: Record<BudgetCategory, string> = {
  [BudgetCategory.Salary]: 'Lön',
  [BudgetCategory.Interest]: 'Ränta',
  [BudgetCategory.Rent]: 'Hyra',
  [BudgetCategory.Amortization]: 'Amortering',
  [BudgetCategory.Food]: 'Mat',
  [BudgetCategory.Transportation]: 'Transport',
  [BudgetCategory.Insurance]: 'Försäkring',
  [BudgetCategory.Utilities]: 'El/Vatten',
  [BudgetCategory.Entertainment]: 'Nöje',
  [BudgetCategory.Savings]: 'Sparande',
  [BudgetCategory.Other]: 'Övrigt',
};

export default function BudgetPage() {
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PersonalBudgetItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    type: BudgetItemType.Expense,
    category: BudgetCategory.Other,
    isRecurring: true,
    notes: '',
    sortOrder: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await personalFinanceApi.getBudgetSummary();
      setBudget(data);
    } catch (err) {
      console.error('Failed to load budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await personalFinanceApi.updateBudgetItem(editingItem.id, formData);
      } else {
        await personalFinanceApi.createBudgetItem(formData);
      }
      await loadData();
      resetForm();
    } catch (err) {
      console.error('Failed to save budget item:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Är du säker på att du vill ta bort denna post?')) return;
    try {
      await personalFinanceApi.deleteBudgetItem(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete budget item:', err);
    }
  };

  const handleEdit = (item: PersonalBudgetItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      amount: item.amount,
      type: item.type,
      category: item.category,
      isRecurring: item.isRecurring,
      notes: item.notes || '',
      sortOrder: item.sortOrder
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      amount: 0,
      type: BudgetItemType.Expense,
      category: BudgetCategory.Other,
      isRecurring: true,
      notes: '',
      sortOrder: 0
    });
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
          <h1 className="text-2xl font-semibold text-neutral-900">Månadsbudget</h1>
          <p className="text-sm text-neutral-500 mt-1">Hantera dina månadskostnader och inkomster</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Lägg till post
        </button>
      </div>

      {/* Summary */}
      {budget && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-5">
            <p className="text-sm text-neutral-500 mb-1">Total inkomst</p>
            <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(budget.totalIncome)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-neutral-500 mb-1">Totala utgifter</p>
            <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(budget.totalExpenses)}</p>
          </div>
          <div className="card p-5 bg-neutral-900 text-white">
            <p className="text-neutral-400 text-sm mb-1">Kvar över</p>
            <p className={`text-2xl font-semibold text-white`}>
              {formatCurrency(budget.balance)}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-900">
              {editingItem ? 'Redigera post' : 'Ny budgetpost'}
            </h2>
            <button onClick={resetForm} className="text-neutral-400 hover:text-neutral-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <LabelWithTooltip 
                label="Namn" 
                tooltip="Vad kallas inkomsten eller utgiften? T.ex. 'Lön', 'Hyra', 'Mat'" 
                required 
              />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="T.ex. Lön, Hyra, Mat"
                required
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Belopp per månad" 
                tooltip="Månadsbelopp i kronor. Lön anges efter skatt (netto)." 
                required 
              />
              <FormattedNumberInput
                value={formData.amount}
                onChange={(val) => setFormData({ ...formData, amount: val })}
                suffix="kr"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Typ" 
                tooltip="Inkomst = pengar du får in. Utgift = pengar som går ut" 
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
                className="input"
              >
                <option value={BudgetItemType.Income}>Inkomst</option>
                <option value={BudgetItemType.Expense}>Utgift</option>
              </select>
            </div>
            <div>
              <LabelWithTooltip 
                label="Kategori" 
                tooltip="Vilken kategori passar bäst? Hjälper till att sortera din budget" 
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) })}
                className="input"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Anteckningar</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={2}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800"
              >
                <Save className="h-4 w-4" />
                Spara
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income */}
        <div className="card p-6">
          <h2 className="text-sm font-medium text-neutral-900 flex items-center gap-2 mb-4">
            <ArrowUpRight className="h-4 w-4 text-neutral-400" />
            Inkomster
          </h2>
          <div className="space-y-2">
            {budget?.incomeItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                  <p className="text-xs text-neutral-400">{categoryLabels[item.category]}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-900">{formatCurrency(item.amount)}</span>
                  <button onClick={() => handleEdit(item)} className="text-neutral-400 hover:text-neutral-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-neutral-400 hover:text-neutral-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {(!budget?.incomeItems || budget.incomeItems.length === 0) && (
              <p className="text-neutral-400 text-sm text-center py-4">Inga inkomster registrerade</p>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div className="card p-6">
          <h2 className="text-sm font-medium text-neutral-900 flex items-center gap-2 mb-4">
            <ArrowDownRight className="h-4 w-4 text-neutral-400" />
            Utgifter
          </h2>
          <div className="space-y-2">
            {budget?.expenseItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                  <p className="text-xs text-neutral-400">{categoryLabels[item.category]}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-900">{formatCurrency(item.amount)}</span>
                  <button onClick={() => handleEdit(item)} className="text-neutral-400 hover:text-neutral-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-neutral-400 hover:text-neutral-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {(!budget?.expenseItems || budget.expenseItems.length === 0) && (
              <p className="text-neutral-400 text-sm text-center py-4">Inga utgifter registrerade</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
