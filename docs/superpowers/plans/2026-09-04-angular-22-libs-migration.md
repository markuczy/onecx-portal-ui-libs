# Angular 21→22 Libs Migration (Phase A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump the `onecx-portal-ui-libs` monorepo from Angular 21 / Nx 22.3.3 to Angular 22 / Nx ≥23.1.0 via a single coordinated `nx migrate` pass, carrying along the TypeScript, `ng-packagr`, `jest-preset-angular`, and `@storybook/angular` bumps, applying the official `OnPush`-by-default migration schematic wholesale, and updating `@angular/*` peerDependency ranges only in the libs that already declare them.

**Architecture:** This is a dependency/tooling upgrade, not a feature change. The workflow is: (1) run `nx migrate 23.1.0` to update `package.json` and generate `migrations.json` entries, (2) install updated dependencies with `npm install`, (3) run `nx migrate --run-migrations` to execute Nx/Angular codemods (including the `OnPush`-by-default schematic) across all affected files, (4) edit the `@angular/*` peerDependency ranges in the 11 published libs' `package.json` files that already declare them, plus the `typescript` peerDependency in `angular-integration-interface`, (5) run build/lint/test/Storybook across the whole workspace and commit the result.

**Tech Stack:** Angular 22, Nx ≥23.1.0 (nx, @nx/angular, @nx/esbuild, @nx/eslint, @nx/eslint-plugin, @nx/jest, @nx/js, @nx/node, @nx/plugin, @nx/react, @nx/storybook, @nx/vite, @nx/web, @nx/workspace), TypeScript `>=6.0 <6.1`, `ng-packagr` `^22.x`, `jest-preset-angular` `^16.2.0`+, `@storybook/angular` `^10.6.0`+, Jest, npm.

**Spec:** GitHub issue onecx/internal-tasks#707 (Libs — Angular 21→22 bump, Phase A), part of onecx/internal-tasks#682.

## Global Constraints

- Use a single coordinated `nx migrate 23.1.0` → `npm install` → `nx migrate --run-migrations` pass. Do NOT run manual `ng update`.
- Final Nx version is `>=23.1.0`.
- Final TypeScript version is `>=6.0 <6.1` (a `6.0.x` release).
- Final `ng-packagr` version is `^22.x`.
- Final `jest-preset-angular` version is `^16.2.0` or higher.
- Final `@storybook/angular` version is `^10.6.0` or higher, with NO framework switch (keep `@storybook/angular`, do not migrate to a different Storybook framework/builder).
- The official `OnPush`-by-default migration schematic output is accepted as-is for every component lacking an explicit `changeDetection` property — no manual per-component review of the resulting annotation.
- `@angular/*` peerDependency ranges change from `^21.0.0` to `^22.0.0` in exactly these 11 files, which are the only `package.json` files under `libs/` that declare an `@angular/*` peerDependency (confirmed by repository inspection): `libs/angular-accelerator/package.json`, `libs/angular-auth/package.json`, `libs/angular-integration-interface/package.json`, `libs/angular-remote-components/package.json`, `libs/angular-standalone-shell/package.json`, `libs/angular-testing/package.json`, `libs/angular-utils/package.json`, `libs/angular-webcomponents/package.json`, `libs/ngrx-accelerator/package.json`, `libs/ngrx-integration-interface/package.json`, `libs/shell-auth/package.json`. No other libs' `package.json` peerDependencies are touched.
- `libs/angular-integration-interface/package.json`'s own `typescript` peerDependency changes from `^5.5.4` to `^6.0.0`.
- Node 24 is already the CI/dev runtime (`.github/workflows/ci.yml`, `release.yml`, `run-migrations.yml` pin `node-version: 24`; local runtime is v24.20.0) — no Node version change is required by this plan.
- No documentation file is authored or modified by this plan. The `angular-22/index.adoc` guide is produced by the separate v9.0.0 cutover ticket, not this one.
- No new test infrastructure, test framework, or test runner is introduced. Existing Jest specs under `libs/*/src/**/*.spec.ts` and Storybook stories under `libs/*/.storybook/` and `libs/*/**/*.stories.ts` are the sole verification surface; only edits to existing spec files are permitted, to keep them passing against the new `OnPush` default.

---

### Task 1: Run `nx migrate` to update root `package.json` and generate migration definitions

