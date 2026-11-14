<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (MatchCV)

- No auth, no database: all user data lives in browser localStorage via `src/lib/use-local-state.ts` — the product is intentionally account-free.
- AI calls go through `createServerFn`s in `src/lib/matchcv.functions.ts`, which lazily import the server-only gateway helper `src/lib/ai-gateway.server.ts` (Responses API, streamed, structured output) — keeps the key and prompts off the client.
- Server functions return `{ ok, data | error }` instead of throwing, so friendly Portuguese errors reach the UI without the request error middleware swallowing them.
- Overall match % is computed in code from AI dimension scores (`src/lib/scoring.ts`), and keyword lists are re-grounded against the literal resume text — keeps results tied to real input; covered by `src/lib/scoring.test.ts`.
- PDF/DOCX parsing and DOCX/PDF export run in the browser with lazily imported libraries (pdfjs-dist, mammoth browser build, docx, jspdf) so nothing browser-only loads during SSR.
