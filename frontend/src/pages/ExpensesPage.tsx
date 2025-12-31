import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { expensesApi, employeesApi } from '../services/api';
import type { ExpenseList, Employee } from '../types';
import { ExpenseStatus, ExpenseCategory } from '../types';
import { 
  Plus, 
  Loader2, 
  Receipt, 
  Search, 
  X, 
  Send, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Wallet
} from 'lucide-react';

const categoryLabels: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Travel]: 'Resa',
  [ExpenseCategory.Accommodation]: 'Logi',
  [ExpenseCategory.Meals]: 'Måltider',
  [ExpenseCategory.Entertainment]: 'Representation',
  [ExpenseCategory.Materials]: 'Material',
  [ExpenseCategory.Software]: 'Programvara',
  [ExpenseCategory.Equipment]: 'Utrustning',
  [ExpenseCategory.Phone]: 'Telefon',
  [ExpenseCategory.Other]: 'Övrigt',
};

const statusLabels: Record<ExpenseStatus, string> = {
  [ExpenseStatus.Draft]: 'Utkast',
  [ExpenseStatus.Submitted]: 'Inskickad',
  [ExpenseStatus.Approved]: 'Godkänd',
  [ExpenseStatus.Paid]: 'Utbetald',
  [ExpenseStatus.Rejected]: 'Avvisad',
};

const statusStyles: Record<ExpenseStatus, string> = {
  [ExpenseStatus.Draft]: 'bg-neutral-100 text-neutral-600',
  [ExpenseStatus.Submitted]: 'bg-neutral-200 text-neutral-700',
  [ExpenseStatus.Approved]: 'bg-neutral-800 text-white',
  [ExpenseStatus.Paid]: 'bg-neutral-900 text-white',
  [ExpenseStatus.Rejected]: 'bg-neutral-300 text-neutral-700',
};

