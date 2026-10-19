<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# BBST Magazine Platform Rules and Architecture

### Architecture and organization

- Use App Router and React Server Components by default.
- Use Client Components only for necessary browser interactions.
- Keep database access, authentication secrets and privileged operations server-side.
- Use Route Handlers for HTTP APIs and Server Actions for appropriate form mutations.
- Keep business logic separate from presentation components.
- Organize code by feature and responsibility.
- Avoid unnecessary abstraction, duplicated logic and unused files.

### TypeScript and validation

- Enable strict type checking.
- Avoid `any`, unsafe assertions and unnecessary non-null assertions.
- Validate untrusted inputs on the server with Zod.
- Use shared validation schemas when appropriate.
- Provide clear, safe errors and useful loading, empty and success states.
- Keep ESLint and production-build checks passing.

### Database and Prisma

- Use PostgreSQL with Prisma.
- Model users, authentication, roles, articles, categories, magazine issues and audit logs where appropriate.
- Define foreign keys, unique constraints, indexes, timestamps and deletion behavior.
- Use migrations for schema changes.
- Use transactions for operations requiring atomicity.
- Use pagination for content and administrative lists.
- Avoid N+1 queries and unnecessary database fields.
- Never expose password-related data, session tokens or privileged database records.
- Seed development data only through an explicit seed command.

### Authentication and authorization

- Integrate Better Auth using its supported Prisma adapter and documented configuration.
- Use server-side session validation.
- Implement explicit ADMIN and EDITOR permissions, with public reader access.
- Protect every administrative page, Route Handler and Server Action.
- Enforce permissions on the server; hiding buttons is not authorization.
- Prevent privilege escalation, unauthorized role updates and insecure direct object references.
- Provision the initial administrator through a secure, documented process.
- Never grant administrator access automatically to public signups.

### File uploads

- Store uploaded PDFs and images in Cloudinary or another configured persistent object-storage provider.
- Never depend on local application storage for production uploads.
- Validate file size, actual content type, upload authorization and permitted formats.
- Restrict magazine files to PDFs and images to explicitly supported formats.
- Use secure server-generated upload authorization.
- Never expose Cloudinary API secrets.
- Store asset identifiers, URLs, file sizes, MIME types and relevant metadata in PostgreSQL.
- Prevent unauthorized file replacement or deletion.
- Handle failed uploads and database updates without leaving inconsistent records.

### Content security

- Render only published articles and magazine issues on public pages.
- Sanitize rich-text HTML before rendering it.
- Validate and normalize slugs.
- Implement secure publishing workflows.
- Protect against stored XSS, CSRF where applicable, injection and insecure file uploads.
- Add rate limiting to sensitive endpoints.
- Never return stack traces or secrets in client-facing errors.

### UI and accessibility

- Maintain the existing shadcn/ui Base UI and Nova configuration.
- Use the BBST palette: white `#FFFFFF`, bright green `#00FF00`, and dark `#171717`.
- Build responsive editorial layouts with clear typography and generous whitespace.
- Provide accessible labels, keyboard navigation, focus indicators and semantic HTML.
- Reuse existing UI components instead of creating unnecessary duplicates.
- Keep animations purposeful and respect reduced-motion preferences.
- Always use Next.js native components (e.g., `<Image />` from `next/image` and `<Link />` from `next/link`) instead of plain HTML tags (`<img>`, `<a>`) where applicable.

### Testing and maintenance

- Test business logic, authorization policies, validation and important database workflows.
- Test unauthorized requests and invalid inputs.
- Run linting, type checking, tests and production builds.
- Do not claim a test passed unless it was actually executed.
- Document environment variables, migrations, deployment and recovery procedures.
- Never commit credentials, generated secrets or real user data.
- Read `AGENTS.md` before making future changes and update it when project conventions change.

## Tailwind CSS and UI Code Quality Rules

### 1. Use Canonical Tailwind Classes

- Always prefer official, canonical Tailwind CSS utility classes over arbitrary-value classes when an equivalent utility exists.
- Examples:
  - Use `stroke-2` instead of `stroke-[2]`.
  - Use `w-75` instead of `w-[300px]` when supported by the installed Tailwind version.
  - Use `sm:w-95` instead of `sm:w-[380px]` when supported.
  - Use `lg:w-110` instead of `lg:w-[440px]` when supported.
  - Use `aspect-4/5` instead of `aspect-[4/5]` when supported.
- Verify utility availability against the installed Tailwind CSS version before replacing classes.
- Do not use arbitrary values when a standard utility, project token, or CSS variable provides the same result.

### 2. Avoid Unnecessary Tailwind IntelliSense Warnings

- Review Tailwind CSS IntelliSense warnings when editing or creating components.
- Resolve `suggestCanonicalClasses` warnings by using the suggested canonical utility when it preserves the intended styling.
- Do not ignore, suppress, or disable warnings without a documented reason.
- Do not change working visual behavior merely to silence a warning.

### 3. Use Design Tokens Consistently

- Reuse existing colors, spacing, typography, shadows, border radii, and breakpoints.
- Prefer the established BBST design palette and shared CSS variables over repeated arbitrary values.
- Avoid introducing new colors or custom values when an existing design token meets the requirement.
- Define reusable design tokens for genuinely repeated custom values.

### 4. Keep Responsive Styling Consistent

- Prefer standard responsive utilities such as `sm:`, `md:`, `lg:`, and `xl:`.
- Avoid duplicating conflicting utilities across breakpoints.
- Preserve the intended layout at mobile, tablet, and desktop sizes when simplifying classes.
- Do not replace responsive sizing with fixed dimensions unless the component genuinely requires them.

### 5. Use Arbitrary Values Only When Necessary

- Arbitrary values such as `w-[317px]`, `top-[13%]`, and `grid-cols-[...]` are allowed when no suitable standard utility or design token exists.
- Use CSS variables for custom values that need to be shared across multiple components.
- Keep necessary one-off values readable and intentional.
- Never convert every arbitrary value mechanically without checking its visual and functional effect.

### 6. Keep Components Maintainable

- Avoid unnecessarily long or duplicated class strings.
- Extract genuinely reusable UI patterns into shared components or design tokens.
- Use the existing component library and Tailwind configuration.
- Do not install additional styling libraries to solve simple utility-class issues.

### 7. Final Quality Checks

- Before completing a UI task, inspect changed files for avoidable Tailwind IntelliSense warnings.
- Run the project's existing lint and TypeScript checks.
- Verify the production build when practical.
- Distinguish editor-only IntelliSense suggestions from actual build errors.
- Report unresolved warnings honestly instead of claiming the project has no warnings.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Ignore routine debugging and unverified changes. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Keep a qualifying candidate through the reporting pass even if you resolve or work around it. A successful fix changes the report outcome; it does not erase the friction that qualified it.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `node node_modules/next/dist/bin/next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
