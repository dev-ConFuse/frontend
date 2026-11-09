"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import("@/components/layout/footer").then(mod => mod.Footer));
import { AuthGuard } from "@/app/auth/components/AuthGuard";
import { GraphSetupCard } from "@/app/dashboard/components/GraphSetupCard";
import { ByodbPanel } from "@/app/byodb/components/ByodbPanel";
import { getSources, deleteUrl, deleteRepository, authClient, getDashboardStats, getRepositories } from "@/lib/api";
import { useToggles } from "@/contexts/toggle";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";
import {
  Bot,
  Copy,
  Check,
  Plus,
  Settings,
  Activity,
  Network,
  Shield,
  Users,
  MessageSquare,
  Globe2,
  Trash2,
  GitBranch,
  FileText,
  Link as LinkIcon,
  BookOpen,
  Globe,
  PenTool,
  Terminal
} from "lucide-react";

interface SourceItem {
  id: string;
  name: string;
  type: string;
  status: string;
  uri?: string;
  metadata?: any;
}

interface AgentItem {
  id: string;
  name: string;
  provider?: string;
  status: string;
  usage_stats?: {
    total_requests: number;
  };
}

interface DashboardStats {
  repositories: number;
  documents: number;
  urls: number;
  logs?: number;
  connections: number;
  context_requests: number;
  security_score: number;
  activity: any[];
}

const TrustmaryWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector("script")) {
      const script = document.createElement("script");
      script.src = "https://widget.trustmary.com/a8wUYUDcGh";
      script.async = true;
      containerRef.current.appendChild(script);
    }
  }, []);

  return <div ref={containerRef} className="flex justify-center items-center py-6" />;
};

