import React, { useState, useEffect } from 'react';
import { BrandingFooter } from './StoryEditor';

export default function HistoryList({ 
  backendUrl, 
  onRestoreStory, 
  showToast,
  refreshTrigger
}) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/history`);
      if (!response.ok) throw new Error('Failed to fetch library history');
      const data = await response.json();
      setHistoryItems(data.projects);
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

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
        borderColor: 'rgba(37, 99, 235, 0.15)', 
        color: 'var(--accent-blue)', 
        background: 'var(--accent-blue-dim)' 
      };
    }
    return { 
      borderColor: 'var(--border-color)', 
      color: 'var(--text-secondary)', 
      background: '#f1f5f9' 
    };
  };

  return (
    <div className="content-body" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)', overflowY: 'auto', padding: '1.5rem 2.5rem' }}>
      
      {/* Control Actions Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          marginBottom: '1.25rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'var(--bg-surface)',
          padding: '1rem 1.5rem',
          borderRadius: '16px'
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
          Total Recordings: <strong style={{ color: 'var(--text-primary)' }}>{historyItems.length}</strong>
        </div>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '9999px' }} 
          onClick={fetchHistory}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Sync Disk
        </button>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ width: '28px', height: '28px', borderWidth: '2px', borderTopColor: 'var(--accent-blue)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>SCANNING LOCAL COMPILATION CACHE...</span>
        </div>
      ) : historyItems.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-secondary)', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '16px', background: 'var(--bg-surface)', boxShadow: 'var(--card-shadow)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.85rem', color: 'var(--text-muted)' }}>
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          </svg>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>LIBRARY IS VACANT</div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '340px' }}>
            Compile script files to assemble your audio projects. They will appear here.
          </p>
        </div>
      ) : (
        <div className="history-list" style={{ padding: 0 }}>
          {historyItems.map((item, idx) => (
            <div key={item.projectId || idx} className="history-item">
              <div className="history-item-header">
                <div>
                  <div className="history-item-title" style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.title}</div>
                  <div className="history-item-date" style={{ fontSize: '0.72rem' }}>{formatDate(item.createdAt)}</div>
                </div>
                
                <span className="badge-pill badge-pill-green" style={{ fontSize: '0.62rem', fontWeight: 'bold', padding: '0.15rem 0.5rem' }}>
                  ✓ READY
                </span>
              </div>

              <div className="history-item-meta" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className="meta-badge" style={getVoiceEngineBadgeStyle(item.provider)}>{item.provider}</span>
                <span className="meta-badge" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{item.voice}</span>
                <span className="meta-badge" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                  {item.chapters?.reduce((acc, ch) => acc + (ch.content?.trim().split(/\s+/).filter(Boolean).length || 0), 0)} words
                </span>
              </div>

              <div className="history-item-actions">
                <div className="history-audio-preview">
                  <audio 
                    className="history-audio-control"
                    src={`${backendUrl}${item.audioUrl}`} 
                    controls 
                    preload="none"
                  />
                </div>

                <div className="history-buttons" style={{ marginTop: '0.35rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '0.3.5rem', borderRadius: '9999px' }}
                    onClick={() => handleRestore(item)}
                    title="Restore text to studio canvas"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M16 3h5v5" />
                    </svg>
                    Load Text
                  </button>
                  
                  <a 
                    href={`${backendUrl}${item.audioUrl}`} 
                    download={`${item.title.replace(/\s+/g, '_')}_master.mp3`}
                    className="btn btn-primary"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '0.3.5rem', borderRadius: '9999px' }}
                    title="Export MP3 File"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#fff' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Export MP3
                  </a>

                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.74rem', display: 'flex', alignItems: 'center', borderRadius: '9999px' }}
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

      {/* Branding & Support Footer */}
      <BrandingFooter showToast={showToast} />
    </div>
  );
}
