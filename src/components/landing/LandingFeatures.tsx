'use client'

import { Reveal } from "./Reveal";

interface Feature {
  id: string;
  title: string;
  description: string;
}

interface FeatureGroup {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  features: Feature[];
}

/**
 * Landing feature catalogue (the full capability list lives here; the former
 * standalone /features route now anchors to this section).
 */
const featureGroups: FeatureGroup[] = [
  {
    id: "sources",
    label: "Sources & Ingestion",
    title: "Connect everything.",
    subtitle: "Repositories, documentation, and logs flow into one knowledge layer.",
    features: [
      {
        id: "multi-source",
        title: "Multi-Source Connection",
        description:
          "Connect repositories (GitHub, GitLab, Bitbucket), documentation, and logs natively. Combine code and knowledge into a single source of truth.",
      },
      {
        id: "real-time-sync",
        title: "Real-Time Sync",
        description:
          "Webhook-driven updates and an event pipeline keep your indexed context current the moment code, docs, or logs change.",
      },
      {
        id: "conversation-sources",
        title: "Conversation Sources",
        description:
          "Index chat-platform conversations alongside code and docs, so design decisions and Q&A stay searchable.",
      },
      {
        id: "format-support",
        title: "Broad Format Support",
        description:
          "Source code, Markdown, rich documents, and web pages are parsed, chunked at natural boundaries, and indexed automatically.",
      },
      {
        id: "pipeline",
        title: "Event-Driven Pipeline",
        description:
          "Ingestion, chunking, embedding, and graph writes run as a streaming pipeline with automatic retries and a dead-letter queue.",
      },
      {
        id: "source-deletion",
        title: "Source Deletion",
        description:
          "Remove a source and everything derived from it — chunks, embeddings, and graph nodes — leaves the knowledge base. No orphaned context.",
      },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence Layer",
    title: "Understand everything.",
    subtitle: "Structure and meaning, extracted and fused at query time.",
    features: [
      {
        id: "knowledge-graph",
        title: "Knowledge Graph",
        description:
          "Automatic relationship discovery and entity linking turn flat chunks into a navigable graph of your system.",
      },
      {
        id: "embeddings",
        title: "Smart Embeddings",
        description:
          "Every chunk is embedded into a high-dimensional vector index for semantic search and similarity matching.",
      },
      {
        id: "hybrid-retrieval",
        title: "Hybrid Retrieval",
        description:
          "Vector search and deep graph traversal are fused per query, so answers balance meaning with structure.",
      },
      {
        id: "cross-source-links",
        title: "Cross-Source Link Discovery",
        description:
          "Semantic relationships between chunks from different sources are detected and stored alongside same-source structure.",
      },
      {
        id: "context-capsules",
        title: "Context Capsules",
        description:
          "Each query returns an assembled, scoped context pack with sources cited — ready for humans or agents.",
      },
      {
        id: "temporal-links",
        title: "Temporal Dependency Links",
        description:
          "Dependency edges carry time: changes link to the decisions and versions around them, so context has history, not just structure.",
      },
    ],
  },
  {
    id: "interfaces",
    label: "Agent Interface",
    title: "Ask anything. Your agent calls a tool.",
    subtitle: "ConFuse is built for coding agents: one tool call returns grounded, permission-scoped context.",
    features: [
      {
        id: "agent-tool-call",
        title: "One Tool Call, Full Context",
        description:
          "Your AI agent calls a single tool and gets grounded, permission-scoped context — no bespoke retrieval code, no vector-store wiring.",
      },
      {
        id: "mcp-server",
        title: "MCP Server for AI Agents",
        description:
          "Agents connect over the Model Context Protocol and call a single get_context tool grounded in your workspace data.",
      },
      {
        id: "grounded-answers",
        title: "Answers With Receipts",
        description:
          "Every result cites the exact chunks it came from, so agents show provenance instead of guessing.",
      },
      {
        id: "multi-domain",
        title: "Code & Docs Together",
        description:
          "One call spans code, documentation, conversations, and logs — the agent gets the whole picture without stitching sources together.",
      },
      {
        id: "graph-traversal",
        title: "Graph Traversal",
        description:
          "Agents follow relationships across the knowledge graph to answer multi-hop questions that similarity search alone cannot.",
      },
      {
        id: "structured-context",
        title: "Structured Context",
        description:
          "Results come back typed and structured — chunks, entities, and relationships — so agents can reason over them directly.",
      },
    ],
  },
  {
    id: "security",
    label: "Security & Scale",
    title: "Secure and scale.",
    subtitle: "Governance, quotas, and speed that hold up under real load.",
    features: [
      {
        id: "granular-security",
        title: "Granular Security",
        description:
          "Row-level security and explicit scoping. Authorized agents only access what they are explicitly permitted to see.",
      },
      {
        id: "team-collaboration",
        title: "Team Collaboration",
        description:
          "Shared workspaces with role-based access and read-only seats for stakeholders who just need visibility.",
      },
      {
        id: "low-latency",
        title: "Low-Latency Retrieval",
        description:
          "Optimized vector search paired with deep graph traversal serves complex multi-hop queries in milliseconds.",
      },
      {
        id: "observability",
        title: "Full Observability",
        description:
          "Structured logs with correlation IDs across every service make each request traceable end to end.",
      },
      {
        id: "enterprise-controls",
        title: "Enterprise Controls",
        description:
          "SAML/SSO, custom VPC/IP isolation, and dedicated SLA options for high-scale, compliance-sensitive deployments.",
      },
      {
        id: "no-training",
        title: "No-Training Guarantee",
        description:
          "Your code and documents are never used to train models — encrypted in transit and at rest, always.",
      },
    ],
  },
];

export function LandingFeatures() {
  return (
    <div id="features" data-testid="features-section">
      {featureGroups.map((group) => (
        <section
          key={group.id}
          id={`feature-group-${group.id}`}
          data-testid={`feature-group-${group.id}`}
          className={`py-24 border-b border-border ${
            group.id === "intelligence" || group.id === "security" ? "bg-card/40" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mb-12 max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                  {group.label}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                  {group.title}
                </h2>
                <p className="text-lg text-muted-foreground">{group.subtitle}</p>
              </div>
            </Reveal>

            {/* Keep every group at 6 features: the hairline grid renders full
                rows only (3 cols on lg, 2 on md) — partial rows leave an ugly
                empty cell in the gap-px border lattice. */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
              {group.features.map((feature, index) => (
                <Reveal key={feature.id} delay={(index % 3) * 100}>
                  <div
                    data-testid={`feature-${feature.id}`}
                    className="h-full bg-background p-8 hover:bg-card transition-colors duration-300 group"
                  >
                    <h3 className="text-lg font-semibold mb-2 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
