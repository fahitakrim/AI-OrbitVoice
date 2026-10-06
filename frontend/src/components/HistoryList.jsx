import { useState, useEffect, useCallback } from 'react';
import { BrandingFooter } from './StoryEditor';
import { SkinGlyphBadge } from '../ui/theme';

export default function HistoryList({ 
  backendUrl, 
  onRestoreStory, 
  showToast,
  refreshTrigger,
  isCompact = false
}) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/api/history`);
      if (!response.ok) throw new Error('Failed to fetch library history');
      const data = await response.json();
      setHistoryItems(data.projects || []);
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, showToast]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const response = await fetch(`${backendUrl}/api/history`);
        if (!response.ok) throw new Error('Failed to fetch library history');
        const data = await response.json();
        if (!ignore) {
          setHistoryItems(data.projects || []);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          console.error(error);
          showToast(error.message, 'error');
          setLoading(false);
        }
      }
    }
    load();
    return () => { ignore = true; };
  }, [backendUrl, showToast, refreshTrigger]);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleRestore = (item) => {
    const formattedChapters = item.chapters.map((ch, idx) => ({
      chapterNumber: idx + 1,
      title: ch.title || `Chapter ${idx + 1}`,
      summary: 'Restored from library.',
      content: ch.content || '',
      status: ch.content ? 'written' : 'empty'
    }));

    onRestoreStory(item.title, formattedChapters);
    showToast(`Restored "${item.title}" to studio canvas!`, 'success');
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to permanently delete this narration? This deletes all files from local storage.')) {
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/history/${projectId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete recording');
      showToast('Recording deleted successfully.', 'success');
      fetchHistory();
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    }
  };

  const getVoiceEngineBadgeStyle = (prov) => {
    if (prov === 'edge' || prov === 'google') {
      return { 
        borderColor: 'rgba(255, 179, 0, 0.4)', 
        color: 'var(--skin-accent-secondary)', 
        background: 'rgba(255, 179, 0, 0.14)',
        fontFamily: 'var(--font-dot)',
        borderRadius: 'var(--radius-pill)',
        letterSpacing: '0.5px'
      };
    }
    return { 
      borderColor: 'rgba(229, 57, 53, 0.4)', 
      color: 'var(--skin-accent)', 
      background: 'rgba(229, 57, 53, 0.14)',
      fontFamily: 'var(--font-dot)',
      borderRadius: 'var(--radius-pill)',
      letterSpacing: '0.5px'
    };
  };

  if (!isCompact) {
    return (
      <div className="content-body" style={{ 
        animation: 'fadeIn 0.4s ease-out', 
        height: 'auto', 
        overflowY: 'auto', 
        padding: '1.5rem 1.5rem 120px 1.5rem' 
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Centered Page Header */}
          <div style={{ textAlign: 'center', padding: '1rem 0 1.75rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
              <h1 className="screen-dot" style={{ 
                fontSize: '2rem', 
                fontWeight: '900', 
                letterSpacing: '0.5px', 
                color: 'var(--skin-text-primary)',
                fontFamily: 'var(--font-dot)',
                margin: 0
              }}>
                AUDIO LIBRARY
              </h1>
              <SkinGlyphBadge label="MASTER ARCHIVE" />
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--skin-text-secondary)', fontWeight: '500', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
              Your compiled narration projects, audio files, and scripts are stored here.
            </p>
          </div>

          {/* Actions Bar */}
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', 
              marginBottom: '0.5rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: 'var(--skin-surface)',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-card)',
              border: 'var(--border-hairline) solid var(--skin-border)'
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--skin-text-secondary)', fontWeight: '600' }}>
              Total Recordings: <strong style={{ color: 'var(--skin-text-primary)' }}>{historyItems.length}</strong>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-pill)' }} 
              onClick={() => { setLoading(true); fetchHistory(); }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Sync Disk
            </button>
          </div>

          {/* History Queue Grid */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem', color: 'var(--skin-text-secondary)' }}>
              <div className="spinner" style={{ width: '28px', height: '28px', borderWidth: '2px', borderTopColor: 'var(--skin-accent)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: '600', fontFamily: 'var(--font-dot)' }}>SCANNING LOCAL COMPILATION CACHE...</span>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem', padding: '3rem', textAlign: 'center', background: 'var(--skin-surface)', borderRadius: 'var(--radius-card)', border: 'var(--border-hairline) solid var(--skin-border)' }}>
              <div style={{ fontSize: '2.5rem', opacity: 0.6 }}>📂</div>
              <div style={{ fontFamily: 'var(--font-dot)', fontSize: '1rem', fontWeight: '800', color: 'var(--skin-text-primary)' }}>
                LIBRARY IS VACANT
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--skin-text-secondary)', maxWidth: '340px', margin: '0 auto', lineHeight: '1.5' }}>
                Compile script files in the Studio to assemble your audio projects. They will appear here.
              </p>
            </div>
          ) : (
            <div className="history-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', width: '100%' }}>
              {historyItems.map((item) => (
                <div key={item.projectId} className="glass-panel text-left" style={{ padding: '1.25rem', background: 'var(--skin-surface)', border: 'var(--border-hairline) solid var(--skin-border)', borderRadius: 'var(--radius-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--skin-text-primary)' }}>{item.title}</span>
                        <span className="badge-pill" style={getVoiceEngineBadgeStyle(item.provider)}>
                          {item.provider.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--skin-text-secondary)', marginTop: '0.35rem', fontWeight: '600' }}>
                        <span>Compiled: {formatDate(item.createdAt)}</span>
                        <span>•</span>
                        <span>Chapters: {item.chapters.length}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.85rem', fontSize: '0.74rem', borderRadius: 'var(--radius-pill)' }}
                        onClick={() => handleRestore(item)}
                      >
                        Restore Studio
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.74rem', display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-pill)' }}
                        onClick={() => handleDelete(item.projectId)}
                        title="Delete recording permanently"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Branding footer */}
          <BrandingFooter />
        </div>
      </div>
    );
  }

  // Render when isCompact is true (embedded inside Editor canvas)
  return (
    <div style={{ padding: 0 }}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px', gap: '0.5rem', color: 'var(--skin-text-secondary)' }}>
          <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderTopColor: 'var(--skin-accent)' }} />
        </div>
      ) : historyItems.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', gap: '0.75rem', padding: '1rem', textAlign: 'center', border: 'var(--border-hairline) dashed var(--skin-border)', borderRadius: 'var(--radius-card)', background: 'var(--skin-surface)' }}>
          <div style={{ fontSize: '1.5rem', opacity: 0.6 }}>📂</div>
          <div style={{ fontFamily: 'var(--font-dot)', fontSize: '0.8rem', fontWeight: '800', color: 'var(--skin-text-primary)' }}>
            LIBRARY IS VACANT
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--skin-text-secondary)', maxWidth: '280px', margin: '0 auto', lineHeight: '1.4' }}>
            Compile script files to assemble your audio projects. They will appear here.
          </p>
        </div>
      ) : (
        <div className="history-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', width: '100%' }}>
          {historyItems.slice(0, 3).map((item) => (
            <div key={item.projectId} className="glass-panel text-left" style={{ padding: '0.85rem 1rem', background: 'var(--skin-surface)', border: 'var(--border-hairline) solid var(--skin-border)', borderRadius: 'var(--radius-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--skin-text-primary)' }}>{item.title}</span>
                    <span className="badge-pill" style={{ ...getVoiceEngineBadgeStyle(item.provider), fontSize: '0.56rem', padding: '0.1rem 0.35rem' }}>
                      {item.provider.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.68rem', borderRadius: 'var(--radius-pill)' }}
                  onClick={() => handleRestore(item)}
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
