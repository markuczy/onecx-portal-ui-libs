Status: completed

Commit: fe9ef601
Subject: docs(shell-context): clarify runtime placeholder substitution and remove TKIT_* cross-repo claim

One-line checks: git diff --check (target-repo) passed; AsciiDoc cross-repo table remains four columns; changed files limited to the two docs specified.

Concerns:
- The entrypoint link references the docker-spa-base repository (link:https://github.com/onecx/docker-spa-base/blob/main/entrypoint.sh[entrypoint.sh]). The running image in the Shell Dockerfile is ghcr.io/onecx/docker-spa-base:2.39.0; if the entrypoint differs for that exact tag, the runtime substitution behavior should be re-verified against that tag.

Report path: .superpowers/sdd/review-plan/task-2-report.md

Fix applied: Updated entrypoint link in dev-docs/shell-context/runtime-configuration.adoc to point to tag 2.39.0 (blob/2.39.0/entrypoint.sh). Verified the tag's entrypoint contains the placeholder replacement loop. Ran `git diff --check` and committed the change.

---
Update: pinned entrypoint link in dev-docs/shell-context/configuration-kinds.adoc to the exact image tag (2.39.0) to match verified container behavior. Changed the single link from blob/main to blob/2.39.0.

Verification performed: ran git diff --check and inspected the staged diff for the targeted file. No whitespace or diff errors found.

Report path: .superpowers/sdd/review-plan/task-2-report.md
