# Standardize CI on Node 24 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set the `setup-environment` composite action's Node-version `default` to `24` so every CI job that relies on that default (build/lint/test) runs on Node 24, closing the last CI gap before the Angular 22 bump.

**Architecture:** One composite action (`.github/actions/setup-environment/action.yml`) declares a `node` input whose `default` feeds `actions/setup-node@v4`'s `node-version`. Three reusable workflows — `build.yml`, `lint.yml`, `test.yml` — call that action **without** passing `node:`, so they inherit the default. Changing that one default value to `24` switches all three jobs to Node 24 with zero workflow edits. This is a single, targeted default-value change; no other Node pin in the repo is touched.

**Tech Stack:** GitHub Actions (composite action + reusable workflows), `actions/setup-node@v4`, `npm ci`, `nx` affected build/lint/test targets, Node.js 24.

**Spec:** onecx/internal-tasks#706 "Libs — Standardize CI on Node 24" (part of onecx/internal-tasks#682, "OneCX Angular 22 / Optimus UI Migration").

## Problem Statement

The `setup-environment` composite action (`.github/actions/setup-environment/action.yml`) declares a `node` input whose `default` value was stale at `'20'`. The three reusable workflows that do the real CI work — `build.yml`, `lint.yml`, `test.yml` — invoke this composite action without specifying `node:`, so they inherit the default and were therefore running on Node 20. Meanwhile `ci.yml` (line 23, `node-version: 24`), `release.yml` (line 18, `node-version: 24`), and `run-migrations.yml` (line 55, `node-version: '24'`) already pin Node 24 explicitly. The end state: the composite action's default is `24`, so every default-relying CI job (build/lint/test) runs on Node 24, and this is the last CI gap before the Angular 22 bump, which requires Node `^22.22.3 || ^24.15.0 || >=26.0.0`.

## Approach

Make a single one-line edit to `.github/actions/setup-environment/action.yml`: change the `node` input's `default` from `'20'` to `24` (single-quoted `'24'`, matching the surrounding `inputs` block style and the quoted style already used by `run-migrations.yml`). Because `build`/`lint`/`test` consume the default rather than passing an explicit version, this one edit is complete and is the only place a Node-version change is warranted. All other Node pins are already `24` and stay byte-for-byte identical to keep the change a single, targeted default-value fix.

**Caller chain (verified against the checked-out repo):** `ci-p.yml`/`ci-pr.yml` → `ci-common.yml` → `build.yml` / `lint.yml` / `test.yml` → `./.github/actions/setup-environment` (no `node:` override). The default value is therefore the single control point for build/lint/test.

**Observed working-tree state (verify before editing — this is a fact about this checkout, not an open question):** commit `493a6bbf` ("fix: implement issue #706 - Libs — Standardize CI on Node 24") already set line 6 to `default: '24'`; `git status` reports a clean tree. The concrete, unambiguous outcome of Task 1 is that line 6 reads `default: '24'` and the rest of the file is byte-identical to before. Step 1 confirms which state the file is in; the deterministic action is the single-line replacement from the pre-fix value.

### Global Constraints (apply to every task)

- Target value is exactly `24`, written as the single-quoted string `'24'`.
- The change is exactly one line in exactly one file: `.github/actions/setup-environment/action.yml`, `default: '20'` → `default: '24'` (line 6).
- Do not touch the passthrough line `node-version: ${{ inputs.node }}` (line 15) — it reads the input default and must remain a reference to `inputs.node`, not a hard-coded value.
- Do not modify the explicit `node-version: 24` pins in `ci.yml:23`, `release.yml:18`, or `run-migrations.yml:55`, nor the `setup-environment` call lines (with no `with:`/`node:`) in `build.yml:16`, `lint.yml:16`, `test.yml:16`. Leave those files byte-for-byte identical.
- No `engines` field is added to `package.json` (none exists; the Node floor is enforced by CI, not the manifest). No `.nvmrc`, no Dockerfile changes.
- No documentation change and no new/updated tests (see Definition-of-Done notes in Notes).
- Commit message follows the repo's issue-implementing convention: `fix: implement issue #706 - Libs — Standardize CI on Node 24`.

