import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gigApi } from '../../services/api';
import type { GigDto } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export default function MyGigsPage() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const sv = i18n.language === 'sv';
  
  const [gigs, setGigs] = useState<GigDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  useEffect(() => {
    loadGigs();
  }, []);

  const loadGigs = async () => {
    setLoading(true);
    try {
      const data = await gigApi.getMyGigs();
      setGigs(data);
    } catch (error) {
      console.error('Failed to load gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await gigApi.publishGig(id);
      loadGigs();
    } catch (error) {
      console.error('Failed to publish gig:', error);
    }
    setActiveMenu(null);
  };

  const handleClose = async (id: number) => {
    try {
      await gigApi.closeGig(id);
      loadGigs();
    } catch (error) {
      console.error('Failed to close gig:', error);
    }
    setActiveMenu(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(sv ? 'Är du säker på att du vill ta bort detta uppdrag?' : 'Are you sure you want to delete this gig?')) {
      return;
    }
    try {
      await gigApi.deleteGig(id);
      loadGigs();
    } catch (error) {
      console.error('Failed to delete gig:', error);
    }
    setActiveMenu(null);
  };

  const getStatusBadge = (status: number, statusName: string) => {
    const styles: Record<number, string> = {
      0: 'bg-neutral-600 text-neutral-200', // Draft
      1: 'bg-white text-neutral-900', // Published
      2: 'bg-neutral-700 text-neutral-400', // Closed
      3: 'bg-neutral-600 text-neutral-300', // Filled
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-neutral-700 text-neutral-300'}`}>
        {statusName}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-4">
            {sv ? 'Logga in för att se dina uppdrag' : 'Log in to see your gigs'}
          </h3>
          <Link to="/login" className="text-neutral-300 hover:text-white">
            {sv ? 'Logga in' : 'Log in'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800 border-b border-neutral-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link to="/gig" className="text-neutral-400 hover:text-white transition-colors">
            ← {sv ? 'Tillbaka till uppdrag' : 'Back to gigs'}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title & Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {sv ? 'Mina uppdrag' : 'My gigs'}
            </h1>
            <p className="text-neutral-400 mt-1">
              {sv ? 'Hantera dina publicerade uppdrag' : 'Manage your posted gigs'}
            </p>
          </div>
          <Link
            to="/gig/post"
            className="px-4 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors font-medium"
          >
            + {sv ? 'Nytt uppdrag' : 'New gig'}
          </Link>
        </div>

        {/* Gigs List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-500"></div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
            <h3 className="text-xl font-semibold text-white mb-2">
              {sv ? 'Inga uppdrag ännu' : 'No gigs yet'}
            </h3>
            <p className="text-neutral-400 mb-6">
              {sv ? 'Skapa ditt första uppdrag för att nå konsulter' : 'Create your first gig to reach consultants'}
            </p>
            <Link
              to="/gig/post"
              className="inline-block px-6 py-3 bg-white text-neutral-900 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
            >
              + {sv ? 'Skapa uppdrag' : 'Create gig'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {gigs.map(gig => (
              <div
                key={gig.id}
                className="bg-neutral-800 rounded-lg border border-neutral-700 p-6 hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/gig/${gig.id}`}
                        className="text-xl font-semibold text-white hover:text-neutral-200 transition-colors"
                      >
                        {gig.title}
                      </Link>
                      {getStatusBadge(gig.status, gig.statusName)}
                    </div>
                    <p className="text-neutral-400 mb-4">{gig.company}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                      <span>{gig.viewCount} {sv ? 'visningar' : 'views'}</span>
                      <span>{gig.applicationCount} {sv ? 'ansökningar' : 'applications'}</span>
                      {gig.hourlyRate && (
                        <span className="text-white">{formatCurrency(gig.hourlyRate)}/h</span>
                      )}
                      <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === gig.id ? null : gig.id)}
                      className="px-3 py-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
                    >
                      •••
                    </button>
                    
                    {activeMenu === gig.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-700 rounded-lg shadow-xl border border-neutral-600 py-2 z-10">
                        <Link
                          to={`/gig/${gig.id}`}
                          className="block px-4 py-2 text-neutral-300 hover:bg-neutral-600 transition-colors"
                        >
                          {sv ? 'Visa' : 'View'}
                        </Link>
                        <Link
                          to={`/gig/${gig.id}/applications`}
                          className="block px-4 py-2 text-neutral-300 hover:bg-neutral-600 transition-colors"
                        >
                          {sv ? 'Ansökningar' : 'Applications'} ({gig.applicationCount})
                        </Link>
                        <hr className="my-2 border-neutral-600" />
                        {gig.status === 0 && (
                          <button
                            onClick={() => handlePublish(gig.id)}
                            className="block w-full text-left px-4 py-2 text-white hover:bg-neutral-600 transition-colors"
                          >
                            {sv ? 'Publicera' : 'Publish'}
                          </button>
                        )}
                        {gig.status === 1 && (
                          <button
                            onClick={() => handleClose(gig.id)}
                            className="block w-full text-left px-4 py-2 text-neutral-400 hover:bg-neutral-600 transition-colors"
                          >
                            {sv ? 'Stäng' : 'Close'}
                          </button>
                        )}
                        <hr className="my-2 border-neutral-600" />
                        <button
                          onClick={() => handleDelete(gig.id)}
                          className="block w-full text-left px-4 py-2 text-neutral-400 hover:bg-neutral-600 transition-colors"
                        >
                          {sv ? 'Ta bort' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
