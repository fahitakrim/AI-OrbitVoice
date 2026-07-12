import React, { useState } from 'react';
import TTSConfig from './TTSConfig';
import OtherLangTTSConfig from './OtherLangTTSConfig';
import AudioEngine from './AudioEngine';

const getWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const getCharCount = (text) => {
  if (!text) return 0;
  return text.length;
};

// Reusable Branding Footer Component
export function BrandingFooter({ showToast }) {
  const handleCopy = (num, type) => {
    navigator.clipboard.writeText(num);
    if (showToast) showToast(`${type} number copied to clipboard!`, 'success');
  };

  return (
    <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div style={{ flex: '1 1 280px' }}>
          <div>
            © 2026 <strong style={{ color: 'var(--text-primary)' }}>AI VoiceOrbit</strong>. Built by <strong style={{ color: 'var(--text-primary)' }}>Fahim Takrim</strong>.
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Part of Orbit Apps — tools for learning, creativity, and everyday productivity.
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            AI VoiceOrbit is free for early users. If this tool helps you, you can support future development.
          </div>
        </div>
        
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
            Support development:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
              <span style={{ fontWeight: '800', color: '#d11172', fontSize: '0.72rem' }}>bKash:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>01980107980</span>
              <button 
                onClick={() => handleCopy('01980107980', 'bKash')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.1rem' }}
                title="Copy Number"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
              <span style={{ fontWeight: '800', color: '#e65100', fontSize: '0.72rem' }}>Nagad:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>01334205845</span>
              <button 
                onClick={() => handleCopy('01334205845', 'Nagad')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.1rem' }}
                title="Copy Number"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
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
  geminiKey,
  
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
  openaiKey,
  elevenlabsKey,
  onGenerationComplete
}) {
  const [prompt, setPrompt] = useState('');
  const [generatingStory, setGeneratingStory] = useState(false);

  const handleGenerateStory = async () => {
    if (!prompt || prompt.trim() === '') {
      showToast('Please enter a topic or prompt for your story.', 'error');
      return;
    }
    if (!geminiKey) {
      showToast('Gemini API Key is missing. Please set it in Settings to write stories.', 'error');
      return;
    }

    setGeneratingStory(true);
    try {
      let finalPrompt = prompt;
      if (studioLanguage !== 'en') {
        const langName = studioLanguage === 'bn' ? 'Bengali (Bangla)' : 'Hindi';
        finalPrompt = `You are a master storyteller. Write an engaging, vivid narrative story in ${langName} based on the user's prompt: "${prompt}".
The story should be detailed (around 500-800 words) and optimized for reading aloud as an audio voiceover.
CRITICAL: Write only the narrative story text. Do NOT write any titles, chapter headings, English translations, or wrap in markdown styling. Start writing the story content directly in the chosen language.`;
      }

      const response = await fetch(`${backendUrl}/api/generate-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          customApiKey: geminiKey
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate story');

      setStoryText(data.story);
      showToast('New story generated and loaded to canvas!', 'success');
      setPrompt('');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setGeneratingStory(false);
    }
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
      return 'গল্পটি এখানে লিখুন বা পেস্ট করুন... The system will compile it into a single MP3 voiceover!';
    }
    if (studioLanguage === 'hi') {
      return 'अपनी कहानी यहाँ लिखें या पेस्ट करें... The system will compile it into a single MP3 voiceover!';
    }
    return 'Paste your story, reel script, documentary narration, or product voiceover here...';
  };

  const getLanguageLabel = () => {
    if (studioLanguage === 'bn') return 'BANGLA STUDIO';
    if (studioLanguage === 'hi') return 'HINDI STUDIO';
    return 'ENGLISH STUDIO';
  };

  return (
    <div className="content-body" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Left Workspace Column: Script Editor & Main Action Trigger */}
      <div className="col-right">
        {/* Top Status and Project Input bar */}
        <div className="glass-panel" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge-pill badge-pill-blue" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                {getLanguageLabel()}
              </span>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '250px', padding: '0.35rem 0.75rem', fontSize: '0.85rem', fontWeight: '700', borderRadius: '6px' }}
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Recording Title (e.g. Episode 1)"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              <span>Chunks: <strong style={{ color: 'var(--text-primary)' }}>{Math.max(1, Math.ceil(storyText.length / 3000))}</strong></span>
              <span>Estimated Duration: <strong style={{ color: 'var(--accent-blue)' }}>{Math.round(getWordCount(storyText) * (studioLanguage === 'en' ? 0.4 : 0.45))}s</strong></span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* Canvas Formatting Helper Toolbar (Positioned at the top of the editor card) */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '9999px' }}
              onClick={handleCleanText}
              title="Fix double spacing and normalize whitespace"
            >
              Clean Text
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '9999px' }}
              onClick={handleAutoFormatPunctuation}
              title="Adds commas and ellipses at natural breaks to make the voice sound highly realistic"
            >
              Add Pauses
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '9999px' }}
              onClick={handleSplitPreview}
              title="Preview how many audio segments this script will create"
            >
              Split into Chunks
            </button>
            
            <button 
              className="btn btn-danger" 
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '9999px', marginLeft: 'auto' }}
              onClick={() => {
                if (window.confirm('Are you sure you want to clear the canvas text?')) {
                  setStoryText('');
                }
              }}
            >
              Clear
            </button>
          </div>

          {/* Editor Canvas Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', marginTop: '1rem', height: '0' }}>
            {storyText === '' && (
              <div className="use-case-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', border: '1px dashed var(--border-color)', margin: '1rem 0', borderRadius: '12px', textAlign: 'center', background: 'var(--bg-base)' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Select a Studio Template to Begin
                </div>
                
                {studioLanguage === 'en' ? (
                  <>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
                      Click a template below to load a sample script text optimized for speech compilation.
                    </p>
                    <div className="use-case-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <div className="use-case-card" onClick={() => handleLoadTemplate('reels')} style={{ padding: '1.1rem 0.85rem', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: 'var(--bg-surface)', transition: 'all 0.25s ease', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>🎬 REELS & SHORTS</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Quick pacing, high hooks. Perfect for social.</div>
                      </div>
                      <div className="use-case-card" onClick={() => handleLoadTemplate('story')} style={{ padding: '1.1rem 0.85rem', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: 'var(--bg-surface)', transition: 'all 0.25s ease', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>📖 NARRATIVE STORY</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Dramatic pacing. Ideal for audiobooks.</div>
                      </div>
                      <div className="use-case-card" onClick={() => handleLoadTemplate('education')} style={{ padding: '1.1rem 0.85rem', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: 'var(--bg-surface)', transition: 'all 0.25s ease', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>🎓 PRESENTATION</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Clear speech pacing. Best for tutorials.</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
                      Click a template below to load a sample script in {studioLanguage === 'bn' ? 'Bangla' : 'Hindi'} optimized with natural Indic breath markers.
                    </p>
                    <div className="use-case-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginTop: '0.5rem', maxWidth: '300px', margin: '0.5rem auto 0 auto' }}>
                      {studioLanguage === 'bn' ? (
                        <div className="use-case-card" onClick={() => handleLoadTemplate('bn')} style={{ padding: '1.1rem 0.85rem', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: 'var(--bg-surface)', transition: 'all 0.25s ease', textAlign: 'left' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>🇧🇩 BANGLA TEMPLATE</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Bengali narrative script. Recommended for NabanitaNeural.</div>
                        </div>
                      ) : (
                        <div className="use-case-card" onClick={() => handleLoadTemplate('hi')} style={{ padding: '1.1rem 0.85rem', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: 'var(--bg-surface)', transition: 'all 0.25s ease', textAlign: 'left' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>🇮🇳 HINDI TEMPLATE</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Hindi narrative script. Recommended for SwaraNeural.</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            <textarea 
              className="form-textarea"
              style={{ flex: 1, height: '100%', fontSize: '0.94rem', lineHeight: '1.7', background: 'transparent', border: 'none', padding: '0.25rem 0', overflowY: 'auto', outline: 'none', resize: 'none', color: 'var(--text-primary)' }}
              placeholder={getPlaceholderText()}
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '1.25rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span>Words: <strong>{getWordCount(storyText)}</strong></span>
              <span>Characters: <strong style={{ color: storyText.length > charLimit ? 'var(--accent-danger)' : 'inherit' }}>{getCharCount(storyText)} / {charLimit}</strong></span>
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.8, textAlign: 'right' }}>
              <div>Tip: Use commas, periods, and ellipses (...) for natural pauses. Bracket pause markers are automatically cleaned.</div>
              <div style={{ marginTop: '0.15rem', opacity: 0.7 }}>* Splits script by paragraphs to compile long recordings safely</div>
            </div>
          </div>
        </div>

        {/* Generate Voiceover Compilation Engine (Now placed directly under the text editor!) */}
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

        {/* Branding & Support Footer */}
        <BrandingFooter showToast={showToast} />
      </div>

      {/* Right Column: Voice Settings Control Panel Only */}
      <div className="col-left">
        {studioLanguage === 'en' ? (
          <TTSConfig
            provider={provider}
            setProvider={setProvider}
            voice={voice}
            setVoice={setVoice}
            speed={speed}
            setSpeed={setSpeed}
            pitch={pitch}
            setPitch={setPitch}
            stability={stability}
            setStability={setStability}
            similarity={similarity}
            setSimilarity={setSimilarity}
            openaiKey={openaiKey}
            elevenlabsKey={elevenlabsKey}
            showToast={showToast}
            backendUrl={backendUrl}
          />
        ) : (
          <OtherLangTTSConfig
            studioLanguage={studioLanguage}
            provider={provider}
            setProvider={setProvider}
            voice={voice}
            setVoice={setVoice}
            speed={speed}
            setSpeed={setSpeed}
            pitch={pitch}
            setPitch={setPitch}
            stability={stability}
            setStability={setStability}
            similarity={similarity}
            setSimilarity={setSimilarity}
            openaiKey={openaiKey}
            elevenlabsKey={elevenlabsKey}
            showToast={showToast}
            backendUrl={backendUrl}
          />
        )}
      </div>

    </div>
  );
}