**Files:**
- Modify: `package.json` (root)
- Modify: `migrations.json`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: an updated root `package.json` with `nx` and all `@nx/*` packages at `>=23.1.0`, `@angular/*` core packages at `22.x`, `typescript` at `6.0.x`, `ng-packagr` at `^22.x`, `jest-preset-angular` at `^16.2.0`+, `@storybook/angular` at `^10.6.0`+. `migrations.json` contains the ordered list of pending migrations, consumed by Task 3.

- [ ] **Step 1: Record current versions for later diffing**

Run: `grep -E '"(nx|@nx/|typescript|@angular/core|@angular/cli|ng-packagr|jest-preset-angular|@storybook/angular|@angular-devkit)"' package.json > /tmp/pre-migrate-versions.txt && cat /tmp/pre-migrate-versions.txt`

This captures the pre-migration baseline: `nx` 22.3.3, `@angular/core` `^21.1.6`, `typescript` `5.9.3`, `ng-packagr` `^21.0.1`, `jest-preset-angular` `^16.0.0`, `@storybook/angular` `^10.2.15`.

- [ ] **Step 2: Run the Nx migrate command targeting Nx 23.1.0**

Run: `npx nx migrate 23.1.0`

This updates `package.json` in place and writes the ordered migration list to `migrations.json`.

- [ ] **Step 3: Set explicit floor versions for packages not managed by the Nx migration generator**

Open `package.json` and set these three dependency entries to the exact values below, overwriting whatever `nx migrate` wrote for them:
- `"ng-packagr": "^22.0.0"`
- `"jest-preset-angular": "^16.2.0"`
- `"@storybook/angular": "^10.6.0"`

- [ ] **Step 4: Verify package.json meets every version floor**

Run: `grep -E '"(nx|@nx/|typescript|@angular/core|@angular/cli|ng-packagr|jest-preset-angular|@storybook/angular|@angular-devkit)"' package.json`

Confirm: `@angular/core` reads `^22.0.0`, `@angular/cli` reads `22.x`, `nx` and all `@nx/*` packages read `>=23.1.0`, `typescript` reads `6.0.x`, `ng-packagr` reads `^22.0.0`, `jest-preset-angular` reads `^16.2.0`, `@storybook/angular` reads `^10.6.0`.

- [ ] **Step 5: Commit the migration manifest**

```bash
git add package.json migrations.json
git commit -m "chore: nx migrate to 23.1.0 for Angular 22 bump (Phase A step 1/5)"
```

---

### Task 2: Install updated dependencies

**Files:**
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: the `package.json` produced by Task 1.
- Produces: `node_modules` populated with Angular 22 / Nx 23.1.x / TypeScript 6.0.x / `ng-packagr` 22.x / `jest-preset-angular` 16.2.x+ / `@storybook/angular` 10.6.x+ packages, consumed by Task 3 and all later verification.

- [ ] **Step 1: Install dependencies from the updated manifest**

Run: `npm install`

- [ ] **Step 2: Verify installed versions match the target floors**

Run: `npx nx report`

Confirm: `nx` >= 23.1.0, `@angular/core` at `22.x`, `typescript` at `6.0.x`. Compare against `/tmp/pre-migrate-versions.txt` from Task 1 to confirm every package actually changed.

- [ ] **Step 3: Commit the lockfile**

```bash
git add package-lock.json
git commit -m "chore: install Angular 22 / Nx 23.1.x dependencies (Phase A step 2/5)"
```

---

### Task 3: Run `nx migrate --run-migrations` to execute codemods, including OnPush-by-default

**Files:**
- Modify: every `*.component.ts` file under `libs/*/src/**`, `libs/*/mocks/**`, and `libs/*/testing/**` that currently lacks an explicit `changeDetection` property inside its `@Component()` decorator.
- Modify: `migrations.json` (migrations marked executed by the tool).
- Modify: any `project.json`, `jest.config.ts`, or `tsconfig*.json` file that the executed migrations rewrite as part of their codemod.

**Interfaces:**
- Consumes: the installed toolchain from Task 2 and the migration list in `migrations.json` from Task 1.
- Produces: source files annotated with `changeDetection: ChangeDetectionStrategy.OnPush` on every component that previously had no explicit `changeDetection`, ready for Task 4's peerDependency edits and Task 5's verification.

- [ ] **Step 1: Snapshot the list of components currently lacking explicit changeDetection**

Run: `grep -rL "changeDetection" $(grep -rl "@Component(" libs --include="*.component.ts") > /tmp/components-without-changedetection.txt && wc -l /tmp/components-without-changedetection.txt`

