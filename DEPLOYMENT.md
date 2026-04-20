# Deploying P&K Forever v1 to Vercel

## ✅ Status: READY FOR DEPLOYMENT

The game is fully built and ready to deploy. All v0 narrative has been converted to Narrat format and builds successfully.

---

## Quick Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Navigate to project root
cd /home/user/pnk-forever

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Choose settings (or use vercel.json)
# - Deploy!

# For production deployment:
vercel --prod
```

### Option 2: Vercel Dashboard (Web UI)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from your Git repository: `wildcard/pnk-forever`
4. Framework Preset: **Vite**
5. Root Directory: **v1-modern**
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Click **Deploy**

---

## Deployment Configuration

The project includes `vercel.json` which configures:
- Build source: `v1-modern/package.json`
- Static build using Vite
- Output directory: `v1-modern/dist`
- Route handling

---

## Testing Locally Before Deployment

```bash
cd v1-modern

# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Preview the built version
npm run preview

# Or run in development mode
npm run dev
```

The dev server will run on `http://localhost:5173` (or similar).

---

## What's Deployed

The v1 game includes:

**✅ Complete Narrative from v0:**
- Beach Rest (slushy puzzle)
- Beach (meeting K)
- Beach Sunset (deep conversation, Easter eggs)
- Jaffa Apartment & Street
- Japan (Kyoto)
- Kitchen (the necklace scene)
- Home (THE END)

**✅ All Features:**
- All dialogue and conversations
- All Easter egg triggers (6 total)
- All items and mechanics
- All story progression
- Exact v0 dialogue preserved

**✅ Easter Eggs:**
1. Mango 🥭 → `pnk_mango`
2. Tea 🫖 → `pnk_drink`
3. Chocolate 🍫 → `pnk_chocolate` (drawer #4 hint)
4. Kite 🪁 → `pnk_kite` (discount code)
5. Love 🧡🖤 → `pnk_love`
6. Fly ✈️ → `pnk_fly`

---

## After Deployment

Once deployed, you'll get a URL like:
- `https://pnk-forever.vercel.app` (or similar)

### Test the Game:
1. Visit the URL
2. Play through from start
3. Verify all scenes work
4. Test Easter egg triggers
5. Check that story flows correctly

### Feedback Loop:
1. Play the game
2. Note any issues or improvements needed
3. Make changes in v1-modern/
4. Commit and push
5. Vercel will auto-deploy (if connected to Git)

---

## Environment Variables (If Needed)

If you want to secure Easter egg webhooks through a backend API:

1. In Vercel Dashboard → Project Settings → Environment Variables
2. Add: `IFTTT_WEBHOOK_KEY=buN0S2VUtrVLjyoCLowl7X`
3. Redeploy

Currently, Easter eggs call IFTTT directly from the client (same as v0).

---

## Branch Info

**Branch:** `claude/anniversary-game-vp0Vp`
**Latest Commit:** Working Narrat game with complete v0 narrative

### To deploy this branch:
- Vercel can deploy from any branch
- Or merge to main/master and deploy from there

---

## Next Steps After Deployment

1. **Play through completely** - Verify everything works
2. **Test on mobile** - Check responsive design
3. **Verify Easter eggs** - Confirm IFTTT triggers fire
4. **Gather feedback** - Note what needs improvement
5. **Iterate** - Make changes, commit, deploy again

---

## Troubleshooting

### Build fails:
```bash
cd v1-modern
npm install
npm run build
```
Check the error output.

### Game doesn't load:
- Check browser console for errors
- Verify all script files are included
- Check that routes are configured correctly

### Easter eggs don't trigger:
- Check network tab for webhook calls
- Verify IFTTT webhook URLs are correct
- Test webhooks manually: `curl https://maker.ifttt.com/trigger/pnk_mango/with/key/[KEY]`

---

**The game is ready. Deploy it and let the feedback loop begin! 🧡🖤**

---

**Created with Claude Code**
**For Anastasia. Forever.**
