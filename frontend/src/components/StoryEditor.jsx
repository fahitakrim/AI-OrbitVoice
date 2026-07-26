import React, { useState } from 'react';
import AudioEngine from './AudioEngine';

const getWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const getCharCount = (text) => {
  if (!text) return 0;
  return text.length;
};

const ALL_STUDIO_VOICES = {
  en: [
    { id: 'en-US-AvaMultilingualNeural', name: 'Ava', badge: 'US Neural', description: 'Premium free voice. Highly realistic, natural, and expressive female narrator (Recommended)' },
    { id: 'en-US-EmmaMultilingualNeural', name: 'Emma', badge: 'US Neural', description: 'Premium free voice. Crisp, clear, and intimate female narrator' },
    { id: 'en-US-AndrewMultilingualNeural', name: 'Andrew', badge: 'US Neural', description: 'Premium free voice. Deep, engaging, and smooth presenter male' },
    { id: 'en-US-BrianMultilingualNeural', name: 'Brian', badge: 'US Neural', description: 'Premium free voice. Crisp, natural professional male narration' },
    { id: 'en-GB-RyanMultilingualNeural', name: 'Ryan', badge: 'UK Neural', description: 'Premium free voice. Warm, expressive British male narration' },
    { id: 'en-GB-SoniaMultilingualNeural', name: 'Sonia', badge: 'UK Neural', description: 'Premium free voice. Clear, expressive British female narrator' },
    { id: 'en-IN-NeerjaExpressiveNeural', name: 'Neerja', badge: 'IN Neural', description: 'Premium free voice. Rich, conversational, and emotionally expressive Indian accent.' },
    { id: 'en-US-AnaNeural', name: 'Ana', badge: 'Child Female', description: 'Premium free child voice. Gentle, friendly kid tone.' },
    { id: 'en-GB-ThomasNeural', name: 'Thomas', badge: 'Deep Narration', description: 'Premium free British voice. Deep, resonant, and formal male narrator.' }
  ],
  bn: [
    { id: 'bn-BD-NabanitaNeural', name: 'Nabanita', badge: 'BD Neural', description: 'Premium free Bangla voice. Warm and natural female narrator.' },
    { id: 'bn-BD-PradeepNeural', name: 'Pradeep', badge: 'BD Neural', description: 'Premium free Bangla voice. Smooth and professional male narrator.' },
    { id: 'bn-IN-TanishaaNeural', name: 'Tanishaa', badge: 'IN Neural', description: 'Premium free Bengali voice. Clear and expressive female narrator.' },
    { id: 'bn-IN-BashkarNeural', name: 'Bashkar', badge: 'IN Neural', description: 'Premium free Bengali voice. Natural male narrator.' }
  ],
  hi: [
    { id: 'hi-IN-SwaraNeural', name: 'Swara', badge: 'IN Neural', description: 'Premium free Hindi voice. Engaging and warm female narrator.' },
    { id: 'hi-IN-MadhurNeural', name: 'Madhur', badge: 'IN Neural', description: 'Premium free Hindi voice. Deep and clear male narrator.' }
  ]
};