- [ ] **Step 2: Execute the Nx migration runner**

Run: `npx nx migrate --run-migrations`

This executes every migration listed in `migrations.json` in order, including the Angular `OnPush`-by-default codemod bundled with the Angular 22 migration set, rewriting every component file recorded in Task 3 Step 1 to add an explicit `changeDetection: ChangeDetectionStrategy.OnPush` property.

- [ ] **Step 3: Verify the OnPush schematic was applied to every recorded component**

Run: `for f in $(cat /tmp/components-without-changedetection.txt); do grep -L "changeDetection" "$f"; done | wc -l`

Confirm output is `0` — every component file from the Task 3 Step 1 snapshot now contains a `changeDetection` property added by the schematic.

- [ ] **Step 4: Review the diff for scope sanity**

Run: `git status --porcelain | wc -l && git diff --stat | tail -5`

Confirm the changed-file count is dominated by `*.component.ts` files plus the config files rewritten by the migrations; `.stories.ts` files show no content changes beyond what the codemod's import reordering produces.

- [ ] **Step 5: Commit the migration output**

```bash
git add -A
git commit -m "chore: apply Nx/Angular 22 automated migrations incl. OnPush-by-default schematic (Phase A step 3/5)"
```

---

### Task 4: Update `@angular/*` peerDependency ranges and `angular-integration-interface`'s `typescript` peerDependency

**Files:**
- Modify: `libs/angular-accelerator/package.json`
- Modify: `libs/angular-auth/package.json`
- Modify: `libs/angular-integration-interface/package.json`
- Modify: `libs/angular-remote-components/package.json`
- Modify: `libs/angular-standalone-shell/package.json`
- Modify: `libs/angular-testing/package.json`
- Modify: `libs/angular-utils/package.json`
- Modify: `libs/angular-webcomponents/package.json`
- Modify: `libs/ngrx-accelerator/package.json`
- Modify: `libs/ngrx-integration-interface/package.json`
- Modify: `libs/shell-auth/package.json`

**Interfaces:**
- Consumes: nothing new beyond the confirmed peerDependency inventory listed in Global Constraints.
- Produces: published-lib manifests with `@angular/*` peerDependency ranges at `^22.0.0` and `angular-integration-interface`'s `typescript` peerDependency at `^6.0.0`, consumed by Task 5's build verification.

- [ ] **Step 1: Bump `@angular/*` ranges in `libs/angular-accelerator/package.json`**

In the `peerDependencies` block, change `@angular/common`, `@angular/core`, `@angular/cdk`, `@angular/forms`, `@angular/platform-browser`, `@angular/router` from `"^21.0.0"` to `"^22.0.0"`. Leave `@onecx/angular-integration-interface`, `@onecx/angular-remote-components`, `@onecx/angular-testing`, `@onecx/angular-utils` unchanged.

- [ ] **Step 2: Bump `@angular/*` ranges in `libs/angular-auth/package.json`**

In `peerDependencies`, change `@angular/common` and `@angular/core` from `"^21.0.0"` to `"^22.0.0"`. Leave `@onecx/angular-integration-interface` unchanged.

- [ ] **Step 3: Bump `@angular/*` and `typescript` ranges in `libs/angular-integration-interface/package.json`**

In `peerDependencies`, change `@angular/core` from `"^21.0.0"` to `"^22.0.0"`, and change `typescript` from `"^5.5.4"` to `"^6.0.0"`.

- [ ] **Step 4: Bump `@angular/*` ranges in `libs/angular-remote-components/package.json`**

In `peerDependencies`, change `@angular/cdk`, `@angular/common`, `@angular/core` from `"^21.0.0"` to `"^22.0.0"`. Leave `@onecx/angular-utils` unchanged.

- [ ] **Step 5: Bump `@angular/*` ranges in `libs/angular-standalone-shell/package.json`**

In `peerDependencies`, change `@angular/common`, `@angular/core`, `@angular/router` from `"^21.0.0"` to `"^22.0.0"`. Leave `@onecx/angular-integration-interface`, `@onecx/angular-webcomponents`, `@onecx/angular-utils`, `@onecx/angular-auth` unchanged.

- [ ] **Step 6: Bump `@angular/*` ranges in `libs/angular-testing/package.json`**

In `peerDependencies`, change `@angular/cdk` from `"^21.0.0"` to `"^22.0.0"`.

- [ ] **Step 7: Bump `@angular/*` ranges in `libs/angular-utils/package.json`**

