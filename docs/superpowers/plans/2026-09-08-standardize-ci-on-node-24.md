# Standardize CI on Node 24 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `setup-environment` composite action's Node-version default `24`, so every CI job that relies on that default (build/lint/test) runs on Node 24, closing the last CI gap before the Angular 22 bump.

**Architecture:** A single composite action (`.github/actions/setup-environment/action.yml`) declares a `node` input whose `default` feeds `actions/setup-node`'s `node-version`. Three reusable workflows (`build.yml`, `lint.yml`, `test.yml`) call this action without passing `node:`, so they inherit the default. Changing the one default value to `'24'` therefore switches all three jobs to Node 24 with no workflow edits. This is deliberately a single, targeted default-value change — no other Node pin in the repo is touched.

**Tech Stack:** GitHub Actions (composite action + reusable workflows), `actions/setup-node`, Node.js 24, nx (affected build/lint/test targets).

**Spec:** GitHub issue onecx/internal-tasks#706 "Libs — Standardize CI on Node 24" (part of onecx/internal-tasks#682, "OneCX Angular 22 / Optimus UI Migration").

## Global Constraints

- Target value is exactly `24` (Node 24). Angular 22 (the follow-on bump, tracked by issue #707) requires Node `^22.22.3 || ^24.15.0 || >=26.0.0`; the repo standardizes on `24`.
- Keep the default wrapped in single quotes (`'24'`) to match the surrounding `inputs` block style and to stay consistent with `run-migrations.yml`'s quoted `'24'`.
- The change is exactly one line in exactly one file: `.github/actions/setup-environment/action.yml`, `default: '20'` → `default: '24'`. No other Node-version pin is modified.
- Do not touch the passthrough line `node-version: ${{ inputs.node }}` (it reads the input default; the default value is what changes).
- Do not modify the explicit `node-version: 24` pins in `ci.yml`, `release.yml`, or `run-migrations.yml`, nor the `setup-environment` call lines in `build.yml`/`lint.yml`/`test.yml`.
- Commit message format follows the repo's existing issue-implementing convention (e.g. `fix: implement issue #706 - Libs — Standardize CI on Node 24`).

---

### Task 1: Bump `setup-environment` Node default from `20` to `24`

**Files:**
- Modify: `.github/actions/setup-environment/action.yml:6`

**Interfaces:**
- Consumes: the `node` input declared in this same file (line 4, `description: 'Node version'`, `required: false`) whose `default` is currently `'20'`.
- Produces: `inputs.node` default = `'24'`, which flows through `node-version: ${{ inputs.node }}` (line 15) to `actions/setup-node@v4` (line 13). No signature or key changes — consumers (`build.yml`, `lint.yml`, `test.yml`) are unchanged and simply inherit the new default.

The file's relevant region before the edit (line numbers shown for orientation):

```yaml
inputs:
  node:
    description: 'Node version'
    default: '20'          # line 6 — CHANGE THIS to '24'
    required: false
```

- [ ] **Step 1: Confirm the target line is unique and at the expected location**

Run:
```bash
grep -n "default: '20'" .github/actions/setup-environment/action.yml
```
Expected: exactly one match, `6:    default: '20'`. (If the line already reads `default: '24'`, the repo is at the target state — the edit step becomes a no-op and Step 4's assertion already holds; proceed to Step 4 to confirm, then to Step 5.)

- [ ] **Step 2: Make the edit**

In `.github/actions/setup-environment/action.yml`, change the value of the `node` input's `default` key from `'20'` to `'24'`, preserving the 4-space indentation and single quotes.

Exact replacement (unique in this file):

```yaml
  node:
    description: 'Node version'
    default: '24'
    required: false
```

(i.e. replace the single line `    default: '20'` with `    default: '24'`.)

- [ ] **Step 3: Validate the YAML parses and the value is correct**

Run:
```bash
python3 -c "import yaml,sys; d=yaml.safe_load(open('.github/actions/setup-environment/action.yml')); print(d['inputs']['node']['default'])"
```
Expected: prints `24`. (If `python3`/`yaml` is unavailable, fall back to the Step 4 grep.)

- [ ] **Step 4: Assert no other Node pin changed and the three consumers still rely on the default**

Run:
```bash
echo "--- default value ---"
grep -n "default: '24'" .github/actions/setup-environment/action.yml
echo "--- full set of node-version pins (must be: action passthrough + ci/release/run-migrations at 24; NO '20' anywhere) ---"
grep -rn "node-version" .github/
echo "--- consumers of the composite action (must be build/lint/test, with NO 'with:'/'node:' override) ---"
grep -rln "actions/setup-environment" .github/workflows/
echo "--- confirm no stray '20' remains in the action file ---"
grep -n "default: '20'" .github/actions/setup-environment/action.yml || echo "OK: no 'default: 20' remains"
```
Expected:
- `default: '24'` present at line 6.
- `node-version` grep shows only: `actions/setup-environment/action.yml:15` (`${{ inputs.node }}`), `ci.yml:23` (`24`), `release.yml:18` (`24`), `run-migrations.yml:55` (`'24'`). No line shows `20`.
- Consumers are exactly `.github/workflows/build.yml`, `.github/workflows/lint.yml`, `.github/workflows/test.yml`.
- The final grep prints `OK: no 'default: 20' remains`.

- [ ] **Step 5: Review the diff and confirm it is a single one-line change to a single file**

Run:
```bash
git --no-pager diff --stat
git --no-pager diff
```
Expected: exactly one file changed, `.github/actions/setup-environment/action.yml`, with one insertion and one deletion:
```
-    default: '20'
+    default: '24'
```
If the working tree was already at `'24'` (Step 1 short-circuit), `git diff` is empty — that is the correct terminal state; proceed to Step 6.

- [ ] **Step 6: Commit**

```bash
git add .github/actions/setup-environment/action.yml
git commit -m "fix: implement issue #706 - Libs — Standardize CI on Node 24

Bumps the setup-environment composite action's Node-version default from
20 to 24 so the build/lint/test CI jobs that inherit the default run on
Node 24. Closes the last CI gap before the Angular 22 bump (requires
Node ^22.22.3 || ^24.15.0 || >=26.0.0). No other Node pin is touched.

Implements onecx/internal-tasks#706"
```

(If Step 1 showed the repo was already at `'24'` and Step 5's diff was empty, no commit is needed — the change is already present.)
