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
| 📧  | **Email Delivery** | Node.js & Nodemailer (Gmail SMTP Relay)       |
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

### 3️⃣ Start the local database (Docker)

Start PostgreSQL using Docker Compose:

```bash
npm run db:up
# or: docker compose up -d db
```

> **Tip:** To also start pgAdmin (available at [http://localhost:5050](http://localhost:5050)), run `npm run docker:up`.

### 4️⃣ Database schema & seed data

Sync the Prisma schema and seed the initial categories, articles, and admin credentials:

```bash
npm run db:push
npm run seed
```

### 5️⃣ Run the development server

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

## 📧 Email System & Gmail SMTP Integration

The platform includes a complete, enterprise-grade transactional email system built using **Node.js and Nodemailer with Gmail SMTP**.

### 🌟 Supported Real Workflows
- **Article Submissions**: Automated receipt with tracking reference to the author + immediate review alert to the editorial board.
- **Editorial Review Status Updates**: Automated author notifications on `APPROVED`, `PUBLISHED` (with live article URL), `REVISION_REQUESTED` (with editorial feedback block & resubmission CTA), and `REJECTED`.
- **Contact Desk & Event Proposals**: Transmitted to `EDITOR_NOTIFICATION_EMAIL` with sender `replyTo` + branded receipt confirmation dispatched to sender.
- **Magazine Release Broadcast**: Dispatched when an issue's status is toggled to `published`.
- **Administrative Password Recovery**: Single-use 256-bit cryptographically secure reset links with SHA-256 token hashing, 30-minute expiry, and account enumeration protection.
- **Email Diagnostics Dashboard**: Accessible at `/admin/email` to test SMTP connectivity, send diagnostic test emails, and review the live `NotificationLog` audit trail.

### ⚙️ Required Environment Variables

```env
# Gmail SMTP Relay Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=ceylonnest.org@gmail.com
SMTP_PASSWORD=your_new_gmail_app_password
EMAIL_FROM_NAME=BBST Magazine
EMAIL_FROM=ceylonnest.org@gmail.com
EDITOR_NOTIFICATION_EMAIL=ceylonnest.org@gmail.com
```

### 🔑 Gmail App Password Setup Instructions
1. Log in to the Google account for `ceylonnest.org@gmail.com`.
2. Navigate to **Google Account Settings** &rarr; **Security**.
3. Under *How you sign in to Google*, ensure **2-Step Verification** is turned **ON**.
4. Search for or navigate to **App passwords** (`https://myaccount.google.com/apppasswords`).
5. Enter an app name (e.g. `BBST Magazine Mailer`) and click **Create**.
6. Copy the generated 16-character password into your `.env` as `SMTP_PASSWORD` (remove any spaces).

> 💡 **Development Simulation Mode**: When `SMTP_PASSWORD` is left as a placeholder or empty, the transporter safely switches to **SIMULATED** mode. Email payloads and recipient logs are recorded cleanly in the database (`notification_log`) without throwing unhandled exceptions.

### 🧪 Running Email System Tests

```bash
# Run the 25-check comprehensive email verification test suite
npm run test:email
```

---

## 📖 Documentation

> 🤖 **`AGENTS.md`**: Contains essential rules for architecture, database, security, and project guidelines.

