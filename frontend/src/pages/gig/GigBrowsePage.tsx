import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gigApi } from '../../services/api';
import type { GigListDto, GigSearchParams } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const categories = [
  { value: 0, label: 'IT & Telekom' },
  { value: 1, label: 'Management & Strategi' },
  { value: 2, label: 'Teknik & Konstruktion' },
  { value: 3, label: 'Ekonomi & Finans' },
  { value: 4, label: 'Marknadsföring & PR' },
  { value: 5, label: 'Design & Media' },
  { value: 6, label: 'Juridik & Inköp' },
  { value: 7, label: 'Bygg & Anläggning' },
  { value: 8, label: 'Övrigt' },
];

const locationTypes = [
  { value: 0, label: 'Remote' },
  { value: 1, label: 'On-site' },
  { value: 2, label: 'Hybrid' },
];

export default function GigBrowsePage() {
  const { i18n } = useTranslation();
  const sv = i18n.language === 'sv';
  
  const [gigs, setGigs] = useState<GigListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadGigs();
  }, [page, selectedCategory, selectedLocation]);

  const loadGigs = async () => {
    setLoading(true);
    try {
      const params: GigSearchParams = {
        query: query || undefined,
        category: selectedCategory,
        locationType: selectedLocation,
        page,
        pageSize: 12,
      };
      const result = await gigApi.searchGigs(params);
      setGigs(result.gigs);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadGigs();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return sv ? 'Direkt' : 'ASAP';
    return new Date(dateStr).toLocaleDateString(sv ? 'sv-SE' : 'en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return sv ? 'Idag' : 'Today';
    if (diffDays === 1) return sv ? 'Igår' : 'Yesterday';
    if (diffDays < 7) return `${diffDays} ${sv ? 'dagar sedan' : 'days ago'}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${sv ? 'veckor sedan' : 'weeks ago'}`;
    return `${Math.floor(diffDays / 30)} ${sv ? 'månader sedan' : 'months ago'}`;
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <div className="bg-neutral-800 py-16 px-4 border-b border-neutral-700">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            MyGig
          </h1>
          <p className="text-xl text-neutral-300 mb-8">
            {sv ? 'Hitta ditt nästa uppdrag – enkelt och snabbt' : 'Find your next gig – simple and fast'}
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={sv ? 'Sök uppdrag, kompetenser, företag...' : 'Search gigs, skills, companies...'}
                className="flex-1 px-4 py-4 rounded-lg bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 text-lg"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-neutral-900 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                {sv ? 'Sök' : 'Search'}
              </button>
            </div>
          </form>
          
          {/* Active gigs count */}
          {totalCount > 0 && (
            <div className="mt-8 text-neutral-400">
              <span className="text-white font-semibold">{totalCount}</span> {sv ? 'aktiva uppdrag' : 'active gigs'}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 border border-neutral-700"
          >
            {sv ? 'Filter' : 'Filters'}
          </button>
          
          {/* Category Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedCategory(undefined); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategory === undefined
                  ? 'bg-white text-neutral-900'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {sv ? 'Alla' : 'All'}
            </button>
            {categories.slice(0, 5).map(cat => (
              <button
                key={cat.value}
                onClick={() => { setSelectedCategory(cat.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-white text-neutral-900'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="bg-neutral-800 rounded-lg p-6 mb-8 border border-neutral-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Kategori' : 'Category'}
                </label>
                <select
                  value={selectedCategory ?? ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 border border-neutral-600"
                >
                  <option value="">{sv ? 'Alla kategorier' : 'All categories'}</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Plats' : 'Location'}
                </label>
                <select
                  value={selectedLocation ?? ''}
                  onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 border border-neutral-600"
                >
                  <option value="">{sv ? 'Alla platser' : 'All locations'}</option>
                  {locationTypes.map(loc => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => { setSelectedCategory(undefined); setSelectedLocation(undefined); setQuery(''); }}
                  className="w-full px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 border border-neutral-500"
                >
                  {sv ? 'Rensa filter' : 'Clear filters'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-500"></div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">
              {sv ? 'Inga uppdrag hittades' : 'No gigs found'}
            </h3>
            <p className="text-neutral-400">
              {sv ? 'Prova att ändra dina sökkriterier' : 'Try adjusting your search criteria'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map(gig => (
                <Link
                  key={gig.id}
                  to={`/gig/${gig.id}`}
                  className="group bg-neutral-800 rounded-lg p-6 hover:bg-neutral-750 transition-all border border-neutral-700 hover:border-neutral-600"
                >
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-white text-lg group-hover:text-neutral-200 transition-colors line-clamp-2">
                      {gig.title}
                    </h3>
                    <p className="text-neutral-400 mt-1">
                      {gig.company}
                    </p>
                  </div>
                  
                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-xs">
                      {gig.categoryName}
                    </span>
                    <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-xs">
                      {gig.locationTypeName}
                    </span>
                    {gig.city && (
                      <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-xs">
                        {gig.city}
                      </span>
                    )}
                  </div>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {gig.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-neutral-700/50 text-neutral-400 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {gig.skills.length > 3 && (
                      <span className="text-neutral-500 text-xs">+{gig.skills.length - 3}</span>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                      {gig.startDate && (
                        <span>{formatDate(gig.startDate)}</span>
                      )}
                      {gig.durationMonths && (
                        <span>{gig.durationMonths} {sv ? 'mån' : 'mo'}</span>
                      )}
                    </div>
                    {gig.hourlyRate && (
                      <span className="text-white font-semibold">
                        {formatCurrency(gig.hourlyRate)}/h
                      </span>
                    )}
                  </div>
                  
                  {/* Time ago & Applications */}
                  <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
                    <span>{getTimeAgo(gig.createdAt)}</span>
                    <span>{gig.applicationCount} {sv ? 'ansökningar' : 'applications'}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-neutral-800 text-white rounded-lg disabled:opacity-50 hover:bg-neutral-700 border border-neutral-700"
                >
                  {sv ? 'Föregående' : 'Previous'}
                </button>
                <span className="px-4 py-2 text-neutral-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-neutral-800 text-white rounded-lg disabled:opacity-50 hover:bg-neutral-700 border border-neutral-700"
                >
                  {sv ? 'Nästa' : 'Next'}
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-12 bg-neutral-800 rounded-lg p-8 text-center border border-neutral-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            {sv ? 'Har du ett uppdrag att publicera?' : 'Have a gig to post?'}
          </h2>
          <p className="text-neutral-300 mb-6">
            {sv ? 'Nå hundratals kvalificerade konsulter på några minuter' : 'Reach hundreds of qualified consultants in minutes'}
          </p>
          <Link
            to="/gig/post"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
          >
            {sv ? 'Publicera uppdrag' : 'Post a gig'}
          </Link>
        </div>
      </div>
    </div>
  );
}
