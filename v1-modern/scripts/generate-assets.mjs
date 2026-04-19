/**
 * Asset generation script using Google Imagen 3.
 * Run: node scripts/generate-assets.mjs
 * Requires: GEMINI_API_KEY env var
 *
 * Skips images that already exist and are > 1KB (real images, not placeholders).
 * To force regeneration: node scripts/generate-assets.mjs --force
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

const STYLE_BG = 'visual novel background art, hand-painted, cinematic, warm atmospheric lighting, highly detailed environment, no characters';
const STYLE_CHAR = 'anime character art, expressive, cute, clean white background, full body portrait';

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
    prompt: `Golden sunset on the Tel Aviv-Jaffa beach promenade, ancient Jaffa clock tower silhouette, orange and pink sky reflecting on the sea, romantic walking path, ${STYLE_BG}`,
  },
  {
    file: 'apartment.png',
    aspectRatio: '16:9',
    prompt: `Cozy Jaffa apartment interior, warm Mediterranean décor, a comfortable pull-out sofa bed in the living room, travel souvenirs on shelves, warm evening lamp light, stone arched windows, ${STYLE_BG}`,
  },
  {
    file: 'street.png',
    aspectRatio: '16:9',
    prompt: `Ancient Jaffa street, limestone buildings, winding cobblestone alley, colorful market stalls, morning light casting long shadows, bougainvillea flowers, ${STYLE_BG}`,
  },
  {
    file: 'kyoto.png',
    aspectRatio: '16:9',
    prompt: `Kyoto Japan traditional neighborhood street, wooden machiya townhouses, cherry blossom trees in full bloom, pagoda visible in background, serene spring atmosphere, ${STYLE_BG}`,
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
    prompt: `Cute anime-style anthropomorphic bird-cat girl named Phoenix, orange and black feathered wings, curious warm expression, wearing casual summer clothes, friendly personality, full body, white background, ${STYLE_CHAR}`,
  },
  {
    file: 'k.png',
    aspectRatio: '3:4',
    prompt: `Cute anime-style anthropomorphic Shiba Inu dog boy named K, wearing colorful peacock feathers as a decorative collar/accessory, confident gentle expression, casual outfit, full body, white background, ${STYLE_CHAR}`,
  },
];

async function generateImage(prompt, aspectRatio) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`;
  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio,
      safetySetting: 'block_some',
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
  const encoded = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!encoded) throw new Error('No image in API response');
  return Buffer.from(encoded, 'base64');
}

function isPlaceholder(filepath) {
  if (!existsSync(filepath)) return true;
  return statSync(filepath).size < 2000;
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
