import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Trash2, Plus, Pencil, X, Check } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import Layout from '../components/Layout';

const API_URL = import.meta.env.VITE_API_URL || '';

interface BudgetItem {
  id: number;
  name: string;
  amount: number;
  type: number;
  category: number;
}

interface Debt {
  id: number;
  name: string;
  type: number;
  currentBalance: number;
  interestRate: number;
  monthlyAmortization?: number;
  assetValue?: number;
}

interface Asset {
  id: number;
  name: string;
  balance: number;
  category: number;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeTab, setActiveTab] = useState<'income' | 'expenses' | 'debts' | 'assets'>('income');
  
  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  
  // Add new item states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<number>(0);
  const [newItemRate, setNewItemRate] = useState<number>(0);
  const [newItemType, setNewItemType] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  const loadData = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [budgetRes, debtsRes, assetsRes] = await Promise.all([
        fetch(`${API_URL}/api/personal-finance/budget`, { headers }),
        fetch(`${API_URL}/api/personal-finance/debts`, { headers }),
        fetch(`${API_URL}/api/personal-finance/accounts`, { headers }),
      ]);

      if (budgetRes.ok) {
        const data = await budgetRes.json();
        setBudgetItems([...data.incomeItems, ...data.expenseItems]);
      }
      if (debtsRes.ok) setDebts(await debtsRes.json());
      if (assetsRes.ok) setAssets(await assetsRes.json());
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Budget operations
  const updateBudgetItem = async (id: number, amount: number) => {
    setSaving(true);
    const item = budgetItems.find(i => i.id === id);
    if (!item) return;
    
    await fetch(`${API_URL}/api/personal-finance/budget/items/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...item, amount }),
    });
    setBudgetItems(budgetItems.map(i => i.id === id ? { ...i, amount } : i));
    setEditingId(null);
    setSaving(false);
  };

  const deleteBudgetItem = async (id: number) => {
    await fetch(`${API_URL}/api/personal-finance/budget/items/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const addBudgetItem = async () => {
    if (!newItemName || newItemAmount <= 0) return;
    setSaving(true);
    
    const isIncome = activeTab === 'income';
    const res = await fetch(`${API_URL}/api/personal-finance/budget/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: newItemName,
        amount: newItemAmount,
        type: isIncome ? 0 : 1,
        category: isIncome ? 0 : 10,
        isRecurring: true,
      }),
    });
    
    if (res.ok) {
      const newItem = await res.json();
      setBudgetItems([...budgetItems, newItem]);
    }
    resetAddForm();
    setSaving(false);
  };

  // Debt operations
  const updateDebt = async (id: number, amount: number) => {
    setSaving(true);
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    
    await fetch(`${API_URL}/api/personal-finance/debts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...debt, amount }),
    });
    setDebts(debts.map(d => d.id === id ? { ...d, currentBalance: amount } : d));
    setEditingId(null);
    setSaving(false);
  };

  const deleteDebt = async (id: number) => {
    await fetch(`${API_URL}/api/personal-finance/debts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    setDebts(debts.filter(d => d.id !== id));
  };

  const addDebt = async () => {
    if (!newItemName || newItemAmount <= 0) return;
    setSaving(true);
    
    const res = await fetch(`${API_URL}/api/personal-finance/debts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: newItemName,
        amount: newItemAmount,
        interestRate: newItemRate,
        type: newItemType,
      }),
    });
    
    if (res.ok) {
      const newDebt = await res.json();
      setDebts([...debts, newDebt]);
    }
    resetAddForm();
    setSaving(false);
  };

  // Asset operations
  const updateAsset = async (id: number, balance: number) => {
    setSaving(true);
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    
    await fetch(`${API_URL}/api/personal-finance/accounts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...asset, balance }),
    });
    setAssets(assets.map(a => a.id === id ? { ...a, balance } : a));
    setEditingId(null);
    setSaving(false);
  };

  const deleteAsset = async (id: number) => {
    await fetch(`${API_URL}/api/personal-finance/accounts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    setAssets(assets.filter(a => a.id !== id));
  };

  const addAsset = async () => {
    if (!newItemName || newItemAmount <= 0) return;
    setSaving(true);
    
    const res = await fetch(`${API_URL}/api/personal-finance/accounts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: newItemName,
        balance: newItemAmount,
        category: newItemType,
      }),
    });
    
    if (res.ok) {
      const newAsset = await res.json();
      setAssets([...assets, newAsset]);
    }
    resetAddForm();
    setSaving(false);
  };

  const resetAddForm = () => {
    setShowAddForm(false);
    setNewItemName('');
    setNewItemAmount(0);
    setNewItemRate(0);
    setNewItemType(0);
  };

  const startEdit = (id: number, value: number) => {
    setEditingId(id);
    setEditValue(value);
  };

  const debtTypeNames: Record<number, string> = {
    0: t('settings.debtTypes.mortgage'),
    1: t('settings.debtTypes.studentLoan'),
    2: t('settings.debtTypes.carLoan'),
    3: t('settings.debtTypes.personalLoan'),
    4: t('settings.debtTypes.creditCard'),
    5: t('settings.debtTypes.taxDebt'),
    6: t('settings.debtTypes.businessLoan'),
    7: t('settings.debtTypes.other'),
  };

  const assetCategoryNames: Record<number, string> = {
    0: t('settings.assetTypes.cash'),
    1: t('settings.assetTypes.bankAccount'),
    2: t('settings.assetTypes.savings'),
    3: t('settings.assetTypes.investments'),
    4: t('settings.assetTypes.pension'),
    5: t('settings.assetTypes.property'),
    6: t('settings.assetTypes.business'),
    7: t('settings.assetTypes.crypto'),
    8: t('settings.assetTypes.other'),
  };

  const incomeItems = budgetItems.filter(i => i.type === 0);
  const expenseItems = budgetItems.filter(i => i.type === 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const renderEditableAmount = (
    id: number, 
    currentValue: number, 
    onSave: (id: number, value: number) => void
  ) => {
    if (editingId === id) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
            className="w-28 px-2 py-1 border border-neutral-300 rounded text-right"
            autoFocus
          />
          <button 
            onClick={() => onSave(id, editValue)} 
            disabled={saving}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Check className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setEditingId(null)} 
            className="p-1 text-neutral-400 hover:bg-neutral-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }
    return (
      <button 
        onClick={() => startEdit(id, currentValue)}
        className="flex items-center gap-2 group"
      >
        <span className="font-medium">{formatCurrency(currentValue)}</span>
        <Pencil className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-600" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-neutral-900">{t('settings.title')}</h1>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-neutral-100 p-1 rounded-lg">
          {(['income', 'expenses', 'debts', 'assets'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); resetAddForm(); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab === 'income' ? t('settings.income') : 
               tab === 'expenses' ? t('settings.expenses') : 
               tab === 'debts' ? t('settings.debts') : 
               t('settings.assets')}
            </button>
          ))}
        </div>

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className="space-y-3">
            {incomeItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                <div>
                  <p className="font-medium text-neutral-900">{item.name}</p>
                  <p className="text-sm text-neutral-500">{t('settings.incomeLabel')}</p>
                </div>
                <div className="flex items-center gap-3">
                  {renderEditableAmount(item.id, item.amount, updateBudgetItem)}
                  <button onClick={() => deleteBudgetItem(item.id)} className="p-2 text-neutral-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {incomeItems.length === 0 && !showAddForm && (
              <p className="text-center text-neutral-400 py-8">{t('settings.noIncome')}</p>
            )}
            
            {showAddForm ? (
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                <input
                  type="text"
                  placeholder={t('settings.namePlaceholder')}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder={t('settings.amountPlaceholder')}
                  value={newItemAmount || ''}
                  onChange={(e) => setNewItemAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
                <div className="flex gap-2">
                  <button onClick={resetAddForm} className="flex-1 py-2 text-neutral-600 hover:text-neutral-900">
                    {t('common.cancel')}
                  </button>
                  <button 
                    onClick={addBudgetItem} 
                    disabled={saving || !newItemName || newItemAmount <= 0}
                    className="flex-1 py-2 bg-neutral-900 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t('common.add')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('settings.addIncome')}
              </button>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-3">
            {expenseItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                <div>
                  <p className="font-medium text-neutral-900">{item.name}</p>
                  <p className="text-sm text-neutral-500">{t('settings.expenseLabel')}</p>
                </div>
                <div className="flex items-center gap-3">
                  {renderEditableAmount(item.id, item.amount, updateBudgetItem)}
                  <button onClick={() => deleteBudgetItem(item.id)} className="p-2 text-neutral-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {expenseItems.length === 0 && !showAddForm && (
              <p className="text-center text-neutral-400 py-8">{t('settings.noExpenses')}</p>
            )}
            
            {showAddForm ? (
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                <input
                  type="text"
                  placeholder={t('settings.namePlaceholder')}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder={t('settings.amountPlaceholder')}
                  value={newItemAmount || ''}
                  onChange={(e) => setNewItemAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
                <div className="flex gap-2">
                  <button onClick={resetAddForm} className="flex-1 py-2 text-neutral-600 hover:text-neutral-900">
                    {t('common.cancel')}
                  </button>
                  <button 
                    onClick={addBudgetItem} 
                    disabled={saving || !newItemName || newItemAmount <= 0}
                    className="flex-1 py-2 bg-neutral-900 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t('common.add')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('settings.addExpense')}
              </button>
            )}
          </div>
        )}

        {/* Debts Tab */}
        {activeTab === 'debts' && (
          <div className="space-y-3">
            {debts.map((debt) => (
              <div key={debt.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                <div>
                  <p className="font-medium text-neutral-900">{debt.name || debtTypeNames[debt.type]}</p>
                  <p className="text-sm text-neutral-500">{debt.interestRate}% {t('settings.interest')}</p>
                </div>
                <div className="flex items-center gap-3">
                  {renderEditableAmount(debt.id, debt.currentBalance, updateDebt)}
                  <button onClick={() => deleteDebt(debt.id)} className="p-2 text-neutral-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {debts.length === 0 && !showAddForm && (
              <p className="text-center text-neutral-400 py-8">{t('settings.noDebts')}</p>
            )}
            
            {showAddForm ? (
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                >
                  {Object.entries(debtTypeNames).map(([value, name]) => (
                    <option key={value} value={value}>{name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder={t('settings.descriptionPlaceholder')}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder={t('settings.amountPlaceholder')}
                  value={newItemAmount || ''}
                  onChange={(e) => setNewItemAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder={t('settings.interestRatePlaceholder')}
                  step="0.1"
                  value={newItemRate || ''}
                  onChange={(e) => setNewItemRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
                <div className="flex gap-2">
                  <button onClick={resetAddForm} className="flex-1 py-2 text-neutral-600 hover:text-neutral-900">
                    {t('common.cancel')}
                  </button>
                  <button 
                    onClick={addDebt} 
                    disabled={saving || !newItemName || newItemAmount <= 0}
                    className="flex-1 py-2 bg-neutral-900 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t('common.add')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('settings.addDebt')}
              </button>
            )}
          </div>
        )}

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <div className="space-y-3">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                <div>
                  <p className="font-medium text-neutral-900">{asset.name}</p>
                  <p className="text-sm text-neutral-500">{assetCategoryNames[asset.category]}</p>
                </div>
                <div className="flex items-center gap-3">
                  {renderEditableAmount(asset.id, asset.balance, updateAsset)}
                  <button onClick={() => deleteAsset(asset.id)} className="p-2 text-neutral-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {assets.length === 0 && !showAddForm && (
              <p className="text-center text-neutral-400 py-8">{t('settings.noAssets')}</p>
            )}
            
            {showAddForm ? (
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                >
                  {Object.entries(assetCategoryNames).map(([value, name]) => (
                    <option key={value} value={value}>{name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder={t('settings.namePlaceholder')}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder={t('settings.amountPlaceholder')}
                  value={newItemAmount || ''}
                  onChange={(e) => setNewItemAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
                <div className="flex gap-2">
                  <button onClick={resetAddForm} className="flex-1 py-2 text-neutral-600 hover:text-neutral-900">
                    {t('common.cancel')}
                  </button>
                  <button 
                    onClick={addAsset} 
                    disabled={saving || !newItemName || newItemAmount <= 0}
                    className="flex-1 py-2 bg-neutral-900 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t('common.add')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('settings.addAsset')}
              </button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
