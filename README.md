# BBST Magazine Platform

A maintainable, secure, and production-oriented digital magazine platform built with modern web technologies.

## Technology Stack

- **Framework**: Next.js (App Router, React Server Components)
- **Language**: Strict TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Lucide React, Motion
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **Validation**: Zod and React Hook Form
- **Storage**: Cloudinary (for PDFs and images)
- **Editor**: Tiptap (Rich-text editor)

## Features

- **Public Website**:
  - Responsive homepage with an editorial hero section
  - Featured and recent magazine issues
  - Magazine listing and detail pages with PDF viewing and downloading
  - Article listing, detail pages, categories, and search
  - SEO optimization and accessible navigation
- **Admin Dashboard**:
  - Secure authentication and role-based access control (Admin, Editor)
  - Magazine management (create, edit, publish, archive, delete)
  - Article management with a rich-text editor
  - Category management
  - User-role management (Admins only)

## Prerequisites

- Node.js (v18 or newer)
- PostgreSQL database
- Cloudinary account for media storage

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

3. Database setup:
Apply Prisma migrations and generate the Prisma Client:

```bash
npx prisma generate
npx prisma db push
# or npx prisma migrate dev
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Core Packages

The following essential packages are used in this project (as listed in `package.json`):

- `next` and `react`
- `@prisma/client`, `@prisma/adapter-pg`, and `pg`
- `better-auth`
- `zod`, `react-hook-form`, and `@hookform/resolvers`
- `cloudinary`
- `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`
- `tailwindcss`, `lucide-react`, `framer-motion`, `shadcn`

## Documentation

- `AGENTS.md`: Contains essential rules for architecture, database, security, and project guidelines.
