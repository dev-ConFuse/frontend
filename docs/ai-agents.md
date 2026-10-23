---
title: Using AI Agents with ConFuse
description: Connect an AI assistant to your knowledge base so it answers from your material — and knows when to say it doesn't know.
---

# Using AI Agents with ConFuse

You can connect an AI assistant — a coding agent, a chat assistant, or your own
tooling — to ConFuse so that it answers questions using **your knowledge base**
rather than its own general knowledge.

## What this changes

Without a connection, an assistant answers from what it learned during
training. That is often reasonable and sometimes badly wrong about *your*
project.

With a connection, the assistant can look things up in your material before
answering. The practical difference:

| | Unconnected assistant | Connected to ConFuse |
|---|---|---|
| Source of truth | General knowledge | Your connected sources |
| About your project | Often generic or wrong | Specific and current |
| Evidence | Usually none | Cited |
| Unknown topics | Confidently guesses | Says it is not covered |

## How you connect

ConFuse publishes an endpoint that assistants supporting the **Model Context
Protocol (MCP)** can connect to. MCP is an open standard that lets AI tools
use external data sources.

You will need:

1. Access to your ConFuse workspace.
2. An assistant that supports MCP connections.
3. The connection details for your workspace — ask your workspace
   administrator if you do not have them.

The exact setup differs per assistant; it is normally a matter of adding a
server endpoint and signing in.

## What the assistant can do

- Search your connected sources to answer questions.
- Cite the material behind its claims.
- Report when the sources do not cover a question.
- Assemble context from several places to answer a cross-cutting question.

## What it should not do

A well-behaved assistant connected to ConFuse will **not**:

- Answer project questions from general knowledge when your sources have the answer.
- Present uncited claims as project fact.
- Hide gaps. If the material is missing, it should say so.
- Invent file names, figures or quotes.

If yours does these things, the material is there to correct it — check the
citations and ask again with the missing piece named.

## Getting the best results

- **Give it the context you would give a colleague.** "In the payments service,
  how are chargebacks handled?" beats "how do chargebacks work?".
- **Ask for citations.** It forces the assistant to show its working.
- **Ask it to flag uncertainty.** "Answer, then list anything you could not
  verify" is a very effective prompt pattern.
- **Ask it to verify.** For important answers, ask the assistant to check each
  claim against the sources before presenting it.

## Safety and boundaries

- The assistant only sees material the workspace is permitted to read.
- Connected sources are not shared outside your workspace.
- Nothing about how ConFuse is built is exposed to the assistant — it sees your
  knowledge, not our internals.
- Humans stay in control: connected material is for answering questions, not
  for taking actions in your systems.

See [Security and Privacy](/docs/security-and-privacy) for the full picture.

## Related reading

- [Core Concepts](/docs/core-concepts) — grounding and citations.
- [Asking Questions and Reading Answers](/docs/questions-and-answers) — the
  same judgement applies to agent answers.