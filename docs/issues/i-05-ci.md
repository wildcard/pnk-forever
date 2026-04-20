## P1 — CI workflow: typecheck + build on every PR

### Why
Every fix so far has had a chance of breaking the build. There's no automated check. A PR with a typo in `vite.config.ts` could silently ship.

### Done when
- [ ] `.github/workflows/ci.yml` runs on every `pull_request`
- [ ] Steps: `npm ci`, `tsc --noEmit` (if tsconfig exists), `npm run build`
- [ ] `node_modules` cached by `package-lock.json` hash
- [ ] Takes <3 min on the first run, <90s on cached runs
- [ ] Green check appears on PRs

### Skeleton
```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main, claude/anniversary-game-vp0Vp]

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: v1-modern
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
          cache-dependency-path: v1-modern/package-lock.json
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run build
```

### Labels
`p1`, `infra`
