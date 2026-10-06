import { useSkinTheme, SkinThemeMode } from '../ui/theme';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme,
  studioLanguage,
  setStudioLanguage,
  isOpen = false,
  setIsOpen
}) {
  const { themeMode } = useSkinTheme();

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

  const currentTheme = themeMode || theme || 'light';

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
              <circle cx="12" cy="12" r="9" stroke="var(--skin-accent-tertiary)" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="12" cy="12" r="5" stroke="var(--skin-accent-secondary)" strokeWidth="1.5" />
              <polygon points="10 9 15 12 10 15" fill="var(--skin-accent)" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontSize: '1.15rem', 
                fontWeight: '900', 
                color: 'var(--skin-text-primary)', 
                letterSpacing: '-0.04em', 
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase'
              }}>
                Voice<span style={{ color: 'var(--skin-accent)' }}>Orbit</span>
              </span>
              <span style={{ 
                fontFamily: 'var(--font-dot)', 
                fontSize: '0.58rem', 
                color: currentTheme === 'glyph' ? 'var(--skin-accent)' : currentTheme === 'dark' ? 'var(--skin-accent-secondary)' : 'var(--skin-text-secondary)', 
                letterSpacing: '1px',
                fontWeight: '700' 
              }}>
                {currentTheme === 'glyph' ? 'NOTHING GLYPH' : currentTheme === 'dark' ? 'AMOLED PITCH' : 'CLEAN MINIMAL'}
              </span>
            </div>
          </div>
          
          {/* Collapse sidebar visual toggle for mobile */}
          <button 
            className="sidebar-close-btn"
            onClick={() => setIsOpen && setIsOpen(false)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--skin-text-secondary)', 
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
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0 0.75rem' }}>
          
          <button 
            className={`sidebar-nav-item ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => handleNavClick('editor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.7rem 0.85rem',
              borderRadius: 'var(--radius-button)',
              border: activeTab === 'editor' ? '1px solid var(--skin-border)' : '1px solid transparent',
              background: activeTab === 'editor' ? 'var(--skin-surface-variant)' : 'transparent',
              color: activeTab === 'editor' ? 'var(--skin-text-primary)' : 'var(--skin-text-secondary)',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              borderLeft: activeTab === 'editor' ? '3px solid var(--skin-accent)' : '3px solid transparent'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: activeTab === 'editor' ? 'var(--skin-accent)' : 'currentColor' }}>
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
              padding: '0.7rem 0.85rem',
              borderRadius: 'var(--radius-button)',
              border: activeTab === 'history' ? '1px solid var(--skin-border)' : '1px solid transparent',
              background: activeTab === 'history' ? 'var(--skin-surface-variant)' : 'transparent',
              color: activeTab === 'history' ? 'var(--skin-text-primary)' : 'var(--skin-text-secondary)',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              borderLeft: activeTab === 'history' ? '3px solid var(--skin-accent)' : '3px solid transparent'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: activeTab === 'history' ? 'var(--skin-accent)' : 'currentColor' }}>
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            My Audio
          </button>
        </nav>

        {/* Sidebar Language switcher inside navigation */}
        {activeTab === 'editor' && (
          <div style={{ 
            margin: '0.25rem 0.75rem', 
            padding: '0.85rem', 
            background: 'var(--skin-surface)', 
            border: 'var(--border-hairline) solid var(--skin-border)', 
            borderRadius: 'var(--radius-button)',
            boxShadow: '0 2px 8px var(--skin-shadow)'
          }}>
            <div style={{ 
              fontSize: '0.68rem', 
              fontWeight: '800', 
              color: 'var(--skin-text-secondary)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-dot)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Studio Language</span>
              <span style={{ color: 'var(--skin-accent)' }}>•</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {[
                { id: 'en', label: 'English Studio' },
                { id: 'bn', label: 'Bangla Studio' },
                { id: 'hi', label: 'Hindi Studio' },
                { id: 'ur', label: 'Urdu Studio' },
                { id: 'ar', label: 'Arabic Studio' }
              ].map((lang) => {
                const isSelected = studioLanguage === lang.id;
                return (
                  <button 
                    key={lang.id}
                    onClick={() => handleLanguageClick(lang.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.38rem 0.55rem',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      borderRadius: 'var(--radius-badge)',
                      border: isSelected ? '1px solid var(--skin-border)' : '1px solid transparent',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--skin-surface-variant)' : 'transparent',
                      color: isSelected ? 'var(--skin-text-primary)' : 'var(--skin-text-secondary)',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{lang.label}</span>
                    {isSelected && (
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: 'var(--skin-accent)' 
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile and Settings Wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Status indicator row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0.5rem 1rem', 
          borderTop: 'var(--border-hairline) solid var(--skin-border)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: 'var(--accent-green)', 
              boxShadow: '0 0 6px var(--accent-green)' 
            }} />
            <span style={{ 
              fontSize: '0.68rem', 
              color: 'var(--skin-text-secondary)', 
              fontWeight: '700', 
              fontFamily: 'var(--font-dot)',
              letterSpacing: '0.5px'
            }}>
              SYS ONLINE
            </span>
          </div>

          <span style={{ 
            fontSize: '0.62rem', 
            color: 'var(--skin-text-secondary)', 
            fontWeight: '600',
            fontFamily: 'var(--font-dot)'
          }}>
            v2.4-SKIN
          </span>
        </div>

        {/* 3-Mode Design Skin Switcher: Light, Dark AMOLED, Nothing OS Glyph */}
        <div style={{
          padding: '0.65rem 0.85rem',
          borderTop: 'var(--border-hairline) solid var(--skin-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          background: 'var(--skin-surface)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '0.66rem',
            fontWeight: '800',
            color: 'var(--skin-text-secondary)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-dot)'
          }}>
            <span>Theme Skin</span>
            <span style={{ 
              color: currentTheme === 'glyph' ? 'var(--skin-accent)' : currentTheme === 'dark' ? 'var(--skin-accent-secondary)' : 'var(--skin-text-primary)',
              fontWeight: 'bold'
            }}>
              {currentTheme === 'glyph' ? 'GLYPH OS' : currentTheme === 'dark' ? 'AMOLED' : 'LIGHT'}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.25rem',
            background: 'var(--skin-surface-variant)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-pill)',
            border: 'var(--border-hairline) solid var(--skin-border)'
          }}>
            <button
              type="button"
              onClick={() => setTheme(SkinThemeMode.LIGHT)}
              title="Minimalist Clean Light Skin"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                padding: '0.4rem 0.2rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.68rem',
                fontWeight: '700',
                background: currentTheme === 'light' ? 'var(--skin-ink)' : 'transparent',
                color: currentTheme === 'light' ? 'var(--skin-on-ink)' : 'var(--skin-text-secondary)',
                transition: 'all 0.15s ease',
                boxShadow: currentTheme === 'light' ? '0 1px 4px var(--skin-shadow)' : 'none'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme(SkinThemeMode.DARK)}
              title="Pitch Black 100% AMOLED Dark Skin"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                padding: '0.4rem 0.2rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.68rem',
                fontWeight: '700',
                background: currentTheme === 'dark' ? 'var(--skin-ink)' : 'transparent',
                color: currentTheme === 'dark' ? 'var(--skin-on-ink)' : 'var(--skin-text-secondary)',
                transition: 'all 0.15s ease',
                boxShadow: currentTheme === 'dark' ? '0 1px 4px var(--skin-shadow)' : 'none'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>AMOLED</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme(SkinThemeMode.GLYPH)}
              title="Bauhaus / Nothing OS Dark Graphite Skin"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                padding: '0.4rem 0.2rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.68rem',
                fontWeight: '700',
                background: currentTheme === 'glyph' ? 'var(--skin-accent)' : 'transparent',
                color: currentTheme === 'glyph' ? '#FFFFFF' : 'var(--skin-text-secondary)',
                transition: 'all 0.15s ease',
                boxShadow: currentTheme === 'glyph' ? '0 1px 6px rgba(229, 37, 42, 0.4)' : 'none'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6" cy="6" r="2.5" />
                <circle cx="18" cy="6" r="2.5" />
                <circle cx="12" cy="12" r="2.5" />
                <circle cx="6" cy="18" r="2.5" />
                <circle cx="18" cy="18" r="2.5" />
              </svg>
              <span>Glyph</span>
            </button>
          </div>
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
            borderTop: 'var(--border-hairline) solid var(--skin-border)', 
            width: '100%', 
            textDecoration: 'none', 
            color: 'inherit',
            transition: 'background 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--skin-surface-variant)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--skin-accent), var(--skin-accent-secondary))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#ffffff', 
            fontSize: '0.8rem', 
            fontWeight: '900',
            boxShadow: '0 0 8px rgba(229, 57, 53, 0.25)',
            flexShrink: 0
          }}>
            FT
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              fontSize: '0.84rem', 
              fontWeight: '800', 
              color: 'var(--skin-text-primary)', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              Fahim Takrim
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--skin-text-secondary)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>

    </div>
  );
}
