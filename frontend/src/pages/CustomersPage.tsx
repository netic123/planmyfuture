import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { customersApi } from '../services/api';
import type { Customer } from '../types';
import { Plus, Loader2, Users, Search, X } from 'lucide-react';

export default function CustomersPage() {
  const { selectedCompany } = useCompany();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    organizationNumber: '',
    address: '',
    postalCode: '',
    city: '',
    email: '',
    phone: '',
    paymentTermsDays: 30,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      loadCustomers();
    }
  }, [selectedCompany]);

  const loadCustomers = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);
      const data = await customersApi.getAll(selectedCompany.id);
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    
    setSaving(true);
    try {
      await customersApi.create(selectedCompany.id, formData);
      await loadCustomers();
      setShowForm(false);
      setFormData({
        name: '',
        organizationNumber: '',
        address: '',
        postalCode: '',
        city: '',
        email: '',
        phone: '',
        paymentTermsDays: 30,
      });
    } catch (error) {
      console.error('Failed to create customer:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.customerNumber.includes(search)
  );

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
          <h1 className="text-2xl font-bold text-slate-900">Kunder</h1>
          <p className="text-slate-600 mt-1">{customers.length} kunder</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Ny kund
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök kunder..."
          className="input pl-10"
        />
      </div>

      {/* Customer list */}
      {filteredCustomers.length === 0 ? (
        <div className="card p-8 text-center">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Inga kunder</h2>
          <p className="text-slate-600">Lägg till din första kund för att komma igång.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Kund</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Org.nr</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Ort</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Betalningsvillkor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{customer.name}</p>
                      <p className="text-sm text-slate-500">#{customer.customerNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.organizationNumber || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.city || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.paymentTermsDays} dagar</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Ny kund</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Kundnamn *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Organisationsnummer</label>
                <input
                  type="text"
                  value={formData.organizationNumber}
                  onChange={(e) => setFormData({ ...formData, organizationNumber: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Adress</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Postnummer</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Ort</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input"
                  />
                </div>
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
                <label className="label">Betalningsvillkor (dagar)</label>
                <input
                  type="number"
                  value={formData.paymentTermsDays}
                  onChange={(e) => setFormData({ ...formData, paymentTermsDays: parseInt(e.target.value) })}
                  className="input"
                  min="0"
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

