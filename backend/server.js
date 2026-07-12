const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { EdgeTTS } = require('edge-tts-universal');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ai-orbitvoice.netlify.app'
  ],
  credentials: true
}));
// Parse JSON request bodies up to 10MB (for long stories)
app.use(express.json({ limit: '10mb' }));

// Directories setup
const HISTORY_DIR = path.join(__dirname, 'history');
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

// Serve static files from history directory
app.use('/history', express.static(HISTORY_DIR));

// Background Interval: Clean up folders older than 5 minutes every 60 seconds
setInterval(() => {
  try {
    if (!fs.existsSync(HISTORY_DIR)) return;
    const now = Date.now();
    const maxAgeMs = 5 * 60 * 1000; // 5 minutes

    const items = fs.readdirSync(HISTORY_DIR);
    for (const item of items) {
      const itemPath = path.join(HISTORY_DIR, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        const ageMs = now - stat.mtimeMs;
        if (ageMs > maxAgeMs) {
          console.log(`[Auto Cleanup] Deleting expired project folder: ${item} (Age: ${Math.round(ageMs / 1000)}s)`);
          fs.rmSync(itemPath, { recursive: true, force: true });
        }
      }
    }
  } catch (error) {
    console.error('[Auto Cleanup] Error running folder cleanup interval:', error.message);
  }
}, 60 * 1000);

// FIFO Limit: Ensure only up to 10 project directories exist
function enforceHistoryLimit(excludeProjectId) {
  try {
    if (!fs.existsSync(HISTORY_DIR)) return;
    
    const dirs = fs.readdirSync(HISTORY_DIR)
      .map(name => {
        const fullPath = path.join(HISTORY_DIR, name);
        return {
          name,
          fullPath,
          stat: fs.statSync(fullPath)
        };
      })
      .filter(item => item.stat.isDirectory() && item.name !== excludeProjectId);

    if (dirs.length >= 9) { // If there are already 9 other folders, free space for the 10th one
      dirs.sort((a, b) => a.stat.mtimeMs - b.stat.mtimeMs);
      const countToDelete = dirs.length - 8;
      for (let i = 0; i < countToDelete; i++) {
        console.log(`[FIFO Limit] Exceeded project cap. Deleting oldest project folder: ${dirs[i].name}`);
        fs.rmSync(dirs[i].fullPath, { recursive: true, force: true });
      }
    }
  } catch (error) {
    console.error('[FIFO Limit] Error enforcing folder limit:', error.message);
  }
}

// Helper: Make sure project directories exist
function getProjectDirs(projectId) {
  const projDir = path.join(HISTORY_DIR, projectId);
  const chunksDir = path.join(projDir, 'chunks');
  
  if (!fs.existsSync(projDir)) {
    enforceHistoryLimit(projectId);
    fs.mkdirSync(projDir, { recursive: true });
  }
  
  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }
  
  return { projDir, chunksDir };
}

// ==========================================
// 1. STORY GENERATION (GEMINI PROXY)
// ==========================================

app.post('/api/generate-story-outline', async (req, res) => {
  const { prompt, genre, chaptersCount, customApiKey } = req.body;
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is missing. Please set it in Settings or backend .env file.' });
  }

  try {
    const instructions = `You are an expert story planner. Generate a detailed chapter outline for a story based on the prompt: "${prompt}".
The story genre is "${genre}".
Return a JSON list of objects representing the chapters. Each object must have:
- "chapterNumber": number (starting from 1)
- "title": string (engaging chapter title)
- "summary": string (brief description of the narrative details in this chapter)

Return exactly ${chaptersCount || 3} chapters. Return ONLY the raw JSON array. Do not wrap in markdown code blocks like \`\`\`json or add explanations.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: instructions }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }
    );

    const resultText = response.data.candidates[0].content.parts[0].text;
    const chapters = JSON.parse(resultText.trim());
    
    res.json({ chapters });
  } catch (error) {
    console.error('Outline generation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate story outline. ' + (error.response?.data?.error?.message || error.message) });
  }
});

app.post('/api/generate-chapter', async (req, res) => {
  const { prompt, genre, chapterNumber, chapterTitle, chapterSummary, previousChaptersContext, customApiKey } = req.body;
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is missing.' });
  }

  try {
    let contextStr = '';
    if (previousChaptersContext && previousChaptersContext.length > 0) {
      contextStr = `Here is the context or summary of the previous chapters for continuity:
${previousChaptersContext.map(c => `Chapter ${c.chapterNumber}: ${c.title} - ${c.summary}`).join('\n')}`;
    }

    const instructions = `You are a master storyteller. Write Chapter ${chapterNumber} of a story.
Overall Story Concept: "${prompt}"
Genre: "${genre}"
Chapter Title: "${chapterTitle}"
Chapter Goal/Summary: "${chapterSummary}"

${contextStr}

Write the chapter narrative in full detail (around 500-1000 words). The language should be highly engaging, immersive, and vivid, optimized to be read aloud as a voiceover.
CRITICAL: Do NOT include any meta-text, markdown headers like "# Chapter ${chapterNumber}", or formatting tags. Start writing the story content directly.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: instructions }]
        }]
      }
    );

    const chapterContent = response.data.candidates[0].content.parts[0].text;
    res.json({ content: chapterContent.trim() });
  } catch (error) {
    console.error('Chapter generation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate chapter. ' + (error.response?.data?.error?.message || error.message) });
  }
});

