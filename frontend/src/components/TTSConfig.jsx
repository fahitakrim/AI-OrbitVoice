import React, { useState, useEffect, useRef } from 'react';

const OPENAI_VOICES = [
  { id: 'onyx', name: 'Onyx', description: 'Deep, masculine, professional narrator (Highly recommended for stories)' },
  { id: 'nova', name: 'Nova', description: 'Bright, feminine, energetic and clear voice' },
  { id: 'alloy', name: 'Alloy', description: 'Balanced, versatile, and neutral tone' },
  { id: 'echo', name: 'Echo', description: 'Warm, intimate, slightly deeper tone' },
  { id: 'fable', name: 'Fable', description: 'Theatrical, dramatic, great for narrative dialogue' },
  { id: 'shimmer', name: 'Shimmer', description: 'Professional, clear, conversational feminine voice' }
];

const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Soft, warm, narration-friendly feminine voice' },
  { id: '2EiwXtPIZUi1R3OqpS5u', name: 'Clyde', description: 'Gravelly, video game style narrative voice' },
  { id: '5Q0t7uMcxvnJa26GUmFY', name: 'Paul', description: 'Deep, gravelly, older male voice' },
  { id: 'piTKgcLEGmPEe24241Jg', name: 'Nicole', description: 'Whispery, crisp, close-mic style voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Classic narration, soft and expressive' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Rich, deep male voice, perfect for ads and storytelling' },
  { id: 'GBv7oZtRgoG2N17B3igB', name: 'Thomas', description: 'Gritty, cinematic, older narrator tone' }
];

const EDGE_VOICES = [
  { id: 'en-US-AvaMultilingualNeural', name: 'Ava (USA - Multilingual V2)', description: 'Premium free voice. Highly realistic, natural, and expressive female narrator (Recommended)' },
  { id: 'en-US-EmmaMultilingualNeural', name: 'Emma (USA - Multilingual V2)', description: 'Premium free voice. Crisp, clear, and intimate female narrator' },
  { id: 'en-US-AndrewMultilingualNeural', name: 'Andrew (USA - Multilingual V2)', description: 'Premium free voice. Deep, engaging, and smooth presenter male' },
  { id: 'en-US-BrianMultilingualNeural', name: 'Brian (USA - Multilingual V2)', description: 'Premium free voice. Crisp, natural professional male narration' },
  { id: 'en-GB-RyanMultilingualNeural', name: 'Ryan (UK - Multilingual V2)', description: 'Premium free voice. Warm, expressive British male narration' },
  { id: 'en-GB-SoniaMultilingualNeural', name: 'Sonia (UK - Multilingual V2)', description: 'Premium free voice. Clear, expressive British female narrator' },
  
  // Expanded High-Fidelity & Expressive Voices
  { id: 'en-IN-NeerjaExpressiveNeural', name: 'Neerja (IND - Expressive Female)', description: 'Premium free voice. Rich, conversational, and emotionally expressive Indian accent.' },
  { id: 'en-US-AnaNeural', name: 'Ana (USA - Child Female)', description: 'Premium free child voice. Gentle, friendly kid tone. Perfect for children\'s audiobooks.' },
  { id: 'en-GB-ThomasNeural', name: 'Thomas (UK - Deep Narration)', description: 'Premium free British voice. Deep, resonant, and formal male narrator.' }
];

const GOOGLE_VOICES = [
  { id: 'en', name: 'English (Google - Unisex)', description: 'Robotic Google Translate voice in English. 100% free and unlimited.' }
];

const PROVIDER_METADATA = {
  edge: { badge: 'FREE ENGINE', type: 'free', detail: 'Microsoft Edge Neural (No API Key Required)' },
  google: { badge: 'FREE ENGINE', type: 'free', detail: 'Google Translate Robotic (No API Key Required)' },
  openai: { badge: 'API KEY REQUIRED', type: 'paid', detail: 'OpenAI TTS Integration' },
  elevenlabs: { badge: 'API KEY REQUIRED', type: 'paid', detail: 'ElevenLabs Voice Cloning' }
};

