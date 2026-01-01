import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import {
  TrendingUp,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  LogOut,
  Settings,
} from 'lucide-react';
import {
  LineChart,
  Line,
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadData(token);
  }, [navigate]);

  const loadData = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/personal/summary`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Generate chart data
  const chartData = summary?.projections?.slice(0, 10).map(p => ({
    year: `${p.years} år`,
    netWorth: Math.round(p.projectedNetWorth),
    saved: Math.round(p.totalSaved),
  })) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-900">Min Ekonomi</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">{user?.email}</span>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-neutral-400 hover:text-neutral-600"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-neutral-600"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
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

        {/* Monthly Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-neutral-600">Inkomst/mån</span>
            </div>
            <p className="text-2xl font-semibold text-neutral-900">
              {formatCurrency(summary?.totalMonthlyIncome || 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-neutral-600">Utgifter/mån</span>
            </div>
            <p className="text-2xl font-semibold text-neutral-900">
              {formatCurrency(summary?.totalMonthlyExpenses || 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-neutral-600">Sparar/mån</span>
            </div>
            <p className="text-2xl font-semibold text-neutral-900">
              {formatCurrency(summary?.monthlyBalance || 0)}
            </p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <h2 className="text-sm font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-neutral-400" />
              Prognos
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
                    name="Nettoförmögenhet"
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

        {/* Future Projections */}
        {summary?.projections && summary.projections.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <h2 className="text-sm font-medium text-neutral-900 mb-4">Din framtid</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summary.projections
                .filter(p => [5, 10, 20, 30].includes(p.years))
                .map((proj, idx) => (
                  <div key={idx} className="text-center p-4 bg-neutral-50 rounded-xl">
                    <p className="text-xs text-neutral-500 mb-1">Om {proj.years} år</p>
                    <p className="text-xl font-semibold text-neutral-900">
                      {formatCurrency(proj.projectedNetWorth)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

