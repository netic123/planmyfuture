import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { vouchersApi, accountsApi } from '../services/api';
import type { VoucherList, Account } from '../types';
import { VoucherType } from '../types';
import { Plus, Loader2, BookOpen, Search, X } from 'lucide-react';

export default function VouchersPage() {
  const { selectedCompany } = useCompany();
  const [vouchers, setVouchers] = useState<VoucherList[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    voucherDate: new Date().toISOString().split('T')[0],
    description: '',
    type: VoucherType.Manual,
    rows: [
      { accountId: 0, debit: 0, credit: 0, description: '' },
      { accountId: 0, debit: 0, credit: 0, description: '' },
    ],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany]);

  const loadData = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);
      const [vouchersData, accountsData] = await Promise.all([
        vouchersApi.getAll(selectedCompany.id),
        accountsApi.getAll(selectedCompany.id),
      ]);
      setVouchers(vouchersData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    
    const totalDebit = formData.rows.reduce((sum, r) => sum + r.debit, 0);
    const totalCredit = formData.rows.reduce((sum, r) => sum + r.credit, 0);
    
    if (totalDebit !== totalCredit) {
      setError('Debet måste vara lika med kredit');
      return;
    }

    if (totalDebit === 0) {
      setError('Verifikationen måste ha minst ett belopp');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await vouchersApi.create(selectedCompany.id, formData);
      await loadData();
      setShowForm(false);
      setFormData({
        voucherDate: new Date().toISOString().split('T')[0],
        description: '',
        type: VoucherType.Manual,
        rows: [
          { accountId: 0, debit: 0, credit: 0, description: '' },
          { accountId: 0, debit: 0, credit: 0, description: '' },
        ],
      });
    } catch (error) {
      console.error('Failed to create voucher:', error);
      setError('Kunde inte skapa verifikationen');
    } finally {
      setSaving(false);
    }
  };

  const addRow = () => {
    setFormData({
      ...formData,
      rows: [...formData.rows, { accountId: 0, debit: 0, credit: 0, description: '' }],
    });
  };

  const updateRow = (index: number, field: string, value: string | number) => {
    const newRows = [...formData.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setFormData({ ...formData, rows: newRows });
  };

  const removeRow = (index: number) => {
    if (formData.rows.length > 2) {
      const newRows = formData.rows.filter((_, i) => i !== index);
      setFormData({ ...formData, rows: newRows });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const getVoucherTypeLabel = (type: VoucherType) => {
    const labels = {
      [VoucherType.Manual]: 'Manuell',
      [VoucherType.Invoice]: 'Faktura',
      [VoucherType.Payment]: 'Betalning',
      [VoucherType.Salary]: 'Lön',
      [VoucherType.Other]: 'Annat',
    };
    return labels[type];
  };

  const totalDebit = formData.rows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = formData.rows.reduce((sum, r) => sum + r.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  const filteredVouchers = vouchers.filter(v => 
    v.voucherNumber.includes(search) ||
    v.description.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-900">Bokföring</h1>
          <p className="text-slate-600 mt-1">{vouchers.length} verifikationer</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Ny verifikation
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök verifikationer..."
          className="input pl-10"
        />
      </div>

      {filteredVouchers.length === 0 ? (
        <div className="card p-8 text-center">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Inga verifikationer</h2>
          <p className="text-slate-600">Skapa din första verifikation för att börja bokföra.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Ver.nr</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Datum</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Beskrivning</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Typ</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Belopp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">#{voucher.voucherNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(voucher.voucherDate).toLocaleDateString('sv-SE')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{voucher.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{getVoucherTypeLabel(voucher.type)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 text-right">
                    {formatCurrency(voucher.totalAmount)}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Ny verifikation</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-neutral-100 text-neutral-700 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Datum *</label>
                  <input
                    type="date"
                    value={formData.voucherDate}
                    onChange={(e) => setFormData({ ...formData, voucherDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Typ</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) as VoucherType })}
                    className="input"
                  >
                    <option value={VoucherType.Manual}>Manuell</option>
                    <option value={VoucherType.Invoice}>Faktura</option>
                    <option value={VoucherType.Payment}>Betalning</option>
                    <option value={VoucherType.Salary}>Lön</option>
                    <option value={VoucherType.Other}>Annat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Beskrivning *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="T.ex. Inköp kontorsmaterial"
                  required
                />
              </div>

              <div>
                <label className="label">Konteringsrader</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-1">
                    <div className="col-span-5">Konto</div>
                    <div className="col-span-3">Debet</div>
                    <div className="col-span-3">Kredit</div>
                    <div className="col-span-1"></div>
                  </div>
                  {formData.rows.map((row, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <select
                          value={row.accountId}
                          onChange={(e) => updateRow(index, 'accountId', parseInt(e.target.value))}
                          className="input text-sm"
                          required
                        >
                          <option value={0}>Välj konto...</option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.accountNumber} - {a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={row.debit || ''}
                          onChange={(e) => updateRow(index, 'debit', parseFloat(e.target.value) || 0)}
                          className="input text-sm"
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={row.credit || ''}
                          onChange={(e) => updateRow(index, 'credit', parseFloat(e.target.value) || 0)}
                          className="input text-sm"
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        {formData.rows.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className="p-1 text-neutral-500 hover:bg-neutral-100 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <button type="button" onClick={addRow} className="text-sm text-neutral-600 hover:text-neutral-900">
                    + Lägg till rad
                  </button>
                  <div className={`text-sm font-medium ${isBalanced ? 'text-neutral-900' : 'text-neutral-600'}`}>
                    Debet: {formatCurrency(totalDebit)} | Kredit: {formatCurrency(totalCredit)}
                    {!isBalanced && ' (Obalanserat!)'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Avbryt
                </button>
                <button type="submit" disabled={saving || !isBalanced} className="btn-primary">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Bokför
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

