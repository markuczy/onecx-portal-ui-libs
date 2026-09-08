# Libs — Standardize CI on Node 24: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `setup-environment` composite action default to Node 24 so every CI job (build/lint/test) that relies on that default runs on Node 24, closing the last CI gap before the Angular 22 bump.

**Architecture:** A single, targeted default-value fix in `.github/actions/setup-environment/action.yml`. `ci-common.yml` invokes the reusable workflows `lint.yml`, `build.yml`, and `test.yml`, each of which calls `./.github/actions/setup-environment` **without** a `node` input. That means all three resolve the composite action's `default` value. Changing that one default from `'20'` to `'24'` standardizes the three jobs on Node 24. No workflow file, no dependency file, and no other Node pin is touched.

**Tech Stack:** GitHub Actions (composite action + reusable workflows), `actions/setup-node@v4`, `npm ci` (npm package manager).

**Spec:** onecx/internal-tasks#706 (part of onecx/internal-tasks#682, OneCX Angular 22 / Optimus UI Migration).

## Global Constraints

- Only `.github/actions/setup-environment/action.yml` may be modified. No other file changes.
- No other Node-version pin in the repo is touched. The existing pins that stay exactly as-is:
  - `.github/workflows/ci.yml:23` → `node-version: 24`
  - `.github/workflows/release.yml:18` → `node-version: 24`
  - `.github/workflows/run-migrations.yml:55` → `node-version: '24'`
- Target Node version is `24` (quoting style matches the surrounding file: single-quoted string).
- The Angular 22 runtime requirement is `Node ^22.22.3 || ^24.15.0 || >=26.0.0`; `24` satisfies it.
- No documentation change is required (internal CI default, no consumer-facing impact).
- No new or updated tests are required (verified by CI running green on Node 24).

## Problem Statement

The `setup-environment` composite action (`.github/actions/setup-environment/action.yml`) declares a stale default Node version. The three reusable CI workflows that do the real work — `build.yml`, `lint.yml`, and `test.yml` — invoke this composite action without specifying a `node` input, so they inherit the default. While `ci.yml`, `release.yml`, and `run-migrations.yml` already pin Node `24` explicitly, the default-driven build/lint/test path was left on an older Node version. The end state: the composite action's default is `24`, so every default-relying CI job runs on Node 24, and this is the last CI gap before the Angular 22 bump.

## Approach

Change the single `default` value of the `node` input in the composite action from `'20'` to `'24'`. This is a one-line edit with no code logic. Because the three jobs (`build`/`lint`/`test`) consume the default rather than passing an explicit version, this single edit is sufficient and complete — it is also the only place a Node-version change is warranted. All other Node pins are already `24` and must be left untouched to keep the change a single, targeted default-value fix.

**Observed working-tree state (verify before editing):** As of planning, the file at `.github/actions/setup-environment/action.yml` line 6 already reads `default: '24'`, introduced by commit `493a6bbf` ("fix: implement issue #706 - Libs — Standardize CI on Node 24"). The concrete outcome of Task 1 is unambiguous either way — line 6 must read `default: '24'`. If it already does, Task 1 is a no-op and verification still passes. This is a verify-and-confirm action, not a conditional.

## File-Level Task List

### Task 1: Set the `setup-environment` Node default to `24`

- **Path** — `.github/actions/setup-environment/action.yml`
- **Action** — modify
- **Summary** — Change the `default` value of the `node` input so the composite action sets up Node 24. This is the only line that changes.

**Current file (relevant lines 3–7):**
```yaml
inputs:
  node:
    description: 'Node version'
    default: '20'
    required: false
```

**Target state (relevant lines 3–7):**
```yaml
inputs:
  node:
    description: 'Node version'
    default: '24'
    required: false
```

**Concrete TODOs:**
- [ ] Open `.github/actions/setup-environment/action.yml`.
- [ ] Locate the `node:` input block (lines 4–7). Confirm the line reads `default: '20'`. If it already reads `default: '24'`, stop — the value is correct and no edit is needed.
- [ ] If the line is `default: '20'`, replace it with `default: '24'` (keep single quotes, keep the same indentation — 4 spaces before `default:`). Do not change the `description: 'Node version'` or `required: false` lines.
- [ ] Confirm the rest of the file is untouched — specifically the step at lines 12–16 that runs `actions/setup-node@v4` with `node-version: ${{ inputs.node }}` must remain exactly as-is (it consumes the input and must not be hard-coded).
- [ ] Save the file.
- [ ] Commit (only if a change was made):