---

## File-Level Task List

### Task 1: Set the `setup-environment` Node `default` to `24`

- **Path** — `.github/actions/setup-environment/action.yml`
- **Action** — modify
- **Summary** — Change the `default` value of the `node` input (line 6) from `'20'` to `'24'`, preserving 4-space indentation and single quotes. This is the only line that changes.

**Current file region before the edit (lines 3–7):**
```yaml
inputs:
  node:
    description: 'Node version'
    default: '20'
    required: false
```

**Target region after the edit (lines 3–7):**
```yaml
inputs:
  node:
    description: 'Node version'
    default: '24'
    required: false
```

**Concrete TODOs:**
- [ ] **Step 1: Confirm which state the file is in** — Run `sed -n '3,7p' .github/actions/setup-environment/action.yml`. The required terminal state is line 6 == `    default: '24'`. If line 6 already reads `default: '24'`, Step 2 is a no-op (the value is correct; do not re-edit or produce a second commit) and proceed to Step 3. If line 6 reads `default: '20'`, perform Step 2.
- [ ] **Step 2: Make the edit** — In `.github/actions/setup-environment/action.yml`, replace the single line `    default: '20'` with `    default: '24'`. Keep the 4-space indent and single quotes. Do not alter `description: 'Node version'` (line 5) or `required: false` (line 7). Do not alter the step at lines 12–16 that runs `actions/setup-node@v4` with `node-version: ${{ inputs.node }}`.
- [ ] **Step 3: Validate the YAML parses and the value resolves to 24** — Run `python3 -c "import yaml; d=yaml.safe_load(open('.github/actions/setup-environment/action.yml')); print(d['inputs']['node']['default'])"`. Expected output: `24`. If `python3`/PyYAML is unavailable, fall back to the grep in Step 4.
- [ ] **Step 4: Assert scope — only the intended line changed; no other pin touched** — Run the Verification Steps (1–6) below and confirm all pass.
- [ ] **Step 5: Review the diff** — Run `git --no-pager diff` (or `git --no-pager diff --stat`). Expected: exactly one file changed, `.github/actions/setup-environment/action.yml`, one insertion and one deletion (`-    default: '20'` / `+    default: '24'`). A clean/empty diff is the correct terminal state on this checkout (the value is already `24`); in that case there is nothing to commit and proceed to close out Task 1.
- [ ] **Step 6: Commit (only when Step 2 produced a real change)** — When Step 5 shows the one-line diff, run:

```bash
git add .github/actions/setup-environment/action.yml
git commit -m "fix: implement issue #706 - Libs — Standardize CI on Node 24

Bumps the setup-environment composite action's Node-version default from 20
to 24 so the build/lint/test CI jobs that inherit the default run on Node 24.
Closes the last CI gap before the Angular 22 bump (requires Node
^22.22.3 || ^24.15.0 || >=26.0.0). No other Node pin is touched.

Implements onecx/internal-tasks#706"
```

When Step 5 shows a clean tree (already at `24`), make no commit — the deliverable is already present and a duplicate commit is incorrect.

**Dependencies** — none.

---

## Verification Steps

Run from the repository root (the repo root is the directory containing `package.json` and `.github/`). All checks below must pass.

1. **The intended default is present and correct** —
   ```bash
   grep -n "default: '24'" .github/actions/setup-environment/action.yml
   ```
   Expected: exactly one match at line 6: `    default: '24'`.

2. **No `20` default remains in the action** —
   ```bash
   grep -n "default: '20'" .github/actions/setup-environment/action.yml
   ```
   Expected: no output (zero matches), exit code 1.

3. **The consuming step still references the input, not a hard-coded value** —
   ```bash
   grep -nF 'node-version: ${{ inputs.node }}' .github/actions/setup-environment/action.yml
   ```
   Expected: exactly one match at line 15: `        node-version: ${{ inputs.node }}`.

