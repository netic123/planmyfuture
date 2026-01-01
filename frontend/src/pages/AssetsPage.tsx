import { useEffect, useState } from 'react';
import { personalFinanceApi } from '../services/api';
import type { FinancialAccount } from '../types';
import { FinancialAccountCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import FormattedNumberInput from '../components/FormattedNumberInput';
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  X,
  PiggyBank,
  Landmark,
  TrendingUp,
  Home,
  Building2,
  Wallet,
  Banknote
} from 'lucide-react';

const categoryLabels: Record<FinancialAccountCategory, string> = {
  [FinancialAccountCategory.Cash]: 'Kontanter',
  [FinancialAccountCategory.BankAccount]: 'Bankkonto',
  [FinancialAccountCategory.Savings]: 'Sparkonto',
  [FinancialAccountCategory.Investment]: 'Investeringar',
  [FinancialAccountCategory.Pension]: 'Pension',
  [FinancialAccountCategory.RealEstate]: 'Fastighet',
  [FinancialAccountCategory.Business]: 'Företag',
  [FinancialAccountCategory.Crypto]: 'Krypto',
  [FinancialAccountCategory.Other]: 'Övrigt',
};

export default function AssetsPage() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    balance: 0,
    category: FinancialAccountCategory.BankAccount,
    accountNumber: '',
    color: '',
    icon: '',
    sortOrder: 0,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await personalFinanceApi.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await personalFinanceApi.updateAccount(editingAccount.id, { ...formData, isActive: true });
      } else {
        await personalFinanceApi.createAccount(formData);
      }
      await loadData();
      resetForm();
    } catch (err) {
      console.error('Failed to save account:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Är du säker på att du vill ta bort detta konto?')) return;
    try {
      await personalFinanceApi.deleteAccount(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  const handleEdit = (account: FinancialAccount) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      institution: account.institution || '',
      balance: account.balance,
      category: account.category,
      accountNumber: account.accountNumber || '',
      color: account.color || '',
      icon: account.icon || '',
      sortOrder: account.sortOrder,
      notes: account.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAccount(null);
    setFormData({
      name: '',
      institution: '',
      balance: 0,
      category: FinancialAccountCategory.BankAccount,
      accountNumber: '',
      color: '',
      icon: '',
      sortOrder: 0,
      notes: ''
    });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getCategoryIcon = (category: FinancialAccountCategory) => {
    const iconClass = "h-4 w-4";
    switch (category) {
      case FinancialAccountCategory.Cash: return <Banknote className={iconClass} />;
      case FinancialAccountCategory.BankAccount: return <Landmark className={iconClass} />;
      case FinancialAccountCategory.Savings: return <PiggyBank className={iconClass} />;
      case FinancialAccountCategory.Investment: return <TrendingUp className={iconClass} />;
      case FinancialAccountCategory.RealEstate: return <Home className={iconClass} />;
      case FinancialAccountCategory.Business: return <Building2 className={iconClass} />;
      default: return <Wallet className={iconClass} />;
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
          <h1 className="text-2xl font-semibold text-neutral-900">Tillgångar</h1>
          <p className="text-sm text-neutral-500 mt-1">Hantera dina konton och investeringar</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Lägg till konto
        </button>
      </div>

      {/* Total */}
      <div className="card p-6 mb-6 bg-neutral-900 text-white">
        <p className="text-neutral-400 text-sm mb-1">Totala tillgångar</p>
        <p className="text-3xl font-semibold">{formatCurrency(totalBalance)}</p>
        <p className="text-neutral-500 text-sm mt-2">{accounts.length} konton</p>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-900">
              {editingAccount ? 'Redigera konto' : 'Nytt konto'}
            </h2>
            <button onClick={resetForm} className="text-neutral-400 hover:text-neutral-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Namn</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="T.ex. Sparkonto, ISK Avanza"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Bank/Mäklare</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="input"
                placeholder="T.ex. Avanza, Nordea, Swedbank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Värde (kr)</label>
              <FormattedNumberInput
                value={formData.balance}
                onChange={(val) => setFormData({ ...formData, balance: val })}
                suffix="kr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Kategori</label>
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">Anteckningar</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={2}
                placeholder="T.ex. kontonummer, detaljer..."
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
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

      {/* Account list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="card p-5 hover:border-neutral-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="h-9 w-9 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600">
                {getCategoryIcon(account.category)}
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(account)} className="p-1.5 text-neutral-400 hover:text-neutral-600">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(account.id)} className="p-1.5 text-neutral-400 hover:text-neutral-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="font-medium text-neutral-900">{account.name}</h3>
            {account.institution && (
              <p className="text-xs text-neutral-500">{account.institution}</p>
            )}
            <p className="text-xl font-semibold text-neutral-900 mt-2">{formatCurrency(account.balance)}</p>
            <p className="text-xs text-neutral-400 mt-1">{categoryLabels[account.category]}</p>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-12">
          <PiggyBank className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Inga tillgångar registrerade ännu</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-sm text-neutral-600 hover:text-neutral-900 font-medium"
          >
            Lägg till ditt första konto
          </button>
        </div>
      )}
    </div>
  );
}
