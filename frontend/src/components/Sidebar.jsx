import React from 'react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  backendUrl, 
  theme, 
  setTheme,
  studioLanguage,
  setStudioLanguage,
  isOpen = false,
  setIsOpen
}) {
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  const handleLanguageClick = (lang) => {
    setStudioLanguage(lang);
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      
      {/* Upper Navigation and Logo Wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Brand Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '1.25rem 1.25rem 0.5rem 1.25rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="9" stroke="var(--accent-blue)" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="12" cy="12" r="5" stroke="var(--accent-violet)" strokeWidth="1.5" />
              <polygon points="10 9 15 12 10 15" fill="var(--accent-blue)" />
            </svg>
            <span style={{ 
              fontSize: '1.15rem', 
              fontWeight: '900', 
              color: 'var(--text-primary)', 
              letterSpacing: '-0.04em', 
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase'
            }}>
              Voice<span style={{ color: 'var(--accent-blue)' }}>Orbit</span>
            </span>
          </div>
          
          {/* Collapse sidebar visual toggle */}
          <button 
            className="sidebar-close-btn"
            onClick={() => setIsOpen && setIsOpen(false)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem'
            }}
            title="Collapse Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
          
          <button 
            className={`sidebar-nav-item ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => handleNavClick('editor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'editor' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: activeTab === 'editor' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              borderLeft: activeTab === 'editor' ? '3px solid var(--accent-blue)' : '3px solid transparent'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            AI Voices
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleNavClick('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'history' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: activeTab === 'history' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              borderLeft: activeTab === 'history' ? '3px solid var(--accent-blue)' : '3px solid transparent'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            My Audio
          </button>
        </nav>

        {/* Sidebar Language switcher inside navigation */}
        {activeTab === 'editor' && (
          <div style={{ 
            margin: '0.5rem 0.75rem', 
            padding: '0.85rem', 
            background: 'var(--bg-base)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '10px' 
          }}>
            <div style={{ 
              fontSize: '0.68rem', 
              fontWeight: '800', 
              color: 'var(--text-muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              marginBottom: '0.5rem'
            }}>
              Studio Language
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button 
                onClick={() => handleLanguageClick('en')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  width: '100%',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: studioLanguage === 'en' ? 'var(--accent-blue-dim)' : 'transparent',
                  color: studioLanguage === 'en' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                English Studio
              </button>

              <button 
                onClick={() => handleLanguageClick('bn')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  width: '100%',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: studioLanguage === 'bn' ? 'var(--accent-blue-dim)' : 'transparent',
                  color: studioLanguage === 'bn' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                Bangla Studio
              </button>

              <button 
                onClick={() => handleLanguageClick('hi')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  width: '100%',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: studioLanguage === 'hi' ? 'var(--accent-blue-dim)' : 'transparent',
                  color: studioLanguage === 'hi' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                Hindi Studio
              </button>

              <button 
                onClick={() => handleLanguageClick('ur')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  width: '100%',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: studioLanguage === 'ur' ? 'var(--accent-blue-dim)' : 'transparent',
                  color: studioLanguage === 'ur' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                Urdu Studio
              </button>

              <button 
                onClick={() => handleLanguageClick('ar')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  width: '100%',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: studioLanguage === 'ar' ? 'var(--accent-blue-dim)' : 'transparent',
                  color: studioLanguage === 'ar' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                Arabic Studio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile and Settings Wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Status indicator and Theme Switcher Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0.5rem 1rem', 
          borderTop: '1px solid var(--border-color)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: '700' }}>SYS ONLINE</span>
          </div>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        </div>

        {/* Minimal Creator Card pointing to Facebook */}
        <a 
          href="https://www.facebook.com/share/1F5WW35d7p/" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.85rem 1rem', 
            borderTop: '1px solid var(--border-color)', 
            width: '100%', 
            textDecoration: 'none', 
            color: 'inherit',
            transition: 'background 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-base)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#ffffff', 
            fontSize: '0.8rem', 
            fontWeight: '900',
            boxShadow: '0 0 8px rgba(37, 99, 235, 0.15)',
            flexShrink: 0
          }}>
            FT
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              fontSize: '0.84rem', 
              fontWeight: '800', 
              color: 'var(--text-primary)', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              Fahim Takrim
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>

    </div>
  );
}
