/**
 * Ch 6 Vancouver + K. sprite fix asset generator.
 * Uses OpenRouter → Google Gemini 2.5 Flash Image ("nano banana").
 * Run: OPENROUTER_API_KEY=... node scripts/generate-ch6.mjs
 * Force regeneration: node scripts/generate-ch6.mjs --force
 */
import { writeFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'img');
const FORCE = process.argv.includes('--force');
const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error('Error: OPENROUTER_API_KEY env var is not set.');
  process.exit(1);
}

const MODEL = 'google/gemini-2.5-flash-image';

const STYLE_BG = 'visual novel background, painterly, soft cinematic lighting, Ghibli-inspired, anime aesthetic, highly detailed, no characters, no text, no watermarks, 16:9 wide';
const STYLE_CHAR = 'anime character portrait, cel-shaded, clean line art, waist-up, centered, plain white background, no text, no watermarks';

const ASSETS = [
  {
    file: 'kits_beach.png',
    prompt: `Kitsilano Beach Vancouver in golden summer late afternoon, English Bay water, North Shore mountains across the water in the hazy distance, warm honey-gold sunlight cutting through, driftwood logs on pale sand, same warm golden painterly register as a Tel Aviv beach scene. ${STYLE_BG}`,
  },
  {
    file: 'vancouver_apt.png',
    prompt: `Modern Vancouver condo interior, high ceilings, floor-to-ceiling windows showing English Bay far below at evening, two desks back-to-back in center: left desk has large monitor showing a FIFA EA Sports soccer player mid-sprint in a stadium plus a ZBrush secondary monitor and a coffee mug, right desk has multi-window code editor with AI agent terminal conversations and a coffee mug with headphones. Warm evening interior lamplight. ${STYLE_BG}`,
  },
  {
    file: 'vancouver_peak.png',
    prompt: `Pacific northwest mountain trail above Vancouver, cedar and moss forest rising to a ridge, maple leaves scattered on the path in early autumn, warm golden light filtering through cedar canopy, distant glittering city and ocean far below, painterly warm Ghibli-style. ${STYLE_BG}`,
  },
  {
    file: 'squamish.png',
    prompt: `Wide cinematic Howe Sound kitesurfing scene from Squamish spit. Foreground: an anthropomorphic orange phoenix bird-cat girl with coral feather wings in a kitesurfing harness, soaring mid-air, a large colorful kite taut against dramatic sky above her, expression of pure weightless joy. Shore left: a fluffy shiba-peacock dog hybrid with colorful peacock tail feathers sitting on a weathered driftwood log watching her, small in frame. Dramatic Stawamus Chief mountain behind. Warm late-afternoon golden light, water sparkles. Painterly anime visual novel style, cinematic wide shot. No text, no watermarks.`,
  },
  {
    file: 'north_van_persian.png',
    prompt: `Intimate Persian restaurant interior, North Vancouver, small warm dining room, saffron-yellow hanging lamps, mirrored mosaic wall panel, a single foregrounded table set for two with a bowl of fesenjan walnut-pomegranate stew, golden tahdig crusted rice, rosewater drink in a small glass. Warm ochre and deep pomegranate reds dominate. Empty chairs implied. ${STYLE_BG}`,
  },
  {
    file: 'costco_downtown.png',
    prompt: `Downtown Vancouver Costco warehouse interior, fluorescent-lit cathedral aisle, absurdly tall metal shelves stacked with bulk products receding into forced-perspective vanishing point, foregrounded pallet stacks of mango boxes, tea tins, and chocolate towers, a lone shopping cart in the aisle. Warm fluorescent tint, slightly cozy-absurd mood, not clinical cold. ${STYLE_BG}`,
  },
  {
    file: 'k.png',
    prompt: `K. (Ehecatl) — anthropomorphic Black and Tan Shiba Inu peacock hybrid boy. Coat: black saddle and mask across back and face, tan points on cheeks, tan eyebrow dots above eyes, tan legs and chest, cream underbelly — classic Black and Tan Shiba Inu coloring, NOT red or orange. Behind him: a magnificent fan of large peacock tail feathers in iridescent green teal and gold spreading wide. Casual sandy beige sweater and khaki pants. Confident warm smile, friendly expression. Waist-up portrait. ${STYLE_CHAR}`,
  },
];

async function generateImage(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'image_url' },
      }),
    });

    if (res.status === 429 || res.status >= 500) {
      const wait = attempt * 5000;
      console.log(`    retry ${attempt}/${retries} after ${wait}ms (HTTP ${res.status})`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
    }

    const data = await res.json();
    const err = data?.error;
    if (err) throw new Error(`API error ${err.code}: ${err.message?.slice(0, 300)}`);

    // OpenRouter puts images in message.images[] as data URIs
    const images = data?.choices?.[0]?.message?.images;
    if (images && images.length > 0) {
      const dataUri = images[0]?.image_url?.url || '';
      if (dataUri.startsWith('data:')) {
        const base64 = dataUri.split(',')[1];
        return Buffer.from(base64, 'base64');
      }
    }

    // Fallback: check content for data URI
    const content = data?.choices?.[0]?.message?.content || '';
    const match = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (match) {
      return Buffer.from(match[1], 'base64');
    }

    throw new Error('No image in response: ' + JSON.stringify(data).slice(0, 400));
  }
  throw new Error('Exhausted retries');
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

    // k.png is always force-regenerated (it's the bug fix)
    const forceThis = FORCE || asset.file === 'k.png';

    if (!forceThis && !isPlaceholder(filepath)) {
      const size = statSync(filepath).size;
      console.log(`  skip  ${asset.file} (${(size / 1024).toFixed(0)} KB)`);
      skipped++;
      continue;
    }

    process.stdout.write(`  gen   ${asset.file} ... `);
    try {
      const img = await generateImage(asset.prompt);
      writeFileSync(filepath, img);
      console.log(`done (${(img.length / 1024).toFixed(0)} KB)`);
      generated++;
      await sleep(2000); // pace requests
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nGenerated: ${generated}  Skipped: ${skipped}  Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main();
