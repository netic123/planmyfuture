import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const [editValue, setEditValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  
  // Add new item states (tracks which section's form is showing)
  const [showAddFormFor, setShowAddFormFor] = useState<'income' | 'expenses' | 'debts' | 'assets' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<number>(0);
  const [newItemRate, setNewItemRate] = useState<number>(0);
  const [newItemType, setNewItemType] = useState<number>(0);

  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  // Calculate current age
  const currentYear = new Date().getFullYear();
  const currentAge = birthYear ? currentYear - birthYear : null;

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
    setEditingId(null);
  };

  const startEdit = (id: number, value: number) => {
    setEditingId(id);
    setEditValue(value);
  };

  const resetAddForm = () => {
    setShowAddFormFor(null);
    setNewItemName('');
    setNewItemAmount(0);
    setNewItemRate(0);
    setNewItemType(0);
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
  const updateDebt = async (id: number, currentBalance: number) => {
    setSaving(true);
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    
    await fetch(`${API_URL}/api/personal-finance/debts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...debt, currentBalance }),
    });
    setDebts(debts.map(d => d.id === id ? { ...d, currentBalance } : d));
    setEditingId(null);
    setSaving(false);
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

  // Calculate how many years until age 100
  const yearsUntil100 = currentAge ? Math.max(0, 100 - currentAge) : 60;
  
  // Chart data - show age on x-axis, covering from now until 100
  const chartData = summary?.projections
    ?.filter(p => p.years <= yearsUntil100)
    ?.filter((_, i, arr) => {
      // Show approximately 8-10 points for a clean chart
      const step = Math.max(1, Math.floor(arr.length / 8));
      return i % step === 0 || i === arr.length - 1;
    })
    ?.map(p => ({
      year: currentAge ? `${currentAge + p.years}` : `${p.years}`,
      age: currentAge ? currentAge + p.years : p.years,
      netWorth: Math.round(p.projectedNetWorth),
    })) || [];

  // Generate age-based milestones (every 10 years until 100)
  const generateAgeMilestones = () => {
    if (!currentAge || !summary?.projections) return [];
    
    const milestones: number[] = [];
    // Start from next decade (40, 50, 60, 70, 80, 90, 100)
    let nextMilestone = Math.ceil(currentAge / 10) * 10;
    if (nextMilestone === currentAge) nextMilestone += 10;
    
    while (nextMilestone <= 100) {
      milestones.push(nextMilestone);
      nextMilestone += 10;
    }
    
    return milestones; // All milestones until 100
  };

  const ageMilestones = generateAgeMilestones();

  // Cost of living calculation (monthly expenses * 12 * years)
  const calculateCostOfLiving = (years: number) => {
    const monthlyExpenses = summary?.totalMonthlyExpenses || 0;
    return monthlyExpenses * 12 * years;
  };

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
    onSave: (id: number, value: number) => void,
    prefix: string = ''
  ) => {
    if (editingId === id) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
            className="w-28 px-2 py-1 border border-neutral-300 rounded text-right text-sm"
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
        className="flex items-center gap-1.5 group text-sm"
      >
        <span className="font-medium">{prefix}{formatCurrency(currentValue)}</span>
        <Pencil className="h-3 w-3 text-neutral-300 group-hover:text-neutral-600" />
      </button>
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
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <button
          onClick={() => toggleSection(section)}
          className="w-full p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-neutral-600">{label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-neutral-900">
              {formatCurrency(value)}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-neutral-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-400" />
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="border-t border-neutral-100 p-4 space-y-2">
            {items.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-2">Inga poster</p>
            ) : (
              items.map(renderItem)
            )}
            
            {showAddFormFor === section ? (
              <div className="mt-3 p-3 bg-neutral-50 rounded-lg space-y-2">
                <input
                  type="text"
                  placeholder="Namn"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Belopp"
                  value={newItemAmount || ''}
                  onChange={(e) => setNewItemAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                />
                {section === 'debts' && (
                  <input
                    type="number"
                    placeholder="Ränta %"
                    value={newItemRate || ''}
                    onChange={(e) => setNewItemRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={resetAddForm}
                    className="flex-1 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={onAdd}
                    disabled={saving || !newItemName || newItemAmount <= 0}
                    className="flex-1 py-2 text-sm bg-neutral-900 text-white rounded-lg disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Lägg till'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddFormFor(section)}
                className="w-full py-2 mt-2 text-sm text-neutral-500 hover:text-neutral-700 flex items-center justify-center gap-1 border border-dashed border-neutral-200 rounded-lg hover:border-neutral-400"
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

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
        title="Logga ut"
      >
        <LogOut className="h-5 w-5" />
      </button>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        {/* Net Worth Card */}
        <div className="bg-neutral-900 text-white rounded-2xl p-8">
          <p className="text-neutral-400 text-sm mb-1">Nettoförmögenhet</p>
          <p className="text-4xl font-semibold tracking-tight">
            {formatCurrency(summary?.netWorth || 0)}
          </p>
          <div className="flex gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-white" />
              <span className="text-neutral-400 text-sm">
                Tillgångar: {formatCurrency(summary?.totalAssets || 0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-neutral-500" />
              <span className="text-neutral-400 text-sm">
                Skulder: {formatCurrency(summary?.totalDebts || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Income */}
          {renderExpandableCard(
            'income',
            <ArrowUpRight className="h-4 w-4 text-green-500" />,
            'Inkomst/mån',
            summary?.totalMonthlyIncome || 0,
            incomeItems,
            (item) => (
              <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
                <span className="text-sm text-neutral-700">{item.name}</span>
                <div className="flex items-center gap-2">
                  {renderEditableAmount(item.id, item.amount, updateBudgetItem)}
                  <button onClick={() => deleteBudgetItem(item.id)} className="p-1 text-neutral-300 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ),
            () => addBudgetItem(true),
            'Lägg till inkomst'
          )}

          {/* Expenses */}
          {renderExpandableCard(
            'expenses',
            <ArrowDownRight className="h-4 w-4 text-red-500" />,
            'Utgifter/mån',
            summary?.totalMonthlyExpenses || 0,
            expenseItems,
            (item) => (
              <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
                <span className="text-sm text-neutral-700">{item.name}</span>
                <div className="flex items-center gap-2">
                  {renderEditableAmount(item.id, item.amount, updateBudgetItem)}
                  <button onClick={() => deleteBudgetItem(item.id)} className="p-1 text-neutral-300 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ),
            () => addBudgetItem(false),
            'Lägg till utgift'
          )}

          {/* Debts */}
          {renderExpandableCard(
            'debts',
            <CreditCard className="h-4 w-4 text-orange-500" />,
            'Skulder',
            summary?.totalDebts || 0,
            debts,
            (debt) => (
              <div key={debt.id} className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
                <div>
                  <span className="text-sm text-neutral-700">{debt.name || getDebtTypeName(debt.type)}</span>
                  {debt.interestRate > 0 && (
                    <span className="text-xs text-neutral-400 ml-2">{debt.interestRate}%</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {renderEditableAmount(debt.id, debt.currentBalance, updateDebt)}
                  <button onClick={() => deleteDebt(debt.id)} className="p-1 text-neutral-300 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ),
            addDebt,
            'Lägg till skuld'
          )}

          {/* Assets */}
          {renderExpandableCard(
            'assets',
            <Building className="h-4 w-4 text-blue-500" />,
            'Tillgångar',
            summary?.totalAssets || 0,
            assets,
            (asset) => (
              <div key={asset.id} className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
                <span className="text-sm text-neutral-700">{asset.name}</span>
                <div className="flex items-center gap-2">
                  {renderEditableAmount(asset.id, asset.balance, updateAsset)}
                  <button onClick={() => deleteAsset(asset.id)} className="p-1 text-neutral-300 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ),
            addAsset,
            'Lägg till tillgång'
          )}
        </div>

        {/* Monthly Balance */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-neutral-400" />
              <span className="text-neutral-600">Sparar per månad</span>
            </div>
            <span className={`text-2xl font-semibold ${(summary?.monthlyBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary?.monthlyBalance || 0)}
            </span>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <h2 className="text-sm font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-neutral-400" />
              {t('dashboard.forecast')}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#171717" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
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
                      border: '1px solid #e5e5e5',
                      fontSize: '14px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netWorth" 
                    name={t('dashboard.netWorth')}
                    stroke="#171717" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNetWorth)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Future Projections - Age Based */}
        {summary?.projections && summary.projections.length > 0 && currentAge && (
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <h2 className="text-sm font-medium text-neutral-900 mb-4">{t('dashboard.yourFuture')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ageMilestones.map((targetAge) => {
                const yearsFromNow = targetAge - currentAge;
                
                // Find the closest projection (interpolate if needed)
                const exactProjection = summary.projections.find(p => p.years === yearsFromNow);
                let netWorth: number;
                
                if (exactProjection) {
                  netWorth = exactProjection.projectedNetWorth;
                } else {
                  // Find projections before and after to interpolate
                  const before = summary.projections.filter(p => p.years < yearsFromNow).pop();
                  const after = summary.projections.find(p => p.years > yearsFromNow);
                  
                  if (before && after) {
                    // Linear interpolation
                    const ratio = (yearsFromNow - before.years) / (after.years - before.years);
                    netWorth = before.projectedNetWorth + ratio * (after.projectedNetWorth - before.projectedNetWorth);
                  } else if (after) {
                    netWorth = (summary.netWorth || 0) + (after.projectedNetWorth - (summary.netWorth || 0)) * (yearsFromNow / after.years);
                  } else if (before) {
                    // Extrapolate from last known
                    const growthRate = before.projectedNetWorth / (summary.netWorth || 1);
                    netWorth = before.projectedNetWorth * Math.pow(growthRate, yearsFromNow / before.years);
                  } else {
                    netWorth = summary.netWorth || 0;
                  }
                }
                
                return (
                  <div key={targetAge} className="text-center p-4 bg-neutral-50 rounded-xl">
                    <p className="text-xs text-neutral-500 mb-1">{t('dashboard.atAge', { age: targetAge })}</p>
                    <p className="text-xl font-semibold text-neutral-900">
                      {formatCurrency(netWorth)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cost of Living Projections */}
        {summary?.totalMonthlyExpenses && summary.totalMonthlyExpenses > 0 && currentAge && (
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="h-4 w-4 text-neutral-400" />
              <h2 className="text-sm font-medium text-neutral-900">{t('dashboard.costOfLiving')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ageMilestones.map((targetAge) => {
                const yearsFromNow = targetAge - currentAge;
                const totalCost = calculateCostOfLiving(yearsFromNow);
                
                return (
                  <div key={targetAge} className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-xs text-neutral-500 mb-1">{t('dashboard.totalCostUntil', { age: targetAge })}</p>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(totalCost)}
                    </p>
                  </div>
                );
              })}
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