4. **Scope is a single file — the diff touches only the action** —
   ```bash
   git diff --name-only
   git status --short
   ```
   Expected: either (a) exactly one changed path, `.github/actions/setup-environment/action.yml`, or (b) a clean/empty output on this checkout (value already `24`).

5. **All other Node pins are untouched and remain on 24 (regression guard for "no other pin touched")** —
   ```bash
   grep -rn "node-version" .github/
   ```
   Expected: exactly these lines, all `24`, unchanged:
   ```
   .github/workflows/ci.yml:23:          node-version: 24
   .github/workflows/run-migrations.yml:55:          node-version: '24'
   .github/workflows/release.yml:18:          node-version: 24
   .github/actions/setup-environment/action.yml:15:        node-version: ${{ inputs.node }}
   ```
   No line reports `20`.

6. **The three default-relying workflows genuinely rely on the default (no `node:` override), confirming the edit covers build/lint/test** —
   ```bash
   grep -rn -A2 "uses: ./.github/actions/setup-environment" .github/workflows/
   ```
   Expected: `build.yml`, `lint.yml`, and `test.yml` each reference the composite action with **no** `with:`/`node:` block beneath it (the very next step is the affected nx command).

7. **CI is the acceptance test (Definition of Done)** — push the branch and confirm the reusable CI runs on Node 24. On `ci-pr.yml` (pull request to `main`/`develop`/`v*`) or `ci-p.yml` (push to any branch), the `ci-common.yml` → `lint.yml`/`build.yml`/`test.yml` jobs must report Node v24.x in the "Setup Node" step logs and go green. A local unit test is not meaningful for a CI runtime-version default; CI running green on Node 24 is the acceptance criterion.

## Notes

- **Working tree is already at the target on this checkout.** Commit `493a6bbf` already made this exact `'20'` → `'24'` change; `git status` is clean. Task 1's terminal state (line 6 == `default: '24'`) is idempotent — verify, and commit only when a real change was produced. Do not create a second, redundant commit when the value is already `24`.
- **Do not touch the other pins.** `ci.yml` uses unquoted `node-version: 24` with `actions/setup-node@v3`; `release.yml` uses `setup-node@v4` with unquoted `node-version: 24`; `run-migrations.yml` uses quoted `node-version: '24'` with `setup-node@v4`. Normalizing quote style, aligning the `setup-node` major version (v3 vs v4), or otherwise editing those lines is out of scope and violates the "no other Node-version pin is touched" criterion. Leave every one byte-for-byte identical.
- **Do not hard-code `24` into `lint.yml`/`build.yml`/`test.yml`.** Passing `node: '24'` into each workflow would defeat the purpose (the fix belongs in the default) and would touch files outside the allowed single-file scope.
- **`package.json` has no `engines` field** — nothing to add there; the Node floor is enforced by CI, not the manifest. There is no `.nvmrc` and no Dockerfile in the repo.
- **Documentation:** no doc change is required. This is an internal CI default with no consumer-facing impact (per the issue's Definition of Done).
- **Tests:** no new or updated tests are required. Correctness is verified by CI running green on Node 24 (Verification Step 7). There is no repo tooling to unit-test a GitHub Actions `default` value, and CLAUDE.md's coverage requirement applies to new application code, not CI configuration.
- **Angular 22 compatibility.** Node `24` satisfies the Angular 22 requirement `^22.22.3 || ^24.15.0 || >=26.0.0` because `actions/setup-node@v4` with `node-version: '24'` resolves the latest 24.x on `ubuntu-latest`, which is `>= 24.15.0`. A future runner image that resolves a sub-`24.15.0` 24.x would need a more specific pin — a separate concern outside this issue's single-line scope.
- **Prior plan drafts exist for this issue.** `docs/superpowers/plans/2026-09-08-standardize-ci-on-node-24.md` and `docs/superpowers/plans/2026-09-08-libs-node-24-ci-standardization.md` were added by earlier commits for the same issue; this document is the current dated plan and supersedes them for execution.
