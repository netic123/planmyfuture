import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { formatCurrency } from '../utils/formatters';
import {
  TrendingUp,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  LogOut,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  CreditCard,
  Building,
  Wallet,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Summary {
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  monthlyBalance: number;
  projections: Array<{
    years: number;
    projectedNetWorth: number;
    totalSaved: number;
  }>;
}

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
  assetValue?: number;  // Värdet på kopplad tillgång (t.ex. bostadens marknadsvärde)
}

interface Asset {
  id: number;
  name: string;
  balance: number;
  category: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  
  // Data for editing
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // Expanded sections (allows multiple to be open)
  const [expandedSections, setExpandedSections] = useState<Set<'income' | 'expenses' | 'debts' | 'assets'>>(new Set());
  
  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingSection, setEditingSection] = useState<'income' | 'expenses' | 'debts' | 'assets' | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [editName, setEditName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  
  // Add new item states (tracks which section's form is showing)
  const [showAddFormFor, setShowAddFormFor] = useState<'income' | 'expenses' | 'debts' | 'assets' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<number>(0);
  const [newItemRate, setNewItemRate] = useState<number>(0);
  const [newItemType, setNewItemType] = useState<number>(0);
  
  // GDPR delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  // Calculate current age
  const currentYear = new Date().getFullYear();
  const currentAge = birthYear ? currentYear - birthYear : null;

  // Alla tillgångar (inklusive bostad som nu sparas separat vid onboarding)
  const allAssets = assets;

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/');
      return;
    }

    // Get birthYear from localStorage user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.birthYear) {
          setBirthYear(user.birthYear);
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    loadAllData(token);
  }, [navigate]);

  const loadAllData = async (token: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [summaryRes, budgetRes, debtsRes, assetsRes] = await Promise.all([
        fetch(`${API_URL}/api/personal-finance/summary`, { headers }),
        fetch(`${API_URL}/api/personal-finance/budget`, { headers }),
        fetch(`${API_URL}/api/personal-finance/debts`, { headers }),
        fetch(`${API_URL}/api/personal-finance/accounts`, { headers }),
      ]);
      
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
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

  const refreshSummary = async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`${API_URL}/api/personal-finance/summary`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) setSummary(await res.json());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/account`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      if (response.ok) {
        // Clear local storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      } else {
        const data = await response.json();
        setDeleteError(data.message || t('gdpr.deleteError'));
      }
    } catch {
      setDeleteError(t('gdpr.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const toggleSection = (section: 'income' | 'expenses' | 'debts' | 'assets') => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
        // Close add form if this section is being closed
        if (showAddFormFor === section) {
          setShowAddFormFor(null);
        }
      } else {
        newSet.add(section);
      }
      return newSet;
    });
    cancelEdit();
  };

  const startEdit = (id: number, name: string, value: number, section: 'income' | 'expenses' | 'debts' | 'assets') => {
    setEditingId(id);
    setEditName(name);
    setEditValue(value);
    setEditingSection(section);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditValue(0);
    setEditingSection(null);
  };

  const resetAddForm = () => {
    setShowAddFormFor(null);
    setNewItemName('');
    setNewItemAmount(0);
    setNewItemRate(0);
    setNewItemType(0);
  };

  // Budget operations
  const updateBudgetItem = async (id: number, name: string, amount: number) => {
    setSaving(true);
    const item = budgetItems.find(i => i.id === id);
    if (!item) return;
    
    await fetch(`${API_URL}/api/personal-finance/budget/items/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...item, name, amount }),
    });
    setBudgetItems(budgetItems.map(i => i.id === id ? { ...i, name, amount } : i));
    cancelEdit();
    refreshSummary();
  };

  const deleteBudgetItem = async (id: number) => {
    await fetch(`${API_URL}/api/personal-finance/budget/items/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    setBudgetItems(budgetItems.filter(item => item.id !== id));
    refreshSummary();
  };

  const addBudgetItem = async (isIncome: boolean) => {
    if (!newItemName || newItemAmount <= 0) return;
    setSaving(true);
    
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
    refreshSummary();
  };

  // Debt operations
  const updateDebt = async (id: number, name: string, currentBalance: number) => {
    setSaving(true);
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    
    await fetch(`${API_URL}/api/personal-finance/debts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...debt, name, currentBalance }),
    });
    setDebts(debts.map(d => d.id === id ? { ...d, name, currentBalance } : d));
    cancelEdit();
    refreshSummary();
  };

  const deleteDebt = async (id: number) => {
    await fetch(`${API_URL}/api/personal-finance/debts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    setDebts(debts.filter(d => d.id !== id));
    refreshSummary();
  };

  const addDebt = async () => {
    if (!newItemName || newItemAmount <= 0) return;
    setSaving(true);
    
    const res = await fetch(`${API_URL}/api/personal-finance/debts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: newItemName,
        type: newItemType,
        originalAmount: newItemAmount,
        currentBalance: newItemAmount,
        interestRate: newItemRate,
      }),
    });
    
    if (res.ok) {
      const newDebt = await res.json();
      setDebts([...debts, newDebt]);
    }
    resetAddForm();
    setSaving(false);
    refreshSummary();
  };

  // Asset operations
  const updateAsset = async (id: number, name: string, balance: number) => {
    setSaving(true);
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    
    await fetch(`${API_URL}/api/personal-finance/accounts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...asset, name, balance }),
    });
    setAssets(assets.map(a => a.id === id ? { ...a, name, balance } : a));
    cancelEdit();
    refreshSummary();
  };

  const deleteAsset = async (id: number) => {
    await fetch(`${API_URL}/api/personal-finance/accounts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    setAssets(assets.filter(a => a.id !== id));
    refreshSummary();
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
    refreshSummary();
  };

  // Filter data
  const incomeItems = budgetItems.filter(item => item.type === 0);
  const expenseItems = budgetItems.filter(item => item.type === 1);

  // Calculate how many years until age 70
  const yearsUntil70 = currentAge ? Math.max(0, 70 - currentAge) : 36;
  
  // Chart data - show age on x-axis, covering from now until 70 (every year)
  const chartData = summary?.projections && currentAge
    ? Array.from({ length: yearsUntil70 + 1 }, (_, i) => {
        const yearsFromNow = i;
        const targetAge = currentAge + yearsFromNow;
        
        // Find exact projection or interpolate
        const exactProjection = summary.projections.find(p => p.years === yearsFromNow);
        let netWorth: number;
        
        if (yearsFromNow === 0) {
          netWorth = summary.netWorth || 0;
        } else if (exactProjection) {
          netWorth = exactProjection.projectedNetWorth;
        } else {
          // Interpolate
          const sortedProjections = [...summary.projections].sort((a, b) => a.years - b.years);
          const before = sortedProjections.filter(p => p.years < yearsFromNow).pop();
          const after = sortedProjections.find(p => p.years > yearsFromNow);
          
          if (before && after) {
            const ratio = (yearsFromNow - before.years) / (after.years - before.years);
            netWorth = before.projectedNetWorth + ratio * (after.projectedNetWorth - before.projectedNetWorth);
          } else if (after) {
            netWorth = (summary.netWorth || 0) + (after.projectedNetWorth - (summary.netWorth || 0)) * (yearsFromNow / after.years);
          } else if (before) {
            const yearlyGrowth = (before.projectedNetWorth - (summary.netWorth || 0)) / before.years;
            netWorth = before.projectedNetWorth + yearlyGrowth * (yearsFromNow - before.years);
          } else {
            netWorth = summary.netWorth || 0;
          }
        }
        
        return {
          year: `${targetAge}`,
          age: targetAge,
          netWorth: Math.round(netWorth),
        };
      })
    : [];

  // Cost of living calculation (monthly expenses * 12 * years)
  const calculateCostOfLiving = (years: number) => {
    const monthlyExpenses = summary?.totalMonthlyExpenses || 0;
    return monthlyExpenses * 12 * years;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Render editable row with both name and value
  const renderEditableRow = (
    id: number,
    currentName: string,
    currentValue: number,
    section: 'income' | 'expenses' | 'debts' | 'assets',
    onSave: (id: number, name: string, value: number) => void,
    onDelete: (id: number) => void,
    extraInfo?: React.ReactNode
  ) => {
    const isEditing = editingId === id && editingSection === section;
    
    if (isEditing) {
      return (
        <div key={id} className="flex items-center justify-between py-2 px-3 bg-neutral-800 rounded-lg border border-neutral-600">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 min-w-0 px-2 py-1 bg-neutral-900 border border-neutral-600 rounded text-sm mr-2 text-white placeholder-neutral-500"
            placeholder="Namn"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
              className="w-28 px-2 py-1 bg-neutral-900 border border-neutral-600 rounded text-right text-sm text-white"
            />
            <button 
              onClick={() => onSave(id, editName, editValue)} 
              disabled={saving}
              className="p-1 text-green-400 hover:bg-neutral-700 rounded"
            >
              <Check className="h-4 w-4" />
            </button>
            <button 
              onClick={cancelEdit} 
              className="p-1 text-neutral-500 hover:bg-neutral-700 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div key={id} className="flex items-center justify-between py-2 px-3 bg-neutral-800 rounded-lg">
        <div className="flex items-center">
          <span className="text-sm text-neutral-300">{currentName}</span>
          {extraInfo}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => startEdit(id, currentName, currentValue, section)}
            className="flex items-center gap-1.5 group text-sm"
          >
            <span className="font-medium text-white">{formatCurrency(currentValue)}</span>
            <Pencil className="h-3 w-3 text-neutral-600 group-hover:text-neutral-400" />
          </button>
          <button onClick={() => onDelete(id)} className="p-1 text-neutral-600 hover:text-red-400">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderExpandableCard = (
    section: 'income' | 'expenses' | 'debts' | 'assets',
    icon: React.ReactNode,
    label: string,
    value: number,
    items: any[],
    renderItem: (item: any) => React.ReactNode,
    onAdd: () => void,
    addLabel: string
  ) => {
    const isExpanded = expandedSections.has(section);
    
    return (
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <button
          onClick={() => toggleSection(section)}
          className="w-full p-5 flex items-center justify-between hover:bg-neutral-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-neutral-400">{label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-white">
              {formatCurrency(value)}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-neutral-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-500" />
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="border-t border-neutral-800 p-4 space-y-2">
            {items.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-2">Inga poster</p>
            ) : (
              items.map(renderItem)
            )}
            
            {showAddFormFor === section ? (
              <div className="mt-3 p-3 bg-neutral-800 rounded-lg space-y-2">
                <input
                  type="text"
                  placeholder={t('dashboard.namePlaceholder')}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500"
                />
                <input
                  type="number"
                  placeholder={t('dashboard.amountPlaceholder')}
                  value={newItemAmount || ''}
                  onChange={(e) => setNewItemAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500"
                />
                {section === 'debts' && (
                  <input
                    type="number"
                    placeholder="Ränta %"
                    value={newItemRate || ''}
                    onChange={(e) => setNewItemRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={resetAddForm}
                    className="flex-1 py-2 text-sm text-neutral-400 hover:bg-neutral-700 rounded-lg"
                  >
                    {t('dashboard.cancel')}
                  </button>
                  <button
                    onClick={onAdd}
                    disabled={saving || !newItemName || newItemAmount <= 0}
                    className="flex-1 py-2 text-sm bg-white text-black rounded-lg disabled:opacity-50 hover:bg-neutral-200"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t('dashboard.add')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddFormFor(section)}
                className="w-full py-2 mt-2 text-sm text-neutral-500 hover:text-white flex items-center justify-center gap-1 border border-dashed border-neutral-700 rounded-lg hover:border-neutral-500"
              >
                <Plus className="h-4 w-4" />
                {addLabel}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'sv' ? 'en' : 'sv';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Header with language switcher, GDPR and logout */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 rounded-lg hover:border-neutral-500 transition-colors"
        >
          {i18n.language === 'sv' ? 'EN' : 'SV'}
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-400 hover:text-red-500 bg-neutral-900 border border-neutral-700 rounded-lg hover:border-red-500/50 transition-colors"
          title={t('gdpr.deleteAccount')}
        >
          <UserX className="h-4 w-4" />
          <span>GDPR</span>
        </button>
        <button
          onClick={handleLogout}
          className="p-2 text-neutral-500 hover:text-white transition-colors"
          title={t('dashboard.logout')}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* GDPR Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-md w-full p-6 border border-neutral-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">{t('gdpr.deleteAccountTitle')}</h2>
            </div>
            
            <p className="text-neutral-400 mb-4">
              {t('gdpr.deleteAccountWarning')}
            </p>
            
            <div className="bg-neutral-800 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-white mb-2">{t('gdpr.whatWillBeDeleted')}</p>
              <ul className="text-sm text-neutral-400 space-y-1">
                <li>• {t('gdpr.accountInfo')}</li>
                <li>• {t('gdpr.budgetItems')}</li>
                <li>• {t('gdpr.allAssets')}</li>
                <li>• {t('gdpr.allDebts')}</li>
                <li>• {t('gdpr.financialGoals')}</li>
              </ul>
            </div>
            
            <p className="text-red-400 text-sm font-medium mb-4">
              {t('gdpr.deleteAccountConfirm')}
            </p>
            
            {deleteError && (
              <p className="text-red-500 text-sm mb-4">{deleteError}</p>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError('');
                }}
                disabled={deleting}
                className="flex-1 py-3 px-4 border border-neutral-700 rounded-xl text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {t('gdpr.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('gdpr.deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {t('gdpr.confirmDelete')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        {/* Net Worth Card */}
        <div className="bg-neutral-900 text-white rounded-2xl p-8">
          <p className="text-neutral-400 text-sm mb-1">{t('dashboard.netWorth')}</p>
          <p className="text-4xl font-semibold tracking-tight">
            {formatCurrency(summary?.netWorth || 0)}
          </p>
          <div className="flex gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-white" />
              <span className="text-neutral-400 text-sm">
                {t('dashboard.totalAssets')}: {formatCurrency(summary?.totalAssets || 0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-neutral-500" />
              <span className="text-neutral-400 text-sm">
                {t('dashboard.totalDebts')}: {formatCurrency(summary?.totalDebts || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Income */}
          {renderExpandableCard(
            'income',
            <ArrowUpRight className="h-4 w-4 text-green-500" />,
            t('dashboard.monthlyIncome'),
            summary?.totalMonthlyIncome || 0,
            incomeItems,
            (item) => renderEditableRow(
              item.id,
              item.name,
              item.amount,
              'income',
              updateBudgetItem,
              deleteBudgetItem
            ),
            () => addBudgetItem(true),
            t('dashboard.addIncome')
          )}

          {/* Expenses */}
          {renderExpandableCard(
            'expenses',
            <ArrowDownRight className="h-4 w-4 text-red-500" />,
            t('dashboard.monthlyExpenses'),
            summary?.totalMonthlyExpenses || 0,
            expenseItems,
            (item) => renderEditableRow(
              item.id,
              item.name,
              item.amount,
              'expenses',
              updateBudgetItem,
              deleteBudgetItem
            ),
            () => addBudgetItem(false),
            t('dashboard.addExpense')
          )}

          {/* Debts */}
          {renderExpandableCard(
            'debts',
            <CreditCard className="h-4 w-4 text-orange-500" />,
            t('dashboard.totalDebts'),
            summary?.totalDebts || 0,
            debts,
            (debt) => renderEditableRow(
              debt.id,
              debt.name || getDebtTypeName(debt.type),
              debt.currentBalance,
              'debts',
              updateDebt,
              deleteDebt,
              debt.interestRate > 0 ? (
                <span className="text-xs text-neutral-400 ml-2">{debt.interestRate}%</span>
              ) : undefined
            ),
            addDebt,
            t('dashboard.addDebt')
          )}

          {/* Assets */}
          {renderExpandableCard(
            'assets',
            <Building className="h-4 w-4 text-blue-500" />,
            t('dashboard.totalAssets'),
            summary?.totalAssets || 0,
            allAssets,
            (asset) => renderEditableRow(
              asset.id,
              asset.name,
              asset.balance,
              'assets',
              updateAsset,
              deleteAsset
            ),
            addAsset,
            t('dashboard.addAsset')
          )}
        </div>

        {/* Monthly Balance */}
        <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-neutral-500" />
              <span className="text-neutral-400">{t('dashboard.savingsPerMonth')}</span>
            </div>
            <span className={`text-2xl font-semibold ${(summary?.monthlyBalance || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(summary?.monthlyBalance || 0)}
            </span>
          </div>
        </div>

        {/* Forecast Chart */}
        {chartData.length > 0 && (
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-neutral-500" />
              {t('dashboard.forecast')}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12, fill: '#737373' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#737373' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      return `${(value / 1000).toFixed(0)}k`;
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #333333',
                      backgroundColor: '#171717',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netWorth" 
                    name={t('dashboard.netWorth')}
                    stroke="#ffffff" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNetWorth)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Cost of Living Chart */}
        {chartData.length > 0 && summary?.totalMonthlyExpenses && summary.totalMonthlyExpenses > 0 && (
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-neutral-500" />
              {t('dashboard.costOfLiving')}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.map(d => ({
                  ...d,
                  costOfLiving: calculateCostOfLiving(d.age - (currentAge || 0))
                }))}>
                  <defs>
                    <linearGradient id="colorCostOfLiving" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12, fill: '#737373' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#737373' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      return `${(value / 1000).toFixed(0)}k`;
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #333333',
                      backgroundColor: '#171717',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costOfLiving" 
                    name={t('dashboard.costOfLiving')}
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCostOfLiving)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getDebtTypeName(type: number): string {
  const types: Record<number, string> = {
    0: 'Bolån',
    1: 'Studielån',
    2: 'Billån',
    3: 'Privatlån',
    4: 'Kreditkort',
    5: 'Skatteverket',
    6: 'CSN',
    7: 'Övrigt',
  };
  return types[type] || 'Skuld';
}
