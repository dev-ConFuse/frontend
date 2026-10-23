---
title: FAQ and Troubleshooting
description: Answers to the questions people ask most, and fixes for the problems they run into.
---

# FAQ and Troubleshooting

## Getting access

**I cannot sign in.**
Check that you are using the account your workspace was set up with. If your
organisation uses single sign-on, use that. If it still fails, ask your
workspace administrator to confirm you have been added to the workspace.

**I signed in but my workspace looks empty.**
Either no sources are connected yet, or you do not have access to the ones that
are. Ask an administrator to connect a source or grant you access.

## Connecting sources

**How long does indexing take?**
It depends on size. Small document sets are quick; a large repository takes
considerably longer the first time. Later re-reads are much faster.

**What should I connect first?**
One or two focused sources that your team actually relies on. Focused beats
broad — a single well-maintained project repository answers better than ten
scattered ones.

**Why is my answer out of date?**
The source has probably changed since it was last read. Sync it and ask again.

**Can I connect something behind a login?**
Only material the workspace is permitted to read. Pages or repositories that
require credentials the workspace does not have cannot be indexed.

## Getting good answers

**My answer is vague or generic.**
Narrow the question. Name the module, feature, service or document you mean.
Compare "how does caching work?" with "how does the payments service cache
exchange rates?".

**The answer says "not covered by connected sources".**
That means the material is not in your knowledge base. Options: rephrase,
connect the source that has it, or ask a narrower question. See
[Asking Questions and Reading Answers](/docs/questions-and-answers).

**The answer is missing something I know exists.**
Either it is not connected as a source, or the source has not been re-read
recently. Connect or sync it.

**Why does it ask for citations?**
Because a claim you cannot check is not much better than a guess. Citations
turn an answer into something you can verify quickly.

**Two sources disagree and the answer says so — what now?**
Usually one is stale. Check dates, retire or sync the older one, and ask again.

**Can I trust an answer for an important decision?**
Use it as a fast orientation, then open the cited sources for the parts that
matter. A single-source answer deserves a spot-check; a two-source answer with
citations is usually reliable.

## AI agents

**My assistant is not finding things I can see in the UI.**
Confirm it is actually connected to ConFuse rather than answering from general
knowledge, and that it is looking at the same workspace. Try asking it to cite
sources — if it cannot, it is not searching.

**The assistant gave an uncited answer about our project.**
Ask it to answer again with citations and to say explicitly when it has no
evidence. Grounded answers should always show their sources.

**How much of our setup can a connected assistant see?**
Only your connected knowledge — not how the platform is built. See
[Security and Privacy](/docs/security-and-privacy).

## Account and workspace

**How do I add a colleague?**
Ask your workspace administrator to add them to the workspace.

**How do I remove something from answers?**
Disconnect the source so it stops contributing to new answers. If you need it
removed from past answers too, speak to your administrator.

**Who can see my questions?**
Questions are scoped to your workspace. Access to workspace material is
controlled by membership and source permissions.

## Still stuck?

Include these three things when you ask for help — they resolve most issues
quickly:

1. What you were trying to do.
2. What you expected to happen.
3. What actually happened, including any message you saw.

## Related reading

- [Getting Started](/docs/getting-started)
- [Connecting Sources](/docs/connecting-sources)
- [Core Concepts](/docs/core-concepts)