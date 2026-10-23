---
title: Learning Guide — How Grounded Question Answering Works
description: For students and the curious: the general ideas behind retrieval, grounding and citations, explained without any vendor detail.
---

# Learning Guide — How Grounded Question Answering Works

This page is for people who want to **understand the ideas**, not just use the
product. It explains how question-answering over a body of knowledge works in
general terms.

> **Scope note.** This is a conceptual introduction to the field. It describes
> general techniques and trade-offs, not how any particular system — including
> ConFuse — is built internally.

## The core problem

A language model can write fluent, confident prose about almost anything. That
is both its strength and its danger: fluency and correctness are unrelated.

Ask a model about *your* project and it has never seen it. It will still
produce a plausible answer. The result is a **hallucination** — a well-formed
statement with no basis in reality.

Grounded question answering solves this by changing the question from:

> "What is the answer?"

to:

> "What does *this material* say the answer is?"

The model is then summarising and reasoning over evidence, rather than
recalling.

## The pipeline

Almost every system of this kind follows the same shape.

### 1. Ingest

Documents, files and pages are read and broken into **chunks** — small enough
to be compared to a question, large enough to carry meaning.

Chunking is a genuine design problem. Too small and passages lose their
context; too large and the relevant detail is buried in noise.

### 2. Index

Each chunk is turned into something searchable. Two broad families:

- **Keyword matching** — literally matching words. Fast, transparent, brittle
  to synonyms ("car" will not find "automobile").
- **Semantic matching** — representing meaning numerically so that similar
  ideas are near each other. Handles paraphrase, but can drift toward
  "similar-sounding" rather than "actually about this".

Good systems use both and combine the results, because they fail in different
ways.

### 3. Retrieve

At question time, the system finds the chunks most likely to contain the
answer. This is **retrieval**, and it is where most quality is won or lost.

Useful idea: a question often contains several distinct sub-questions.
"Does the cache stay consistent across regions?" is really at least two
questions. Decomposing before searching is often worth more than any amount of
careful phrasing after.

### 4. Compose

The retrieved evidence is given to a model, which writes an answer **from that
evidence**.

The prompt is the interesting part: it can require citations, demand that
uncertain claims be labelled, and instruct the model to say "not covered"
rather than fill a gap.

### 5. Verify

A strong system does not stop at a first draft. It checks whether each claim is
actually supported by the retrieved evidence, and sends the weak ones back for
more searching.

This "check, then fix" loop is the difference between a system that produces
answers and a system that produces *reliable* answers.

## Why citations are the whole game

A citation is not decoration. It converts an answer from a claim into a
**checkable** claim.

- It makes verification cheap — you click instead of re-searching.
- It creates accountability for the answer's source.
- It exposes gaps: a claim with no citation is visibly unsupported.

If you remember one thing from this page: **a cited answer and an uncited
answer are not the same kind of object**, even if they read identically.

## Failure modes worth knowing

| Failure | What it looks like | What helps |
|---|---|---|
| **Hallucination** | Confident claim with no evidence | Require citations; verify claims |
| **Missed evidence** | Answer misses the obvious source | Better chunking; decompose the question |
| **Stale evidence** | Correct last year, wrong now | Re-read sources regularly |
| **Contradiction** | Two sources disagree, answer hides it | Surface conflicts instead of picking silently |
| **Overconfident synthesis** | Neat conclusion from weak evidence | Report confidence; flag single-source claims |
| **Prompt injection** | Text in a source tries to steer the model | Treat source content as data, not instructions |

## How to evaluate a system like this

If you are assessing one, ask:

1. **Does it ever say "I don't know"?** A system that always answers is not
   measuring anything.
2. **Are the citations real?** Open them. Do they support the claim?
3. **Does it find contradictory evidence?** Ask a question where the sources
   disagree.
4. **Is it robust to rephrasing?** The same question in different words should
   not give wildly different answers.
5. **What happens with an empty knowledge base?** It should refuse to answer,
   not produce filler.

## Ideas to study next

Roughly in order of usefulness:

1. **Information retrieval fundamentals** — relevance, precision, recall, and
   why ranking is hard.
2. **Retrieval-augmented generation** — the general pattern of grounding a model
   in retrieved evidence.
3. **Vector representations of text** — how meaning gets a numeric shape, at
   least conceptually.
4. **Chunking and context windows** — the practical constraints that shape
   every design decision.
5. **Evaluation** — how you measure whether answers are actually right. This is
   the least glamorous and most valuable topic in the field.

## Related reading

- [Core Concepts](/docs/core-concepts) — the terms used in the product.
- [Asking Questions and Reading Answers](/docs/questions-and-answers) — how to
  apply these ideas in practice.