/** Static MCP config snippet with light syntax colouring (readable in light + dark). */
function JsonCode({ json, accentClass, tintClass }: { json: string; accentClass: string; tintClass: string }) {
  const tokens = json.split(/("(?:[^"\\]|\\.)*"\s*:|"(?:[^"\\]|\\.)*"|[{}\[\],:]|\s+)/g);
  return (
    <pre className={`rounded-xl border border-border/60 p-5 text-sm leading-relaxed font-mono whitespace-pre-wrap break-all min-h-[200px] ${tintClass}`}>
      <code>
        {tokens.map((tok, i) => {
          if (!tok) return null;
          if (tok.startsWith('"') && tok.trimEnd().endsWith(":")) {
            return <span key={i} className={accentClass}>{tok}</span>;
          }
          if (tok.startsWith('"')) {
            return (
              <span
                key={i}
                className={/^"https?:/.test(tok) ? "text-sky-600 dark:text-sky-400" : "text-emerald-600 dark:text-emerald-400"}
              >
                {tok}
              </span>
            );
          }
          return <span key={i} className="text-muted-foreground">{tok}</span>;
        })}
      </code>
    </pre>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    repositories: 0,
    documents: 0,
    urls: 0,
    logs: 0,
    connections: 0,
    context_requests: 0,
    security_score: 98,
    activity: [],
  });
  const { toggles, ready: togglesReady } = useToggles();
  const [loading, setLoading] = useState(true);
  const [recentSources, setRecentSources] = useState<SourceItem[]>([]);
  const initialLoading = loading || !togglesReady;
  const [recentAgents, setRecentAgents] = useState<AgentItem[]>([]);
  const [activeTab, setActiveTab] = useState("home");
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const fetchData = useCallback(async (isAutoRefresh = false) => {
    if (!isAuthenticated) return;

    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }

      // Use the centralized dashboard stats API
      const [dashboardStatsResp, sourcesResp, reposResp] = await Promise.all([
        getDashboardStats().catch(() => null),
        getSources().catch(() => null),
        getRepositories().catch(() => null)
      ]);

      if (dashboardStatsResp && dashboardStatsResp.success === false) {
        console.warn('Dashboard stats API returned failure, using fallback calculation');
      }

      const dashboardStats = (dashboardStatsResp as any)?.data || dashboardStatsResp || {};

      // Extract sources for the "Connected Sources" list
      let sources: SourceItem[] = [];
      if (sourcesResp && sourcesResp.success) {
        const potentialSources = (sourcesResp as any).sources || (sourcesResp as any).data || [];
        sources = Array.isArray(potentialSources) ? potentialSources :
          (Array.isArray(potentialSources.documents) ? potentialSources.documents : []);
      }

      if (!Array.isArray(sources)) {
        sources = [];
      }

      // Merge in repositories if needed for the recent list
      if (reposResp && (reposResp as any).success) {
        const reposData = (reposResp as any).data?.repositories || (reposResp as any).repositories || (reposResp as any).data || [];
        const repos = Array.isArray(reposData) ? reposData : [];
        const repoSources = repos.map((repo: any) => ({
          id: repo.id,
          name: repo.name || repo.url,
          type: repo.provider || 'repository',
          status: repo.status || 'active',
          uri: repo.url,
        }));

        const existingIds = new Set(sources.map(s => s.id));
        repoSources.forEach((rs: SourceItem) => {
          if (!existingIds.has(rs.id)) {
            sources.push(rs);
          }
        });
      }

      setRecentSources(Array.isArray(sources) ? sources.slice(0, 4) : []);

      // Update stats from the dashboard API
      setStats({
        repositories: dashboardStats.repositories || 0,
        documents: dashboardStats.documents || 0,
        urls: dashboardStats.urls || 0,
        logs: dashboardStats.logs || 0,
        connections: dashboardStats.connections || (sources.length),
        context_requests: dashboardStats.context_requests || 0,
        security_score: dashboardStats.security_score || 98,
        activity: dashboardStats.activity || [],
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]); // Added isAuthenticated dependency

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }

    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchData(true);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchData, isAuthenticated]);

  const [copied, setCopied] = useState(false);
  const mcpUrl = `${process.env.NEXT_PUBLIC_CLIENT_CONNECTOR_URL}/api/v1/mcp/sse${user?.id ? `?userId=${user.id}` : ''}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const httpConfig = `{
  "mcpServers": {
    "ConFuse": {
      "url": "${mcpUrl}",
      "type": "http"
    }
  }
}`;
  const sseConfig = `{
  "mcpServers": {
    "ConFuse": {
      "url": "${mcpUrl}",
      "type": "sse"
    }
  }
}`;
  const stdioConfig = `{
  "mcpServers": {
    "ConFuse": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${mcpUrl}"]
    }
  }
}`;

  const [copiedConfig, setCopiedConfig] = useState<string | null>(null);
  const handleCopyConfig = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedConfig(key);
      setTimeout(() => setCopiedConfig(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">ConFuse</h1>
              </div>
              <div className="flex items-center gap-4">
                <ProfileAvatar />
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full">
          <div className="border-b border-border bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <TabsList className="bg-transparent h-12 p-0 rounded-none w-full justify-start border-none mt-2">
                <TabsTrigger value="home" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-12 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-primary transition-colors duration-200">Home</TabsTrigger>
                <TabsTrigger value="byodb" data-testid="byodb-tab" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-12 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-primary transition-colors duration-200">BYODB</TabsTrigger>
                <TabsTrigger value="agents" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-12 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-primary transition-colors duration-200">Config</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="home" className="m-0 border-none outline-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <GraphSetupCard onByodbSelected={() => setActiveTab("byodb")} />
              <div className="grid lg:grid-cols-2 gap-12 mb-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-6 text-foreground">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-4 mt-7">
                    {initialLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse bg-card/50 border-border h-32 flex flex-col justify-between p-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-muted"></div>
                            <div className="h-5 w-24 bg-muted rounded"></div>
                          </div>
                          <div className="h-10 w-full bg-muted rounded"></div>
                        </Card>
                      ))
                    ) : (
                      [
                        {
                          toggleId: "enableRepositories",
                          href: "/sources/repositories",
                          icon: GitBranch,
                          label: "Repository",
                          buttonText: "Connect",
                          btnColor: "bg-indigo-600 hover:bg-indigo-700"
                        },
                        {
                          toggleId: "enableCloudLogs",
                          href: "/sources/logs",
                          icon: Terminal,
                          label: "Logs",
                          buttonText: "Connect",
                          btnColor: "bg-sky-600 hover:bg-sky-700"
                        },
                        {
                          toggleId: "enableDocuments",
                          href: "/sources/documents",
                          icon: FileText,
                          label: "Documents",
                          buttonText: "Add",
                          btnColor: "bg-emerald-600 hover:bg-emerald-700"
                        },
                        {
                          toggleId: "enableURLs",
                          href: "/sources/urls",
                          icon: LinkIcon,
                          label: "URLs",
                          buttonText: "Add",
                          btnColor: "bg-amber-500 hover:bg-amber-600"
                        },
                        {
                          toggleId: "enableChats",
                          href: "/sources/chats",
                          icon: MessageSquare,
                          label: "Chats",
                          buttonText: "Connect",
                          btnColor: "bg-rose-600 hover:bg-rose-700"
                        },
                        {
                          toggleId: "enableDesign",
                          href: "/sources/design",
                          icon: PenTool,
                          label: "Design",
                          buttonText: "Connect",
                          btnColor: "bg-fuchsia-600 hover:bg-fuchsia-700"
                        },
                        {
                          href: "/connections",
                          icon: Users,
                          label: "Connections",
                          buttonText: "View",
                          btnColor: "bg-violet-600 hover:bg-violet-700"
                        },
                        {
                          toggleId: "agentRules",
                          href: "/agents/rules",
                          icon: Network,
                          label: "Agent Rules",
                          buttonText: "Configure",
                          btnColor: "bg-teal-600 hover:bg-teal-700"
                        }
                      ].filter(action => action.toggleId ? Boolean(toggles[action.toggleId]) : true).map((action, idx) => (
                        <Card key={idx} className="border-border bg-card">
                          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                <action.icon className="w-5 h-5" />
                              </div>
                              <span className="font-semibold text-foreground">{action.label}</span>
                            </div>
                            <Link prefetch={false} href={action.href} className="w-full">
                              {/* Fixed (non-token) colors: identical in dark and
                                  light mode — these CTAs are the one place the
                                  dashboard deliberately opts out of theming. */}
                              <Button className={`w-full text-white transition-colors ${action.btnColor}`}>
                                {action.buttonText}
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      )))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-6 text-foreground">Overview</h2>
                  <div className="flex flex-col xl:flex-row gap-6 items-start">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 flex-1 w-full">
                      {initialLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i} className="animate-pulse bg-card/50 border-border h-[104px] flex flex-col justify-between p-5">
                            <div className="flex justify-between items-center">
                              <div className="h-4 w-20 bg-muted rounded"></div>
                              <div className="w-4 h-4 bg-muted rounded"></div>
                            </div>
                            <div className="h-8 w-12 bg-muted rounded mt-2"></div>
                          </Card>
                        ))
                      ) : (
                        <>
                          {Boolean(toggles.enableRepositories) && (
                            <Card className="border-border bg-card">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                  Repositories
                                </CardTitle>
                                <GitBranch className="w-4 h-4 text-muted-foreground" />
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-semibold tracking-tight text-foreground">{loading ? '...' : stats.repositories}</div>
                                <p className="text-xs text-muted-foreground">
                                  Connected repos
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {Boolean(toggles.enableDocuments) && (
                            <Card className="border-border bg-card">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                  Documents
                                </CardTitle>
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-semibold tracking-tight text-foreground">{loading ? '...' : stats.documents}</div>
                                <p className="text-xs text-muted-foreground">
                                  Indexed documents
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {Boolean(toggles.enableURLs) && (
                            <Card className="border-border bg-card">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                  URLs
                                </CardTitle>
                                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-semibold tracking-tight text-foreground">{loading ? '...' : stats.urls}</div>
                                <p className="text-xs text-muted-foreground">
                                  Connected URLs
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {Boolean(toggles.enableCloudLogs) && (
                            <Card className="border-border bg-card">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                  Logs
                                </CardTitle>
                                <Terminal className="w-4 h-4 text-muted-foreground" />
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-semibold tracking-tight text-foreground">{loading ? '...' : (stats.logs || 0).toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                  Processed entries
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          <Card className="border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                Context Requests
                              </CardTitle>
                              <Activity className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-semibold tracking-tight text-foreground">{loading ? '...' : (stats.context_requests || 0).toLocaleString()}</div>
                              <p className="text-xs text-muted-foreground">
                                Last 24 hours
                              </p>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </div>

                    {/* Fixed 340px column at xl: content-sized width (w-auto)
                        let the long docs copy balloon the panel past the
                        container and squeeze the stats grid behind it. */}
                    <div className="shrink-0 w-full xl:w-[340px] flex flex-col gap-6">
                      <Card className="border-border bg-card">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Feedback
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <TrustmaryWidget />
                        </CardContent>
                      </Card>
                      {/* Docs live here (NOT in Quick Actions): documentation is
                          reference material, not an active product feature —
                          keep it visually secondary under Feedback. */}
                      <Card className="border-border bg-card" data-testid="docs-card">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10">
                              <BookOpen className="h-5 w-5 text-indigo-500" />
                            </div>
                            <CardTitle className="text-base font-semibold text-foreground">
                              Documentation
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Guides, concepts, and API references — everything you
                            need to get the most out of ConFuse.
                          </p>
                          <Link prefetch={false} href="/docs" target="_blank">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                              View Documentation →
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        Connected Sources
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4" onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const deleteBtn = target.closest('button[data-action="delete-source"]');
                    if (deleteBtn) {
                      e.preventDefault();
                      e.stopPropagation();
                      const sourceId = deleteBtn.getAttribute('data-id');
                      const sourceType = deleteBtn.getAttribute('data-type');
                      if (sourceId && sourceType) {
                        // handleDeleteSource is not defined so we'll implement the logic here
                        if (confirm('Are you sure you want to delete this source?')) {
                          try {
                            if (sourceType === 'url') {
                              deleteUrl(sourceId);
                            } else {
                              deleteRepository(sourceId);
                            }
                            setRecentSources(prev => prev.filter(s => s.id !== sourceId));
                            fetchData(true);
                            toast({ title: "Source Deleted", description: "The source has been removed." });
                          } catch (error) {
                            toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete source." });
                          }
                        }
                      }
                    }
                  }}>
                    {initialLoading ? (
                      <div className="flex justify-center p-4">
                        <Activity className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : recentSources.length > 0 ? (
                      recentSources.filter(source => {
                        const type = (source.type || '').toLowerCase();
                        if (['github', 'gitlab', 'bitbucket', 'repository'].includes(type)) return toggles.enableRepositories !== false;
                        if (['url', 'web'].includes(type)) return toggles.enableURLs !== false;
                        if (['document', 'upload', 'file'].includes(type)) return toggles.enableDocuments !== false;
                        if (['slack', 'chat'].includes(type)) return toggles.enableChats !== false;
                        if (['figma', 'zeplin', 'design'].includes(type)) return toggles.enableDesign !== false;
                        return true;
                      }).map((source, index) => {
                        const getIcon = (type?: string) => {
                          switch ((type || '').toLowerCase()) {
                            case 'github':
                            case 'gitlab':
                            case 'bitbucket':
                            case 'repository':
                              return GitBranch;
                            case 'url':
                            case 'web':
                              return Globe2;
                            case 'document':
                            case 'upload':
                              return FileText;
                            default:
                              return LinkIcon;
                          }
                        };
                        const IconComponent = getIcon(source.type);
                        return (
                          <div key={source.id || index} className="group/item flex flex-col p-3 rounded-xl bg-muted/10 border border-border/40 gap-2 hover:border-primary/50 hover:bg-muted/20 transition-all duration-200 relative">
                            <div className="flex items-center justify-between">
                              <Link href={source.type === 'url' ? '/sources/urls' : '/sources/repositories'} className="flex items-center space-x-3 flex-1 min-w-0">
                                <IconComponent className="w-5 h-5 text-primary flex-shrink-0" />
                                <span className="font-medium text-foreground truncate max-w-[150px]">
                                  {source.name || source.uri || 'Untitled'}
                                </span>
                              </Link>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs capitalize">{source.type}</Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  data-action="delete-source"
                                  data-id={source.id}
                                  data-type={source.type}
                                  className="h-8 w-8 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${source.status === 'active' || source.status === 'syncing' || source.status === 'pending' || source.status === 'connected' ? 'bg-emerald-500' : 'bg-gray-400'
                                }`}></div>
                              <div className="text-sm text-muted-foreground">
                                Status: {source.status}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                        <div className="rounded-full border-2 border-dashed border-border p-4">
                          <GitBranch className="w-6 h-6 opacity-50" />
                        </div>
                        <p>No sources connected yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(stats.activity && stats.activity.length > 0 ? stats.activity : [
                      { action: "No recent activity", source: "-", time: "Now", type: "system" },
                    ]).map((activity, index) => {
                      const getIcon = (type: string) => {
                        switch (type) {
                          case 'document': return FileText;
                          case 'repository': return GitBranch;
                          case 'url': return Globe;
                          case 'agent': return Bot;
                          default: return Activity;
                        }
                      };
                      const IconComponent = getIcon(activity.type);
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-muted/10 border border-border/40 hover:border-primary/50 hover:bg-muted/20 transition-all duration-200">
                          <div className="rounded-lg bg-primary/10 p-1.5">
                            <IconComponent className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">{activity.action}</div>
                            <div className="text-xs text-muted-foreground">{activity.source} • {activity.time}</div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="byodb" className="m-0 border-none outline-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ByodbPanel />
            </div>
          </TabsContent>

          <TabsContent value="agents" className="m-0 border-none outline-none flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
              <div className="w-full">
                <div className="max-w-3xl mx-auto text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Connect Your{" "}
                    <span className="bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 dark:from-indigo-400 dark:via-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
                      AI Agent
                    </span>
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    ConFuse provides a remote Model Context Protocol (MCP) server. Provide the URL below to your AI agent or IDE (like Cursor or Windsurf) to connect.
                  </p>
                </div>

                <div className="mb-10 rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-card to-sky-500/10 shadow-lg shadow-indigo-500/10 dark:shadow-indigo-500/20 overflow-hidden">
                  <div className="flex justify-between items-center px-5 py-3.5 border-b border-border/60">
                    <span className="text-sm font-semibold text-foreground">Your Secure Connection URL</span>
                    <Button
                      size="sm"
                      onClick={handleCopy}
                      className="h-9 px-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-xs font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-xs font-medium">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="px-5 py-5">
                    <div className="bg-background/80 border border-border/60 rounded-xl px-4 py-3.5 text-center overflow-x-auto">
                      <code className="text-sm text-foreground font-mono break-all">{mcpUrl}</code>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Native HTTP Card */}
                  <div className="group flex flex-col rounded-2xl border-2 border-border bg-card shadow-sm transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400/70 dark:hover:border-indigo-500/60 overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-indigo-400" />
                    <div className="flex items-center justify-between p-5 pb-3">
                      <h4 className="text-foreground font-semibold text-base">Native (type: http)</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyConfig("http", httpConfig)}
                        className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Copy config"
                      >
                        {copiedConfig === "http" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="px-5 pb-5 flex-1">
                      <JsonCode
                        json={httpConfig}
                        accentClass="text-indigo-600 dark:text-indigo-400"
                        tintClass="bg-indigo-50/60 dark:bg-indigo-950/25"
                      />
                    </div>
                  </div>

                  {/* Native SSE Card */}
                  <div className="group flex flex-col rounded-2xl border-2 border-border bg-card shadow-sm transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-400/70 dark:hover:border-sky-500/60 overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-sky-400" />
                    <div className="flex items-center justify-between p-5 pb-3">
                      <h4 className="text-foreground font-semibold text-base">Native (type: sse)</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyConfig("sse", sseConfig)}
                        className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Copy config"
                      >
                        {copiedConfig === "sse" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="px-5 pb-5 flex-1">
                      <JsonCode
                        json={sseConfig}
                        accentClass="text-sky-600 dark:text-sky-400"
                        tintClass="bg-sky-50/60 dark:bg-sky-950/25"
                      />
                    </div>
                  </div>

                  {/* Stdio Proxy Card */}
                  <div className="group flex flex-col rounded-2xl border-2 border-border bg-card shadow-sm transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-400/70 dark:hover:border-violet-500/60 overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-violet-400" />
                    <div className="flex items-center justify-between p-5 pb-3">
                      <h4 className="text-foreground font-semibold text-base">Stdio Proxy (CLI)</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyConfig("stdio", stdioConfig)}
                        className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Copy config"
                      >
                        {copiedConfig === "stdio" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="px-5 pb-5 flex-1">
                      <JsonCode
                        json={stdioConfig}
                        accentClass="text-violet-600 dark:text-violet-400"
                        tintClass="bg-violet-50/60 dark:bg-violet-950/25"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Footer />
      </div>
    </AuthGuard>
  );
}