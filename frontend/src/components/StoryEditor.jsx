import React, { useState } from 'react';
import AudioEngine from './AudioEngine';
import HistoryList from './HistoryList';

const getWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const getCharCount = (text) => {
  if (!text) return 0;
  return text.length;
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
      return 'গল্পটি এখানে লিখুন বা পেস্ট করুন...';
    }
    if (studioLanguage === 'hi') {
      return 'अपनी कहानी यहाँ लिखें या पेस्ट करें...';
    }
    return 'Paste your story, reel script, documentary narration, or product voiceover here...';
  };

  const getLanguageLabel = () => {
    if (studioLanguage === 'bn') return 'BANGLA STUDIO';
    if (studioLanguage === 'hi') return 'HINDI STUDIO';
    return 'ENGLISH STUDIO';
  };



  return (
    <div className="content-body" style={{ animation: 'fadeIn 0.4s ease-out', height: 'auto', overflowY: 'auto', padding: '1.5rem 1.5rem 120px 1.5rem' }}>
      


      {/* Centered NoteGPT Studio Shell */}
      <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        
        {/* Centered Page Header */}
        <div style={{ textAlign: 'center', padding: '1rem 0 1.75rem 0' }}>
          <h1 style={{ fontSize: '2.1rem', fontWeight: '900', letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '0.55rem' }}>
            Text to Speech
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
            Create natural, emotional speech in seconds for commercial use to help you earn.
          </p>
        </div>

        {/* Text Input Panel */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                {storyText.length.toLocaleString()} / 30,000 chars
              </div>
            </div>
          </div>
        </div>

        {/* Generate Voiceover Compilation CTA Button */}
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

        {/* Examples Grid (NoteGPT-style actions cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '1.25rem', width: '100%' }}>
          <div 
            className="glass-panel" 
            onClick={() => handleLoadTemplate('reels')} 
            style={{ 
              padding: '1rem', 
              cursor: 'pointer', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px',
              transition: 'all 0.2s ease', 
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '105px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              [Example] How Earthquakes Form
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                Course
              </span>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--accent-blue)" style={{ marginLeft: '1px' }}>
                  <polygon points="6 4 18 12 6 20" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className="glass-panel" 
            onClick={() => handleLoadTemplate('story')} 
            style={{ 
              padding: '1rem', 
              cursor: 'pointer', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px',
              transition: 'all 0.2s ease', 
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '105px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-violet)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              [Example] The Boy Who Collected Clouds
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-violet)', fontWeight: 'bold' }}>
                Audiobook
              </span>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--accent-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--accent-violet)" style={{ marginLeft: '1px' }}>
                  <polygon points="6 4 18 12 6 20" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className="glass-panel" 
            onClick={() => handleLoadTemplate('education')} 
            style={{ 
              padding: '1rem', 
              cursor: 'pointer', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px',
              transition: 'all 0.2s ease', 
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '105px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-green)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              [Example] Why We Always Forget Dreams
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                Dubbing
              </span>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--accent-green)" style={{ marginLeft: '1px' }}>
                  <polygon points="6 4 18 12 6 20" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className="glass-panel" 
            onClick={() => handleLoadTemplate(studioLanguage === 'bn' ? 'bn' : (studioLanguage === 'hi' ? 'hi' : 'reels'))} 
            style={{ 
              padding: '1rem', 
              cursor: 'pointer', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px',
              transition: 'all 0.2s ease', 
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '105px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-yellow)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              [Example] Newton and the Apple
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-yellow)', fontWeight: 'bold' }}>
                Storytelling
              </span>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--accent-yellow)" style={{ marginLeft: '1px' }}>
                  <polygon points="6 4 18 12 6 20" />
                </svg>
              </div>
            </div>
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
