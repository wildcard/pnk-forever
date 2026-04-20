# Ralph Task — v2 IR + Ren'Py WASM Milestone

**Repo:** `wildcard/pnk-forever`
**Milestone:** #1 `v2: Ren'Py WASM + Engine-Portable IR`
**Plan:** [`docs/plans/ir-renpy-milestone.md`](../docs/plans/ir-renpy-milestone.md)
**Completion phrase:** `MILESTONE_COMPLETE`
**Iteration cap:** 40 (hard stop; re-launch if more needed)

## Objective

Close every open issue under milestone #1. Each iteration = pick one ready issue,
implement it fully, commit, move on. When the milestone has **zero open issues**,
output `<promise>MILESTONE_COMPLETE</promise>`.

## Per-iteration procedure

Run this procedure verbatim each iteration. Do **not** freelance outside it.

### 1. Orient (≤30s)

```bash
gh issue list --search 'milestone:"v2: Ren'"'"'Py WASM + Engine-Portable IR"' --state open \
  --json number,title,labels --jq '.[] | "#\(.number) [\([.labels[].name] | join(","))] \(.title)"'
```

If output is empty → milestone done → output `<promise>MILESTONE_COMPLETE</promise>`
and stop.

### 2. Pick the next ready issue

Use the dependency DAG below. Pick the lowest-numbered open issue whose deps are all
closed. **Skip** issues whose "Depends on" clause references any still-open issue.

**Dependency DAG** (→ means "depends on"):

```
#18 (schema)               — no deps
#19 (ir-lint)              → #18
#20 (narrat parser)        → #18, #19
#21 (narrat emitter)       → #20
#22 (roundtrip verify)     → #20, #21
#23 (content-architect)    → #18
#24 (narrat-adapter agent) → #21
#25 (renpy-adapter agent)  → #28 (circular-ok: write agent after emitter exists)
#26 (engine-migrator)      → #24, #25
#27 (Ren'Py SDK fetch)     — no deps (can run any time; heavy download)
#28 (Ren'Py emitter)       → #22 (IR shape proven)
#29 (Ren'Py assets)        → #28
#30 (Ren'Py web build)     → #27, #28, #29
#31 (Vercel routing)       → #30
#32 (v2 acceptance)        → #30, #31
#33 (meta docs)            → #23 (content-architect exists to link to)
```

### 3. Implement the issue

- **Branch from `main`** (not from the current worktree branch) using a fresh
  worktree under `.claude/worktrees/`:
  ```bash
  git fetch origin main
  BRANCH="ralph/issue-${ISSUE_NUM}"
  git worktree add -b "$BRANCH" ".claude/worktrees/$BRANCH" origin/main
  cd ".claude/worktrees/$BRANCH"
  ```
  This isolates each iteration; failures in one don't contaminate others.
- Follow the issue's `## Acceptance` checklist exactly. Check off each box in the
  issue body as you complete it (`gh issue edit $N --body "..."` with updated body).
- Run the smoke check specified in the issue (or the relevant phase gate below)
  before declaring done.

### 4. Phase smoke gates

| Phase | Gate |
|---|---|
| 0 | `npm run ir-lint` (or whatever ir-lint script is named) exits 0 against `content/**` |
| 1 | `bash tools/adapters/narrat/roundtrip.sh` reports clean diff; `cd v1-modern && npm run build` succeeds |
| 2 | Each new agent file has valid frontmatter (name, description, tools list). No runtime test required. |
| 3 | `bash tools/build-renpy-web.sh` produces `dist/v2-renpy/index.html`; local http.server serves it; full autoplay via game-tester reaches sacred line exactly once |

### 5. Commit + PR

```bash
git add <files>
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

Closes #<issue-number>

<body — why, what changed, any deviations from the issue>

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push -u origin "$BRANCH"
gh pr create --base main --head "$BRANCH" \
  --title "<subject>" \
  --body "Closes #<issue-number>

<short summary>

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

Follow `~/.claude/rules/git-commit-rules.md` for commit format and
`~/.claude/rules/pr-comment-structure.md` for any PR comments.

### 6. Auto-merge when safe

If the PR has no CI (or CI is green) and only touches files whose phase gate passed:

```bash
gh pr merge --squash --auto --delete-branch
```

If CI is red or manual review is warranted, leave the PR open and comment on the
issue with the PR link — **do not block the loop**. Move on to the next ready issue.

### 7. Cleanup worktree

```bash
cd /Users/kobik-private/workspace/pnk-forever
git worktree remove ".claude/worktrees/$BRANCH" --force
```

### 8. Log progress

Append a one-line entry to `.claude/ralph-log.md`:

```
<YYYY-MM-DD HH:MM>  iter=<N>  issue=#<N>  branch=<name>  status=<merged|pr-open|blocked>  notes=<>
```

## Blocker protocol

If an iteration cannot complete:

- **External dependency missing** (Ren'Py SDK download fails, Vercel auth absent,
  asset source missing): file a new issue titled `Blocker · <what's missing>`,
  label it `blocker`, comment on the blocked issue with a link, **skip** the
  blocked issue this cycle. Don't retry the same blocked issue more than twice.
- **Test flakiness** (game-tester intermittent): retry once. Still flaky → file
  an issue, skip.
- **Schema gap discovered mid-implementation**: reopen #18 with a comment
  describing the missing field, fix it first, then retry.

## Hard rules

- **Never skip hooks** (`--no-verify`, `--no-gpg-sign`).
- **Never force-push to main** or any shared branch.
- **Never delete content from the repo** that isn't part of the issue's scope.
- **Never edit the sacred line** (`"For Anastasia. Forever."` in japan.narrat or
  its IR equivalent). This constraint survives the IR migration.
- **Respect `.claude/rules/narrat-no-autoplay-loops.md`** — the rule applies to
  IR output too. ir-lint must enforce it before any emitter runs.
- **If you get stuck in a loop** (same issue, same error, 3rd attempt): stop
  touching that issue, file a detailed `blocker` issue, move on.

## Exit

When `gh issue list --search 'milestone:...' --state open` returns empty,
write a final summary comment on milestone #1:

```bash
gh api 'repos/wildcard/pnk-forever/milestones/1/labels' # (no-op; milestones don't take comments directly)
# Instead comment on a tracking issue or close-out PR
```

Then output: `<promise>MILESTONE_COMPLETE</promise>`
