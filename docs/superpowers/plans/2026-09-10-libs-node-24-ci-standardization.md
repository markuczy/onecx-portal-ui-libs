# Libs — Standardize CI on Node 24 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `setup-environment` composite action's Node-version default `24` so that every CI job that inherits the default (build/lint/test) runs on Node 24, as a single targeted default-value change with no other Node pin touched.

**Architecture:** The repository routes Node setup through a single composite action, `.github/actions/setup-environment/action.yml`, whose `node` input has a `default` and is passed to `actions/setup-node@v4` as `node-version: ${{ inputs.node }}`. Three workflow files — `build.yml`, `lint.yml`, `test.yml` — invoke the action with no `with: node:` override, so they inherit that default. Three other files — `ci.yml`, `release.yml`, `run-migrations.yml` — set `node-version` directly to `24`. Fixing the one default to `24` aligns the default-inheriting jobs with the already-pinned ones.

**Tech Stack:** GitHub Actions (composite action + reusable workflows), `actions/setup-node@v4`, YAML. No application code, no package.json, no tests.

**Spec:** https://github.com/onecx/internal-tasks/issues/706

## Global Constraints

- **Single targeted edit:** Change exactly one token — the `node` input `default` in `.github/actions/setup-environment/action.yml` from `'20'` to `'24'`.
- **Do NOT touch any other Node-version pin:** Leave `ci.yml:23` (`node-version: 24`), `release.yml:18` (`node-version: 24`), and `run-migrations.yml:55` (`node-version: '24'`) byte-for-byte unchanged.
- **Do NOT touch action-version pins:** `actions/setup-node@v3` (in `ci.yml:21`) and `@v4` references are GitHub Action version tags, not Node versions — out of scope.
- **No other file changes:** Do not modify `build.yml`, `lint.yml`, `test.yml` (they correctly inherit the default). Do not add a `node:` override to any workflow — the acceptance criterion requires they *rely on the default*.
- **Documentation:** No consumer-facing documentation change. The only doc artifacts are agent planning docs under `docs/superpowers/plans/` — do not add consumer docs (Antora `dev-docs/`, `docs/antora.yml`, library `README.md`) because this change has no consumer-facing impact.
- **Tests:** No new or updated test files. This is a CI configuration change with no testable application code; verification is static checks plus the PR's own CI running green on Node 24.

---

### Task 1: Set the setup-environment Node default to 24

**Files:**
- Modify: `.github/actions/setup-environment/action.yml:6` (the `default:` line under `inputs.node`)

**Interfaces:**
- Consumes: the `node` input (optional) of the `setup-environment` composite action; currently `default: '20'`.
- Produces: the same input with `default: '24'`. Downstream consumers (`build.yml`, `lint.yml`, `test.yml`) pick up Node 24 with no change to their own files because they invoke the action with no `with: node:` override.

- [ ] **Step 1: Confirm the current value**

Run: `grep -n "default:" .github/actions/setup-environment/action.yml`
Expected: one line, `    default: '20'` (indented 4 spaces, single-quoted `20`).

If the line already reads `default: '24'`, this fix has already landed on this branch (see commit `493a6bbf`); stop this task and record that no edit is needed — do not re-edit.

- [ ] **Step 2: Apply the single-line edit**

In `.github/actions/setup-environment/action.yml`, replace exactly this 5-line block:

```yaml
inputs:
  node:
    description: 'Node version'
    default: '20'
    required: false
```

with:

```yaml
inputs:
  node:
    description: 'Node version'
    default: '24'
    required: false
```

The only difference is `default: '20'` → `default: '24'`. Keep the single quotes and the 4-space indentation. Do not alter `description`, `required`, or the `runs:`/`steps:` block below (the action must keep `node-version: ${{ inputs.node }}` and `cache: 'npm'`).

- [ ] **Step 3: Confirm the change**

Run: `grep -n "default:" .github/actions/setup-environment/action.yml`
Expected: `    default: '24'`.

