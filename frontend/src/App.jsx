import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StoryEditor from './components/StoryEditor';
import TTSConfig from './components/TTSConfig';
import HistoryList from './components/HistoryList';

export default function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [studioLanguage, setStudioLanguage] = useState('en'); // 'en', 'bn', 'hi'
  
  // Theme Management
  const [theme, setTheme] = useState(() => localStorage.getItem('vo_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vo_theme', theme);
  }, [theme]);

  // English State
  const [storyTitle, setStoryTitle] = useState('Nebula Echoes');
  const [storyText, setStoryText] = useState('The static on console nine was different tonight. It was not the usual background hiss of the stellar wind, nor the erratic popping of solar flares. It was a rhythmic, pulsing cadence. Three short bursts, a long pause, and then a low hum that vibrated the metal deck plates beneath Arthur\'s boots. He adjusted his headset, filtering out the ambient hum of the life support systems. The signal remained. It was coming from sector seven-nine, a barren stretch of the belt known only for dust and ice. No ships were scheduled. No mining rigs were active. Yet, the signal persisted, like a mechanical heartbeat calling out in the void.');
  const [provider, setProvider] = useState('edge');
  const [voice, setVoice] = useState('en-US-JennyNeural');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState('+0Hz');
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.75);

  // Bangla/Hindi Multilingual State
  const [otherTitle, setOtherTitle] = useState('Multilingual Narrative');
  const [otherText, setOtherText] = useState('নবানিতা হলো মাইক্রোসফট এজ এর একটি বাস্তবসম্মত বাংলা ভয়েস আর্টিস্ট। যখন আপনি দীর্ঘ গল্প তৈরি করেন, তখন সেটির বিভিন্ন বাক্যের মাঝে স্বাচ্ছন্দ্যে শ্বাস নেয়ার বিরতি তৈরি করতে "Format Breath Pauses" বাটনটি চাপুন।\n\nनमस्ते, मधुर माइक्रोसॉफ्ट एज़ की एक बेहतरीन हिंदी आवाज़ है। आप इसके माध्यम से सुंदर कहानियों का वाचन रिकॉर्ड कर सकते हैं।');
  const [otherProvider, setOtherProvider] = useState('edge');
  const [otherVoice, setOtherVoice] = useState('bn-BD-NabanitaNeural');
  const [otherSpeed, setOtherSpeed] = useState(1.0);
  const [otherPitch, setOtherPitch] = useState('+0Hz');
  const [otherStability, setOtherStability] = useState(0.5);
  const [otherSimilarity, setOtherSimilarity] = useState(0.75);

  // Credentials State
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [elevenlabsKey, setElevenlabsKey] = useState('');
  const [charLimit, setCharLimit] = useState(30000);

  // Toast Alerts State
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Sync Library Trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const backendUrl = 'http://localhost:5000';

  // Load saved credentials on mount
  useEffect(() => {
    setGeminiKey(localStorage.getItem('vo_gemini_key') || '');
    setOpenaiKey(localStorage.getItem('vo_openai_key') || '');
    setElevenlabsKey(localStorage.getItem('vo_elevenlabs_key') || '');
    const savedLimit = localStorage.getItem('vo_char_limit');
    if (savedLimit) setCharLimit(Number(savedLimit));
  }, []);

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

  // Auto-switch default voice when language toggled for Edge
  useEffect(() => {
    if (activeProvider === 'edge') {
      if (studioLanguage === 'bn') {
        setActiveVoice('bn-BD-NabanitaNeural');
      } else if (studioLanguage === 'hi') {
        setActiveVoice('hi-IN-SwaraNeural');
      } else if (studioLanguage === 'en') {
        setActiveVoice('en-US-JennyNeural');
      }
    } else if (activeProvider === 'google') {
      if (studioLanguage === 'bn') {
        setActiveVoice('bn');
      } else if (studioLanguage === 'hi') {
        setActiveVoice('hi');
      } else if (studioLanguage === 'en') {
        setActiveVoice('en');
      }
    }
  }, [studioLanguage]);

  return (
    <div className="app-container">
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

      {/* Top Header Navigation with Theme props */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendUrl={backendUrl}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="main-content">
        <header className="content-header" style={{ padding: '0.85rem 2.5rem 0.65rem 2.5rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="content-title" style={{ fontSize: '1.25rem', display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                {activeTab === 'editor' && 'AI Voiceover Studio'}
                {activeTab === 'history' && 'Audio Library'}
                {activeTab === 'settings' && 'Settings & Keyring'}
                
                <span className="content-subtitle" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'inline', marginLeft: '0.25rem', fontWeight: '500' }}>
                  {activeTab === 'editor' && 'Create voiceovers for Reels, Shorts, stories, lessons, and presentations.'}
                  {activeTab === 'history' && 'Archived recordings and story audio files.'}
                  {activeTab === 'settings' && 'Manage local API integration keys safely.'}
                </span>
              </h1>
              
              {activeTab === 'editor' && (
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="badge-pill badge-pill-blue" style={{ fontSize: '0.64rem', padding: '0.15rem 0.5rem' }}>Free Engine</span>
                  <span className="badge-pill badge-pill-violet" style={{ fontSize: '0.64rem', padding: '0.15rem 0.5rem' }}>Long Script Mode</span>
                  <span className="badge-pill badge-pill-green" style={{ fontSize: '0.64rem', padding: '0.15rem 0.5rem' }}>MP3 Export</span>
                </div>
              )}
            </div>

            {/* Right side: Segmented Language switch & Waveform decoration inside the header */}
            {activeTab === 'editor' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <div 
                  style={{ 
                    display: 'flex', 
                    background: 'var(--border-color)', 
                    padding: '0.15rem', 
                    borderRadius: '9999px',
                    alignItems: 'center'
                  }}
                >
                  <button
                    className={`sidebar-btn ${studioLanguage === 'en' ? 'active' : ''}`}
                    style={{ padding: '0.3rem 0.95rem', fontSize: '0.75rem', borderRadius: '9999px' }}
                    onClick={() => setStudioLanguage('en')}
                  >
                    English
                  </button>
                  <button
                    className={`sidebar-btn ${studioLanguage === 'bn' ? 'active' : ''}`}
                    style={{ padding: '0.3rem 0.95rem', fontSize: '0.75rem', borderRadius: '9999px' }}
                    onClick={() => setStudioLanguage('bn')}
                  >
                    Bangla
                  </button>
                  <button
                    className={`sidebar-btn ${studioLanguage === 'hi' ? 'active' : ''}`}
                    style={{ padding: '0.3rem 0.95rem', fontSize: '0.75rem', borderRadius: '9999px' }}
                    onClick={() => setStudioLanguage('hi')}
                  >
                    Hindi
                  </button>
                </div>

                <div className="header-waveform" style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '18px' }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="header-wave-bar" 
                      style={{ 
                        width: '2px', 
                        height: '4px', 
                        background: 'linear-gradient(to top, var(--accent-blue), var(--accent-violet))',
                        borderRadius: '9999px',
                        animation: `dance 1s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.08}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'history' && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', background: 'var(--bg-surface)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                Disk Cache: <strong style={{ color: 'var(--text-primary)' }}>Active</strong>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'editor' && (
          <StoryEditor 
            studioLanguage={studioLanguage}
            setStudioLanguage={setStudioLanguage}
            storyTitle={activeTitle}
            setStoryTitle={setActiveTitle}
            storyText={activeText}
            setStoryText={setActiveText}
            showToast={showToast}
            backendUrl={backendUrl}
            charLimit={charLimit}
            geminiKey={geminiKey}
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
            elevenlabsKey={elevenlabsKey}
            onGenerationComplete={() => setRefreshTrigger(prev => prev + 1)}
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

        {activeTab === 'settings' && (
          <TTSConfig 
            openaiKey={openaiKey}
            setOpenaiKey={setOpenaiKey}
            elevenlabsKey={elevenlabsKey}
            setElevenlabsKey={setElevenlabsKey}
            geminiKey={geminiKey}
            setGeminiKey={setGeminiKey}
            charLimit={charLimit}
            setCharLimit={setCharLimit}
            showToast={showToast}
            isSettingsTab={true}
          />
        )}
      </main>
    </div>
  );
}
