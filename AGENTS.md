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

### Testing and maintenance
- Test business logic, authorization policies, validation and important database workflows.
- Test unauthorized requests and invalid inputs.
- Run linting, type checking, tests and production builds.
- Do not claim a test passed unless it was actually executed.
- Document environment variables, migrations, deployment and recovery procedures.
- Never commit credentials, generated secrets or real user data.
- Read `AGENTS.md` before making future changes and update it when project conventions change.
