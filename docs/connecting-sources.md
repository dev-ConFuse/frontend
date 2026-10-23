---
title: Connecting Sources
description: What you can connect, what happens when you do, and how to keep your knowledge base clean and useful.
---

# Connecting Sources

Sources are the raw material of every answer. This page explains what you can
connect, what ConFuse does with it, and how to get the best results.

## What you can connect

| Source type | Good for | Watch out for |
|---|---|---|
| **Repository** | Code, configuration, in-repo documentation | Very large or noisy repositories slow indexing and dilute answers |
| **Documents** | Specifications, design notes, runbooks, meeting notes | Scanned or image-only files may not be readable |
| **Web links** | Published references, articles, external guides | Pages behind a login cannot be read |
| **E-books / videos** | Training and reference material | Long media produces a lot of material to search |

You can connect more than one of each. Everything becomes searchable together.

## What happens when you connect

1. **Connect** — you authorise ConFuse to read the source.
2. **Read and index** — the material is processed into searchable pieces.
3. **Ready** — the source starts contributing to answers.

Indexing is a one-time cost per source. Re-reads after changes are much faster.

## Keeping answers focused

Quality of input dominates quality of output. A few practical habits:

- **Prefer focused sources.** The repository for one project answers better than
  a monorepo containing everything.
- **Name things clearly.** Source names appear in citations — "Payments service
  docs" is more useful than "docs-2".
- **Remove stale sources.** Out-of-date material produces out-of-date answers.
  Unsynced sources are the most common cause of an answer that is correct last
  year and wrong today.
- **Sync after big changes.** If a document moves or a branch is renamed, sync.

## Permissions and access

ConFuse only answers from material the workspace is permitted to read. If a
person cannot see a source, it does not appear in their answers. Access is
scoped to your workspace, and connected material is not shared with other
workspaces.

For more, see [Security and Privacy](/docs/security-and-privacy).

## Removing a source

You can disconnect a source at any time. Once removed, it stops contributing to
new answers. If you need something to disappear from past answers as well,
raise it with your workspace administrator.

## Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Source stuck in indexing | Very large source, or read errors | Wait, then retry; split large sources |
| Answers never mention a known file | That material is not connected | Add it as a source |
| Answers reference old content | Source has not been re-read | Sync the source |
| Nothing found for any question | Source is empty or unreadable | Check the source actually contains readable text |

More in [FAQ and Troubleshooting](/docs/faq).