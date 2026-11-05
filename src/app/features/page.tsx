import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Activity,
  Bot,
  Brain,
  Crown,
  FileCode2,
  Gauge,
  GitMerge,
  History,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Network,
  Package,
  Plug,
  RefreshCw,
  Search,
  Shield,
  Users,
  Webhook,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'ConFuse - Features',
  description:
    'Everything ConFuse can do — connect repositories, documentation and logs, build a living knowledge graph, and deliver scoped context to humans and AI agents.',
}

interface Feature {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

interface FeatureGroup {
  id: string
  label: string
  title: string
  subtitle: string
  features: Feature[]
}

/**
 * Marketing feature catalogue for /features.
 *
 * Copy is grounded in shipped platform capabilities (sources pipeline,
 * knowledge graph + hybrid retrieval, MCP gateway, billing quotas,
 * observability contract) — keep it truthful when editing.
 */
const featureGroups: FeatureGroup[] = [
  {
    id: 'sources',
    label: 'Sources & Ingestion',
    title: 'Connect everything.',
    subtitle: 'Repositories, documentation, and logs flow into one knowledge layer.',
    features: [
      {
        id: 'multi-source',
        icon: Plug,
        title: 'Multi-Source Connection',
        description:
          'Connect repositories (GitHub, GitLab, Bitbucket), documentation, and logs natively. Combine code and knowledge into a single source of truth.',
      },
      {
        id: 'real-time-sync',
        icon: RefreshCw,
        title: 'Real-Time Sync',
        description:
          'Webhook-driven updates and an event pipeline keep your indexed context current the moment code, docs, or logs change.',
      },
      {
        id: 'conversation-sources',
        icon: MessageSquare,
        title: 'Conversation Sources',
        description:
          'Index chat-platform conversations alongside code and docs, so design decisions and Q&A stay searchable.',
      },
      {
        id: 'format-support',
        icon: FileCode2,
        title: 'Broad Format Support',
        description:
          'Source code, Markdown, rich documents, and web pages are parsed, chunked at natural boundaries, and indexed automatically.',
      },
      {
        id: 'pipeline',
        icon: Layers,
        title: 'Event-Driven Pipeline',
        description:
          'Ingestion, chunking, embedding, and graph writes run as a streaming pipeline with automatic retries and a dead-letter queue.',
      },
    ],
  },
  {
    id: 'intelligence',
    label: 'Intelligence Layer',
    title: 'Understand everything.',
    subtitle: 'Structure and meaning, extracted and fused at query time.',
    features: [
      {
        id: 'knowledge-graph',
        icon: Network,
        title: 'Knowledge Graph',
        description:
          'Automatic relationship discovery and entity linking turn flat chunks into a navigable graph of your system.',
      },
      {
        id: 'embeddings',
        icon: Brain,
        title: 'Smart Embeddings',
        description:
          'Every chunk is embedded into a high-dimensional vector index for semantic search and similarity matching.',
      },
      {
        id: 'hybrid-retrieval',
        icon: Search,
        title: 'Hybrid Retrieval',
        description:
          'Vector search and deep graph traversal are fused per query, so answers balance meaning with structure.',
      },
      {
        id: 'cross-source-links',
        icon: GitMerge,
        title: 'Cross-Source Link Discovery',
        description:
          'Semantic relationships between chunks from different sources are detected and stored alongside same-source structure.',
      },
      {
        id: 'context-capsules',
        icon: Package,
        title: 'Context Capsules',
        description:
          'Each query returns an assembled, scoped context pack with sources cited — ready for humans or agents.',
      },
    ],
  },
  {
    id: 'interfaces',
    label: 'Interfaces & Agents',
    title: 'Ask anything.',
    subtitle: 'For people in the browser and agents over the wire.',
    features: [
      {
        id: 'ai-search',
        icon: Search,
        title: 'AI-Powered Search',
        description:
          'Natural language search across all your connected sources with intelligent context understanding.',
      },
      {
        id: 'mcp-server',
        icon: Bot,
        title: 'MCP Server for AI Agents',
        description:
          'Agents connect over the Model Context Protocol and call a single get_context tool grounded in your workspace data.',
      },
      {
        id: 'rest-api',
        icon: Webhook,
        title: 'REST API & Webhooks',
        description:
          'A complete REST API and webhooks for integration with your existing tools, CI, and internal services.',
      },
      {
        id: 'dashboard',
        icon: LayoutDashboard,
        title: 'Web Dashboard',
        description:
          'Manage sources, run queries, monitor usage, and control billing from one place.',
      },
      {
        id: 'memory',
        icon: History,
        title: 'Persistent Memory',
        description:
          'Sessions, memories, and evidence are kept versioned and immutable — query point-in-time context when debugging.',
      },
    ],
  },
  {
    id: 'security',
    label: 'Security & Scale',
    title: 'Secure and scale.',
    subtitle: 'Governance, quotas, and speed that hold up under real load.',
    features: [
      {
        id: 'granular-security',
        icon: Shield,
        title: 'Granular Security',
        description:
          'Row-level security and explicit scoping. Authorized agents only access what they are explicitly permitted to see.',
      },
      {
        id: 'team-collaboration',
        icon: Users,
        title: 'Team Collaboration',
        description:
          'Shared workspaces with role-based access and read-only seats for stakeholders who just need visibility.',
      },
      {
        id: 'low-latency',
        icon: Gauge,
        title: 'Low-Latency Retrieval',
        description:
          'Optimized vector search paired with deep graph traversal serves complex multi-hop queries in milliseconds.',
      },
      {
        id: 'observability',
        icon: Activity,
        title: 'Full Observability',
        description:
          'Structured logs with correlation IDs across every service make each request traceable end to end.',
      },
      {
        id: 'enterprise-controls',
        icon: Crown,
        title: 'Enterprise Controls',
        description:
          'SAML/SSO, custom VPC/IP isolation, and dedicated SLA options for high-scale, compliance-sensitive deployments.',
      },
    ],
  },
]

export default function FeaturesRoute() {
  return (
    <div className="min-h-screen bg-background" data-testid="features-page">
      <Navbar />

      <main className="pt-20">
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="secondary" className="w-fit mx-auto mb-4">
              Platform Capabilities
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything ConFuse
              <span className="text-primary"> can do</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From ingestion to answer — the complete capability list for teams
              that live across repositories, documentation, and logs.
            </p>
          </div>
        </section>

        {featureGroups.map((group) => (
          <section
            key={group.id}
            id={group.id}
            data-testid={`feature-group-${group.id}`}
            className={`py-16 ${group.id === 'intelligence' || group.id === 'security' ? 'bg-muted/20' : ''}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12 max-w-2xl">
                <Badge variant="outline" className="mb-4">
                  {group.label}
                </Badge>
                <h2 className="text-3xl font-bold text-foreground tracking-tight mb-3">
                  {group.title}
                </h2>
                <p className="text-lg text-muted-foreground">{group.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
                {group.features.map((feature) => (
                  <Card
                    key={feature.id}
                    data-testid={`feature-${feature.id}`}
                    className="bg-background border-border rounded-none hover:bg-muted/50 transition-colors"
                  >
                    <CardContent className="p-8">
                      <feature.icon className="w-6 h-6 text-primary mb-5" />
                      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="py-24 bg-background border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
              Ready to unify your context?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start free, upgrade when your team grows, or talk to us about
              enterprise scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/billing">
                <Button className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium text-base">
                  Get Started
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  className="h-12 px-8 border-border hover:bg-muted rounded-none font-medium text-base"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
