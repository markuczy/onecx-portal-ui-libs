Task 2 report - Separate PortalViewport spinner from globalLoading

Summary
-------
I updated dev-docs/errors-feedback/README.adoc to make clear that the Shell's PortalViewport spinner is driven by RoutesService.showContent$ (updated by RoutesService.loadChildren()), and that the libraries' globalLoading Topic is a separate page-global signal. The change is documentation-only and scoped to the single review comment.

Changes made
------------
- File modified: dev-docs/errors-feedback/README.adoc
  - Replaced the Mermaid loading diagram to show two distinct signals:
    - globalLoading Topic -> full-screen loading spinner
    - RoutesService.loadChildren() -> RoutesService.showContent$ -> PortalViewport spinner (bound to showContent$)
  - Added an explicit explanatory sentence clarifying the PortalViewport spinner binding and that publishing globalLoading does not toggle it.

Verification performed
---------------------
- Confirmed the task brief and review guidance at:
  .superpowers/sdd/review-plan/task-2-brief.md
- Committed changes inside the target-repo Git repository.
  - Commit: a2bf984e (short SHA)
  - Commit message: "docs(errors-feedback): separate PortalViewport spinner signal from globalLoading (Task 2)"
- Ran git diff --check in the target-repo; no whitespace errors reported.

Source verification
-------------------
Per the review brief and PR discussion, the Shell implementation updates RoutesService.showContent$ during loadChildren() and the PortalViewportComponent binds its spinner to routesService.showContent$. I did not modify source code; the documentation now reflects those signals as distinct.

Notes
-----
- The change is intentionally scoped to the one review comment. No source or other documentation files were modified.
- No tests required or run; this is a docs-only correction.

If you want, I can also open a PR with this commit or update related pages referencing the spinner signal.

Fix report (applied to address remaining diagram edge)
-----------------------------------------------
I removed the Mermaid edge that connected `globalLoading Topic` to the full-screen spinner so the diagram no longer implies that publishing `globalLoading` drives the PortalViewport spinner. To verify, I ran the following command in the target-repo and captured its output:

Command:
  git -C .tmp-pr-agent/target-repo diff --check

Output:

(no output)

