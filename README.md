<div align="center">

# 📰 BBST Magazine Platform

**A maintainable, secure, and production-oriented digital magazine platform built with modern web technologies.**

![Next.js](https://img.shields.io/badge/Next.js-171717?style=for-the-badge&logo=nextdotjs&logoColor=00FF00)
![TypeScript](https://img.shields.io/badge/TypeScript-171717?style=for-the-badge&logo=typescript&logoColor=00FF00)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-171717?style=for-the-badge&logo=tailwindcss&logoColor=00FF00)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-171717?style=for-the-badge&logo=postgresql&logoColor=00FF00)
![Prisma](https://img.shields.io/badge/Prisma-171717?style=for-the-badge&logo=prisma&logoColor=00FF00)
![Cloudinary](https://img.shields.io/badge/Cloudinary-171717?style=for-the-badge&logo=cloudinary&logoColor=00FF00)

[Stack](#-technology-stack) · [Features](#-features) · [Prerequisites](#-prerequisites) · [Installation](#-installation) · [Packages](#-core-packages) · [Docs](#-documentation)

</div>

---

## 🧰 Technology Stack

|     | Layer              | Technology                                    |
| :-: | :----------------- | :-------------------------------------------- |
| ⚡  | **Framework**      | Next.js (App Router, React Server Components) |
| 🔐  | **Language**       | Strict TypeScript                             |
| 🎨  | **Styling**        | Tailwind CSS, shadcn/ui, Lucide React, Motion |
| 🗄️  | **Database**       | PostgreSQL with Prisma ORM                    |
| 🔑  | **Authentication** | Better Auth                                   |
| ✅  | **Validation**     | Zod and React Hook Form                       |
| ☁️  | **Storage**        | Cloudinary (for PDFs and images)              |
| ✍️  | **Editor**         | Tiptap (Rich-text editor)                     |

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🌐 Public Website

- 📱 Responsive homepage with an editorial hero section
- 🌟 Featured and recent magazine issues
- 📖 Magazine listing and detail pages with PDF viewing and downloading
- 📝 Article listing, detail pages, categories, and search
- 🔍 SEO optimization and accessible navigation

</td>
<td width="50%" valign="top">

### 🛠️ Admin Dashboard

- 🔒 Secure authentication and role-based access control (Admin, Editor)
- 📚 Magazine management (create, edit, publish, archive, delete)
- ✏️ Article management with a rich-text editor
- 🏷️ Category management
- 👑 User-role management (Admins only)

</td>
</tr>
</table>

---

## 📋 Prerequisites

|     | Requirement                          |
| :-: | :----------------------------------- |
| 🟢  | Node.js (v18 or newer)               |
| 🐘  | PostgreSQL database                  |
| ☁️  | Cloudinary account for media storage |

---

## 🚀 Installation

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Set up environment variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### 3️⃣ Database setup

Apply Prisma migrations and generate the Prisma Client:

```bash
npx prisma generate
npx prisma db push
# or npx prisma migrate dev
```

### 4️⃣ Run the development server

```bash
npm run dev
```

> 🎉 Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📦 Core Packages

The following essential packages are used in this project (as listed in `package.json`):

|     | Area                    | Packages                                                 |
| :-: | :---------------------- | :------------------------------------------------------- |
| ⚡  | **Framework**           | `next` and `react`                                       |
| 🗄️  | **Prisma + PostgreSQL** | `@prisma/client`, `@prisma/adapter-pg`, and `pg`         |
| 🔑  | **Auth**                | `better-auth`                                            |
| ✅  | **Validation**          | `zod`, `react-hook-form`, and `@hookform/resolvers`      |
| ☁️  | **Storage**             | `cloudinary`                                             |
| ✍️  | **Editor**              | `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`     |
| 🎨  | **Styling**             | `tailwindcss`, `lucide-react`, `framer-motion`, `shadcn` |

---

## 📖 Documentation

> 🤖 **`AGENTS.md`**: Contains essential rules for architecture, database, security, and project guidelines.
