import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { employeesApi } from '../services/api';
import type { Salary, Employee } from '../types';
import { Plus, Loader2, Wallet, X, CheckCircle } from 'lucide-react';

export default function SalariesPage() {
  const { selectedCompany } = useCompany();
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    paymentDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 25).toISOString().split('T')[0],
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
      const [salariesData, employeesData] = await Promise.all([
        employeesApi.getSalaries(selectedCompany.id),
        employeesApi.getAll(selectedCompany.id),
      ]);
      setSalaries(salariesData);
      setEmployees(employeesData.filter(e => e.isActive));
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
      await employeesApi.createSalary(selectedCompany.id, formData);
      await loadData();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create salary:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsPaid = async (salaryId: number) => {
    if (!selectedCompany) return;
    try {
      await employeesApi.markSalaryAsPaid(selectedCompany.id, salaryId);
      await loadData();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleDateString('sv-SE', { month: 'long' });
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
          <h1 className="text-2xl font-bold text-slate-900">Lönekörning</h1>
          <p className="text-slate-600 mt-1">{salaries.length} löneutbetalningar</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary" disabled={employees.length === 0}>
          <Plus className="h-4 w-4" />
          Ny lönekörning
        </button>
      </div>

      {employees.length === 0 && (
        <div className="card p-4 mb-6 bg-neutral-100 border-neutral-200">
          <p className="text-neutral-600">Du måste lägga till anställda innan du kan köra lön.</p>
        </div>
      )}

      {salaries.length === 0 ? (
        <div className="card p-8 text-center">
          <Wallet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Inga löner</h2>
          <p className="text-slate-600">Kör din första lönekörning för att komma igång.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Anställd</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Period</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Utbetalning</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Brutto</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Skatt</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Netto</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Arb.avg</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {salaries.map((salary) => (
                <tr key={salary.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{salary.employeeName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {getMonthName(salary.month)} {salary.year}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(salary.paymentDate).toLocaleDateString('sv-SE')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 text-right">{formatCurrency(salary.grossSalary)}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600 text-right">-{formatCurrency(salary.taxAmount)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 text-right">{formatCurrency(salary.netSalary)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-right">{formatCurrency(salary.employerContribution)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      salary.isPaid ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {salary.isPaid ? 'Utbetald' : 'Ej utbetald'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!salary.isPaid && (
                      <button
                        onClick={() => handleMarkAsPaid(salary.id)}
                        className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                        title="Markera som utbetald"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Ny lönekörning</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Anställd *</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: parseInt(e.target.value) })}
                  className="input"
                  required
                >
                  <option value={0}>Välj anställd...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">År *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="input"
                    min="2020"
                    max="2100"
                    required
                  />
                </div>
                <div>
                  <label className="label">Månad *</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="input"
                    required
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Utbetalningsdatum *</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Avbryt
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Kör lön
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