app.post('/api/generate-story', async (req, res) => {
  const { prompt, customApiKey } = req.body;
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ error: 'Please enter a prompt to generate a story.' });
  }

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is missing. Please set it in Settings.' });
  }

  try {
    const instructions = `You are a master storyteller. Write an engaging, vivid narrative story based on the prompt: "${prompt}".
The story should be detailed (around 500-800 words) and optimized for reading aloud as an audio voiceover.
CRITICAL: Write only the narrative text. Do NOT write any titles, chapter headings (like "Chapter 1"), metadata, or wrap in markdown styling. Start writing the story directly.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: instructions }]
        }]
      }
    );

    const storyContent = response.data.candidates[0].content.parts[0].text;
    res.json({ story: storyContent.trim() });
  } catch (error) {
    console.error('Story generation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate story. ' + (error.response?.data?.error?.message || error.message) });
  }
});

// ==========================================
// 2. TEXT-TO-SPEECH (TTS PROXY)
// ==========================================

app.post('/api/synthesize-chunk', async (req, res) => {
  const { provider, text, voice, settings, apiKey, projectId, chunkIndex } = req.body;
  
  if (!text || !voice || !projectId || chunkIndex === undefined) {
    return res.status(400).json({ error: 'Missing required parameters: text, voice, projectId, chunkIndex' });
  }

  const { chunksDir } = getProjectDirs(projectId);
  const chunkFileName = `chunk_${String(chunkIndex).padStart(4, '0')}.mp3`;
  const chunkFilePath = path.join(chunksDir, chunkFileName);

  try {
    let audioBuffer;

    if (provider === 'openai') {
      const oaiKey = apiKey || process.env.OPENAI_API_KEY;
      if (!oaiKey) {
        return res.status(400).json({ error: 'OpenAI API Key is missing. Please configure it in settings.' });
      }

      console.log(`[OpenAI TTS] Synthesizing chunk ${chunkIndex} for project ${projectId}...`);
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          model: 'tts-1',
          input: text,
          voice: voice,
          speed: settings?.speed || 1.0
        },
        {
          headers: {
            'Authorization': `Bearer ${oaiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );
      audioBuffer = Buffer.from(response.data);

    } else if (provider === 'elevenlabs') {
      const elKey = apiKey || process.env.ELEVENLABS_API_KEY;
      if (!elKey) {
        return res.status(400).json({ error: 'ElevenLabs API Key is missing. Please configure it in settings.' });
      }

      console.log(`[ElevenLabs TTS] Synthesizing chunk ${chunkIndex} for project ${projectId}...`);
      const voiceId = voice; // Eleventh voice ID
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: settings?.stability !== undefined ? settings.stability : 0.5,
            similarity_boost: settings?.similarity_boost !== undefined ? settings.similarity_boost : 0.75
          }
        },
        {
          headers: {
            'xi-api-key': elKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );
      audioBuffer = Buffer.from(response.data);
    } else if (provider === 'edge') {
      let pitchStr = '+0Hz';
      if (settings?.pitch) {
        pitchStr = String(settings.pitch).replace('%', 'Hz');
        if (!pitchStr.startsWith('+') && !pitchStr.startsWith('-')) {
          pitchStr = '+' + pitchStr;
        }
      }
      if (!/^[+-]\d+Hz$/.test(pitchStr)) {
        pitchStr = '+0Hz';
      }

      console.log(`[Edge TTS] Synthesizing chunk ${chunkIndex} for project ${projectId} (speed: ${settings?.speed || 1}, pitch: ${pitchStr})...`);
      let edgeOptions = {};
      if (settings?.speed) {
        const percent = Math.round((settings.speed - 1) * 100);
        edgeOptions.rate = percent >= 0 ? `+${percent}%` : `${percent}%`;
      }
      edgeOptions.pitch = pitchStr;
      const tts = new EdgeTTS(text, voice, edgeOptions);
      const edgeRes = await tts.synthesize();
      audioBuffer = Buffer.from(await edgeRes.audio.arrayBuffer());
    } else if (provider === 'google') {
      console.log(`[Google TTS] Synthesizing chunk ${chunkIndex} for project ${projectId} (voice/lang: ${voice})...`);
      const lang = voice || 'en';
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      audioBuffer = Buffer.from(response.data);
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    // Write chunk audio to local folder
    fs.writeFileSync(chunkFilePath, audioBuffer);
    
    res.json({ 
      success: true, 
      chunkIndex,
      chunkPath: `/history/${projectId}/chunks/${chunkFileName}` 
    });

  } catch (error) {
    console.error(`TTS Chunk Synthesis error for chunk ${chunkIndex}:`, error.message);
    const errDetails = error.response ? Buffer.from(error.response.data).toString() : error.message;
    console.error('Error Details:', errDetails);
    res.status(500).json({ error: `Failed to synthesize chunk ${chunkIndex}: ` + errDetails });
  }
});

