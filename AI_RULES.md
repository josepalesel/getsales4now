# AI_RULES.md

## Tech stack

- **Frontend:** React 19 + TypeScript, with app code in `client/src/`
- **Build tool:** Vite 7 for the client build and development workflow
- **Routing:** `wouter` for client-side routing, with routes defined from `client/src/App.tsx`
- **Styling:** Tailwind CSS 4 for all layout, spacing, typography, and responsive styling
- **UI primitives:** `shadcn/ui` components in `client/src/components/ui/`, built on Radix UI
- **Icons & motion:** `lucide-react` for icons and `framer-motion` for lightweight, purposeful animation
- **Client data layer:** `@tanstack/react-query` with `@trpc/react-query` for typed queries, mutations, caching, and invalidation
- **Backend:** Express + tRPC, with server code under `server/`
- **Database:** MySQL with Drizzle ORM, with schema and migrations in `drizzle/`
- **Validation & forms:** `zod` for schemas and `react-hook-form` with `@hookform/resolvers/zod` for form handling

## Library usage rules

1. **Use React + TypeScript for all application code.**
   - Put frontend components, pages, hooks, and utilities in `client/src/`.
   - Reuse shared types from `shared/` when data is used by both client and server.

2. **Use `wouter` for navigation.**
   - Add or update routes in `client/src/App.tsx`.
   - Use `Link`, `Route`, `Switch`, and `useLocation` from `wouter` instead of adding another routing library.

3. **Use Tailwind CSS for styling.**
   - Prefer utility classes directly in components.
   - Use the existing `cn()` helper from `client/src/lib/utils.ts` when combining class names.
   - Do not introduce CSS-in-JS or another styling framework.

4. **Use `shadcn/ui` components before building custom UI primitives.**
   - Prefer the existing button, input, dialog, table, tabs, select, sheet, dropdown, and form-related components in `client/src/components/ui/`.
   - Only build a custom component when the existing primitives do not fit the requirement.

5. **Use `lucide-react` for icons.**
   - Do not add another icon library unless there is a specific gap that Lucide cannot cover.

6. **Use tRPC + React Query for internal app data flows.**
   - Use `trpc.*.useQuery()` for reads and `trpc.*.useMutation()` for writes in the client.
   - Let React Query manage loading, caching, refetching, and invalidation.
   - Do not replace internal typed API calls with ad hoc `fetch` or `axios` requests.

7. **Use `axios` only for external third-party HTTP requests.**
   - Keep those calls on the server whenever possible.
   - Do not use `axios` for client-to-server requests inside this app.

8. **Use Zod + React Hook Form for forms.**
   - Define schemas with `zod`.
   - Use `react-hook-form` with `@hookform/resolvers/zod` for validation and submission handling.
   - Keep validation close to the form unless the schema is shared across multiple places.

9. **Use Drizzle ORM for database access.**
   - Put schema definitions and migrations in `drizzle/`.
   - Keep database reads and writes in server-side code only.
   - Prefer Drizzle queries over raw SQL unless there is a strong reason otherwise.

10. **Use Express + tRPC for backend features.**
    - Add business logic, integrations, and API procedures in `server/`.
    - Prefer extending the existing router structure instead of introducing separate API patterns.

11. **Use the existing app utilities for UX feedback.**
    - Use `sonner` for toast notifications.
    - Use `next-themes` for theming behavior instead of creating a separate theme system.
    - Use `framer-motion` only when animation clearly improves the experience.

12. **Use the existing testing setup for automated tests.**
    - Write tests with `vitest`.
    - Keep server-focused tests near server code and follow existing patterns in the repo.

## Practical defaults

- Prefer small, focused components and keep page composition at the page level.
- Use `@/` for client imports and `@shared/` for shared modules.
- Before adding a new dependency, first check whether the current stack already solves the problem.
- Match nearby patterns in the codebase before introducing a new approach.
- Keep client-only logic in the client, server-only logic in the server, and shared contracts in `shared/`.