- [ ] **Step 4: Commit**

```bash
git add .github/actions/setup-environment/action.yml
git commit -m "fix: standardize CI on Node 24 by defaulting setup-environment to 24"
```

---

## Verification Steps

Run these after Task 1. All are static checks or the PR's own CI — no local npm test/lint task exists for CI YAML, so the `.vscode/tasks.json` "current work" tasks do not apply here.

- [ ] **V1 — The default is 24 and it is the only default change:**
  Run: `git diff HEAD~1 -- .github/actions/setup-environment/action.yml`
  Expected: exactly one changed line, `-    default: '20'` and `+    default: '24'`. No other lines in this file change.

- [ ] **V2 — No other Node-version pin changed in the whole repo:**
  Run: `git diff --name-only`
  Expected: the only changed file is `.github/actions/setup-environment/action.yml` (plus the plan doc `docs/superpowers/plans/2026-09-10-libs-node-24-ci-standardization.md`).
  Then confirm the three existing direct pins are untouched and still read 24:
  Run: `grep -rn "node-version" .github/workflows/`
  Expected:
  - `.github/workflows/ci.yml:23:          node-version: 24`
  - `.github/workflows/release.yml:18:          node-version: 24`
  - `.github/workflows/run-migrations.yml:55:          node-version: '24'`
  (unchanged from before the edit)

- [ ] **V3 — The default-inheriting jobs are unchanged and still have no node override:**
  Run: `grep -rn -A2 "uses: ./.github/actions/setup-environment" .github/workflows/`
  Expected: `build.yml`, `lint.yml`, and `test.yml` each invoke `uses: ./.github/actions/setup-environment` with no `with: node:` override, so they now resolve to Node 24 via the default.

- [ ] **V4 — YAML is still valid (optional sanity check):**
  Run: `node -e "const y=require('js-yaml');const f=require('fs');for(const p of ['.github/actions/setup-environment/action.yml','.github/workflows/build.yml','.github/workflows/lint.yml','.github/workflows/test.yml']){y.load(f.readFileSync(p,'utf8'));console.log('ok',p)}"`
  Expected: `ok` printed for all four files (no parse error). If `js-yaml` is not installed, skip this check — it is a sanity aid, not a gate.

- [ ] **V5 — Acceptance via CI (final gate):** On the pull request, the `build`, `lint`, and `test` jobs (routed through `ci-common.yml` → `build.yml`/`lint.yml`/`test.yml`) must run green with `node-version` resolving to 24, and the `On Push`/`On PR` workflows already pinned to 24 remain green. This is the recorded "no new tests" verification for the issue.

## Notes

- **Current branch state:** On this branch (`feat/spec-682/onecx-onecx-portal-ui-libs-main`), the target line in `.github/actions/setup-environment/action.yml` already reads `default: '24'` at HEAD; the original single-line fix is commit `493a6bbf` (2026-09-04), with follow-up plan/docs at `014df983` and `a8376207`. Step 1 of Task 1 is written to detect this so an implementer on a fresh checkout (where the line is still `'20'`) performs the edit, while an implementer here records no-op.
- **Scope boundary (parent issue #682):** This issue is strictly the Node-24 CI default. The downstream "Angular 22 bump" (Node requirement `^22.22.3 || ^24.15.0 || >=26.0.0`) is a separate issue (`7e391ff9`, #707 Phase A) and is NOT part of this plan.
- **Risks:** Minimal. The change is a single default token; the only behavioral effect is that the three default-inheriting jobs move from Node 20 to Node 24. If any build/lint/test job fails on Node 24, that is a downstream dependency/engineering issue surfaced by the bump — not a defect in this one-line fix — and should be triaged separately.
- **Out of scope:** `actions/setup-node` major-version bumps (`@v3`/`@v4`), `engines` fields (none present), and any `.nvmrc`/`.node-version`/`.tool-versions` file (none present at the repository root).
