import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || '';

interface BudgetItem {
  id: number;
  name: string;
  amount: number;
  type: number;
}

interface Debt {
  id: number;
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeTab, setActiveTab] = useState<'budget' | 'debts' | 'assets'>('budget');

  useEffect(() => {
    loadData();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const loadData = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [budgetRes, debtsRes, assetsRes] = await Promise.all([
        fetch(`${API_URL}/api/personal/budget/summary`, { headers }),
        fetch(`${API_URL}/api/personal/debts`, { headers }),
        fetch(`${API_URL}/api/personal/accounts`, { headers }),
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

  const deleteBudgetItem = async (id: number) => {
    const token = getToken();
    await fetch(`${API_URL}/api/personal/budget/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const deleteDebt = async (id: number) => {
    const token = getToken();
    await fetch(`${API_URL}/api/personal/debts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setDebts(debts.filter(d => d.id !== id));
  };

  const deleteAsset = async (id: number) => {
    const token = getToken();
    await fetch(`${API_URL}/api/personal/accounts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setAssets(assets.filter(a => a.id !== id));
  };

  const debtTypeNames: Record<number, string> = {
    0: 'Bolån', 1: 'Studielån', 2: 'Billån', 3: 'Privatlån',
    4: 'Kreditkort', 5: 'Skatteskuld', 6: 'Företagslån', 7: 'Övrigt',
  };

  const assetCategoryNames: Record<number, string> = {
    0: 'Kontanter', 1: 'Bankkonto', 2: 'Sparkonto', 3: 'Investeringar',
    4: 'Pension', 5: 'Fastighet', 6: 'Företag', 7: 'Krypto', 8: 'Övrigt',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-neutral-400 hover:text-neutral-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-neutral-900">Inställningar</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-neutral-100 p-1 rounded-lg">
          {(['budget', 'debts', 'assets'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab === 'budget' ? 'Budget' : tab === 'debts' ? 'Skulder' : 'Tillgångar'}
            </button>
          ))}
        </div>

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-3">
            {budgetItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                <div>
                  <p className="font-medium text-neutral-900">{item.name}</p>
                  <p className="text-sm text-neutral-500">{item.type === 0 ? 'Inkomst' : 'Utgift'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                  <button onClick={() => deleteBudgetItem(item.id)} className="p-2 text-neutral-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {budgetItems.length === 0 && (
              <p className="text-center text-neutral-400 py-8">Inga budgetposter</p>
            )}
          </div>
        )}

        {/* Debts Tab */}
        {activeTab === 'debts' && (
          <div className="space-y-3">
            {debts.map((debt) => (
              <div key={debt.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                <div>
                  <p className="font-medium text-neutral-900">{debtTypeNames[debt.type]}</p>
                  <p className="text-sm text-neutral-500">{debt.interestRate}% ränta</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatCurrency(debt.currentBalance)}</span>
                  <button onClick={() => deleteDebt(debt.id)} className="p-2 text-neutral-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {debts.length === 0 && (
              <p className="text-center text-neutral-400 py-8">Inga skulder</p>
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
                  <span className="font-medium">{formatCurrency(asset.balance)}</span>
                  <button onClick={() => deleteAsset(asset.id)} className="p-2 text-neutral-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {assets.length === 0 && (
              <p className="text-center text-neutral-400 py-8">Inga tillgångar</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

