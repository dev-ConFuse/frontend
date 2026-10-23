# ConFuse Documentation

User and learner documentation for ConFuse.

These files are served publicly by the in-app `/docs` page. Keep them focused on
what users and students need. **Never include internal detail here** — no
service names, ports, environment variables, file paths, infrastructure,
credentials, or descriptions of how the platform is built.

Internal engineering documentation belongs in `../service-docs/`, which is not
served publicly.

## Contents

| Document | For |
|---|---|
| [overview.md](overview.md) | What ConFuse is and who it is for |
| [getting-started.md](getting-started.md) | First source to first answer |
| [core-concepts.md](core-concepts.md) | The vocabulary used in the product |
| [connecting-sources.md](connecting-sources.md) | Sources, indexing and keeping answers fresh |
| [questions-and-answers.md](questions-and-answers.md) | Asking well and judging answers |
| [ai-agents.md](ai-agents.md) | Connecting AI assistants |
| [learning-guide.md](learning-guide.md) | Concepts for students and self-learners |
| [security-and-privacy.md](security-and-privacy.md) | How data is handled |
| [faq.md](faq.md) | Common questions and troubleshooting |

## Conventions

Each file starts with frontmatter:

```yaml
---
title: Card heading shown on /docs
description: One line shown on the card
---
```

The index page lists every `.md` file in this folder, so only add files you
want publicly listed.