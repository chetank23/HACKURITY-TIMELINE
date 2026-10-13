<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## HACKURITY architecture

- Keep event math, persistence hook, visual scene, timeline and controls in separate `src/features/hackurity` modules so animation frames never drive the event clock.
- This is a single-device installation: persist absolute event timestamps and settings locally, and derive elapsed time on every clock update rather than decrementing counters.
- Render the installation on a proportionally scaled 1920×1080 stage with safe margins; use native Canvas/SVG for bounded continuous animation and CSS semantic tokens for all visual colors.
