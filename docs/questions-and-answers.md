---
title: Asking Questions and Reading Answers
description: How to ask questions that get good answers, and how to judge how far to trust the one you got.
---

# Asking Questions and Reading Answers

The difference between a useful answer and a frustrating one is usually the
question. This page covers both sides: asking well, and reading critically.

## Asking well

**Be specific.** Name the thing you mean.

- Weak: *How does the payment stuff work?*
- Strong: *How does the payments service handle a failed card charge?*

**Ask one thing at a time.** Compound questions get compound, mushy answers.

- Weak: *How do auth and caching and logging work?*
- Strong: three separate questions.

**Use the words your project uses.** If the code says "ledger", ask about the
"ledger" rather than the "transaction book".

**Ask for reasoning, not just facts.** "What was decided about X and why?" is
answerable from design notes; "What is X?" may only find a definition.

**Follow up.** Answers are a starting point. A second question about the part
that surprised you is usually the fastest route to understanding.

## What a good answer contains

| Part | Why it matters |
|---|---|
| **The direct answer** | The claim being made |
| **Sources** | What the claim rests on — open the ones that matter |
| **Confidence** | How strongly the evidence supports the claim |
| **Gaps and caveats** | What the sources did not cover, or where they disagreed |

## How far to trust an answer

Ask three questions of every answer:

1. **Is it cited?** A claim with no source is a lead, not a fact.
2. **How many sources?** Two independent sources agreeing is much stronger than
   one. Single-source answers deserve a spot-check.
3. **Is it current?** If the answer rests on a document that may be stale, sync
   the source and ask again.

A practical rule: **trust the pattern, verify the details.** An answer that
says "rate limiting is handled at the gateway, see these two places" is
probably directionally right even if you want to check the two places.

## When the answer says "not covered"

This is a real result and often the most useful one. It means your question
reaches beyond the connected material. Your options:

- **Rephrase.** Different words may match different passages.
- **Connect more.** If the answer lives in a document nobody connected, connect it.
- **Ask a narrower question.** The broad version may be uncovered while a
  specific part is well documented.
- **Treat it as a finding.** "We have never written this down" is worth knowing.

What the system will *not* do is fill the gap from general knowledge and
present it as project fact. That is deliberate.

## Reading disagreement

Sometimes sources contradict each other — usually because one is older. When
that happens, a good answer will surface the conflict rather than silently pick
a side. Resolve it by checking dates and, if needed, re-syncing or retiring the
stale source.

## Common mistakes

- **Trusting a confident tone.** Confidence in writing is not evidence. Check
  the citations.
- **Asking once and giving up.** Rephrasing is cheap and often effective.
- **Blaming the system for a missing source.** If the material is not connected,
  no question will find it.
- **Accepting single-source answers on important decisions.** For anything
  high-stakes, open the source.

## Related reading

- [Core Concepts](/docs/core-concepts) — grounding, citations, confidence.
- [Learning Guide](/docs/learning-guide) — why these signals exist at all.