// Reusable Branding Footer Component
export function BrandingFooter() {
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

export default function StoryEditor({ 
  studioLanguage,
  setStudioLanguage,
  storyTitle, 
  setStoryTitle, 
  storyText, 
  setStoryText,
  showToast,
  backendUrl,
  charLimit,
  setCharLimit,
  geminiKey,
  setGeminiKey,
  openaiKey,
  setOpenaiKey,
  elevenlabsKey,
  setElevenlabsKey,
  
  // TTS configuration props
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
  onGenerationComplete,
  refreshTrigger,
  onRestoreStory
}) {
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewAudioRef = React.useRef(null);
  const voiceScrollRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  React.useEffect(() => {
    const el = voiceScrollRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      const toScroll = e.deltaY || e.deltaX;
      if (toScroll !== 0) {
        e.preventDefault();
        el.scrollLeft += toScroll;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [studioLanguage]);

  const handlePreviewVoice = async (e, voiceId) => {
    e.stopPropagation();
    
    if (previewingVoiceId === voiceId) {
      if (previewAudioRef.current) {
        if (!previewAudioRef.current.paused) {
          previewAudioRef.current.pause();
          setPreviewingVoiceId(null);
        } else {
          previewAudioRef.current.play().catch(console.error);
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

    try {
      const response = await fetch(`${backendUrl}/api/preview-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'edge',
          voice: voiceId,
          apiKey: '',
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
        audio.play().catch(err => {
          console.error('Audio playback failed:', err);
        });
      };

      audio.onended = () => {
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

  const getActiveVoiceName = () => {
    const all = [
      ...ALL_STUDIO_VOICES.en,
      ...ALL_STUDIO_VOICES.bn,
      ...ALL_STUDIO_VOICES.hi
    ].find(v => v.id === voice);
    return all ? all.name : voice;
  };

  const handleAutoFormatPunctuation = () => {
    if (!storyText || storyText.trim() === '') {
      showToast('Please enter some text in the canvas first.', 'error');
      return;
    }

    let formatted = storyText;

    // Collapses spacing
    formatted = formatted.replace(/[ \t]+/g, ' ');

    if (studioLanguage === 'en') {
      // English breath pauses logic
      const sentences = formatted.split(/([.!?]+)/);
      for (let i = 0; i < sentences.length; i += 2) {
        let sentence = sentences[i];
        if (!sentence) continue;

        const words = sentence.trim().split(/\s+/);
        if (words.length > 10) {
          sentence = sentence.replace(/(\w+)(\s+)(and|but|because|which|although|however|then)(\s+)/gi, (match, prevWord, space1, word, space2) => {
            if (/[.,!?;:]/.test(prevWord)) {
              return match;
            }
            return `${prevWord}, ${word} `;
          });
        }
        sentences[i] = sentence;
      }
      formatted = sentences.join('');
    } else {
      // Indic (Bangla / Hindi) breath pauses logic
      const sentences = formatted.split(/([।\.!?]+)/);
      for (let i = 0; i < sentences.length; i += 2) {
        let sentence = sentences[i];
        if (!sentence) continue;

        const words = sentence.trim().split(/\s+/);
        if (words.length > 8) {
          sentence = sentence.replace(/(\S+)(\s+)(এবং|কিন্তু|কারণ|তারপর|অথবা|যেহেতু|আর|और|लेकिन|क्योंकि|फिर|या|इसलिए|परंतु|তथा)(\s+)/g, (match, prevWord, space1, word, space2) => {
            if (/[.,!?;:।\-\—]/.test(prevWord)) {
              return match;
            }
            return `${prevWord}, ${word} `;
          });
        }
        sentences[i] = sentence;
      }
      formatted = sentences.join('');
    }

    formatted = formatted.replace(/\.{3,}/g, '... ');
    formatted = formatted.replace(/(\s*),(\s*)/g, ', ');
    formatted = formatted.replace(/,(\s*),/g, ',');

    setStoryText(formatted);
    showToast(`Applied ${studioLanguage === 'en' ? 'English' : 'Indic'} breath pauses for realistic delivery!`, 'success');
  };

  const handleCleanText = () => {
    if (!storyText || storyText.trim() === '') {
      showToast('Please enter some text in the canvas first.', 'error');
      return;
    }
    let cleaned = storyText;
    cleaned = cleaned.replace(/[ \t]+/g, ' '); 
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); 
    cleaned = cleaned.trim();
    setStoryText(cleaned);
    showToast('Cleaned up script spaces and paragraph breaks!', 'success');
  };

  const handleSplitPreview = () => {
    if (!storyText || storyText.trim() === '') {
      showToast('Please enter some text in the canvas first.', 'error');
      return;
    }
    const paragraphs = storyText.split('\n').filter(p => p.trim() !== '');
    let chunksCount = 0;
    let tempText = '';
    paragraphs.forEach(p => {
      if ((tempText + '\n' + p).length > 3000) {
        chunksCount++;
        tempText = p;
      } else {
        tempText = tempText ? (tempText + '\n' + p) : p;
      }
    });
    if (tempText) chunksCount++;
    showToast(`Script will compile into ${chunksCount} audio chunks. All chunks are within safe limits.`, 'success');
  };

  const handleLoadTemplate = (type) => {
    if (type === 'reels') {
      setStoryTitle('Viral Reels Script');
      setStoryText('Attention creators... This is how you generate ultra-realistic voiceovers for your Reels and Shorts, completely for free. No subscriptions. No hidden limits. Try adjusting the speed to 0.90x, select the Ava neural voice, and hit Generate. Let’s make your content sound viral.');
      showToast('Loaded Reels & Shorts template!', 'success');
    } else if (type === 'story') {
      setStoryTitle('The Dead Beacon');
      setStoryText('The old lighthouse had stood silent for three decades. Its iron stairs were rusted, its glass lens shattered. But tonight... a beam of brilliant gold pierced the fog, sweeping across the dark waters. On the shore below, Sarah watched in disbelief, as the long-dead beacon came to life.');
      showToast('Loaded Story Narration template!', 'success');
    } else if (type === 'education') {
      setStoryTitle('Presentation Narration');
      setStoryText('Welcome to the training module on digital workflow optimization. Today, we will discuss how neural speech engines improve user accessibility, by converting written documentation into natural, spoken-word instructions. Please review the system settings on the right panel before continuing.');
      showToast('Loaded Presentation & Education template!', 'success');
    } else if (type === 'bn') {
      setStoryTitle('বাংলা রূপকথা');
      setStoryText('এক যে ছিল রাজা, আর এক যে ছিল রানী। তাদের রাজপ্রাসাদের পাশে ছিল একটি সুন্দর ফুলের বাগান। সেই বাগানে প্রতিদিন সকালবেলা হাজার রকমের পাখি এসে গান গাইত। রাজা প্রতিদিন সকালে উঠে সেই বাগানের পাখিদের মিষ্টি গান শুনে আনন্দিত হতেন। কিন্তু সমস্যা হলো, রানী ফুল পছন্দ করতেন না।');
      showToast('Loaded Bangla story template!', 'success');
    } else if (type === 'hi') {
      setStoryTitle('बुद्धिमान वृद्ध');
      setStoryText('बहुत समय पहले की बात है, एक हरे-भरे जंगल के किनारे एक छोटा सा गाँव था। गाँव के लोग बहुत सीधे-साधे और मेहनती थे। उस गाँव में एक बुद्धिमान वृद्ध रहते थे, जिनकी सलाह लेने के लिए दूर-दूर से लोग आते थे। एक दिन, गाँव पर एक बड़ी आफत आई, जब सभी फसलें अचानक सूख गईं।');
      showToast('Loaded Hindi story template!', 'success');
    }
  };

  const getPlaceholderText = () => {
    if (studioLanguage === 'bn') {
      return '✍️ আপনার গল্প বা ভয়েস ওভারের কথাগুলো এখানে টাইপ বা পেস্ট করুন...';
    }
    if (studioLanguage === 'hi') {
      return '✍️ अपनी कहानी या वॉइसओवर टेक्स्ट यहाँ लिखें या पेस्ट करें...';
    }
    return '✍️ Type or paste your script here... (e.g. story, reel script, documentary narration, or product voiceover)';
  };

  const getLanguageLabel = () => {
    if (studioLanguage === 'bn') return 'BANGLA STUDIO';
    if (studioLanguage === 'hi') return 'HINDI STUDIO';
    return 'ENGLISH STUDIO';
  };



  return (
    <div className="content-body" style={{ animation: 'fadeIn 0.4s ease-out', padding: '1.5rem 1.5rem 120px 1.5rem' }}>
      
      {/* Centered NoteGPT Studio Shell */}
      <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        
        {/* Centered Page Header */}
        <div style={{ textAlign: 'center', padding: '0.75rem 0 1.25rem 0' }}>
          <h1 style={{ 
            fontSize: '2.1rem', 
            fontWeight: '900', 
            letterSpacing: '-0.04em', 
            marginBottom: '0.45rem',
            background: 'linear-gradient(135deg, var(--text-primary) 40%, var(--accent-blue) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span>🎙️ Text to Speech</span>
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '500', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
            Generate studio-grade neural voiceovers in seconds for video, audiobooks, and social media.
          </p>
        </div>

        {/* Text Input Panel */}
        <div>
          {/* Script Section Header Label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', padding: '0 0.25rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>✍️ Enter Your Script</span>
            </div>
            {storyText ? (
              <button 
                onClick={() => setStoryText('')}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                title="Clear text box"
              >
                🗑️ Clear Text
              </button>
            ) : (
              <button 
                onClick={() => handleLoadTemplate('reels')}
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                title="Load sample demo script"
              >
                ✨ Load Sample Script
              </button>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="editor-title-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge-pill badge-pill-blue" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                {getLanguageLabel()}
              </span>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '220px', padding: '0.35rem 0.75rem', fontSize: '0.85rem', fontWeight: '700', borderRadius: '6px' }}
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Name your file (e.g. My Recording)"
              />
            </div>
            
            {/* Formatting Tools */}
            <div className="editor-toolbar" style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', borderRadius: '6px' }} onClick={handleCleanText} title="Cleans script formatting">
                🧹 Clean Text
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', borderRadius: '6px' }} onClick={handleAutoFormatPunctuation} title="Adds punctuation clauses for breath pauses">
                ⏱ Add Pauses
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', borderRadius: '6px' }} onClick={handleSplitPreview} title="Splits narrative text block into multi-row compiler segments">
                ✂ Split into Chunks
              </button>
            </div>
          </div>

          {/* Script Text Area */}
          <div className="form-group" style={{ margin: 0, position: 'relative' }}>
            <textarea
              className="form-input"
              rows={8}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                resize: 'vertical',
                fontSize: '0.94rem',
                color: 'var(--text-primary)',
                padding: '0.25rem 0.5rem',
                fontFamily: 'var(--font-sans)',
                lineHeight: '1.6',
                boxShadow: 'none',
                minHeight: '200px'
              }}
              placeholder={getPlaceholderText()}
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
            />
            
            {/* Sub-card actions (inside the text editor card bottom) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Words: <strong style={{ color: 'var(--text-primary)' }}>{getWordCount(storyText).toLocaleString()}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                {storyText.length.toLocaleString()} / 30,000 chars
              </div>
            </div>
            
            {!storyText && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>💡 Tip: Click inside the box above to write your script, or tap <strong>✨ Load Sample Script</strong> to test instantly!</span>
              </div>
            )}
          </div>
        </div>
      </div>

        <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-surface)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="slider-container" style={{ marginBottom: 0 }}>
              <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>Vocal Speed</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="slider-val" style={{ fontWeight: 'bold' }}>{speed.toFixed(2)}x</span>
                  {speed !== 1.0 && (
                    <button 
                      onClick={() => setSpeed(1.0)} 
                      style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.65rem', cursor: 'pointer', fontWeight: '700', padding: 0 }}
                      title="Reset Speed"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <input 
                type="range" 
                className="slider-input" 
                min="0.25" 
                max="2.0" 
                step="0.05" 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.25rem' }}
              />
            </div>

            <div className="slider-container" style={{ marginBottom: 0 }}>
              <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>Vocal Pitch</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="slider-val" style={{ fontWeight: 'bold' }}>{pitch}</span>
                  {pitch !== '+0Hz' && (
                    <button 
                      onClick={() => setPitch('+0Hz')} 
                      style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.65rem', cursor: 'pointer', fontWeight: '700', padding: 0 }}
                      title="Reset Pitch"
                    >
                      Reset
                    </button>
                  )}
                </div>
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
                style={{ width: '100%', marginTop: '0.25rem' }}
              />

            </div>
          </div>

          <div style={{ marginTop: '0.25rem' }}>
            <AudioEngine
              storyTitle={storyTitle}
              storyText={storyText}
              provider={provider}
              voice={voice}
              speed={speed}
              pitch={pitch}
              stability={stability}
              similarity={similarity}
              openaiKey={openaiKey}
              elevenlabsKey={elevenlabsKey}
              charLimit={charLimit}
              showToast={showToast}
              backendUrl={backendUrl}
              onGenerationComplete={onGenerationComplete}
            />
          </div>
        </div>

        {/* Voice Selection Cards Grid (Scrollable sidewise) */}
        <div style={{ marginTop: '0.5rem', width: '100%' }}>
          <div className="form-label" style={{ marginBottom: '0.65rem', fontWeight: '800', fontSize: '0.86rem', color: 'var(--text-primary)', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Choose Narrator Voice</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-blue)', fontWeight: '600', opacity: 0.85 }}>Swipe ↔</span>
          </div>
          <div 
            ref={voiceScrollRef}
            className="no-scrollbar"
            style={{ 
              display: 'flex', 
              overflowX: 'auto', 
              gap: '0.75rem', 
              width: '100%', 
              paddingBottom: '0.75rem',
              paddingTop: '0.25rem',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {(ALL_STUDIO_VOICES[studioLanguage] || []).map((v) => {
              const isSelected = voice === v.id;
              const isCurrentPreview = previewingVoiceId === v.id;
              
              return (
                <div 
                  key={v.id}
                  className={`glass-panel ${isSelected ? 'selected' : ''}`}
                  onClick={() => setVoice(v.id)}
                  style={{ 
                    padding: '1rem', 
                    cursor: 'pointer', 
                    background: isSelected ? 'var(--accent-blue-dim)' : 'var(--bg-surface)', 
                    border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)', 
                    borderRadius: '12px',
                    transition: 'all 0.2s ease', 
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '110px',
                    width: '185px',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.25)' : 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                  onMouseOut={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; } }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.2rem' }}>
                      {v.description.split('.')[0] || v.description}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', zIndex: 2 }}>
                    <span style={{ 
                      fontSize: '0.62rem', 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '4px', 
                      background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.03)', 
                      color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)', 
                      fontWeight: 'bold',
                      border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)'
                    }}>
                      {v.badge}
                    </span>
                    
                    {/* Preview Audio Circle Button */}
                    <button
                      className={`player-btn-sec preview-btn ${isCurrentPreview ? 'active' : ''}`}
                      onClick={(e) => handlePreviewVoice(e, v.id)}
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: isCurrentPreview ? 'var(--accent-blue)' : 'var(--border-color)', 
                        color: isCurrentPreview ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Preview Voice Artist"
                    >
                      {isCurrentPreview && previewLoading ? (
                        <div className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1.2px', borderTopColor: '#fff', animationDuration: '0.6s' }} />
                      ) : isCurrentPreview ? (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>



        {/* Bottom Brand footer inside centered shell */}
        <div style={{ marginTop: '1.5rem', opacity: 0.8 }}>
          <BrandingFooter />
        </div>

      </div>
    </div>
  );
}
