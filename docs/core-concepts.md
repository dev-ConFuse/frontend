---
title: Core Concepts
description: The vocabulary you will see throughout ConFuse — sources, knowledge base, grounding, citations, agents and more.
---

# Core Concepts

A short reference for the terms used across ConFuse. Skim it once and the rest
of the product becomes much easier to follow.

## Source

Anything you connect for ConFuse to read: a repository, a document set, or a
set of web links. Sources are the boundary of what ConFuse is allowed to answer
from — if a source is not connected, it is not part of your answers.

## Knowledge Base

Everything ConFuse has read and prepared from your connected sources, searched
as one. When you ask a question, the knowledge base is the only material
consulted.

## Chunk

A manageable piece of a larger document or file. Long material is broken into
chunks so the right passage can be found without loading everything at once.
You will sometimes see chunk references in citations.

## Retrieval

The process of finding the passages most relevant to your question. Retrieval
is what happens before an answer is written — think of it as the reading step.

## Grounding

An answer is **grounded** when its claims are supported by retrieved material
rather than by general knowledge or assumption. Grounding is the property that
makes an answer checkable.

## Citation

A pointer from a claim in an answer back to the specific material it came from.
If a claim has no citation, treat it as unverified.

## Confidence

A short judgement of how strongly the evidence supports the answer. Read it as
a prompt about how much to verify:

- **High** — supported by multiple independent sources.
- **Medium** — supported, but thinly. Worth a spot-check.
- **Low** — weak or single-source. Treat as a lead, not a conclusion.

## Gap / "not covered"

A statement that the connected sources do not contain the answer. This is a
useful outcome: it tells you the question reaches past your material, and it is
preferable to a plausible guess.

## Agent

An AI assistant connected to ConFuse. When connected, the assistant answers
questions using your knowledge base instead of relying on its own general
knowledge. See [Using AI Agents](/docs/ai-agents).

## Workspace

Your organisation's space. Sources, settings and access are scoped to a
workspace, so your material is not mixed with anyone else's.

## Memory

A recorded fact or conclusion that ConFuse can reuse later. Memories carry
their own provenance and can be marked wrong or outdated without deleting the
history of what was believed and when.

## Ruleset

A set of instructions that shape how agents should behave when working with
your knowledge — for example, requiring citations, or preferring certain
sources. Useful for keeping answers consistent across a team.

## Sync

The act of re-reading a source after it has changed, so the knowledge base
stays current. Sources can be synced on demand.

## Related reading

- [Connecting Sources](/docs/connecting-sources)
- [Asking Questions and Reading Answers](/docs/questions-and-answers)
- [Learning Guide](/docs/learning-guide) — the ideas behind these terms.