export default function ExpensesPage() {
  const { selectedCompany } = useCompany();
  const [expenses, setExpenses] = useState<ExpenseList[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    vatRate: 25,
    expenseDate: new Date().toISOString().split('T')[0],
    category: ExpenseCategory.Other,
    receiptNumber: '',
    notes: '',
    supplier: '',
    employeeId: null as number | null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany]);

  const loadData = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);
      const [expensesData, employeesData] = await Promise.all([
        expensesApi.getAll(selectedCompany.id),
        employeesApi.getAll(selectedCompany.id),
      ]);
      setExpenses(expensesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    
    setSaving(true);
    try {
      await expensesApi.create(selectedCompany.id, {
        ...formData,
        employeeId: formData.employeeId || undefined,
      });
      await loadData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      vatRate: 25,
      expenseDate: new Date().toISOString().split('T')[0],
      category: ExpenseCategory.Other,
      receiptNumber: '',
      notes: '',
      supplier: '',
      employeeId: null,
    });
  };

  const handleSubmitExpense = async (id: number) => {
    if (!selectedCompany) return;
    try {
      await expensesApi.submit(selectedCompany.id, id);
      await loadData();
    } catch (error) {
      console.error('Failed to submit expense:', error);
    }
  };

  const handleApprove = async (id: number) => {
    if (!selectedCompany) return;
    try {
      await expensesApi.approve(selectedCompany.id, id);
      await loadData();
    } catch (error) {
      console.error('Failed to approve expense:', error);
    }
  };

  const handleReject = async (id: number) => {
    if (!selectedCompany) return;
    try {
      await expensesApi.reject(selectedCompany.id, id);
      await loadData();
    } catch (error) {
      console.error('Failed to reject expense:', error);
    }
  };

  const handlePay = async (id: number) => {
    if (!selectedCompany) return;
    try {
      await expensesApi.markAsPaid(selectedCompany.id, id);
      await loadData();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!selectedCompany) return;
    if (!confirm('Är du säker på att du vill ta bort detta utlägg?')) return;
    
    try {
      await expensesApi.delete(selectedCompany.id, id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Kunde inte ta bort utlägget. Endast utkast kan tas bort.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const vatAmount = formData.amount * (formData.vatRate / 100);
  const totalAmount = formData.amount + vatAmount;

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    (e.supplier?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    totalDraft: expenses.filter(e => e.status === ExpenseStatus.Draft).reduce((sum, e) => sum + e.totalAmount, 0),
    totalSubmitted: expenses.filter(e => e.status === ExpenseStatus.Submitted).reduce((sum, e) => sum + e.totalAmount, 0),
    totalApproved: expenses.filter(e => e.status === ExpenseStatus.Approved).reduce((sum, e) => sum + e.totalAmount, 0),
    totalPaid: expenses.filter(e => e.status === ExpenseStatus.Paid).reduce((sum, e) => sum + e.totalAmount, 0),
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Utlägg</h1>
          <p className="text-neutral-500 mt-1">{expenses.length} utlägg</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Nytt utlägg
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 border-l-4 border-l-neutral-300">
          <p className="text-sm text-neutral-500">Utkast</p>
          <p className="text-xl font-semibold text-neutral-700">{formatCurrency(stats.totalDraft)}</p>
        </div>
        <div className="card p-4 border-l-4 border-l-neutral-400">
          <p className="text-sm text-neutral-500">Väntar på godkännande</p>
          <p className="text-xl font-semibold text-neutral-700">{formatCurrency(stats.totalSubmitted)}</p>
        </div>
        <div className="card p-4 border-l-4 border-l-neutral-600">
          <p className="text-sm text-neutral-500">Godkända</p>
          <p className="text-xl font-semibold text-neutral-800">{formatCurrency(stats.totalApproved)}</p>
        </div>
        <div className="card p-4 border-l-4 border-l-neutral-900">
          <p className="text-sm text-neutral-500">Utbetalda</p>
          <p className="text-xl font-semibold text-neutral-900">{formatCurrency(stats.totalPaid)}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök utlägg..."
          className="input pl-10"
        />
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="card p-8 text-center">
          <Receipt className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-neutral-900 mb-2">Inga utlägg</h2>
          <p className="text-neutral-500">Lägg till ditt första utlägg för att komma igång.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Datum</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Beskrivning</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Leverantör</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Kategori</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Belopp</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(expense.expenseDate).toLocaleDateString('sv-SE')}
                  </td>
                  <td className="px-6 py-4 font-medium text-neutral-900">{expense.description}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{expense.supplier || '-'}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{categoryLabels[expense.category]}</td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                    {formatCurrency(expense.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[expense.status]}`}>
                      {statusLabels[expense.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      {expense.status === ExpenseStatus.Draft && (
                        <>
                          <button
                            onClick={() => handleSubmitExpense(expense.id)}
                            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                            title="Skicka in"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                            title="Ta bort"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {expense.status === ExpenseStatus.Submitted && (
                        <>
                          <button
                            onClick={() => handleApprove(expense.id)}
                            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                            title="Godkänn"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(expense.id)}
                            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                            title="Avvisa"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {expense.status === ExpenseStatus.Approved && (
                        <button
                          onClick={() => handlePay(expense.id)}
                          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                          title="Markera som utbetald"
                        >
                          <Wallet className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Nytt utlägg</h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Beskrivning *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="T.ex. Taxi till möte"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Belopp exkl. moms *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="label">Momssats</label>
                  <select
                    value={formData.vatRate}
                    onChange={(e) => setFormData({ ...formData, vatRate: parseInt(e.target.value) })}
                    className="input"
                  >
                    <option value={25}>25%</option>
                    <option value={12}>12%</option>
                    <option value={6}>6%</option>
                    <option value={0}>0%</option>
                  </select>
                </div>
              </div>

              <div className="bg-neutral-100 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Belopp exkl. moms</span>
                  <span className="font-medium">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Moms ({formData.vatRate}%)</span>
                  <span className="font-medium">{formatCurrency(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-neutral-300 mt-2">
                  <span className="font-medium text-neutral-900">Totalt</span>
                  <span className="font-semibold text-neutral-900">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Datum *</label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Kategori</label>
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
              </div>

              <div>
                <label className="label">Leverantör/Butik</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="input"
                  placeholder="T.ex. Taxi Stockholm"
                />
              </div>

              <div>
                <label className="label">Kvittonummer</label>
                <input
                  type="text"
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                  className="input"
                  placeholder="Kvittonr eller referens"
                />
              </div>

              {employees.length > 0 && (
                <div>
                  <label className="label">Anställd (valfritt)</label>
                  <select
                    value={formData.employeeId || ''}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value ? parseInt(e.target.value) : null })}
                    className="input"
                  >
                    <option value="">Ingen anställd vald</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="label">Anteckningar</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Valfri information..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Avbryt
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Spara utlägg
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
