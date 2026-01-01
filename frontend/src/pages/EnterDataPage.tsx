import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { personalFinanceApi } from '../services/api';
import type { PersonalBudgetItem, FinancialAccount, Debt, BudgetSummary } from '../types';
import { BudgetItemType, BudgetCategory, FinancialAccountCategory, DebtType } from '../types';
import { formatCurrency } from '../utils/formatters';
import FormattedNumberInput from '../components/FormattedNumberInput';
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  X,
  Wallet,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  Car,
  Check
} from 'lucide-react';

type TabType = 'income' | 'expenses' | 'assets' | 'debts';

export default function EnterDataPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('income');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Data states
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Form states
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState<PersonalBudgetItem | null>(null);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  // Form data
  const [budgetFormData, setBudgetFormData] = useState({
    name: '',
    amount: 0,
    type: BudgetItemType.Income,
    category: BudgetCategory.Salary,
    isRecurring: true,
    notes: '',
    sortOrder: 0
  });

  const [assetFormData, setAssetFormData] = useState({
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

  const [debtFormData, setDebtFormData] = useState({
    type: DebtType.Mortgage,
    currentBalance: 0,
    assetValue: undefined as number | undefined,
    interestRate: 0,
    amortizationRate: undefined as number | undefined,
    monthlyPayment: undefined as number | undefined,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [budgetData, accountsData, debtsData] = await Promise.all([
        personalFinanceApi.getBudgetSummary(),
        personalFinanceApi.getAccounts(),
        personalFinanceApi.getDebts()
      ]);
      setBudget(budgetData);
      setAccounts(accountsData);
      setDebts(debtsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Budget handlers
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingBudgetItem) {
        await personalFinanceApi.updateBudgetItem(editingBudgetItem.id, budgetFormData);
      } else {
        await personalFinanceApi.createBudgetItem(budgetFormData);
      }
      await loadAllData();
      resetBudgetForm();
      showSuccessMessage();
    } catch (err) {
      console.error('Failed to save budget item:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBudgetDelete = async (id: number) => {
    if (!confirm(t('enterData.confirmDelete'))) return;
    try {
      await personalFinanceApi.deleteBudgetItem(id);
      await loadAllData();
    } catch (err) {
      console.error('Failed to delete budget item:', err);
    }
  };

  const handleBudgetEdit = (item: PersonalBudgetItem) => {
    setEditingBudgetItem(item);
    setBudgetFormData({
      name: item.name,
      amount: item.amount,
      type: item.type,
      category: item.category,
      isRecurring: item.isRecurring,
      notes: item.notes || '',
      sortOrder: item.sortOrder
    });
    setShowBudgetForm(true);
  };

  const resetBudgetForm = () => {
    setShowBudgetForm(false);
    setEditingBudgetItem(null);
    setBudgetFormData({
      name: '',
      amount: 0,
      type: activeTab === 'income' ? BudgetItemType.Income : BudgetItemType.Expense,
      category: activeTab === 'income' ? BudgetCategory.Salary : BudgetCategory.Other,
      isRecurring: true,
      notes: '',
      sortOrder: 0
    });
  };

  // Asset handlers
  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingAccount) {
        await personalFinanceApi.updateAccount(editingAccount.id, { ...assetFormData, isActive: true });
      } else {
        await personalFinanceApi.createAccount(assetFormData);
      }
      await loadAllData();
      resetAssetForm();
      showSuccessMessage();
    } catch (err) {
      console.error('Failed to save account:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAssetDelete = async (id: number) => {
    if (!confirm(t('enterData.confirmDelete'))) return;
    try {
      await personalFinanceApi.deleteAccount(id);
      await loadAllData();
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  const handleAssetEdit = (account: FinancialAccount) => {
    setEditingAccount(account);
    setAssetFormData({
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
    setShowAssetForm(true);
  };

  const resetAssetForm = () => {
    setShowAssetForm(false);
    setEditingAccount(null);
    setAssetFormData({
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

  // Debt handlers
  const handleDebtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingDebt) {
        await personalFinanceApi.updateDebt(editingDebt.id, { ...debtFormData, isActive: true });
      } else {
        await personalFinanceApi.createDebt(debtFormData);
      }
      await loadAllData();
      resetDebtForm();
      showSuccessMessage();
    } catch (err) {
      console.error('Failed to save debt:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDebtDelete = async (id: number) => {
    if (!confirm(t('enterData.confirmDelete'))) return;
    try {
      await personalFinanceApi.deleteDebt(id);
      await loadAllData();
    } catch (err) {
      console.error('Failed to delete debt:', err);
    }
  };

  const handleDebtEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setDebtFormData({
      type: debt.type,
      currentBalance: debt.currentBalance,
      assetValue: debt.assetValue,
      interestRate: debt.interestRate,
      amortizationRate: debt.amortizationRate,
      monthlyPayment: debt.monthlyPayment,
    });
    setShowDebtForm(true);
  };

  const resetDebtForm = () => {
    setShowDebtForm(false);
    setEditingDebt(null);
    setDebtFormData({
      type: DebtType.Mortgage,
      currentBalance: 0,
      assetValue: undefined,
      interestRate: 0,
      amortizationRate: undefined,
      monthlyPayment: undefined,
    });
  };

  // Labels
  const categoryLabels: Record<number, string> = {
    [BudgetCategory.Salary]: t('enterData.categories.salary'),
    [BudgetCategory.Interest]: t('enterData.categories.interest'),
    [BudgetCategory.Rent]: t('enterData.categories.rent'),
    [BudgetCategory.Amortization]: t('enterData.categories.amortization'),
    [BudgetCategory.Food]: t('enterData.categories.food'),
    [BudgetCategory.Transportation]: t('enterData.categories.transportation'),
    [BudgetCategory.Insurance]: t('enterData.categories.insurance'),
    [BudgetCategory.Utilities]: t('enterData.categories.utilities'),
    [BudgetCategory.Entertainment]: t('enterData.categories.entertainment'),
    [BudgetCategory.Savings]: t('enterData.categories.savings'),
    [BudgetCategory.Other]: t('enterData.categories.other'),
  };

  const assetCategoryLabels: Record<number, string> = {
    [FinancialAccountCategory.Cash]: t('categories.cash'),
    [FinancialAccountCategory.BankAccount]: t('categories.bankAccount'),
    [FinancialAccountCategory.Savings]: t('categories.savingsAccount'),
    [FinancialAccountCategory.Investment]: t('categories.investments'),
    [FinancialAccountCategory.Pension]: t('categories.pension'),
    [FinancialAccountCategory.RealEstate]: t('categories.property'),
    [FinancialAccountCategory.Business]: t('categories.business'),
    [FinancialAccountCategory.Crypto]: 'Krypto',
    [FinancialAccountCategory.Other]: t('categories.other'),
  };

  const debtTypeLabels: Record<number, string> = {
    [DebtType.Mortgage]: t('debtTypes.mortgage'),
    [DebtType.StudentLoan]: t('enterData.debtTypes.studentLoan'),
    [DebtType.CarLoan]: t('enterData.debtTypes.carLoan'),
    [DebtType.PersonalLoan]: t('enterData.debtTypes.personalLoan'),
    [DebtType.CreditCard]: t('debtTypes.creditCard'),
    [DebtType.TaxDebt]: t('debtTypes.taxDebt'),
    [DebtType.BusinessLoan]: t('enterData.debtTypes.businessLoan'),
    [DebtType.Other]: t('debtTypes.other'),
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'income', label: t('enterData.tabs.income'), icon: <ArrowUpRight className="h-4 w-4" /> },
    { key: 'expenses', label: t('enterData.tabs.expenses'), icon: <ArrowDownRight className="h-4 w-4" /> },
    { key: 'assets', label: t('enterData.tabs.assets'), icon: <PiggyBank className="h-4 w-4" /> },
    { key: 'debts', label: t('enterData.tabs.debts'), icon: <CreditCard className="h-4 w-4" /> },
  ];

  const assetDebtTypes = [DebtType.Mortgage, DebtType.CarLoan];
  const showAssetField = assetDebtTypes.includes(debtFormData.type);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalDebts = debts.reduce((sum, d) => sum + d.currentBalance, 0);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">{t('enterData.title')}</h1>
        <p className="text-sm text-neutral-500 mt-1">{t('enterData.description')}</p>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="h-4 w-4" />
          {t('enterData.saved')}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-neutral-500 mb-1">{t('enterData.monthlyIncome')}</p>
          <p className="text-lg font-semibold text-neutral-900">{formatCurrency(budget?.totalIncome || 0)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 mb-1">{t('enterData.monthlyExpenses')}</p>
          <p className="text-lg font-semibold text-neutral-900">{formatCurrency(budget?.totalExpenses || 0)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 mb-1">{t('enterData.totalAssets')}</p>
          <p className="text-lg font-semibold text-neutral-900">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 mb-1">{t('enterData.totalDebts')}</p>
          <p className="text-lg font-semibold text-neutral-900">{formatCurrency(totalDebts)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setShowBudgetForm(false);
              setShowAssetForm(false);
              setShowDebtForm(false);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card p-6">
        {/* Income Tab */}
        {activeTab === 'income' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-neutral-900">{t('enterData.incomeTitle')}</h2>
              <button
                onClick={() => {
                  setBudgetFormData({ ...budgetFormData, type: BudgetItemType.Income, category: BudgetCategory.Salary });
                  setShowBudgetForm(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4" />
                {t('enterData.addIncome')}
              </button>
            </div>

            {showBudgetForm && budgetFormData.type === BudgetItemType.Income && (
              <form onSubmit={handleBudgetSubmit} className="bg-neutral-50 p-4 rounded-lg mb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.name')}</label>
                    <input
                      type="text"
                      value={budgetFormData.name}
                      onChange={(e) => setBudgetFormData({ ...budgetFormData, name: e.target.value })}
                      className="input"
                      placeholder={t('enterData.incomeNamePlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.amountPerMonth')}</label>
                    <FormattedNumberInput
                      value={budgetFormData.amount}
                      onChange={(val) => setBudgetFormData({ ...budgetFormData, amount: val })}
                      suffix="kr"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={resetBudgetForm} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 disabled:opacity-50">
                    <Save className="h-4 w-4" />
                    {t('common.save')}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {budget?.incomeItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-md">
                  <span className="text-sm font-medium text-neutral-900">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-900">{formatCurrency(item.amount)}</span>
                    <button onClick={() => handleBudgetEdit(item)} className="text-neutral-400 hover:text-neutral-600">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleBudgetDelete(item.id)} className="text-neutral-400 hover:text-neutral-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(!budget?.incomeItems || budget.incomeItems.length === 0) && (
                <p className="text-neutral-400 text-sm text-center py-8">{t('enterData.noIncome')}</p>
              )}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-neutral-900">{t('enterData.expensesTitle')}</h2>
              <button
                onClick={() => {
                  setBudgetFormData({ ...budgetFormData, type: BudgetItemType.Expense, category: BudgetCategory.Other });
                  setShowBudgetForm(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4" />
                {t('enterData.addExpense')}
              </button>
            </div>

            {showBudgetForm && budgetFormData.type === BudgetItemType.Expense && (
              <form onSubmit={handleBudgetSubmit} className="bg-neutral-50 p-4 rounded-lg mb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.name')}</label>
                    <input
                      type="text"
                      value={budgetFormData.name}
                      onChange={(e) => setBudgetFormData({ ...budgetFormData, name: e.target.value })}
                      className="input"
                      placeholder={t('enterData.expenseNamePlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.amountPerMonth')}</label>
                    <FormattedNumberInput
                      value={budgetFormData.amount}
                      onChange={(val) => setBudgetFormData({ ...budgetFormData, amount: val })}
                      suffix="kr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.category')}</label>
                  <select
                    value={budgetFormData.category}
                    onChange={(e) => setBudgetFormData({ ...budgetFormData, category: parseInt(e.target.value) })}
                    className="input"
                  >
                    {Object.entries(categoryLabels)
                      .filter(([key]) => parseInt(key) !== BudgetCategory.Salary)
                      .map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={resetBudgetForm} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 disabled:opacity-50">
                    <Save className="h-4 w-4" />
                    {t('common.save')}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {budget?.expenseItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-md">
                  <div>
                    <span className="text-sm font-medium text-neutral-900">{item.name}</span>
                    <span className="text-xs text-neutral-400 ml-2">{categoryLabels[item.category]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-900">{formatCurrency(item.amount)}</span>
                    <button onClick={() => handleBudgetEdit(item)} className="text-neutral-400 hover:text-neutral-600">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleBudgetDelete(item.id)} className="text-neutral-400 hover:text-neutral-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(!budget?.expenseItems || budget.expenseItems.length === 0) && (
                <p className="text-neutral-400 text-sm text-center py-8">{t('enterData.noExpenses')}</p>
              )}
            </div>
          </div>
        )}

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-neutral-900">{t('enterData.assetsTitle')}</h2>
              <button
                onClick={() => setShowAssetForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4" />
                {t('enterData.addAsset')}
              </button>
            </div>

            {showAssetForm && (
              <form onSubmit={handleAssetSubmit} className="bg-neutral-50 p-4 rounded-lg mb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.name')}</label>
                    <input
                      type="text"
                      value={assetFormData.name}
                      onChange={(e) => setAssetFormData({ ...assetFormData, name: e.target.value })}
                      className="input"
                      placeholder={t('enterData.assetNamePlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.value')}</label>
                    <FormattedNumberInput
                      value={assetFormData.balance}
                      onChange={(val) => setAssetFormData({ ...assetFormData, balance: val })}
                      suffix="kr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.category')}</label>
                    <select
                      value={assetFormData.category}
                      onChange={(e) => setAssetFormData({ ...assetFormData, category: parseInt(e.target.value) })}
                      className="input"
                    >
                      {Object.entries(assetCategoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.bank')}</label>
                    <input
                      type="text"
                      value={assetFormData.institution}
                      onChange={(e) => setAssetFormData({ ...assetFormData, institution: e.target.value })}
                      className="input"
                      placeholder={t('enterData.bankPlaceholder')}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={resetAssetForm} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 disabled:opacity-50">
                    <Save className="h-4 w-4" />
                    {t('common.save')}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-md">
                  <div>
                    <span className="text-sm font-medium text-neutral-900">{account.name}</span>
                    <span className="text-xs text-neutral-400 ml-2">{assetCategoryLabels[account.category]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-900">{formatCurrency(account.balance)}</span>
                    <button onClick={() => handleAssetEdit(account)} className="text-neutral-400 hover:text-neutral-600">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleAssetDelete(account.id)} className="text-neutral-400 hover:text-neutral-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {accounts.length === 0 && (
                <p className="text-neutral-400 text-sm text-center py-8">{t('enterData.noAssets')}</p>
              )}
            </div>
          </div>
        )}

        {/* Debts Tab */}
        {activeTab === 'debts' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-neutral-900">{t('enterData.debtsTitle')}</h2>
              <button
                onClick={() => setShowDebtForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4" />
                {t('enterData.addDebt')}
              </button>
            </div>

            {showDebtForm && (
              <form onSubmit={handleDebtSubmit} className="bg-neutral-50 p-4 rounded-lg mb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.debtType')}</label>
                    <select
                      value={debtFormData.type}
                      onChange={(e) => setDebtFormData({ ...debtFormData, type: parseInt(e.target.value) })}
                      className="input"
                    >
                      {Object.entries(debtTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.remainingDebt')}</label>
                    <FormattedNumberInput
                      value={debtFormData.currentBalance}
                      onChange={(val) => setDebtFormData({ ...debtFormData, currentBalance: val })}
                      suffix="kr"
                    />
                  </div>
                </div>
                {showAssetField && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {debtFormData.type === DebtType.Mortgage ? t('enterData.propertyValue') : t('enterData.assetValue')}
                    </label>
                    <FormattedNumberInput
                      value={debtFormData.assetValue || 0}
                      onChange={(val) => setDebtFormData({ ...debtFormData, assetValue: val || undefined })}
                      suffix="kr"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.interestRate')}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={debtFormData.interestRate || ''}
                        onChange={(e) => setDebtFormData({ ...debtFormData, interestRate: parseFloat(e.target.value) || 0 })}
                        className="input pr-10"
                        step="0.01"
                        placeholder="2.5"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('enterData.amortizationRate')}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={debtFormData.amortizationRate || ''}
                        onChange={(e) => setDebtFormData({ ...debtFormData, amortizationRate: parseFloat(e.target.value) || undefined })}
                        className="input pr-10"
                        step="0.01"
                        placeholder="2"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={resetDebtForm} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 disabled:opacity-50">
                    <Save className="h-4 w-4" />
                    {t('common.save')}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {debts.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-neutral-200 flex items-center justify-center text-neutral-600">
                      {debt.type === DebtType.Mortgage ? <Home className="h-4 w-4" /> : 
                       debt.type === DebtType.CarLoan ? <Car className="h-4 w-4" /> : 
                       <CreditCard className="h-4 w-4" />}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-neutral-900">{debtTypeLabels[debt.type]}</span>
                      {debt.interestRate > 0 && (
                        <p className="text-xs text-neutral-400">{debt.interestRate}% {t('enterData.interest')}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-900">{formatCurrency(debt.currentBalance)}</span>
                    <button onClick={() => handleDebtEdit(debt)} className="text-neutral-400 hover:text-neutral-600">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDebtDelete(debt.id)} className="text-neutral-400 hover:text-neutral-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {debts.length === 0 && (
                <p className="text-neutral-400 text-sm text-center py-8">{t('enterData.noDebts')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