function BrandingFooter() {
  return (
    <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div style={{ flex: '1 1 280px' }}>
          <div>
            © 2026 <strong style={{ color: 'var(--text-primary)' }}>AI VoiceOrbit</strong>. Built by <a href="https://www.facebook.com/share/1F5WW35d7p/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', fontWeight: '700', textDecoration: 'underline' }}>Fahim Takrim</a>.
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Part of Orbit Apps — tools for learning, creativity, and everyday productivity.
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            AI VoiceOrbit is free for early users.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TTSConfig({ 
  provider, 
  setProvider, 
  voice, 
  setVoice, 
  speed, 
  setSpeed, 
  pitch,
  setPitch,
  stability, 
  setStability, 
  similarity, 
  setSimilarity,
  geminiKey,
  setGeminiKey,
  openaiKey,
  setOpenaiKey,
  elevenlabsKey,
  setElevenlabsKey,
  charLimit,
  setCharLimit,
  showToast,
  isSettingsTab = false,
  backendUrl = 'https://ai-orbitvoice.onrender.com',
  showOnlyVoiceGrid = false,
  hideVoiceGrid = false,
  onSelectVoice
}) {
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showElevenlabs, setShowElevenlabs] = useState(false);

  // Previewing States
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const previewAudioRef = useRef(null);

  // Set default voice when provider changes
  useEffect(() => {
    if (provider === 'openai' && !OPENAI_VOICES.some(v => v.id === voice)) {
      setVoice(OPENAI_VOICES[0].id);
    } else if (provider === 'elevenlabs' && !ELEVENLABS_VOICES.some(v => v.id === voice)) {
      setVoice(ELEVENLABS_VOICES[0].id);
    } else if (provider === 'edge' && !EDGE_VOICES.some(v => v.id === voice)) {
      setVoice(EDGE_VOICES[0].id);
    } else if (provider === 'google' && !GOOGLE_VOICES.some(v => v.id === voice)) {
      setVoice(GOOGLE_VOICES[0].id);
    }
  }, [provider]);

  const activeVoices = provider === 'openai' 
    ? OPENAI_VOICES 
    : provider === 'elevenlabs' 
      ? ELEVENLABS_VOICES 
      : provider === 'google'
        ? GOOGLE_VOICES
        : EDGE_VOICES;

  const saveCredentials = () => {
    localStorage.setItem('vo_gemini_key', geminiKey);
    localStorage.setItem('vo_openai_key', openaiKey);
    localStorage.setItem('vo_elevenlabs_key', elevenlabsKey);
    localStorage.setItem('vo_char_limit', String(charLimit));
    showToast('Credentials updated successfully!', 'success');
  };

  const handlePreviewVoice = async (e, voiceId) => {
    e.stopPropagation();
    
    if (previewingVoiceId === voiceId) {
      if (previewAudioRef.current) {
        if (previewPlaying) {
          previewAudioRef.current.pause();
          setPreviewPlaying(false);
        } else {
          previewAudioRef.current.play().catch(console.error);
          setPreviewPlaying(true);
        }
      }
      return;
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }

    setPreviewingVoiceId(voiceId);
    setPreviewLoading(true);
    setPreviewPlaying(false);

    try {
      const activeKey = provider === 'openai' ? openaiKey : (provider === 'elevenlabs' ? elevenlabsKey : '');
      const response = await fetch(`${backendUrl}/api/preview-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          voice: voiceId,
          apiKey: activeKey,
          settings: { speed, pitch }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch preview audio');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      previewAudioRef.current = audio;
      
      audio.oncanplaythrough = () => {
        setPreviewLoading(false);
        audio.play().then(() => {
          setPreviewPlaying(true);
        }).catch(err => {
          console.error('Audio playback failed:', err);
        });
      };

      audio.onended = () => {
        setPreviewPlaying(false);
        setPreviewingVoiceId(null);
      };

      audio.onerror = (err) => {
        console.error('Audio element error:', err);
        showToast('Playback error.', 'error');
        setPreviewLoading(false);
        setPreviewingVoiceId(null);
      };

    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      setPreviewLoading(false);
      setPreviewingVoiceId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  if (isSettingsTab) {
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
            <h1 style={{ fontSize: '2.1rem', fontWeight: '900', letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '0.55rem' }}>
              Settings & Credentials
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
              Manage your local API endpoints and keys. Kept safely in your browser storage.
            </p>
          </div>

          <div className="glass-panel" style={{ width: '100%', padding: '2rem', background: 'var(--bg-surface)' }}>
            <div className="panel-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              API Integration Hub
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              API keys are kept strictly in your local browser sandbox and are only sent directly to official speech endpoints. They never transit third-party servers.
            </p>
              
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label">Gemini API Key (Required for AI Studio Canvas Writer)</label>
                <button 
                  className="player-btn-sec" 
                  style={{ fontSize: '0.72rem', textDecoration: 'underline', border: 'none', background: 'transparent' }} 
                  onClick={() => setShowGemini(!showGemini)}
                >
                  {showGemini ? 'Hide Key' : 'Reveal Key'}
                </button>
              </div>
              <input 
                type={showGemini ? 'text' : 'password'} 
                className="form-input" 
                placeholder="AIzaSy..." 
                value={geminiKey || ''}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
              <div style={{ marginTop: '0.35rem', fontSize: '0.74rem' }}>
                <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                  Register for a Free Gemini API Key at Google AI Studio
                </a>
              </div>
              <div className="api-status">
                <span className="status-indicator" style={{ background: geminiKey ? 'var(--accent-green)' : 'var(--text-muted)', boxShadow: geminiKey ? '0 0 5px var(--accent-green)' : 'none' }} />
                <span style={{ color: geminiKey ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {geminiKey ? 'Connected (Gemini Engine Ready)' : 'Disconnected (Required for writing scripts with AI)'}
                </span>
              </div>
            </div>

            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label">OpenAI API Key (Optional - Paid Speech Engine)</label>
                <button 
                  className="player-btn-sec" 
                  style={{ fontSize: '0.72rem', textDecoration: 'underline', border: 'none', background: 'transparent' }} 
                  onClick={() => setShowOpenai(!showOpenai)}
                >
                  {showOpenai ? 'Hide Key' : 'Reveal Key'}
                </button>
              </div>
              <input 
                type={showOpenai ? 'text' : 'password'} 
                className="form-input" 
                placeholder="sk-proj-..." 
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
              <div className="api-status">
                <span className="status-indicator" style={{ background: openaiKey ? 'var(--accent-green)' : 'var(--text-muted)', boxShadow: openaiKey ? '0 0 5px var(--accent-green)' : 'none' }} />
                <span style={{ color: openaiKey ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {openaiKey ? 'Connected (OpenAI Engine Available)' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label">ElevenLabs API Key (Optional - Paid Speech Engine)</label>
                <button 
                  className="player-btn-sec" 
                  style={{ fontSize: '0.72rem', textDecoration: 'underline', border: 'none', background: 'transparent' }} 
                  onClick={() => setShowElevenlabs(!showElevenlabs)}
                >
                  {showElevenlabs ? 'Hide Key' : 'Reveal Key'}
                </button>
              </div>
              <input 
                type={showElevenlabs ? 'text' : 'password'} 
                className="form-input" 
                placeholder="Enter ElevenLabs API Key" 
                value={elevenlabsKey}
                onChange={(e) => setElevenlabsKey(e.target.value)}
              />
              <div className="api-status">
                <span className="status-indicator" style={{ background: elevenlabsKey ? 'var(--accent-green)' : 'var(--text-muted)', boxShadow: elevenlabsKey ? '0 0 5px var(--accent-green)' : 'none' }} />
                <span style={{ color: elevenlabsKey ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {elevenlabsKey ? 'Connected (ElevenLabs Engine Available)' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
              <label className="form-label">Single-Run Generation Character Limit</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 30000" 
                value={charLimit || ''}
                onChange={(e) => setCharLimit(Number(e.target.value))}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                Protects local storage and sets boundaries to prevent API execution timeouts.
              </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', borderRadius: '9999px' }} onClick={saveCredentials}>
              Save Credentials
            </button>
          </div>

          {/* Branding & Support Footer */}
          <BrandingFooter showToast={showToast} />
        </div>
      </div>
    );
  }

  const currentMetadata = PROVIDER_METADATA[provider] || { badge: 'FREE', type: 'free' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', overflow: 'hidden' }}>
      
      {/* Card: Voice Roster selection */}
      {!hideVoiceGrid && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="form-label" style={{ marginBottom: '0.5rem', fontWeight: '700' }}>Choose Narrator Voice</div>
          
          <div className="voice-grid" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {activeVoices.map((v) => {
              const isCurrentPreview = previewingVoiceId === v.id;
              const isSelected = voice === v.id;
              return (
                <div
                  key={v.id}
                  className={`voice-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => { setVoice(v.id); if (onSelectVoice) onSelectVoice(); }}
                  title={v.description}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="voice-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8rem', fontWeight: '700' }}>
                      {v.name}
                    </div>
                    <div className="voice-meta" style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                      {v.id.includes('-') ? v.id.split('-').slice(1).join('-') : v.id.substring(0, 10)}
                    </div>
                  </div>
                  
                  {/* Selected Accent Waveform Decoration */}
                  {isSelected && (
                    <div className="mini-waveform" style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '10px', margin: '0 0.4rem', opacity: 0.8 }}>
                      <div style={{ width: '1.5px', height: '100%', background: 'var(--accent-blue)', animation: 'dance 0.6s ease infinite alternate' }} />
                      <div style={{ width: '1.5px', height: '60%', background: 'var(--accent-blue)', animation: 'dance 0.6s ease infinite alternate', animationDelay: '0.15s' }} />
                      <div style={{ width: '1.5px', height: '80%', background: 'var(--accent-blue)', animation: 'dance 0.6s ease infinite alternate', animationDelay: '0.30s' }} />
                    </div>
                  )}

                  <button
                    className={`player-btn-sec preview-btn ${isCurrentPreview ? 'active' : ''}`}
                    onClick={(e) => handlePreviewVoice(e, v.id)}
                    style={{ 
                      width: '22px', 
                      height: '22px', 
                      borderRadius: '50%', 
                      background: isCurrentPreview ? 'var(--accent-blue)' : 'var(--border-color)', 
                      color: isCurrentPreview ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      marginLeft: '0.2rem',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                    title="Preview Voice"
                  >
                    {isCurrentPreview && previewLoading ? (
                      <div className="spinner" style={{ width: '9px', height: '9px', borderWidth: '1.2px', borderTopColor: '#fff', animationDuration: '0.6s' }} />
                    ) : isCurrentPreview && previewPlaying ? (
                      <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Speed & Pitch Settings */}
      <div style={{ marginTop: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
        <div className="form-label" style={{ marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.8rem' }}>Speed & Pitch Settings</div>
        
        <div className="slider-container" style={{ marginBottom: '0.6rem' }}>
          <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span>Vocal Speed</span>
            <span className="slider-val" style={{ fontWeight: 'bold' }}>{speed.toFixed(2)}x</span>
          </div>
          <input 
            type="range" 
            className="slider-input" 
            min="0.25" 
            max="2.0" 
            step="0.05" 
            value={speed} 
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.2rem' }}
          />
        </div>

        <div className="slider-container" style={{ marginBottom: 0 }}>
          <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span>Vocal Pitch</span>
            <span className="slider-val" style={{ fontWeight: 'bold' }}>{pitch}</span>
          </div>
          <input 
            type="range" 
            className="slider-input" 
            min="-20" 
            max="20" 
            step="1" 
            value={parseInt(pitch.replace('%', '').replace('Hz', '')) || 0} 
            onChange={(e) => {
              const num = Number(e.target.value);
              setPitch(num >= 0 ? `+${num}Hz` : `${num}Hz`);
            }}
            style={{ width: '100%', marginTop: '0.2rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>DEEPER BASS</span>
            <span>BRIGHTER SOPRANO</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
