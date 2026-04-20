## P1 — Playwright smoke test: game reaches Jaffa

### Why
Manual testing is slow and keeps regressing (the same "blank screen" surfaced 3 times during initial development). A single smoke test catches 90% of breakages.

### Done when
- [ ] `@playwright/test` installed as devDependency
- [ ] `tests/smoke.spec.ts` exists with one test that walks from start to Jaffa
- [ ] `npm test` runs it headless, passes locally
- [ ] Added as a CI step (extends I-5)

### Test outline
```ts
test('playthrough: start → Jaffa', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Press to start');

  // click through opening — advance dialog with Enter/click
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
  }

  await page.click('text=Look around');
  // ... more clicks that correspond to the golden path

  await expect(page.locator('.background-jaffa_apt')).toBeVisible({ timeout: 30_000 });
});
```

### Don't over-engineer
One golden-path test. No full playthrough. No side-quest branches. That's for I-6b if it ever matters.

### Labels
`p1`, `tests`
