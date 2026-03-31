# AI Rules

## Tech stack

- **Frontend:** React 19 + TypeScript
- **Build tool:** Vite 7, with the app rooted in `client/`
- **Routing:** `wouter` for client-side routes in `client/src/App.tsx`
- **Styling:** Tailwind CSS 4 for all layout and visual styling
- **UI components:** `shadcn/ui` components from `client/src/components/ui/`, built on Radix UI
- **Icons:** `lucide-react`
- **Client data layer:** `@tanstack/react-query` for caching and async state
- **API layer:** `tRPC` with `superjson` for end-to-end typed client/server communication
- **Backend:** Express + tRPC server code in `server/`
- **Database:** MySQL with Drizzle ORM and schema/migrations in `drizzle/`

## Library usage rules

1. **Use React + TypeScript for all app code.**
   - New frontend code should live in `client/src/`.
   - Reuse shared types from `shared/` when data crosses client/server boundaries.

2. **Use `wouter` for navigation and route matching.**
   - Define and update routes in `client/src/App.tsx`.
   - Use `Link`, `Route`, `Switch`, and `useLocation` from `wouter` instead of introducing another routing library.

3. **Use Tailwind CSS for styling.**
   - Prefer utility classes directly in components.
   - Use the existing `cn()` helper from `client/src/lib/utils.ts` when merging class names.
   - Do not add CSS frameworks or CSS-in-JS libraries.

4. **Use shadcn/ui before building custom primitives.**
   - Prefer components from `client/src/components/ui/` for buttons, cards, dialogs, inputs, tabs, tables, etc.
   - Use Radix-based shadcn patterns for accessible interactive UI.
   - Only create custom components when the existing UI primitives do not fit the need.

5. **Use `lucide-react` for icons.**
   - Do not add a second icon library unless there is a clear gap that Lucide cannot cover.

6. **Use tRPC + React Query for app data fetching and mutations.**
   - Prefer `trpc.*.useQuery()` and `trpc.*.useMutation()` in the client.
   - Let React Query handle caching, loading, and invalidation.
   - Do not replace internal app API calls with ad hoc `fetch` or `axios` calls.
   - `axios` should only be used for external third-party HTTP requests when needed.

7. **Use Zod and React Hook Form for forms with validation.**
   - Define schemas with `zod`.
   - Use `react-hook-form` with `@hookform/resolvers/zod` for form state and validation.
   - Keep validation logic close to the form or shared when reused.

8. **Use Drizzle ORM for database access.**
   - Put schema definitions and migrations in `drizzle/`.
   - Use Drizzle for queries instead of introducing another ORM or raw SQL by default.
   - Keep database logic on the server side only.

9. **Use Express + tRPC for backend features.**
   - Add server endpoints and business logic under `server/`.
   - Prefer extending existing tRPC routers over creating parallel API patterns.
   - Keep auth, billing, and integration logic on the server.

10. **Use the existing UX utilities for app feedback and polish.**
    - Use `sonner` for toast notifications.
    - Use `framer-motion` only for purposeful, lightweight animation.
    - Reuse existing theme and language context patterns instead of adding new global state libraries.

## Practical defaults

- Prefer small, focused components in `client/src/components/` and page-level composition in `client/src/pages/`.
- Keep aliases consistent: use `@/` for client code and `@shared/` for shared modules.
- Before adding a new dependency, first check whether the current stack already covers the need.
- Match existing patterns in nearby files before inventing a new approach.