In `peerDependencies`, change `@angular/cdk`, `@angular/common`, `@angular/core`, `@angular/router`, `@angular/platform-browser` from `"^21.0.0"` to `"^22.0.0"`. Leave `@onecx/angular-integration-interface` unchanged.

- [ ] **Step 8: Bump `@angular/*` ranges in `libs/angular-webcomponents/package.json`**

In `peerDependencies`, change `@angular/common`, `@angular/core`, `@angular/platform-browser`, `@angular/elements`, `@angular/router` from `"^21.0.0"` to `"^22.0.0"`. Leave `@onecx/angular-integration-interface`, `@onecx/angular-utils` unchanged.

- [ ] **Step 9: Bump `@angular/*` ranges in `libs/ngrx-accelerator/package.json`**

In `peerDependencies`, change `@angular/core`, `@angular/router` from `"^21.0.0"` to `"^22.0.0"`.

- [ ] **Step 10: Bump `@angular/*` ranges in `libs/ngrx-integration-interface/package.json`**

In `peerDependencies`, change `@angular/core` from `"^21.0.0"` to `"^22.0.0"`. Leave `@onecx/angular-integration-interface` unchanged.

- [ ] **Step 11: Bump `@angular/*` ranges in `libs/shell-auth/package.json`**

In `peerDependencies`, change `@angular/core` from `"^21.0.0"` to `"^22.0.0"`. Leave `@onecx/angular-integration-interface`, `@onecx/angular-utils` unchanged.

- [ ] **Step 12: Verify the peerDependency edits are complete and scoped correctly**

Run:
```bash
for f in libs/angular-accelerator/package.json libs/angular-auth/package.json libs/angular-integration-interface/package.json libs/angular-remote-components/package.json libs/angular-standalone-shell/package.json libs/angular-testing/package.json libs/angular-utils/package.json libs/angular-webcomponents/package.json libs/ngrx-accelerator/package.json libs/ngrx-integration-interface/package.json libs/shell-auth/package.json; do
  echo "=== $f ==="
  grep '"@angular/' "$f"
done
```

Confirm every line shows `^22.0.0`. Then run: `git diff --stat -- 'libs/*/package.json' | grep -v -E 'angular-accelerator|angular-auth|angular-integration-interface|angular-remote-components|angular-standalone-shell|angular-testing|angular-utils|angular-webcomponents|ngrx-accelerator|ngrx-integration-interface|shell-auth'` and confirm this produces empty output, proving no other lib's `package.json` was touched.

- [ ] **Step 13: Commit the peerDependency updates**

```bash
git add libs/angular-accelerator/package.json libs/angular-auth/package.json libs/angular-integration-interface/package.json libs/angular-remote-components/package.json libs/angular-standalone-shell/package.json libs/angular-testing/package.json libs/angular-utils/package.json libs/angular-webcomponents/package.json libs/ngrx-accelerator/package.json libs/ngrx-integration-interface/package.json libs/shell-auth/package.json
git commit -m "chore: bump @angular/* peerDependency ranges to ^22.0.0 and angular-integration-interface typescript peer (Phase A step 4/5)"
```

---

### Task 5: Fix build/lint/test breakage introduced by the migration and verify a green workspace

**Files:**
- Modify: `libs/*/src/**/*.spec.ts` files whose assertions depend on default (non-`OnPush`) change detection timing, discovered by running Step 3 below.
- Modify: `libs/angular-accelerator/.storybook/main.ts` if the Storybook 10.6.x build in Step 4 reports a config-shape error for renamed option keys.

**Interfaces:**
- Consumes: the fully migrated dependency tree and peerDependency updates from Tasks 1–4.
- Produces: a workspace that builds, lints, and tests green, satisfying the issue's acceptance criteria.

- [ ] **Step 1: Run the full affected build**

Run: `npx nx run-many -t build`

