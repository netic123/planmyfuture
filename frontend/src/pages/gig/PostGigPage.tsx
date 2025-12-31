import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gigApi } from '../../services/api';
import type { CreateGigRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const categories = [
  { value: 0, label: 'IT & Telekom', labelEn: 'IT & Telecom' },
  { value: 1, label: 'Management & Strategi', labelEn: 'Management & Strategy' },
  { value: 2, label: 'Teknik & Konstruktion', labelEn: 'Engineering & Construction' },
  { value: 3, label: 'Ekonomi & Finans', labelEn: 'Finance & Economics' },
  { value: 4, label: 'Marknadsföring & PR', labelEn: 'Marketing & PR' },
  { value: 5, label: 'Design & Media', labelEn: 'Design & Media' },
  { value: 6, label: 'Juridik & Inköp', labelEn: 'Legal & Procurement' },
  { value: 7, label: 'Bygg & Anläggning', labelEn: 'Construction' },
  { value: 8, label: 'Övrigt', labelEn: 'Other' },
];

const locationTypes = [
  { value: 0, label: 'Remote' },
  { value: 1, label: 'On-site' },
  { value: 2, label: 'Hybrid' },
];

export default function PostGigPage() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sv = i18n.language === 'sv';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState(0);
  const [skills, setSkills] = useState('');
  const [locationType, setLocationType] = useState(2);
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [hourlyRate, setHourlyRate] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-4">
            {sv ? 'Logga in för att publicera uppdrag' : 'Log in to post gigs'}
          </h3>
          <Link to="/login" className="text-neutral-300 hover:text-white">
            {sv ? 'Logga in' : 'Log in'}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (publish: boolean) => {
    if (!title.trim() || !description.trim() || !company.trim()) {
      setError(sv ? 'Fyll i alla obligatoriska fält' : 'Fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const request: CreateGigRequest = {
        title,
        description,
        company,
        category,
        skills,
        locationType,
        city: city || undefined,
        startDate: startDate || undefined,
        durationMonths: durationMonths ? Number(durationMonths) : undefined,
        hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : undefined,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        publish,
      };

      const gig = await gigApi.createGig(request);
      navigate(`/gig/${gig.id}`);
    } catch (err) {
      console.error('Failed to create gig:', err);
      setError(sv ? 'Kunde inte skapa uppdraget' : 'Could not create gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800 border-b border-neutral-700">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link to="/gig" className="text-neutral-400 hover:text-white transition-colors">
            ← {sv ? 'Tillbaka till uppdrag' : 'Back to gigs'}
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {sv ? 'Publicera nytt uppdrag' : 'Post a new gig'}
          </h1>
          <p className="text-neutral-400 mb-8">
            {sv ? 'Nå kvalificerade konsulter inom några minuter' : 'Reach qualified consultants in minutes'}
          </p>

          {error && (
            <div className="bg-neutral-700 border border-neutral-600 text-neutral-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
                {sv ? 'Grundläggande info' : 'Basic info'}
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Titel *' : 'Title *'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={sv ? 't.ex. Senior .NET-utvecklare' : 'e.g. Senior .NET Developer'}
                  className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Företag *' : 'Company *'}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={sv ? 'Ditt företagsnamn' : 'Your company name'}
                  className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Beskrivning *' : 'Description *'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder={sv ? 'Beskriv uppdraget, vad som ska göras, krav på konsulten...' : 'Describe the gig, what needs to be done, requirements...'}
                  className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Kategori' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 border border-neutral-600"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {sv ? cat.label : cat.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Kompetenser' : 'Skills'}
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder={sv ? 't.ex. React, TypeScript, Node.js' : 'e.g. React, TypeScript, Node.js'}
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                  <p className="text-xs text-neutral-500 mt-1">{sv ? 'Separera med komma' : 'Separate with comma'}</p>
                </div>
              </div>
            </div>

            {/* Location & Duration */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
                {sv ? 'Plats & Tidsram' : 'Location & Timeline'}
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Arbetsplats' : 'Work location'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {locationTypes.map(loc => (
                    <button
                      key={loc.value}
                      type="button"
                      onClick={() => setLocationType(loc.value)}
                      className={`px-4 py-3 rounded-lg text-center transition-colors border ${
                        locationType === loc.value
                          ? 'bg-white text-neutral-900 border-white'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border-neutral-600'
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {locationType !== 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Stad' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={sv ? 't.ex. Stockholm' : 'e.g. Stockholm'}
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Startdatum' : 'Start date'}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 border border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Längd (månader)' : 'Duration (months)'}
                  </label>
                  <input
                    type="number"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    placeholder="12"
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Timmar/vecka' : 'Hours/week'}
                  </label>
                  <input
                    type="number"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    placeholder="40"
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>
              </div>
            </div>

            {/* Rate & Contact */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
                {sv ? 'Arvode & Kontakt' : 'Rate & Contact'}
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Timpris (SEK)' : 'Hourly rate (SEK)'}
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder={sv ? 't.ex. 900' : 'e.g. 900'}
                  className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Kontakt e-post' : 'Contact email'}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Kontakt telefon' : 'Contact phone'}
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+46 70 123 45 67"
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-neutral-700">
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-neutral-700 text-white rounded-lg font-semibold hover:bg-neutral-600 transition-colors disabled:opacity-50 border border-neutral-600"
              >
                {sv ? 'Spara som utkast' : 'Save as draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-white text-neutral-900 rounded-lg font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-50"
              >
                {loading ? (sv ? 'Publicerar...' : 'Publishing...') : (sv ? 'Publicera nu' : 'Publish now')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
