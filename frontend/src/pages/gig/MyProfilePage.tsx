import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gigApi } from '../../services/api';
import type { ConsultantProfileDto, CreateProfileRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const locationTypes = [
  { value: 0, label: 'Remote' },
  { value: 1, label: 'On-site' },
  { value: 2, label: 'Hybrid' },
];

export default function MyProfilePage() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const sv = i18n.language === 'sv';
  
  const [profile, setProfile] = useState<ConsultantProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form state
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [city, setCity] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [availableFrom, setAvailableFrom] = useState('');
  const [preferredLocationType, setPreferredLocationType] = useState(0);
  const [hourlyRate, setHourlyRate] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await gigApi.getMyProfile();
      setProfile(data);
      populateForm(data);
    } catch (error) {
      // Profile doesn't exist yet, that's OK
      if (user) {
        setEmail(user.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: ConsultantProfileDto) => {
    setHeadline(data.headline);
    setSummary(data.summary);
    setSkills(data.skills.join(', '));
    setYearsOfExperience(data.yearsOfExperience);
    setCurrentTitle(data.currentTitle || '');
    setCurrentCompany(data.currentCompany || '');
    setCity(data.city || '');
    setIsAvailable(data.isAvailable);
    setAvailableFrom(data.availableFrom?.split('T')[0] || '');
    setPreferredLocationType(data.preferredLocationType);
    setHourlyRate(data.hourlyRate?.toString() || '');
    setLinkedInUrl(data.linkedInUrl || '');
    setEmail(data.email || '');
    setPhone(data.phone || '');
    setWebsite(data.website || '');
  };

  const handleSave = async () => {
    if (!headline.trim()) {
      setMessage(sv ? 'Fyll i en rubrik' : 'Fill in a headline');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const request: CreateProfileRequest = {
        headline,
        summary,
        skills,
        yearsOfExperience,
        currentTitle: currentTitle || undefined,
        currentCompany: currentCompany || undefined,
        city: city || undefined,
        isAvailable,
        availableFrom: availableFrom || undefined,
        preferredLocationType,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        linkedInUrl: linkedInUrl || undefined,
        email: email || undefined,
        phone: phone || undefined,
        website: website || undefined,
      };

      const data = await gigApi.createOrUpdateProfile(request);
      setProfile(data);
      setMessage(sv ? 'Profil sparad!' : 'Profile saved!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      setMessage(sv ? 'Kunde inte spara profilen' : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-4">
            {sv ? 'Logga in för att skapa profil' : 'Log in to create profile'}
          </h3>
          <Link to="/login" className="text-neutral-300 hover:text-white">
            {sv ? 'Logga in' : 'Log in'}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-500"></div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {sv ? 'Min konsultprofil' : 'My consultant profile'}
              </h1>
              <p className="text-neutral-400 mt-1">
                {sv ? 'Visa upp din kompetens för uppdragsgivare' : 'Showcase your skills to clients'}
              </p>
            </div>
          </div>

          {message && (
            <div className={`px-4 py-3 rounded-lg mb-6 border ${
              message.includes('sparad') || message.includes('saved')
                ? 'bg-neutral-700 border-neutral-600 text-white'
                : 'bg-neutral-700 border-neutral-600 text-neutral-300'
            }`}>
              {message}
            </div>
          )}

          <form className="space-y-6">
            {/* Main Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
                {sv ? 'Presentation' : 'Introduction'}
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Rubrik / Titel *' : 'Headline / Title *'}
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={sv ? 't.ex. Senior Fullstack-utvecklare | React & .NET' : 'e.g. Senior Fullstack Developer | React & .NET'}
                  className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Om dig' : 'About you'}
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={5}
                  placeholder={sv ? 'Beskriv din erfarenhet, vad du är bra på, vad du söker...' : 'Describe your experience, what you are good at, what you are looking for...'}
                  className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Kompetenser' : 'Skills'}
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder={sv ? 't.ex. React, TypeScript, .NET, Azure, SQL' : 'e.g. React, TypeScript, .NET, Azure, SQL'}
                  className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                />
                <p className="text-xs text-neutral-500 mt-1">{sv ? 'Separera med komma' : 'Separate with comma'}</p>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
                {sv ? 'Erfarenhet' : 'Experience'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'År i branschen' : 'Years of experience'}
                  </label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 border border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Nuvarande titel' : 'Current title'}
                  </label>
                  <input
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder={sv ? 't.ex. Tech Lead' : 'e.g. Tech Lead'}
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Nuvarande företag' : 'Current company'}
                  </label>
                  <input
                    type="text"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder={sv ? 't.ex. Eget bolag AB' : 'e.g. My Company AB'}
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
                {sv ? 'Tillgänglighet' : 'Availability'}
              </h2>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-5 h-5 rounded bg-neutral-700 border-neutral-600 text-neutral-600 focus:ring-neutral-500"
                  />
                  <span className="text-white">{sv ? 'Jag är tillgänglig för nya uppdrag' : 'I am available for new gigs'}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Tillgänglig från' : 'Available from'}
                  </label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 border border-neutral-600"
                  />
                </div>

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
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Föredragen arbetsplats' : 'Preferred work location'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {locationTypes.map(loc => (
                    <button
                      key={loc.value}
                      type="button"
                      onClick={() => setPreferredLocationType(loc.value)}
                      className={`px-4 py-3 rounded-lg text-center transition-colors border ${
                        preferredLocationType === loc.value
                          ? 'bg-white text-neutral-900 border-white'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border-neutral-600'
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Önskad timtaxa (SEK)' : 'Desired hourly rate (SEK)'}
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="900"
                  className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
                {sv ? 'Kontaktuppgifter' : 'Contact information'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'E-post' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Telefon' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+46 70 123 45 67"
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    {sv ? 'Webbplats' : 'Website'}
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-neutral-700">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-4 bg-white text-neutral-900 rounded-lg font-semibold text-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
              >
                {saving ? (sv ? 'Sparar...' : 'Saving...') : (sv ? 'Spara profil' : 'Save profile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
