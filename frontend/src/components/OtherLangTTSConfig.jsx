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
  { id: 'bn-BD-NabanitaNeural', name: 'Nabanita (Bangladesh - Female)', description: 'Premium free Bangla voice. Warm and natural female narrator (Recommended for Bangla).' },
  { id: 'bn-BD-PradeepNeural', name: 'Pradeep (Bangladesh - Male)', description: 'Premium free Bangla voice. Smooth and professional male narrator.' },
  { id: 'bn-IN-TanishaaNeural', name: 'Tanishaa (India - Female)', description: 'Premium free Bengali voice. Clear and expressive female narrator.' },
  { id: 'bn-IN-BashkarNeural', name: 'Bashkar (India - Male)', description: 'Premium free Bengali voice. Natural male narrator.' },
  { id: 'hi-IN-SwaraNeural', name: 'Swara (India - Female)', description: 'Premium free Hindi voice. Engaging and warm female narrator (Recommended for Hindi).' },
  { id: 'hi-IN-MadhurNeural', name: 'Madhur (India - Male)', description: 'Premium free Hindi voice. Deep and clear male narrator.' }
];

const GOOGLE_VOICES = [
  { id: 'bn', name: 'Bangla (Google - Unisex)', description: 'Robotic Google Translate voice in Bangla. 100% free.' },
  { id: 'hi', name: 'Hindi (Google - Unisex)', description: 'Robotic Google Translate voice in Hindi. 100% free.' }
];

const getLanguageLabel = (id) => {
  if (id.startsWith('bn')) return { label: 'BANGLA', color: 'var(--accent-blue)', bg: 'var(--accent-blue-dim)' };
  if (id.startsWith('hi')) return { label: 'HINDI', color: '#d97706', bg: '#fef3c7' }; 
  return { label: 'MULTI', color: 'var(--text-secondary)', bg: 'var(--bg-base)' };
};

const PROVIDER_METADATA = {
  edge: { badge: 'FREE ENGINE', type: 'free' },
  google: { badge: 'FREE ENGINE', type: 'free' },
  openai: { badge: 'API KEY REQUIRED', type: 'paid' },
  elevenlabs: { badge: 'API KEY REQUIRED', type: 'paid' }
};

export default function OtherLangTTSConfig({ 
  studioLanguage,
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
  openaiKey,
  elevenlabsKey,
  showToast,
  backendUrl = 'https://ai-orbitvoice.onrender.com',
  showOnlyVoiceGrid = false,
  hideVoiceGrid = false,
  onSelectVoice
}) {
  // Previewing States
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const previewAudioRef = useRef(null);

  // Filter lists based on the active studioLanguage ('bn' / 'hi')
  const activeVoices = provider === 'openai' 
    ? OPENAI_VOICES 
    : provider === 'elevenlabs' 
      ? ELEVENLABS_VOICES 
      : provider === 'google'
        ? GOOGLE_VOICES.filter(v => v.id === studioLanguage)
        : EDGE_VOICES.filter(v => v.id.startsWith(studioLanguage));

  // Sync / Reset default voice on language toggle
  useEffect(() => {
    if (activeVoices.length > 0 && !activeVoices.some(v => v.id === voice)) {
      setVoice(activeVoices[0].id);
    }
  }, [provider, studioLanguage]);

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
              const langLabel = getLanguageLabel(v.id);
              return (
                <div
                  key={v.id}
                  className={`voice-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => { setVoice(v.id); if (onSelectVoice) onSelectVoice(); }}
                  title={v.description}
                  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.6rem', borderRadius: '8px' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.1rem' }}>
                      {provider === 'edge' && (
                        <span 
                          style={{ 
                            fontSize: '0.56rem', 
                            fontWeight: '700', 
                            padding: '0.1rem 0.35rem', 
                            borderRadius: '9999px', 
                            background: langLabel.bg, 
                            color: langLabel.color,
                            border: 'none',
                            flexShrink: 0
                          }}
                        >
                          {langLabel.label}
                        </span>
                      )}
                      <div className="voice-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8rem', fontWeight: '700' }}>
                        {v.name}
                      </div>
                    </div>
                    <div className="voice-meta" style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
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
      
    </div>
  );
}
