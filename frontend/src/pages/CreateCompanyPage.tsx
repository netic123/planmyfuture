import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companiesApi } from '../services/api';
import { useCompany } from '../context/CompanyContext';
import { Building2, Loader2 } from 'lucide-react';

export default function CreateCompanyPage() {
  const [name, setName] = useState('');
  const [organizationNumber, setOrganizationNumber] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bankgiro, setBankgiro] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshCompanies, selectCompany } = useCompany();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const company = await companiesApi.create({
        name,
        organizationNumber,
        address: address || undefined,
        postalCode: postalCode || undefined,
        city: city || undefined,
        phone: phone || undefined,
        email: email || undefined,
        bankgiro: bankgiro || undefined,
      });
      await refreshCompanies();
      selectCompany(company);
      navigate('/');
    } catch {
      setError('Kunde inte skapa företaget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-neutral-900 mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Skapa ditt företag</h1>
          <p className="mt-2 text-slate-600">Fyll i uppgifterna för ditt företag</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-neutral-100 text-neutral-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="name" className="label">Företagsnamn *</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Företaget AB"
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="orgNumber" className="label">Organisationsnummer *</label>
                <input
                  id="orgNumber"
                  type="text"
                  value={organizationNumber}
                  onChange={(e) => setOrganizationNumber(e.target.value)}
                  className="input"
                  placeholder="556123-4567"
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="info@foretaget.se"
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="address" className="label">Adress</label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input"
                  placeholder="Storgatan 1"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="label">Postnummer</label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="input"
                  placeholder="123 45"
                />
              </div>

              <div>
                <label htmlFor="city" className="label">Ort</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input"
                  placeholder="Stockholm"
                />
              </div>

              <div>
                <label htmlFor="phone" className="label">Telefon</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  placeholder="08-123 456 78"
                />
              </div>

              <div>
                <label htmlFor="bankgiro" className="label">Bankgiro</label>
                <input
                  id="bankgiro"
                  type="text"
                  value={bankgiro}
                  onChange={(e) => setBankgiro(e.target.value)}
                  className="input"
                  placeholder="123-4567"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Skapar företag...
                </>
              ) : (
                'Skapa företag'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

