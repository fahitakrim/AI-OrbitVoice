import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StoryEditor from './components/StoryEditor';
import HistoryList from './components/HistoryList';
import DynamicConstellationCanvas from './components/DynamicConstellationCanvas';
import { SkinTheme, SkinThemeMode } from './ui/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [studioLanguage, setStudioLanguage] = useState('en'); // 'en', 'bn', 'hi', 'ur', 'ar'
  
  // Theme Management: light, dark (AMOLED), glyph (Nothing OS Bauhaus)
  const [theme, setTheme] = useState(() => localStorage.getItem('vo_theme') || SkinThemeMode.LIGHT);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vo_theme', theme);
  }, [theme]);

  // English / Active State with Auto-Saved Draft Persistence
  const [storyTitle, setStoryTitle] = useState(() => localStorage.getItem('vo_draft_title') || 'My Audio');
  const [storyText, setStoryText] = useState(() => localStorage.getItem('vo_draft_text') || '');
  const [provider, setProvider] = useState('edge');
  const [voice, setVoice] = useState('en-US-AvaMultilingualNeural');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState('+0Hz');
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.75);

  // Auto-save script drafts so users never lose their writing
  useEffect(() => {
    if (storyText) {
      localStorage.setItem('vo_draft_text', storyText);
    } else {
      localStorage.removeItem('vo_draft_text');
    }
  }, [storyText]);

  useEffect(() => {
    if (storyTitle) {
      localStorage.setItem('vo_draft_title', storyTitle);
    }
  }, [storyTitle]);

  // Bangla/Hindi/Urdu/Arabic Multilingual State
  const [otherTitle, setOtherTitle] = useState('My Audio');
  const [otherText, setOtherText] = useState('');
  const [otherProvider, setOtherProvider] = useState('edge');
  const [otherVoice, setOtherVoice] = useState('bn-BD-NabanitaNeural');
  const [otherSpeed, setOtherSpeed] = useState(1.0);
  const [otherPitch, setOtherPitch] = useState('+0Hz');
  const [otherStability, setOtherStability] = useState(0.5);
  const [otherSimilarity, setOtherSimilarity] = useState(0.75);

  // Credentials State (lazily initialized from localStorage)
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('vo_gemini_key') || '');
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem('vo_openai_key') || '');
  const [elevenlabsKey, setElevenlabsKey] = useState(() => localStorage.getItem('vo_elevenlabs_key') || '');
  const [charLimit, setCharLimit] = useState(() => {
    const saved = localStorage.getItem('vo_char_limit');
    return saved ? Number(saved) : 30000;
  });

  // Toast Alerts State
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Sync Library Trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://ai-orbitvoice.onrender.com';

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  };

  const handleRestoreStory = (title, restoredChapters) => {
    const text = restoredChapters[0]?.content || '';
    
    // Auto-detect language of restored content to set toggle
    const hasBengali = /[\u0980-\u09FF]/.test(text);
    const hasHindi = /[\u0900-\u097F]/.test(text);
    
    if (hasBengali) {
      setStudioLanguage('bn');
      setOtherTitle(title);
      setOtherText(text);
      setOtherVoice('bn-BD-NabanitaNeural');
    } else if (hasHindi) {
      setStudioLanguage('hi');
      setOtherTitle(title);
      setOtherText(text);
      setOtherVoice('hi-IN-SwaraNeural');
    } else {
      setStudioLanguage('en');
      setStoryTitle(title);
      setStoryText(text);
      setVoice('en-US-JennyNeural');
    }
    
    setActiveTab('editor');
  };

  // Dynamically map active state context to unified editor
  const activeTitle = studioLanguage === 'en' ? storyTitle : otherTitle;
  const setActiveTitle = studioLanguage === 'en' ? setStoryTitle : setOtherTitle;
  
  const activeText = studioLanguage === 'en' ? storyText : otherText;
  const setActiveText = studioLanguage === 'en' ? setStoryText : setOtherText;
  
  const activeProvider = studioLanguage === 'en' ? provider : otherProvider;
  const setActiveProvider = studioLanguage === 'en' ? setProvider : setOtherProvider;
  
  const activeVoice = studioLanguage === 'en' ? voice : otherVoice;
  const setActiveVoice = studioLanguage === 'en' ? setVoice : setOtherVoice;
  
  const activeSpeed = studioLanguage === 'en' ? speed : otherSpeed;
  const setActiveSpeed = studioLanguage === 'en' ? setSpeed : setOtherSpeed;
  
  const activePitch = studioLanguage === 'en' ? pitch : otherPitch;
  const setActivePitch = studioLanguage === 'en' ? setPitch : setOtherPitch;
  
  const activeStability = studioLanguage === 'en' ? stability : otherStability;
  const setActiveStability = studioLanguage === 'en' ? setStability : setOtherStability;
  
  const activeSimilarity = studioLanguage === 'en' ? similarity : otherSimilarity;
  const setActiveSimilarity = studioLanguage === 'en' ? setSimilarity : setOtherSimilarity;

  // Handler for language changes that updates default voice cleanly
  const handleLanguageChange = (lang) => {
    setStudioLanguage(lang);
    if (activeProvider === 'edge') {
      const defaultVoices = {
        bn: 'bn-BD-NabanitaNeural',
        hi: 'hi-IN-SwaraNeural',
        ur: 'ur-PK-UzmaNeural',
        ar: 'ar-SA-ZariyahNeural',
        en: 'en-US-AvaMultilingualNeural',
      };
      const v = defaultVoices[lang];
      if (v) {
        if (lang === 'en') setVoice(v);
        else setOtherVoice(v);
      }
    } else if (activeProvider === 'google') {
      if (lang === 'en') setVoice('en');
      else setOtherVoice(lang);
    }
  };

  return (
    <SkinTheme themeMode={theme} setThemeMode={setTheme}>
      <div className="app-container">
        {/* Option 3: Interactive Orbit Starfield Constellation Background */}
        <DynamicConstellationCanvas />

        {/* Floating background orbit particles */}
        <div className="float-dot-1" />
        <div className="float-dot-2" />

        {/* Toast Alert */}
        <div className={`toast ${toast.visible ? 'show' : ''} ${toast.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {toast.type === 'success' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--accent-green)' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--accent-danger)' }}>
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>

        {/* Mobile Sidebar backdrop */}
        {isSidebarOpen && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 990,
              display: 'block'
            }}
            className="mobile-sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar Navigation with Theme & Language props */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          theme={theme}
          setTheme={setTheme}
          studioLanguage={studioLanguage}
          setStudioLanguage={handleLanguageChange}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        <main className="main-content">
          {/* Mobile Header Bar */}
          <div className="mobile-header">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="mobile-menu-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            
            <div className="mobile-header-logo">
              <div className="logo-glow" />
              <span>VOICEORBIT</span>
            </div>
            <div style={{ width: '20px' }} />
          </div>

          {activeTab === 'editor' && (
            <StoryEditor 
              studioLanguage={studioLanguage}
              setStudioLanguage={handleLanguageChange}
              storyTitle={activeTitle}
              setStoryTitle={setActiveTitle}
              storyText={activeText}
              setStoryText={setActiveText}
              showToast={showToast}
              backendUrl={backendUrl}
              charLimit={charLimit}
              setCharLimit={setCharLimit}
              geminiKey={geminiKey}
              setGeminiKey={setGeminiKey}
              provider={activeProvider}
              setProvider={setActiveProvider}
              voice={activeVoice}
              setVoice={setActiveVoice}
              speed={activeSpeed}
              setSpeed={setActiveSpeed}
              pitch={activePitch}
              setPitch={setActivePitch}
              stability={activeStability}
              setStability={setActiveStability}
              similarity={activeSimilarity}
              setSimilarity={setActiveSimilarity}
              openaiKey={openaiKey}
              setOpenaiKey={setOpenaiKey}
              elevenlabsKey={elevenlabsKey}
              setElevenlabsKey={setElevenlabsKey}
              onGenerationComplete={() => setRefreshTrigger(prev => prev + 1)}
              refreshTrigger={refreshTrigger}
              onRestoreStory={handleRestoreStory}
            />
          )}

          {activeTab === 'history' && (
            <HistoryList 
              backendUrl={backendUrl}
              onRestoreStory={handleRestoreStory}
              showToast={showToast}
              refreshTrigger={refreshTrigger}
            />
          )}
        </main>
      </div>
    </SkinTheme>
  );
}
