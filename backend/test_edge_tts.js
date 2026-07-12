const { EdgeTTS } = require('edge-tts-universal');
const fs = require('fs');

async function test() {
  try {
    console.log("Initializing EdgeTTS...");
    const tts = new EdgeTTS(
      'Hello, this is a free high-quality voiceover generated without any API keys using Microsoft Azure Neural voices!', 
      'en-US-JennyNeural'
    );
    console.log("Synthesizing...");
    const res = await tts.synthesize();
    console.log("Got blob, converting to buffer...");
    const audioBuffer = Buffer.from(await res.audio.arrayBuffer());
    fs.writeFileSync('./test_output.mp3', audioBuffer);
    console.log("Success! Audio saved to test_output.mp3, size: " + audioBuffer.length + " bytes");
  } catch (err) {
    console.error("Error during test:", err);
  }
}

test();
