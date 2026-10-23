---
title: Security and Privacy
description: How your data is handled and what you can expect — written in plain terms for users and administrators.
---

# Security and Privacy

This page describes, in plain terms, how information is handled in ConFuse and
what you can expect from it. It is written for users and administrators.

## The basic principles

1. **Your material stays yours.** What you connect is used to answer your
   questions. It is not sold, published, or used to train general-purpose
   models.
2. **Workspaces are isolated.** Sources and answers are scoped to your
   workspace. Another organisation's material never appears in yours.
3. **Access follows your permissions.** A person only sees answers built from
   material they are allowed to read.
4. **Answers are grounded, not authoritative.** ConFuse shows evidence so you
   can judge. It does not claim infallibility.

## What is collected

| Category | Examples | Why |
|---|---|---|
| **Connected content** | Repository files, documents, pages you connect | It is the material answers are drawn from |
| **Questions and answers** | What you asked, what was returned | To show results and improve relevance |
| **Account information** | Name, email, workspace membership | To provide access and support |
| **Usage information** | Which features are used, error reports | To keep the service reliable |

## What is not exposed

To be explicit about the boundary you asked us to keep:

- **No internal implementation detail** is published in this documentation or
  exposed to connected assistants.
- **No secrets or credentials** are shown in documentation or in answers.
- **Connected assistants see your knowledge, not our systems.** An agent
  connected to ConFuse can search your material; it cannot inspect how the
  platform itself is built.

## Your controls

- **Connect and disconnect sources** at any time.
- **Control who can see what**, through workspace membership and source access.
- **Mark information as wrong or outdated** so it stops shaping answers, while
  keeping the history of what was believed and when.
- **Remove content.** Ask your administrator if you need something removed from
  past answers as well as from future ones.

## For administrators

- Give people the least access they need; answers follow source permissions.
- Review connected sources periodically — stale sources are the most common
  cause of misleading answers.
- Treat connected content as potentially untrusted text. Like any system that
  reads external material, content that tries to give instructions should be
  treated as data, not as commands.

## Responsible disclosure

If you believe you have found a security problem, please report it to your
workspace administrator or the ConFuse team rather than discussing it publicly.
Include what you observed, how to reproduce it, and what you expected instead.

## Summary

ConFuse is designed to make answers **checkable** rather than merely
plausible — that is also the right standard for how it handles your data: clear
boundaries, visible controls, and nothing hidden in the fine print.

## Related reading

- [Connecting Sources](/docs/connecting-sources) — permissions and access in practice.
- [Using AI Agents with ConFuse](/docs/ai-agents) — what connected assistants can see.