app.post('/api/preview-voice', async (req, res) => {
  const { provider, voice, apiKey, settings } = req.body;
  const previewText = "Hi! I am your narrator voice. Ready to bring your stories to life.";

  if (!voice) {
    return res.status(400).json({ error: 'Missing voice ID' });
  }

  try {
    let audioBuffer;

    if (provider === 'edge') {
      let pitchStr = '+0Hz';
      if (settings?.pitch) {
        pitchStr = String(settings.pitch).replace('%', 'Hz');
        if (!pitchStr.startsWith('+') && !pitchStr.startsWith('-')) {
          pitchStr = '+' + pitchStr;
        }
      }
      if (!/^[+-]\d+Hz$/.test(pitchStr)) {
        pitchStr = '+0Hz';
      }

      console.log(`[Edge TTS] Synthesizing preview (speed: ${settings?.speed || 1}, pitch: ${pitchStr})...`);
      let edgeOptions = {};
      if (settings?.speed) {
        const percent = Math.round((settings.speed - 1) * 100);
        edgeOptions.rate = percent >= 0 ? `+${percent}%` : `${percent}%`;
      }
      edgeOptions.pitch = pitchStr;
      const tts = new EdgeTTS(previewText, voice, edgeOptions);
      const edgeRes = await tts.synthesize();
      audioBuffer = Buffer.from(await edgeRes.audio.arrayBuffer());
    } else if (provider === 'google') {
      console.log(`[Google TTS] Synthesizing preview (voice/lang: ${voice})...`);
      const lang = voice || 'en';
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(previewText)}`;
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      audioBuffer = Buffer.from(response.data);
    } else if (provider === 'openai') {
      const oaiKey = apiKey || process.env.OPENAI_API_KEY;
      if (!oaiKey) return res.status(400).json({ error: 'OpenAI key missing' });
      
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        { model: 'tts-1', input: previewText, voice: voice },
        { headers: { 'Authorization': `Bearer ${oaiKey}`, 'Content-Type': 'application/json' }, responseType: 'arraybuffer' }
      );
      audioBuffer = Buffer.from(response.data);
    } else if (provider === 'elevenlabs') {
      const elKey = apiKey || process.env.ELEVENLABS_API_KEY;
      if (!elKey) return res.status(400).json({ error: 'ElevenLabs key missing' });

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
        { text: previewText, model_id: 'eleven_monolingual_v1' },
        { headers: { 'xi-api-key': elKey, 'Content-Type': 'application/json' }, responseType: 'arraybuffer' }
      );
      audioBuffer = Buffer.from(response.data);
    } else {
      return res.status(400).json({ error: 'Unsupported provider' });
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    res.send(audioBuffer);

  } catch (error) {
    console.error('Preview synthesis error:', error);
    const errDetails = error.response ? Buffer.from(error.response.data).toString() : error.message;
    res.status(500).json({ error: 'Failed to generate voice preview: ' + errDetails });
  }
});

app.post('/api/analyze-enhance', async (req, res) => {
  const { text, customApiKey, availableProviders } = req.body;
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Please enter some text in your canvas before analyzing.' });
  }

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is missing. Please set it in Settings to enable the AI Enhancer.' });
  }

  const providers = availableProviders || { edge: true, openai: false, elevenlabs: false };

  // Build the list of valid recommendations based on active keys
  let voiceRosterText = "";
  if (providers.edge) {
    voiceRosterText += `\n- Microsoft Edge (Free) voices:\n` +
      `  * en-US-JennyNeural (Warm, clear, and friendly female)\n` +
      `  * en-US-GuyNeural (Natural, professional male narration)\n` +
      `  * en-US-AriaNeural (Highly narrative, bright and expressive female)\n` +
      `  * en-US-AndrewNeural (Smooth, natural news presenter male)\n` +
      `  * en-US-ChristopherNeural (Conversational, pleasant male)\n` +
      `  * en-US-EricNeural (Bright, friendly conversational male)\n` +
      `  * en-US-MichelleNeural (Clear, narrative female)\n` +
      `  * en-US-RogerNeural (Deep, crisp male narration)\n` +
      `  * en-US-SteffanNeural (Professional, rhythmic male)\n` +
      `  * en-GB-SoniaNeural (Clear, narrative British female)\n` +
      `  * en-GB-RyanNeural (Warm, professional British male)\n` +
      `  * en-GB-LibbyNeural (Soft, conversational British female)\n` +
      `  * en-GB-OliverNeural (Polite, clear British male)\n` +
      `  * en-AU-NatashaNeural (Vivid, friendly Australian female)\n` +
      `  * en-AU-WilliamNeural (Deep, clear Australian male)\n` +
      `  * en-CA-ClaraNeural (Vivid, friendly Canadian female)\n` +
      `  * en-CA-LiamNeural (Warm, friendly Canadian male)\n` +
      `  * en-IN-NeerjaNeural (Clear, warm Indian English female)\n` +
      `  * en-IN-PrabhatNeural (Professional, calm Indian English male)\n`;
  }
  if (providers.openai) {
    voiceRosterText += `\n- OpenAI (Paid) voices:\n` +
      `  * onyx (Deep, masculine, professional narrator)\n` +
      `  * nova (Bright, feminine, energetic and clear)\n` +
      `  * alloy (Balanced, neutral)\n` +
      `  * echo (Warm, intimate, deeper male)\n` +
      `  * fable (Theatrical, dramatic narrator)\n` +
      `  * shimmer (Professional, conversational female)\n`;
  }
  if (providers.elevenlabs) {
    voiceRosterText += `\n- ElevenLabs (Paid) voices:\n` +
      `  * 21m00Tcm4TlvDq8ikWAM (Rachel: Soft, warm feminine voice)\n` +
      `  * 2EiwXtPIZUi1R3OqpS5u (Clyde: Gravelly, video game style male)\n` +
      `  * 5Q0t7uMcxvnJa26GUmFY (Paul: Deep, gravelly, older male)\n` +
      `  * piTKgcLEGmPEe24241Jg (Nicole: Whispery, crisp close-mic female)\n` +
      `  * EXAVITQu4vr4xnSDxMaL (Bella: Classic narration, soft female)\n` +
      `  * Antoni (ID: ErXwobaYiN019PkySvjV) (Rich, deep storytelling male)\n` +
      `  * Thomas (ID: GBv7oZtRgoG2N17B3igB) (Gritty, cinematic older male)\n`;
  }

  try {
    const promptInstructions = `You are a professional voiceover director and speech scriptwriter. Your job is to analyze the story text provided by the user, choose the best narrator voice from the roster of available engines, and polish/format the story text for natural Text-to-Speech (TTS) reading.

The story/text to process is:
"${text}"

Roster of available voices for recommendation:
${voiceRosterText}

Tasks:
1. Analyze the tone, mood, and genre of this text.
2. Recommend the best matching voice from the roster. Choose the single best voice ID and its provider ('edge', 'openai', or 'elevenlabs'). Do NOT recommend a voice provider that is not in the roster. If the user only has free Edge available, pick an Edge voice.
3. Rewrite and format the text into a polished storytelling narration script optimized for natural speech synthesis:
   - CRITICAL: Preserve the exact plot, sequence of events, characters, and settings. Do NOT invent a new story, change the characters, or alter the meaning. You are only polishing spelling, grammar, flow, and formatting, NOT generating a random new story.
   - Punctuation formatting: Place commas (,) where the speaker should take a natural quick breath. Place periods (.) to end complete thoughts with downward inflection. Use ellipses (...) or dashes (—) for dramatic or transitional pauses.
   - Paragraphing: Organize the script into short, clean paragraphs (about 2-4 sentences each) so that it flows logically and is easy for the compilation queue to process.
   - Speech synthesis optimize: Ensure the wording sounds natural when spoken aloud. Add expressive descriptors if needed, but do not alter the story.

Return ONLY a JSON object with this exact structure:
{
  "genre": "genre name here",
  "mood": "mood description here",
  "recommendedProvider": "edge" or "openai" or "elevenlabs",
  "recommendedVoice": "voice_id_here",
  "rationale": "short explanation for why this voice matches the story's emotional tone and characters",
  "enhancedText": "polished and formatted story text with optimized commas, periods, ellipses, and paragraph breaks"
}

Do not include any markdown formatting like \`\`\`json or trailing text. Return only the raw JSON.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: promptInstructions }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }
    );

    const resultText = response.data.candidates[0].content.parts[0].text;
    const analysisData = JSON.parse(resultText.trim());
    
    res.json(analysisData);

  } catch (error) {
    console.error('AI Analyze-Enhance error:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI Analysis failed. ' + (error.response?.data?.error?.message || error.message) });
  }
});

// ==========================================
// 3. AUDIO CONCATENATION & PROJECT METADATA
// ==========================================

app.post('/api/merge-audio', async (req, res) => {
  const { projectId, title, chapters, provider, voice } = req.body;

  if (!projectId || !title) {
    return res.status(400).json({ error: 'Missing projectId or title' });
  }

  try {
    const { projDir, chunksDir } = getProjectDirs(projectId);
    
    // 1. Find all chunk files and sort them numerically
    const files = fs.readdirSync(chunksDir)
      .filter(f => f.startsWith('chunk_') && f.endsWith('.mp3'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('chunk_', '').replace('.mp3', ''));
        const numB = parseInt(b.replace('chunk_', '').replace('.mp3', ''));
        return numA - numB;
      });

    if (files.length === 0) {
      return res.status(400).json({ error: 'No audio chunks found to merge.' });
    }

    console.log(`Merging ${files.length} chunks for project ${projectId}...`);

    // 2. Read and concatenate buffers
    const fileBuffers = files.map(file => fs.readFileSync(path.join(chunksDir, file)));
    const mergedBuffer = Buffer.concat(fileBuffers);

    const mergedFileName = 'merged.mp3';
    const mergedFilePath = path.join(projDir, mergedFileName);
    fs.writeFileSync(mergedFilePath, mergedBuffer);

    // 3. Save project metadata.json
    const metadata = {
      projectId,
      title,
      chapters: chapters || [],
      provider,
      voice,
      createdAt: new Date().toISOString(),
      durationSeconds: 0, // Placeholder
      audioUrl: `/history/${projectId}/${mergedFileName}`
    };

    fs.writeFileSync(path.join(projDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

    res.json({
      success: true,
      audioUrl: metadata.audioUrl,
      metadata
    });
  } catch (error) {
    console.error('Merging audio error:', error);
    res.status(500).json({ error: 'Failed to merge audio chunks. ' + error.message });
  }
});

// ==========================================
// 4. HISTORY / LIBRARY MANAGEMENT
// ==========================================

app.get('/api/history', (req, res) => {
  try {
    const projects = [];
    if (fs.existsSync(HISTORY_DIR)) {
      const dirs = fs.readdirSync(HISTORY_DIR).filter(file => {
        return fs.statSync(path.join(HISTORY_DIR, file)).isDirectory();
      });

      for (const dir of dirs) {
        const metadataPath = path.join(HISTORY_DIR, dir, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          try {
            const data = fs.readFileSync(metadataPath, 'utf8');
            projects.push(JSON.parse(data));
          } catch (e) {
            console.error(`Error parsing metadata in ${dir}`, e);
          }
        }
      }
    }

    // Sort by created date descending
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ projects });
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ error: 'Failed to read history library. ' + error.message });
  }
});

app.delete('/api/history/:projectId', (req, res) => {
  const { projectId } = req.params;
  const projectPath = path.join(HISTORY_DIR, projectId);
  try {
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
      res.json({ success: true, message: `Recording deleted successfully` });
    } else {
      res.status(404).json({ error: 'Recording not found' });
    }
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete recording: ' + error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Storyteller Backend running on port ${PORT} `);
  console.log(` Storage Path: ${HISTORY_DIR} `);
  console.log(`==================================================`);
});
