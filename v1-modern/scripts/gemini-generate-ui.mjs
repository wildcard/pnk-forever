/**
 * PNK Forever — UI Art Generator
 * Uses Gemini 2.5 Flash Image (nano banana) to generate splash + menu backgrounds.
 * Run: GEMINI_API_KEY=xxx node scripts/gemini-generate-ui.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.resolve(__dirname, '..');

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY not set.');
  process.exit(1);
}

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`;

const manifest = [
  {
    filename: 'img/ui/splash/splash_bg.jpg',
    mimeType: 'image/jpeg',
    aspectRatio: '16:9',
    prompt: 'Visual novel background, painterly anime style, Ghibli-inspired, soft cinematic lighting, highly detailed. Interior view looking through a large open balcony door at golden dusk. Sheer white curtains gently billowing in warm breeze. Outside: coral-orange sunset sky #FF6B35, city silhouette with palm trees, ocean glimmer in far distance. Foreground: warmly lit living room interior, small round table with two empty ceramic tea cups. The central vertical band is kept relatively dim with a soft natural vignette. Deep warm shadow tones #120E0A in corners. Romantic, tender, cinematic. No text, no watermarks, no people, no characters.',
  },
  {
    filename: 'img/ui/menu/menu_bg.jpg',
    mimeType: 'image/jpeg',
    aspectRatio: '16:9',
    prompt: 'Visual novel background, painterly anime style, Ghibli-inspired, highly detailed, soft cinematic lighting. Close perspective on a cozy wooden cafe table in warm morning light. Two ceramic coffee cups side by side with gentle steam rising. A folded handwritten letter and a small orange blossom flower beside them. Warm sunlight streaming through a latticed window at right edge. Left half of composition is naturally dimmer with cool wood shadows. Right half glows warmly amber and cream. Color palette: cream white #FFF8F0, warm amber, coral orange #FF6B35 accents, rich dark wood, teal turquoise #4CC2BA ceramic cup glaze. Intimate anniversary warmth. No text, no watermarks, no people.',
  },
  {
    filename: 'img/ui/paper_texture.png',
    mimeType: 'image/png',
    aspectRatio: '1:1',
    prompt: 'Seamless tileable paper texture. Aged cream-white surface, very subtle fiber grain, warm ivory tone. No pattern, no watermark, no text, no color tint beyond warm cream. Extremely minimal — will be used at low opacity as a screen overlay to add tactile warmth to digital UI.',
  },
];

async function generateImage(entry, retries = 3) {
  const body = {
    contents: [{ parts: [{ text: entry.prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: entry.aspectRatio },
    },
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}: POST to Gemini...`);
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`  HTTP ${res.status}: ${errText.slice(0, 200)}`);
        if ((res.status === 429 || res.status >= 500) && attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`  Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));

      if (!imgPart) {
        console.error('  No image part in response. Full response:');
        console.error(JSON.stringify(data, null, 2).slice(0, 500));
        throw new Error('No image data returned');
      }

      const buffer = Buffer.from(imgPart.inlineData.data, 'base64');
      const outPath = path.join(BASE_DIR, 'public', entry.filename);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, buffer);

      const stats = fs.statSync(outPath);
      console.log(`  OK: ${outPath} (${(stats.size / 1024).toFixed(1)} KB)`);
      return { success: true, path: outPath, size: stats.size };
    } catch (err) {
      if (attempt === retries) {
        console.error(`  FAILED after ${retries} attempts: ${err.message}`);
        return { success: false, error: err.message };
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`  Error: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function main() {
  console.log(`PNK Forever UI Art Generator`);
  console.log(`API key: ${API_KEY.slice(0, 8)}...`);
  console.log(`Generating ${manifest.length} assets...\n`);

  const results = [];
  for (const entry of manifest) {
    console.log(`\n[${entry.filename}]`);
    const result = await generateImage(entry);
    results.push({ filename: entry.filename, ...result });
    // Small pause between requests to be kind to rate limits
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    const status = r.success ? `OK (${(r.size / 1024).toFixed(1)} KB)` : `FAILED: ${r.error}`;
    console.log(`  ${r.filename}: ${status}`);
  }

  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.error(`\n${failures.length} asset(s) failed.`);
    process.exit(1);
  }
  console.log('\nAll assets generated successfully.');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
