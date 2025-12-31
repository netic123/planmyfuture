import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { invoicesApi, customersApi } from '../services/api';
import type { InvoiceList, Customer } from '../types';
import { InvoiceStatus } from '../types';
import { Plus, Loader2, FileText, Search, X, Send, CheckCircle, Trash2 } from 'lucide-react';

export default function InvoicesPage() {
  const { selectedCompany } = useCompany();
  const [invoices, setInvoices] = useState<InvoiceList[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    customerId: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reference: '',
    lines: [{ description: '', quantity: 1, unit: 'st', unitPrice: 0, vatRate: 25 }],
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
      const [invoicesData, customersData] = await Promise.all([
        invoicesApi.getAll(selectedCompany.id),
        customersApi.getAll(selectedCompany.id),
      ]);
      setInvoices(invoicesData);
      setCustomers(customersData);
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
      await invoicesApi.create(selectedCompany.id, formData);
      await loadData();
      setShowForm(false);
      setFormData({
        customerId: 0,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reference: '',
        lines: [{ description: '', quantity: 1, unit: 'st', unitPrice: 0, vatRate: 25 }],
      });
    } catch (error) {
      console.error('Failed to create invoice:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (id: number) => {
    if (!selectedCompany) return;
    try {
      await invoicesApi.send(selectedCompany.id, id);
      await loadData();
    } catch (error) {
      console.error('Failed to send invoice:', error);
    }
  };

  const handlePay = async (id: number) => {
    if (!selectedCompany) return;
    try {
      await invoicesApi.markAsPaid(selectedCompany.id, id);
      await loadData();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const handleDelete = async (id: number, invoiceNumber: string) => {
    if (!selectedCompany) return;
    if (!confirm(`Är du säker på att du vill ta bort faktura #${invoiceNumber}?`)) return;
    
    try {
      await invoicesApi.delete(selectedCompany.id, id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      alert('Kunde inte ta bort fakturan. Endast utkast kan tas bort.');
    }
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { description: '', quantity: 1, unit: 'st', unitPrice: 0, vatRate: 25 }],
    });
  };

  const updateLine = (index: number, field: string, value: string | number) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length > 1) {
      const newLines = formData.lines.filter((_, i) => i !== index);
      setFormData({ ...formData, lines: newLines });
    }
  };

  const calculateLineTotal = (line: typeof formData.lines[0]) => {
    const exVat = line.quantity * line.unitPrice;
    const vat = exVat * (line.vatRate / 100);
    const inclVat = exVat + vat;
    return { exVat, vat, inclVat };
  };

  const totals = formData.lines.reduce(
    (acc, line) => {
      const { exVat, vat, inclVat } = calculateLineTotal(line);
      return {
        exVat: acc.exVat + exVat,
        vat: acc.vat + vat,
        inclVat: acc.inclVat + inclVat,
      };
    },
    { exVat: 0, vat: 0, inclVat: 0 }
  );

  const getStatusBadge = (status: InvoiceStatus) => {
    const styles = {
      [InvoiceStatus.Draft]: 'bg-neutral-100 text-neutral-600',
      [InvoiceStatus.Sent]: 'bg-neutral-200 text-neutral-700',
      [InvoiceStatus.Paid]: 'bg-neutral-900 text-white',
      [InvoiceStatus.Overdue]: 'bg-neutral-800 text-white',
      [InvoiceStatus.Cancelled]: 'bg-neutral-100 text-neutral-400',
    };
    const labels = {
      [InvoiceStatus.Draft]: 'Utkast',
      [InvoiceStatus.Sent]: 'Skickad',
      [InvoiceStatus.Paid]: 'Betald',
      [InvoiceStatus.Overdue]: 'Förfallen',
      [InvoiceStatus.Cancelled]: 'Makulerad',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const filteredInvoices = invoices.filter(i => 
    i.invoiceNumber.includes(search) ||
    i.customerName.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-semibold text-neutral-900">Fakturor</h1>
          <p className="text-neutral-500 mt-1">{invoices.length} fakturor</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary" disabled={customers.length === 0}>
          <Plus className="h-4 w-4" />
          Ny faktura
        </button>
      </div>

      {customers.length === 0 && (
        <div className="card p-4 mb-6 border-neutral-300">
          <p className="text-neutral-600">Du måste skapa minst en kund innan du kan skapa fakturor.</p>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök fakturor..."
          className="input pl-10"
        />
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="card p-8 text-center">
          <FileText className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-neutral-900 mb-2">Inga fakturor</h2>
          <p className="text-neutral-500">Skapa din första faktura för att komma igång.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Fakturanr</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Kund</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Fakturadatum</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Förfallodatum</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Belopp</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">#{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{invoice.customerName}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(invoice.invoiceDate).toLocaleDateString('sv-SE')}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(invoice.dueDate).toLocaleDateString('sv-SE')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                    {formatCurrency(invoice.totalIncludingVat)}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      {invoice.status === InvoiceStatus.Draft && (
                        <>
                          <button
                            onClick={() => handleSend(invoice.id)}
                            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                            title="Markera som skickad"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                            title="Ta bort faktura"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {(invoice.status === InvoiceStatus.Sent || invoice.status === InvoiceStatus.Overdue) && (
                        <button
                          onClick={() => handlePay(invoice.id)}
                          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                          title="Markera som betald"
                        >
                          <CheckCircle className="h-4 w-4" />
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Ny faktura</h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Kund *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: parseInt(e.target.value) })}
                  className="input"
                  required
                >
                  <option value={0}>Välj kund...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fakturadatum</label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Förfallodatum</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Er referens</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Fakturarader</label>
                
                <div className="grid grid-cols-12 gap-2 mb-2 px-3 text-xs font-medium text-neutral-500 uppercase">
                  <div className="col-span-4">Beskrivning</div>
                  <div className="col-span-1 text-right">Antal</div>
                  <div className="col-span-2 text-right">À-pris</div>
                  <div className="col-span-1 text-center">Moms</div>
                  <div className="col-span-2 text-right">Moms (kr)</div>
                  <div className="col-span-2 text-right">Summa</div>
                </div>
                
                <div className="space-y-3">
                  {formData.lines.map((line, index) => {
                    const lineCalc = calculateLineTotal(line);
                    return (
                      <div key={index} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4">
                            <input
                              type="text"
                              placeholder="Beskrivning"
                              value={line.description}
                              onChange={(e) => updateLine(index, 'description', e.target.value)}
                              className="input text-sm"
                              required
                            />
                          </div>
                          <div className="col-span-1">
                            <input
                              type="number"
                              placeholder="1"
                              value={line.quantity}
                              onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="input text-sm text-right"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="0"
                              value={line.unitPrice}
                              onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="input text-sm text-right"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="col-span-1">
                            <select
                              value={line.vatRate}
                              onChange={(e) => updateLine(index, 'vatRate', parseInt(e.target.value))}
                              className="input text-sm text-center"
                            >
                              <option value={25}>25%</option>
                              <option value={12}>12%</option>
                              <option value={6}>6%</option>
                              <option value={0}>0%</option>
                            </select>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="text-sm font-medium text-neutral-600">
                              {formatCurrency(lineCalc.vat)}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-center justify-end gap-2">
                            <span className="text-sm font-semibold text-neutral-900">
                              {formatCurrency(lineCalc.inclVat)}
                            </span>
                            {formData.lines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLine(index)}
                                className="p-1 text-neutral-400 hover:bg-neutral-200 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-neutral-200 text-xs text-neutral-500 flex justify-end gap-4">
                          <span>Ex moms: {formatCurrency(lineCalc.exVat)}</span>
                          <span>+ Moms {line.vatRate}%: {formatCurrency(lineCalc.vat)}</span>
                          <span className="font-medium text-neutral-700">= {formatCurrency(lineCalc.inclVat)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button type="button" onClick={addLine} className="mt-3 text-sm text-neutral-600 hover:text-neutral-900 font-medium">
                  + Lägg till rad
                </button>
              </div>

              <div className="bg-neutral-100 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Sammanfattning</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Summa exkl. moms</span>
                    <span className="font-medium text-neutral-900">{formatCurrency(totals.exVat)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Moms totalt</span>
                    <span className="font-medium text-neutral-600">{formatCurrency(totals.vat)}</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-neutral-300">
                    <span className="font-medium text-neutral-900">Att betala</span>
                    <span className="font-semibold text-lg text-neutral-900">{formatCurrency(totals.inclVat)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Avbryt
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Skapa faktura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
