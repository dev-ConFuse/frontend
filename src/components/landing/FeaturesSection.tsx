'use client'

import type { ComponentType, SVGProps } from 'react'
import {
  FileText,
  GitBranch,
  Network,
  Search,
  Shield,
  Zap,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'

interface Feature {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  testid: string
}

const FEATURES: Feature[] = [
  {
    icon: GitBranch,
    title: 'Repository ingestion',
    description:
      'Connect GitHub, GitLab and Bitbucket. Repositories stream through an event pipeline with incremental re-processing on every push.',
    testid: 'feature-repositories',
  },
  {
    icon: FileText,
    title: 'Document ingestion',
    description:
      'Bring docs, wikis and knowledge bases into the same graph so code and documentation are searchable as one corpus.',
    testid: 'feature-documents',
  },
  {
    icon: Network,
    title: 'Knowledge graph',
    description:
      'Every chunk, symbol and relationship is stored in a per-user FalkorDB graph with call graphs, imports and hierarchical links.',
    testid: 'feature-graph',
  },
  {
    icon: Search,
    title: 'Hybrid search',
    description:
      'Vector similarity and graph traversal are fused into a single ranked result set, tuned per source and query type.',
    testid: 'feature-search',
  },
  {
    icon: Shield,
    title: 'Zero-trust security',
    description:
      'Auth0 identity, per-user graph isolation and workspace-scoped access control keep every source private by default.',
    testid: 'feature-security',
  },
  {
    icon: Zap,
    title: 'Built for AI agents',
    description:
      'An MCP gateway exposes the same knowledge to your team and to AI agents, with full correlation and observability.',
    testid: 'feature-agents',
  },
]

/**
 * Landing-page feature grid (lazy-loaded from the home page).
 */
export function FeaturesSection() {
  return (
    <section
      id="features"
      className="px-4 py-16 sm:px-6 lg:px-8"
      data-testid="features-section"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            data-testid="features-heading"
          >
            Everything you need to unify microservice knowledge
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From ingestion to retrieval — one platform for humans and AI agents.
          </p>
        </div>

        <div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="features-grid"
        >
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="bg-card border-border"
              data-testid={feature.testid}
            >
              <CardContent className="p-6">
                <feature.icon className="mb-4 h-8 w-8 text-primary" />
                <CardTitle className="mb-2 text-xl">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}