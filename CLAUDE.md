# CLAUDE.md — AI Assistant Guide for ClaudeCode2

This file provides context, conventions, and instructions for AI assistants (such as Claude Code) working in this repository.

---

## Project Overview

**Repository:** ClaudeCode2
**Status:** Newly initialized — this project is in its early stages.
**Purpose:** (To be updated as the project takes shape.)

---

## Repository Structure

```
ClaudeCode2/
├── CLAUDE.md          # AI assistant guide (this file)
└── (project files TBD)
```

> **Note:** This repository was just created. Update this section as directories and files are added.

---

## Getting Started

### Prerequisites

(To be documented once the tech stack is chosen.)

### Setup

```bash
git clone <repository-url>
cd ClaudeCode2
# Additional setup steps TBD
```

---

## Development Workflow

### Branching

- Feature branches follow the pattern: `claude/<description>-<session-id>`
- Always develop on the designated feature branch, never push directly to `main`.
- Use descriptive commit messages that explain **why** a change was made, not just what.

### Commits

- Keep commits atomic — one logical change per commit.
- Use conventional commit style when appropriate:
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

(To be updated once linting/formatting tools are configured.)

- Follow the existing code style in the repository.
- Use consistent indentation and naming conventions established by the project.

---

## Build & Test

(To be updated once the build system and test framework are configured.)

```bash
# Build (TBD)
# Test (TBD)
# Lint (TBD)
```

---

## AI Assistant Instructions

When working in this repository, AI assistants should follow these guidelines:

### Before Making Changes

1. **Read before writing.** Always read a file before proposing edits. Understand existing patterns.
2. **Explore first.** Use search/exploration tools to understand context before jumping to conclusions.
3. **Plan with todos.** Use task tracking for multi-step work to stay organized and transparent.

### While Making Changes

4. **Edit, don't rewrite.** Prefer targeted edits over full file rewrites when possible.
5. **Match existing style.** Follow the patterns and conventions already in the codebase.
6. **Keep it focused.** Only change what's needed. No bonus refactors, no adding comments to untouched code, no extra type annotations on unchanged lines.
7. **Test your work.** Run available tests and builds after making changes to verify nothing is broken.

### Git Operations

8. **Branch discipline.** Always work on the assigned feature branch. Never push to `main` without explicit permission.
9. **Commit clearly.** Write commit messages that describe the intent, not just the diff.
10. **Push carefully.** Use `git push -u origin <branch-name>` and retry with exponential backoff on network failures (up to 4 retries: 2s, 4s, 8s, 16s).

### Security

11. **No secrets in code.** Never commit `.env` files, API keys, tokens, or credentials.
12. **Avoid OWASP Top 10.** Watch for injection vulnerabilities, XSS, insecure deserialization, etc.

---

## Updating This File

This `CLAUDE.md` should be kept up to date as the project evolves. When significant changes happen — new frameworks adopted, directory structure changes, CI/CD configured, conventions established — update the relevant sections.

Key triggers for updating this file:
- New tech stack or framework is added
- Build/test/lint commands change
- Directory structure is reorganized
- New coding conventions are established
- CI/CD pipelines are configured
- Deployment processes are set up
