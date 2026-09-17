import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const preprocessTtsText = (text) => {
  if (!text) return '';
  
  let cleaned = text;
  
  // 1. Convert supported bracket pause markers into natural punctuation/spacing
  cleaned = cleaned.replace(/\[pause\]/gi, ' ... ');
  cleaned = cleaned.replace(/\[medium pause\]/gi, ' ... ');
  cleaned = cleaned.replace(/\[long pause\]/gi, ' . . . ');
  cleaned = cleaned.replace(/\[pause:500ms\]/gi, ' ... ');
  cleaned = cleaned.replace(/\[pause:1s\]/gi, ' . . . ');
  cleaned = cleaned.replace(/\[short pause\]/gi, ' , ');
  cleaned = cleaned.replace(/\[pause:300ms\]/gi, ' , ');

  // 2. Remove any other bracket tags like [whisper], [excited], [angry], [dramatic pause]
  cleaned = cleaned.replace(/\[[^\]]+\]/g, ' ');

  // 3. Clean up multiple horizontal spaces (preserving paragraph lines)
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  return cleaned;
};

export default function AudioEngine({ 
  storyTitle, 
  storyText, 
  provider, 
  voice, 
  speed, 
  pitch,
  stability, 
  similarity, 
  openaiKey, 
  elevenlabsKey, 
  charLimit,
  showToast,
  backendUrl,
  onGenerationComplete
}) {
  const [synthesisQueue, setSynthesisQueue] = useState([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedAudioUrl, setMergedAudioUrl] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState('');
  const [compilerStep, setCompilerStep] = useState(0); // 0: idle, 1: prep, 2: split, 3: gen, 4: merge, 5: done
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerDismissed, setIsPlayerDismissed] = useState(false);
  
  const audioRef = useRef(null);
  const timelineRef = useRef(null);

  const compileStoryIntoChunks = () => {
    const allChunks = [];
    if (!storyText || storyText.trim() === '') return [];
    
    // Preprocess the text to resolve pause brackets and strip unsupported brackets
    const cleanedStoryText = preprocessTtsText(storyText);
    
    const paragraphs = cleanedStoryText.split('\n').filter(p => p.trim() !== '');
    let currentChunkText = '';
    let subIndex = 1;
    let chunkIndex = 0;

    paragraphs.forEach((p) => {
      if ((currentChunkText + '\n' + p).length > 3000) {
        if (currentChunkText) {
          allChunks.push({
            index: chunkIndex++,
            title: `Segment ${subIndex++}`,
            text: currentChunkText.trim(),
            status: 'waiting'
          });
        }
        currentChunkText = p;
      } else {
        currentChunkText = currentChunkText ? (currentChunkText + '\n' + p) : p;
      }
    });

    if (currentChunkText) {
      allChunks.push({
        index: chunkIndex++,
        title: subIndex > 1 ? `Segment ${subIndex}` : 'Narrative Audio',
        text: currentChunkText.trim(),
        status: 'waiting'
      });
    }

    return allChunks;
  };

  const startSynthesis = async () => {
    if (storyText && storyText.length > charLimit) {
      showToast(`Text length (${storyText.length.toLocaleString()}) exceeds the limit of ${charLimit.toLocaleString()} characters.`, 'error');
      return;
    }

    setCompilerStep(1); // Preparing text
    setProgress(5);
    await new Promise(r => setTimeout(r, 400));

    setCompilerStep(2); // Splitting chunks
    const chunks = compileStoryIntoChunks();
    setProgress(15);
    await new Promise(r => setTimeout(r, 400));
    
    if (chunks.length === 0) {
      showToast('Please make sure you have generated or written story content.', 'error');
      setCompilerStep(0);
      return;
    }

    if (provider === 'openai' && !openaiKey) {
      showToast('OpenAI API Key is missing. Please set it in Settings.', 'error');
      setCompilerStep(0);
      return;
    }
    if (provider === 'elevenlabs' && !elevenlabsKey) {
      showToast('ElevenLabs API Key is missing. Please set it in Settings.', 'error');
      setCompilerStep(0);
      return;
    }

    const projectId = `project_${Date.now()}`;
    setCurrentProjectId(projectId);
    setSynthesisQueue(chunks);
    setIsSynthesizing(true);
    setMergedAudioUrl('');
    setIsPlaying(false);

    setCompilerStep(3); // Generating chunks

    const activeKey = provider === 'openai' ? openaiKey : (provider === 'elevenlabs' ? elevenlabsKey : '');
    const settings = provider === 'openai' ? { speed } : (provider === 'elevenlabs' ? { stability, similarity_boost: similarity } : { speed, pitch });

    let successCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      setSynthesisQueue(prev => prev.map((c, idx) => idx === i ? { ...c, status: 'active' } : c));
      
      try {
        const response = await fetch(`${backendUrl}/api/synthesize-chunk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            text: chunks[i].text,
            voice,
            settings,
            apiKey: activeKey,
            projectId,
            chunkIndex: i
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Failed to synthesize chunk ${i + 1}`);

        setSynthesisQueue(prev => prev.map((c, idx) => idx === i ? { ...c, status: 'done' } : c));
        successCount++;
        setProgress(Math.round(15 + ((i + 1) / chunks.length) * 70));

      } catch (error) {
        console.error(error);
        setSynthesisQueue(prev => prev.map((c, idx) => idx === i ? { ...c, status: 'error' } : c));
        showToast(error.message, 'error');
        setIsSynthesizing(false);
        return;
      }
    }

    if (successCount === chunks.length) {
      await triggerAudioMerge(projectId, chunks);
    }
  };

  const retryChunk = async (index) => {
    setSynthesisQueue(prev => prev.map((c, idx) => idx === index ? { ...c, status: 'active' } : c));
    
    const projectId = currentProjectId || `project_${Date.now()}`;
    const activeKey = provider === 'openai' ? openaiKey : (provider === 'elevenlabs' ? elevenlabsKey : '');
    const settings = provider === 'openai' ? { speed } : (provider === 'elevenlabs' ? { stability, similarity_boost: similarity } : { speed, pitch });

    try {
      const response = await fetch(`${backendUrl}/api/synthesize-chunk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          text: synthesisQueue[index].text,
          voice,
          settings,
          apiKey: activeKey,
          projectId,
          chunkIndex: index
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Failed to synthesize chunk ${index + 1}`);

      setSynthesisQueue(prev => {
        const next = prev.map((c, idx) => idx === index ? { ...c, status: 'done' } : c);
        const successCount = next.filter(c => c.status === 'done').length;
        setProgress(Math.round(15 + (successCount / next.length) * 70));
        
        if (next.every(c => c.status === 'done')) {
          triggerAudioMerge(projectId, next);
        }
        return next;
      });
      showToast(`Segment ${index + 1} synthesized successfully!`, 'success');

    } catch (error) {
      console.error(error);
      setSynthesisQueue(prev => prev.map((c, idx) => idx === index ? { ...c, status: 'error' } : c));
      showToast(error.message, 'error');
    }
  };

  const triggerAudioMerge = async (projectId, currentQueue) => {
    try {
      setCompilerStep(4); // Merging audio
      setProgress(90);
      showToast('All segments synthesized! Merging master audio...', 'success');
      
      const response = await fetch(`${backendUrl}/api/merge-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title: storyTitle || 'Untitled Story',
          chapters: [{ title: 'Full Voiceover', content: storyText }],
          provider,
          voice
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to merge audio segments');

      setMergedAudioUrl(`${backendUrl}${data.audioUrl}`);
      setIsPlayerDismissed(false);
      setCompilerStep(5); // Completed
      setProgress(100);
      showToast('Audio compilation successful!', 'success');
      
      if (onGenerationComplete) onGenerationComplete();
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Audio play error:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, mergedAudioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimelineClick = (e) => {
    if (timelineRef.current && audioRef.current && duration > 0) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyAudioUrl = async () => {
    try {
      if (!mergedAudioUrl) return;
      await navigator.clipboard.writeText(mergedAudioUrl);
      showToast('Audio URL copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy audio URL', 'error');
    }
  };

  const timelineProgress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const visualizerBars = Array.from({ length: 28 }, (_, i) => i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Generate Voiceover Primary Trigger */}
      <div>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.7rem 1.15rem', fontSize: '0.88rem', fontWeight: '700', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          onClick={startSynthesis}
          disabled={isSynthesizing}
        >
          {/* Spark/Play Vector Hybrid */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '0.2rem' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
          </svg>
          {isSynthesizing ? 'Compiling script...' : 'Generate Voiceover'}
        </button>

        {/* Compiler queue display */}
        {compilerStep > 0 && (
          <div style={{ marginTop: '1.1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.45rem', fontWeight: '600' }}>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                {compilerStep === 1 && 'PREPARING SCRIPT TEXT...'}
                {compilerStep === 2 && 'SPLITTING CHUNKS...'}
                {compilerStep === 3 && `COMPILING SEGM. (${synthesisQueue.filter(c => c.status === 'done').length}/${synthesisQueue.length})`}
                {compilerStep === 4 && 'MERGING MASTER FILES...'}
                {compilerStep === 5 && 'COMPILATION DONE'}
              </span>
              <span>{progress}%</span>
            </div>
            
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="queue-container" style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '0.75rem' }}>
              {synthesisQueue.map((item, idx) => (
                <div key={idx} className={`queue-item ${item.status}`} style={{ padding: '0.3rem 0.5rem', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="queue-item-info">
                    <div className="queue-indicator" style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.status === 'done' ? 'var(--accent-green)' : item.status === 'active' ? 'var(--accent-blue)' : item.status === 'error' ? 'var(--accent-danger)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.76rem', color: item.status === 'active' ? 'var(--accent-blue)' : 'var(--text-primary)', fontWeight: '500', marginLeft: '0.2rem' }}>{item.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.72rem', color: item.status === 'done' ? 'var(--accent-green)' : item.status === 'active' ? 'var(--accent-blue)' : item.status === 'error' ? 'var(--accent-danger)' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                      {item.status === 'waiting' && 'waiting'}
                      {item.status === 'active' && 'active'}
                      {item.status === 'done' && 'ready'}
                      {item.status === 'error' && 'failed'}
                    </span>
                    {item.status === 'error' && (
                      <button 
                        onClick={() => retryChunk(idx)}
                        style={{ background: '#fff', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', fontSize: '0.62rem', padding: '0.1rem 0.35rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        RETRY
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Merged master audio player popup mounted directly to document.body */}
      {mergedAudioUrl && !isPlayerDismissed && typeof document !== 'undefined' && createPortal(
        <div className="audio-player-container audio-player-popup">
          <audio 
            ref={audioRef} 
            src={mergedAudioUrl} 
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="player-inner-wrapper">
            
            {/* Left: Visualizer & Track Info */}
            <div className="player-info-group">
              <div className="player-section-visualizer">
                <div className={`visualizer-bars ${isPlaying ? 'playing' : ''}`} style={{ height: '18px', width: '100%' }}>
                  {visualizerBars.slice(0, 12).map((b) => (
                    <div 
                      key={b} 
                      className="visualizer-bar" 
                      style={{ 
                        width: '2px',
                        height: isPlaying ? undefined : '3px',
                        background: 'var(--accent-blue)',
                        animationDelay: `${Math.random() * 0.4}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="player-text-meta">
                <div className="player-title" title={storyTitle || 'My Audio'}>
                  {storyTitle || 'My Audio'}
                </div>
                <div className="player-subtitle">
                  {voice.replace('Neural', '').replace('Multilingual', '')}
                </div>
              </div>
            </div>

            {/* Center: Play button & Timeline */}
            <div className="player-center-group">
              <button 
                type="button"
                className="player-btn-circle" 
                onClick={togglePlay}
                style={{ width: '34px', height: '34px', flexShrink: 0 }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" style={{ color: '#fff' }}>
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" style={{ color: '#fff', marginLeft: '2px' }}>
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                  </svg>
                )}
              </button>

              <div className="audio-timeline-container">
                <span className="audio-time">{formatTime(currentTime)}</span>
                <div 
                  ref={timelineRef} 
                  className="audio-timeline" 
                  onClick={handleTimelineClick}
                >
                  <div className="audio-timeline-fill" style={{ width: `${timelineProgress}%` }} />
                </div>
                <span className="audio-time">{formatTime(duration)}</span>
              </div>

              <button 
                type="button"
                className="player-btn-sec" 
                onClick={toggleMute} 
                style={{ width: '24px', height: '24px', flexShrink: 0 }}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <line x1="22" x2="16" y1="9" y2="15" />
                    <line x1="16" x2="22" y1="9" y2="15" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>

              <select 
                className="form-select player-speed-select" 
                onChange={(e) => {
                  if (audioRef.current) {
                    audioRef.current.playbackRate = Number(e.target.value);
                  }
                }}
                defaultValue="1.0"
                title="Playback Speed"
              >
                <option value="0.75">0.75x</option>
                <option value="1.0">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2.0">2.0x</option>
              </select>
            </div>

            {/* Right: Actions & Close */}
            <div className="player-actions-group">
              <button
                type="button"
                onClick={handleCopyAudioUrl}
                className="btn btn-secondary player-action-btn"
                title="Copy audio URL"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy Link</span>
              </button>

              <a 
                href={mergedAudioUrl} 
                download={`${(storyTitle || 'narration').trim().replace(/[^a-zA-Z0-9_\-\u0980-\u09FF\u0900-\u097F]/g, '_')}_master.mp3`}
                className="btn btn-primary player-action-btn"
                title="Export MP3 File"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export MP3</span>
              </a>

              <button
                type="button"
                onClick={() => setIsPlayerDismissed(true)}
                className="player-close-btn"
                title="Close Player"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
