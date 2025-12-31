import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gigApi } from '../../services/api';
import type { GigDto } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export default function GigDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sv = i18n.language === 'sv';
  
  const [gig, setGig] = useState<GigDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState<string>('');

  useEffect(() => {
    loadGig();
  }, [id]);

  const loadGig = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await gigApi.getGig(Number(id));
      setGig(data);
    } catch (error) {
      console.error('Failed to load gig:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!id || !coverLetter.trim()) return;
    setApplying(true);
    try {
      await gigApi.applyToGig(Number(id), {
        coverLetter,
        proposedRate: proposedRate ? Number(proposedRate) : undefined,
      });
      setShowApplyModal(false);
      alert(sv ? 'Ansökan skickad!' : 'Application sent!');
      loadGig();
    } catch (error) {
      console.error('Failed to apply:', error);
      alert(sv ? 'Kunde inte skicka ansökan' : 'Could not send application');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return sv ? 'Direkt' : 'ASAP';
    return new Date(dateStr).toLocaleDateString(sv ? 'sv-SE' : 'en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-500"></div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            {sv ? 'Uppdraget hittades inte' : 'Gig not found'}
          </h3>
          <Link to="/gig" className="text-neutral-300 hover:text-white">
            {sv ? 'Tillbaka till uppdrag' : 'Back to gigs'}
          </Link>
        </div>
      </div>
    );
  }

  const skills = gig.skills || [];

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800 border-b border-neutral-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/gig" className="text-neutral-400 hover:text-white transition-colors">
            ← {sv ? 'Tillbaka till uppdrag' : 'Back to gigs'}
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
          {/* Title Section */}
          <div className="p-8 border-b border-neutral-700">
            <h1 className="text-3xl font-bold text-white mb-2">{gig.title}</h1>
            <p className="text-lg text-neutral-400">{gig.company}</p>

            {/* Meta Tags */}
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="px-3 py-1.5 bg-neutral-700 text-neutral-300 rounded text-sm">
                {gig.categoryName}
              </span>
              <span className="px-3 py-1.5 bg-neutral-700 text-neutral-300 rounded text-sm">
                {gig.locationTypeName} {gig.city && `· ${gig.city}`}
              </span>
              {gig.startDate && (
                <span className="px-3 py-1.5 bg-neutral-700 text-neutral-300 rounded text-sm">
                  {sv ? 'Start:' : 'Start:'} {formatDate(gig.startDate)}
                </span>
              )}
              {gig.durationMonths && (
                <span className="px-3 py-1.5 bg-neutral-700 text-neutral-300 rounded text-sm">
                  {gig.durationMonths} {sv ? 'månader' : 'months'}
                </span>
              )}
              {gig.hoursPerWeek && (
                <span className="px-3 py-1.5 bg-neutral-700 text-neutral-300 rounded text-sm">
                  {gig.hoursPerWeek} {sv ? 'tim/vecka' : 'h/week'}
                </span>
              )}
            </div>

            {/* Rate & Stats */}
            <div className="flex flex-wrap items-center gap-8 mt-6 pt-6 border-t border-neutral-700">
              {gig.hourlyRate && (
                <div>
                  <p className="text-sm text-neutral-400">{sv ? 'Timpris' : 'Hourly rate'}</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(gig.hourlyRate)}/h</p>
                </div>
              )}
              {gig.monthlyRate && (
                <div>
                  <p className="text-sm text-neutral-400">{sv ? 'Månadspris' : 'Monthly rate'}</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(gig.monthlyRate)}/mån</p>
                </div>
              )}
              <div>
                <p className="text-sm text-neutral-400">{sv ? 'Visningar' : 'Views'}</p>
                <p className="text-xl font-semibold text-white">{gig.viewCount}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">{sv ? 'Ansökningar' : 'Applications'}</p>
                <p className="text-xl font-semibold text-white">{gig.applicationCount}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-8 border-b border-neutral-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              {sv ? 'Om uppdraget' : 'About this gig'}
            </h2>
            <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed">{gig.description}</p>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="p-8 border-b border-neutral-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                {sv ? 'Kompetenser' : 'Skills'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-neutral-700 text-neutral-300 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          {(gig.contactEmail || gig.contactPhone) && (
            <div className="p-8 border-b border-neutral-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                {sv ? 'Kontakt' : 'Contact'}
              </h2>
              <div className="flex flex-wrap gap-4">
                {gig.contactEmail && (
                  <a href={`mailto:${gig.contactEmail}`} className="px-4 py-2 bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition-colors">
                    {gig.contactEmail}
                  </a>
                )}
                {gig.contactPhone && (
                  <a href={`tel:${gig.contactPhone}`} className="px-4 py-2 bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition-colors">
                    {gig.contactPhone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Apply Section */}
          <div className="p-8 bg-neutral-800">
            {gig.isOwner ? (
              <div className="text-center">
                <p className="text-neutral-400 mb-4">{sv ? 'Detta är ditt uppdrag' : 'This is your gig'}</p>
                <Link
                  to={`/gig/edit/${gig.id}`}
                  className="inline-block px-6 py-3 bg-white text-neutral-900 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
                >
                  {sv ? 'Redigera uppdrag' : 'Edit gig'}
                </Link>
              </div>
            ) : user ? (
              <div className="text-center">
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="px-8 py-4 bg-white text-neutral-900 rounded-lg font-semibold text-lg hover:bg-neutral-100 transition-colors"
                >
                  {sv ? 'Ansök nu' : 'Apply now'}
                </button>
                <p className="text-neutral-400 mt-2 text-sm">
                  {sv ? 'Visa intresse direkt till uppdragsgivaren' : 'Show interest directly to the client'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-neutral-400 mb-4">{sv ? 'Logga in för att ansöka' : 'Log in to apply'}</p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 bg-white text-neutral-900 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
                >
                  {sv ? 'Logga in' : 'Log in'}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Posted by */}
        <div className="mt-4 text-center text-neutral-500 text-sm">
          {sv ? 'Publicerat av' : 'Posted by'} {gig.posterName} · {formatDate(gig.createdAt)}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg max-w-lg w-full p-6 border border-neutral-700">
            <h2 className="text-2xl font-bold text-white mb-4">
              {sv ? 'Ansök till uppdraget' : 'Apply to gig'}
            </h2>
            <p className="text-neutral-400 mb-6">{gig.title}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Personligt brev / Presentation *' : 'Cover letter / Introduction *'}
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  placeholder={sv ? 'Beskriv varför du är rätt för detta uppdrag...' : 'Describe why you are right for this gig...'}
                  className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {sv ? 'Föreslagen timtaxa (valfritt)' : 'Proposed hourly rate (optional)'}
                </label>
                <input
                  type="number"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 placeholder-neutral-400 border border-neutral-600"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 px-4 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors border border-neutral-600"
              >
                {sv ? 'Avbryt' : 'Cancel'}
              </button>
              <button
                onClick={handleApply}
                disabled={applying || !coverLetter.trim()}
                className="flex-1 px-4 py-3 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
              >
                {applying ? (sv ? 'Skickar...' : 'Sending...') : (sv ? 'Skicka ansökan' : 'Send application')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