```bash
git add .github/actions/setup-environment/action.yml
git commit -m "ci: standardize setup-environment default on Node 24

Standardize the setup-environment composite action's Node default on 24
so the build/lint/test CI jobs that rely on the default run on Node 24.
Part of OneCX Angular 22 / Optimus UI Migration (#682).

Implements onecx/internal-tasks#706"
```

**Dependencies** — none.

## Verification Steps

Run these from the repository root. All must pass.

1. **The single intended change is present and correct:**

```bash
grep -n "default: '24'" .github/actions/setup-environment/action.yml
```
Expected: exactly one match on the `node` input block (line 6): `    default: '24'`.

2. **No `20` default remains anywhere in the action:**

```bash
grep -n "default: '20'" .github/actions/setup-environment/action.yml
```
Expected: no output (zero matches).

3. **The step that consumes the input is unchanged (still uses the input, not a hard-coded value):**

```bash
grep -n "node-version: \${{ inputs.node }}" .github/actions/setup-environment/action.yml
```
Expected: exactly one match (line 15).

4. **Scope is a single file — confirm the diff touches only the action:**

```bash
git diff --name-only HEAD~1
```
(Or, if the tree already matched the target and no commit was made, confirm a clean tree:)
```bash
git status --short
```
Expected: only `.github/actions/setup-environment/action.yml` changed (or, in the no-op case, a clean working tree).

5. **All other Node pins are untouched and remain on `24`** (regression guard for the "no other pin touched" criterion):

```bash
grep -rn "node-version" .github/ | grep -v "inputs.node"
```
Expected: exactly these lines, all already `24`, unchanged:
```
.github/workflows/ci.yml:23:          node-version: 24
.github/workflows/run-migrations.yml:55:          node-version: '24'
.github/workflows/release.yml:18:          node-version: 24
```

6. **The three default-relying workflows genuinely rely on the default (no `node` input is passed), confirming the edit covers build/lint/test:**

```bash
grep -rn -A2 "uses: ./.github/actions/setup-environment" .github/workflows/
```
Expected: `build.yml`, `lint.yml`, and `test.yml` each reference the composite action with no `with:`/`node:` override beneath it.

7. **CI itself is the acceptance test (Definition of Done):** push the branch and confirm the reusable CI runs on Node 24. On `ci-pr.yml` (pull request to `main`/`develop`/`v*`) or `ci-p.yml` (push to any branch), the `ci-common.yml` → `lint.yml`/`build.yml`/`test.yml` jobs must report Node v24.x in the "Setup Node" step logs and go green. No local test is meaningful for a CI runtime-version default.

## Notes

- **Working tree may already be at the target.** Commit `493a6bbf` already made this exact `'20'` → `'24'` change on this checkout. Task 1's outcome (line 6 == `default: '24'`) is idempotent: verify, and only commit if a change was actually made. Do not create a second, redundant commit if the value is already `24`.
- **Do not "helpfully" touch the other pins.** `ci.yml` uses unquoted `node-version: 24` and `actions/setup-node@v3`; `run-migrations.yml` uses quoted `node-version: '24'` and `setup-node@v4`. Normalizing quote style or bumping the `setup-node` major version is explicitly out of scope and violates the "no other Node-version pin is touched" criterion. Leave every one of them byte-for-byte identical.
- **Do not hard-code `24` into `lint.yml`/`build.yml`/`test.yml`.** Passing `node: '24'` into each workflow would defeat the purpose (the fix belongs in the default) and would touch files outside the allowed scope.
- **`package.json` has no `engines` field** — nothing to add there; the Node floor is enforced by CI, not by the manifest.
- **Documentation:** no doc change is required. This is an internal CI default with no consumer-facing impact (per the issue's Definition of Done).
- **Tests:** no new/updated tests are required. Correctness is verified by CI running green on Node 24 (Verification step 7). There is no repo tooling to unit-test a GitHub Actions `default` value, and CLAUDE.md's coverage requirement applies to new application code, not CI configuration.
- **Angular 22 compatibility:** Node `24` satisfies the Angular 22 requirement `^22.22.3 || ^24.15.0 || >=26.0.0` only if the concrete 24.x on `ubuntu-latest` is `>= 24.15.0`. `actions/setup-node@v4` with `node-version: '24'` resolves the latest 24.x, so this holds. If a future `24.x` on the runner image ever drops below `24.15.0`, the follow-up is to pin `24.15.x+` — but that is a separate concern outside this issue's single-line scope.
