import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, backendUrl, theme, setTheme }) {
  return (
    <div className="sidebar">
      {/* Brand Logo - Compatible with EduOrbit Orbit Visual Family */}
      <div className="sidebar-logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          {/* Outer Orbit dotted ring */}
          <circle cx="12" cy="12" r="9" stroke="var(--accent-blue)" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Inner soft violet ring */}
          <circle cx="12" cy="12" r="6" stroke="var(--accent-violet)" strokeWidth="1" opacity="0.4" />
          {/* Play button triangle inside */}
          <polygon points="10 9 16 12 10 15" fill="var(--accent-blue)" />
          {/* Accent yellow satellite dot */}
          <circle cx="21" cy="7" r="2" fill="var(--accent-yellow)" />
        </svg>
        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'var(--font-sans)' }}>
          AI <span style={{ color: 'var(--accent-blue)' }}>VoiceOrbit</span>
        </span>
      </div>
      
      {/* Navigation Tabs - Studio, Library, Settings */}
      <nav className="sidebar-nav">
        <button 
          className={`sidebar-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Studio
        </button>
        
        <button 
          className={`sidebar-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Library
        </button>
        
        <button 
          className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      {/* Right Side Status Panel with Dark Mode Toggle */}
      <div className="sidebar-footer" style={{ margin: 0, border: 'none', paddingTop: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        {/* Sun/Moon Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.45rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-fast)'
          }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        <div className="sidebar-footer-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.74rem', 
              color: 'var(--text-secondary)', 
              background: 'var(--bg-base)', 
              padding: '0.35rem 0.75rem', 
              borderRadius: '9999px',
              border: '1px solid var(--border-color)',
              fontWeight: '600'
            }}
          >
            <div className="status-indicator" />
            <span>Backend: Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
