import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { employeesApi } from '../services/api';
import type { Employee } from '../types';
import { Plus, Loader2, UserCircle, X } from 'lucide-react';

export default function EmployeesPage() {
  const { selectedCompany } = useCompany();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalNumber: '',
    address: '',
    postalCode: '',
    city: '',
    email: '',
    phone: '',
    bankAccount: '',
    monthlySalary: 0,
    taxRate: 30,
    startDate: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      loadEmployees();
    }
  }, [selectedCompany]);

  const loadEmployees = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);
      const data = await employeesApi.getAll(selectedCompany.id);
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    
    setSaving(true);
    try {
      await employeesApi.create(selectedCompany.id, formData);
      await loadEmployees();
      setShowForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        personalNumber: '',
        address: '',
        postalCode: '',
        city: '',
        email: '',
        phone: '',
        bankAccount: '',
        monthlySalary: 0,
        taxRate: 30,
        startDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to create employee:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Anställda</h1>
          <p className="text-slate-600 mt-1">{employees.length} anställda</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Ny anställd
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="card p-8 text-center">
          <UserCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Inga anställda</h2>
          <p className="text-slate-600">Lägg till anställda för att hantera löner.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div key={employee.id} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-medium">
                  {employee.firstName[0]}{employee.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{employee.fullName}</h3>
                  <p className="text-sm text-slate-500">#{employee.employeeNumber}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  employee.isActive ? 'bg-neutral-900 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {employee.isActive ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Månadslön:</span>
                  <span className="font-medium text-slate-900">{formatCurrency(employee.monthlySalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Skattesats:</span>
                  <span className="text-slate-600">{employee.taxRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Startdatum:</span>
                  <span className="text-slate-600">{new Date(employee.startDate).toLocaleDateString('sv-SE')}</span>
                </div>
                {employee.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-600 truncate ml-2">{employee.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Ny anställd</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Förnamn *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Efternamn *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Personnummer</label>
                <input
                  type="text"
                  value={formData.personalNumber}
                  onChange={(e) => setFormData({ ...formData, personalNumber: e.target.value })}
                  className="input"
                  placeholder="YYYYMMDD-XXXX"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Bankkonto</label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="input"
                  placeholder="Clearing + kontonummer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Månadslön (kr) *</label>
                  <input
                    type="number"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) })}
                    className="input"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="label">Skattesats (%) *</label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                    className="input"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Startdatum *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                  Spara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

