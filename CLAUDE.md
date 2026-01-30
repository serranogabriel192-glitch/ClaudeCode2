# CLAUDE.md — AI Assistant Guide for ClaudeCode2

This file provides context, conventions, and instructions for AI assistants (such as Claude Code) working in this repository.

---

## Project Overview

**Repository:** ClaudeCode2
**Purpose:** Web-based visitor sign-in kiosk system for front desk check-in, sign-out, and admin management.
**Tech stack:** Node.js, Express, SQLite (better-sqlite3), Nodemailer, plain HTML/CSS/JS frontend.

---

## Repository Structure

```
ClaudeCode2/
├── CLAUDE.md              # AI assistant guide (this file)
├── package.json           # Dependencies and scripts
├── server.js              # Express server entry point
├── .env.example           # Environment variable template
├── .gitignore             # Git ignore rules
├── src/
│   ├── db.js              # SQLite schema, prepared statements, queries
│   ├── email.js           # Nodemailer setup and host notification
│   └── routes/
│       ├── visitors.js    # Sign-in, sign-out, search, pre-register APIs
│       └── admin.js       # Stats, history, CSV export APIs
├── public/
│   ├── index.html         # Welcome / kiosk home screen
│   ├── signin.html        # Visitor sign-in form
│   ├── signout.html       # Visitor sign-out (search + one-click)
│   ├── admin.html         # Admin dashboard (stats, current visitors, history)
│   ├── preregister.html   # Pre-register an expected visitor
│   ├── css/
│   │   └── style.css      # All styles (kiosk-friendly, responsive)
│   └── js/
│       ├── signin.js      # Sign-in form submission logic
│       ├── signout.js     # Sign-out search and action logic
│       ├── admin.js       # Dashboard stats, tables, pagination
│       └── preregister.js # Pre-registration form logic
└── data/                  # SQLite database (auto-created, gitignored)
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later

### Setup

```bash
git clone <repository-url>
cd ClaudeCode2
npm install
```

### Running

```bash
npm start          # Production: node server.js
npm run dev        # Development: node --watch server.js (auto-restart on changes)
```

The app runs at `http://localhost:3000` by default. Set `PORT` in a `.env` file to change it.

### Email Notifications (optional)

Copy `.env.example` to `.env` and fill in SMTP credentials. If left blank, the app works without email — notifications are simply skipped.

---

## API Routes

| Method | Path                        | Description                      |
|--------|-----------------------------|----------------------------------|
| POST   | `/api/visitors/signin`      | Sign in a visitor                |
| POST   | `/api/visitors/signout/:id` | Sign out a visitor by ID         |
| GET    | `/api/visitors/current`     | List all currently signed-in     |
| GET    | `/api/visitors/search?q=`   | Search visitors by name/company/host |
| POST   | `/api/visitors/preregister` | Pre-register an expected visitor |
| GET    | `/api/admin/stats`          | Dashboard statistics             |
| GET    | `/api/admin/history`        | Paginated visitor history        |
| GET    | `/api/admin/export`         | Download all visitors as CSV     |

---

## Development Workflow

### Branching

- Feature branches follow the pattern: `claude/<description>-<session-id>`
- Always develop on the designated feature branch, never push directly to `main`.
- Use descriptive commit messages that explain **why** a change was made, not just what.

### Commits

- Keep commits atomic — one logical change per commit.
- Use conventional commit style:
  - `feat:` — new feature
  - `fix:` — bug fix
  - `docs:` — documentation only
  - `refactor:` — code restructuring without behavior change
  - `test:` — adding or updating tests
  - `chore:` — maintenance, dependencies, tooling

### Pull Requests

- PRs should target the main branch unless otherwise specified.
- Include a summary of changes and testing done.

---

## Code Conventions

### General Principles

- **Simplicity first:** Prefer clear, straightforward code over clever abstractions.
- **Minimal changes:** Only modify what is necessary to accomplish the task. Avoid drive-by refactors.
- **No over-engineering:** Don't add features, error handling, or abstractions for hypothetical future needs.
- **Security-aware:** Never commit secrets, credentials, `.env` files, or API keys. Validate inputs at system boundaries.

### Style

- Plain JavaScript (no TypeScript, no build step).
- Double quotes in JS, standard 2-space indentation.
- Backend uses CommonJS (`require`/`module.exports`).
- Frontend uses vanilla JS with `fetch` for API calls — no frameworks.
- CSS uses custom properties (variables) defined in `:root` in `style.css`.
- All user-facing text rendered in the frontend is escaped to prevent XSS.

### Database

- SQLite via `better-sqlite3` (synchronous API).
- All queries are prepared statements defined in `src/db.js`.
- The database file lives in `data/visitors.db` (auto-created, gitignored).

---

## Build & Test

```bash
npm start       # Start the server
npm run dev     # Start with --watch for auto-restart
```

No build step required — the frontend is plain HTML/CSS/JS served statically.

---

## AI Assistant Instructions

When working in this repository, AI assistants should follow these guidelines:

### Before Making Changes

1. **Read before writing.** Always read a file before proposing edits. Understand existing patterns.
2. **Explore first.** Use search/exploration tools to understand context before jumping to conclusions.
3. **Plan with todos.** Use task tracking for multi-step work to stay organized and transparent.

### While Making Changes

4. **Edit, don't rewrite.** Prefer targeted edits over full file rewrites when possible.
5. **Match existing style.** Follow the patterns and conventions already in the codebase — vanilla JS, CommonJS, prepared statements, no frameworks.
6. **Keep it focused.** Only change what's needed. No bonus refactors, no adding comments to untouched code.
7. **Test your work.** Run `npm start` and verify changes work by checking the relevant page/endpoint.

### Key Patterns

- **New API routes:** Add prepared statements in `src/db.js`, then add route handlers in `src/routes/visitors.js` or `src/routes/admin.js`.
- **New pages:** Create an HTML file in `public/`, a JS file in `public/js/`, and use existing CSS classes from `style.css`.
- **XSS prevention:** Always use the `esc()` helper in frontend JS when rendering user data into HTML.

### Git Operations

8. **Branch discipline.** Always work on the assigned feature branch. Never push to `main` without explicit permission.
9. **Commit clearly.** Write commit messages that describe the intent, not just the diff.
10. **Push carefully.** Use `git push -u origin <branch-name>` and retry with exponential backoff on network failures (up to 4 retries: 2s, 4s, 8s, 16s).

### Security

11. **No secrets in code.** Never commit `.env` files, API keys, tokens, or credentials.
12. **Avoid OWASP Top 10.** Watch for injection vulnerabilities, XSS, insecure deserialization, etc.
13. **Parameterized queries only.** Never interpolate user input into SQL strings — always use prepared statements.

---

## Updating This File

This `CLAUDE.md` should be kept up to date as the project evolves:
- New routes or pages are added
- Tech stack changes (e.g., adding TypeScript, a test framework, or CI/CD)
- Directory structure is reorganized
- New coding conventions are established
- Deployment processes are set up
