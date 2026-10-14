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

## SideQuest architecture
- Use TanStack Router file routes for all pages; the fixed platform router preserves typed navigation and SSR.
- Share the navigation, footer, mascot, and preview through focused SideQuest components; brand tokens and presentation rules live in the global stylesheet.
- Keep seeded events and foundation counts explicitly illustrative; real ingestion and live counts are separate follow-up work.
- Discovery uses a typed browser-safe hackathonsApi with TanStack Query loader priming; replace the API implementation rather than page components when connecting live data.
- Derive statuses, countdowns, filters, and calendar exports in pure shared helpers so date and eligibility rules have deterministic tests.
- Store discovery filters, sort, pagination, and desktop detail selection in typed route search; bookmarks use account-keyed TanStack Query and user-scoped Cloud policies for persistence and isolation.
- Keep discovery reads behind public server functions using the publishable client; browser bookmark writes use the generated client with RLS so no privileged keys enter the UI.
- Keep a single root auth subscriber and shared auth context for session-aware navigation; public Quest Log renders an inline sign-in CTA and never fetches private data without a user.
- Serve the app manifest and minimal static-only service worker from public; never cache authenticated or API responses.
