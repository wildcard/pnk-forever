/**
 * Asset generation using Google Gemini 2.5 Flash Image ("nano banana").
 * Run: GEMINI_API_KEY=... node scripts/generate-assets.mjs
 *
 * Skips images already larger than 50KB (real images, not placeholders).
 * Force regeneration: node scripts/generate-assets.mjs --force
 */
import { writeFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'img');
const FORCE = process.argv.includes('--force');
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY env var is not set.');
  process.exit(1);
}

const STYLE_BG = 'visual novel background, painterly, soft cinematic lighting, Ghibli-inspired, anime aesthetic, highly detailed, no characters, no text, no watermarks';
const STYLE_CHAR = 'anime character portrait, cel-shaded, clean line art, waist-up, centered, plain white background, no text, no watermarks';

const ASSETS = [
  // ── Backgrounds (16:9) ─────────────────────────────────────────────────────
  {
    file: 'beach_rest.png',
    aspectRatio: '16:9',
    prompt: `Cozy outdoor beach café in Tel Aviv, Mediterranean sea view, summer golden hour, comfortable rattan chairs, a half-drunk acai slushy on the table, sea breeze, ${STYLE_BG}`,
  },
  {
    file: 'beach.png',
    aspectRatio: '16:9',
    prompt: `Sunny Tel Aviv beach, sand and turquoise Mediterranean water, beach umbrellas, a folding Brompton bicycle leaning against a palm tree, clear blue sky, ${STYLE_BG}`,
  },
  {
    file: 'sunset.png',
    aspectRatio: '16:9',
    prompt: `Golden sunset on the Tel Aviv-Jaffa beach promenade, Jaffa clock tower silhouette in the distance, orange-pink sky reflecting on calm sea, empty walking path, coral and teal palette, ${STYLE_BG}`,
  },
  {
    file: 'apartment.png',
    aspectRatio: '16:9',
    prompt: `Cozy Jaffa apartment interior, warm Mediterranean décor, living-room bed with linen cushions, travel souvenirs on shelves, morning light through wooden shutters, stone arched windows, ${STYLE_BG}`,
  },
  {
    file: 'street.png',
    aspectRatio: '16:9',
    prompt: `Ancient Jaffa stone alley at morning, limestone buildings, bougainvillea flowers spilling over walls, a kitesurfing shop window display, warm Mediterranean light, ${STYLE_BG}`,
  },
  {
    file: 'kyoto.png',
    aspectRatio: '16:9',
    prompt: `Kyoto street at dusk, red paper lanterns glowing, cherry blossom trees, traditional wooden machiya townhouses, warm coral and lantern-red palette, ${STYLE_BG}`,
  },
  {
    file: 'kyoto_apt.png',
    aspectRatio: '16:9',
    prompt: `Japanese apartment interior in Kyoto, minimalist design, tatami mats on the floor, shoji screen windows with soft afternoon light, a pair of uwabaki house slippers by the entrance, ${STYLE_BG}`,
  },
  {
    file: 'kitchen.png',
    aspectRatio: '16:9',
    prompt: `Japanese home kitchen, steaming bamboo dim sum baskets on the stove, warm cozy atmosphere, wooden utensils hanging on the wall, soft kitchen lighting, aromatic steam rising, ${STYLE_BG}`,
  },
  {
    file: 'home.png',
    aspectRatio: '16:9',
    prompt: `Modern cozy apartment living room in Tel Aviv at evening, warm lamplight, a couple's belongings—two coats, two cups of tea—feeling of belonging and home, intimate and romantic, ${STYLE_BG}`,
  },
  // ── Character sprites (3:4 portrait) ───────────────────────────────────────
  {
    file: 'phoenix.png',
    aspectRatio: '3:4',
    prompt: `Phoenix (P.) — a bird-cat hybrid girl with coral-orange feathered wings and soft cat features, big curious expressive eyes, friendly warm smile, casual summer outfit in teal, waist-up portrait, ${STYLE_CHAR}`,
  },
  {
    file: 'k.png',
    aspectRatio: '3:4',
    prompt: `K. (Ehecatl) — a shiba-peacock hybrid boy with a fluffy shiba face and colorful peacock tail feathers framing him, confident warm smile, casual outfit in sandy beige, waist-up portrait, ${STYLE_CHAR}`,
  },
];

const MODEL = 'gemini-2.5-flash-image';

async function generateImage(prompt, aspectRatio) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p?.inlineData?.data);
  if (!imagePart) throw new Error('No image in API response: ' + JSON.stringify(data).slice(0, 300));
  return Buffer.from(imagePart.inlineData.data, 'base64');
}

function isPlaceholder(filepath) {
  if (!existsSync(filepath)) return true;
  return statSync(filepath).size < 50000;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const asset of ASSETS) {
    const filepath = join(OUTPUT_DIR, asset.file);

    if (!FORCE && !isPlaceholder(filepath)) {
      console.log(`  skip  ${asset.file}`);
      skipped++;
      continue;
    }

    process.stdout.write(`  gen   ${asset.file} ... `);
    try {
      const img = await generateImage(asset.prompt, asset.aspectRatio);
      writeFileSync(filepath, img);
      console.log(`done (${(img.length / 1024).toFixed(0)} KB)`);
      generated++;
      await sleep(1500); // stay under rate limits
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nGenerated: ${generated}  Skipped: ${skipped}  Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main();