Fix each reported compile error at its reported file and line (for example, an import path renamed by Angular 22 or a type error surfaced by TypeScript 6.0's stricter checks), then re-run `npx nx run-many -t build` until it completes with exit code 0 for every project.

- [ ] **Step 2: Run the full affected lint**

Run: `npx nx run-many -t lint`

Fix each reported violation at its reported file and line, then re-run `npx nx run-many -t lint` until it completes with exit code 0 for every project.

- [ ] **Step 3: Run the full test suite with coverage**

Run: `npx nx run-many -t test --coverage`

For each spec file that fails because a component now defaults to `ChangeDetectionStrategy.OnPush` and no longer re-renders automatically after a property mutation, add an explicit `fixture.detectChanges()` call (or `fixture.componentRef.markForCheck()` followed by `fixture.detectChanges()`) immediately after the mutation in that spec, following the existing AAA structure of the file. Do not remove or alter the `changeDetection: ChangeDetectionStrategy.OnPush` property added by the Task 3 schematic. Re-run `npx nx run-many -t test --coverage` until all suites pass.

- [ ] **Step 4: Build Storybook for `angular-accelerator` to confirm the `@storybook/angular` 10.6.x bump works without a framework switch**

Run: `npx nx build-storybook angular-accelerator`

Confirm the build completes successfully using the existing `framework: { name: '@storybook/angular' }` entry in `libs/angular-accelerator/.storybook/main.ts`. The `framework.name` value stays `@storybook/angular`.

- [ ] **Step 5: Re-verify every version floor end-to-end**

Run: `npx nx report | grep -E "nx |@angular/core|typescript"` and `grep -E '"(ng-packagr|jest-preset-angular|@storybook/angular)"' package.json`

Confirm: `nx` >= 23.1.0, `@angular/core` at `22.x`, `typescript` at `6.0.x`, `ng-packagr` at `^22.0.0`, `jest-preset-angular` at `^16.2.0`, `@storybook/angular` at `^10.6.0`.

- [ ] **Step 6: Commit any fix-up changes**

```bash
git add -A
git commit -m "fix: resolve build/lint/test breakage from Angular 22 / Nx 23.1.x / TS 6.0 migration (Phase A step 5/5)"
```

---

## Verification Steps

Run the following commands from the repository root in order and confirm each passes:

1. `npx nx report` — confirm `nx` >= 23.1.0, `@angular/core` at `22.x`, `typescript` at a `6.0.x` version.
2. `grep -E '"(ng-packagr|jest-preset-angular|@storybook/angular)"' package.json` — confirm `ng-packagr` `^22.0.0`, `jest-preset-angular` `^16.2.0`, `@storybook/angular` `^10.6.0`.
3. `npx nx run-many -t build` — all projects build with exit code 0.
4. `npx nx run-many -t lint` — all projects lint with exit code 0.
5. `npx nx run-many -t test --coverage` — all test suites pass with exit code 0.
6. `npx nx build-storybook angular-accelerator` — Storybook build succeeds using `@storybook/angular` (no framework switch).
7. `for f in libs/angular-accelerator libs/angular-auth libs/angular-integration-interface libs/angular-remote-components libs/angular-standalone-shell libs/angular-testing libs/angular-utils libs/angular-webcomponents libs/ngrx-accelerator libs/ngrx-integration-interface libs/shell-auth; do grep -H '\^22.0.0' "$f/package.json" | grep '@angular/'; done` — confirms every target lib's `@angular/*` peerDependencies read `^22.0.0`.
8. `grep '"typescript"' libs/angular-integration-interface/package.json` — confirms `typescript` peerDependency is `^6.0.0`.
9. `for f in $(cat /tmp/components-without-changedetection.txt); do grep -L "changeDetection" "$f"; done | wc -l` — confirms `0`, i.e. every component that previously lacked `changeDetection` now has it.
10. `git diff --stat -- 'libs/*/package.json'` — confirms only the 11 target libs' `peerDependencies` blocks changed, no other lib manifests were touched.

## Notes

- This plan does not create or modify any `.adoc` documentation file; the `angular-22/index.adoc` guide is produced under the separate v9.0.0 cutover ticket.
- No new test infrastructure is introduced. Only existing Jest specs are edited in Task 5 Step 3, solely to accommodate the new `OnPush` default.
- The exact resolved Nx patch version from `npx nx migrate 23.1.0` satisfies `>=23.1.0` per the Global Constraints; this plan targets `23.1.0` as the concrete migration argument.
- The CI Node version blocker (Libs — Standardize CI on Node 24) is already satisfied: `.github/workflows/ci.yml`, `release.yml`, and `run-migrations.yml` already pin `node-version: 24`. No CI workflow changes are required by this plan.
- Risk: the `OnPush`-by-default schematic changes runtime change-detection behavior for every migrated component. Task 5 Step 3 addresses only Jest spec fallout within this repository. Downstream behavioral effects in consuming applications are tracked separately under the parent spec (onecx/internal-tasks#682), Phase B/C.
