'use client'

import { useCallback, useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth'
import {
  Cloud,
  Database,
  Loader2,
  LogIn,
  Network,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import {
  createFalkorDbConnection,
  deleteFalkorDbConnection,
  listFalkorDbConnections,
  testFalkorDbConnection,
  testSavedFalkorDbConnection,
  type FalkorDbConnectionInput,
  type FalkorDbConnectionPublic,
  type FalkorDbConnectionTestResult,
} from '@/lib/falkordb'
import { TestResultPanel } from './components/TestResultPanel'
import { ConnectionList } from './components/ConnectionList'

type Mode = 'cloud' | 'self_hosted'

/**
 * BYODB — Bring Your Own Database.
 *
 * Lets a user point ConFuse at a FalkorDB they own themselves, either:
 *   - FalkorDB Cloud (their own account) — paste the connection string, or
 *   - self-hosted — discrete host/port/credential/TLS fields.
 *
 * Both land in ONE backend model; `deploymentType` is reporting metadata only.
 *
 * Auth note: auth-middleware requires a signed-in user even to run a test, so
 * the form is fully visible and fillable while logged out (so an evaluator can
 * see exactly what is asked) but Test/Save prompt for sign-in and return here.
 */
export default function ByodbPage() {
  const { toast } = useToast()
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth()

  const [mode, setMode] = useState<Mode>('cloud')

  // Cloud (connection string) fields
  const [connectionUrl, setConnectionUrl] = useState('')

  // Self-hosted fields
  const [host, setHost] = useState('')
  const [port, setPort] = useState('6379')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [tlsEnabled, setTlsEnabled] = useState(false)
  const [caCertificate, setCaCertificate] = useState('')

  // Shared fields
  const [graphName, setGraphName] = useState('confuse')
  const [name, setName] = useState('')

  // UI state
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<FalkorDbConnectionTestResult | null>(null)
  const [connections, setConnections] = useState<FalkorDbConnectionPublic[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(true)

  const loadConnections = useCallback(async () => {
    if (!isAuthenticated) {
      setConnections([])
      setLoadingList(false)
      return
    }
    setLoadingList(true)
    try {
      setConnections(await listFalkorDbConnections())
    } catch {
      // A missing/unavailable list must not block the connect form itself.
      setConnections([])
    } finally {
      setLoadingList(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void loadConnections()
  }, [loadConnections])

  /** Assemble the write-only payload for the active mode. */
  function buildInput(): FalkorDbConnectionInput {
    const shared: FalkorDbConnectionInput = {
      name: name.trim() || undefined,
      graphName: graphName.trim(),
    }

    if (mode === 'cloud') {
      return {
        ...shared,
        connectionUrl: connectionUrl.trim(),
        deploymentType: 'cloud',
      }
    }

    return {
      ...shared,
      host: host.trim(),
      port: Number(port) || 6379,
      username: username.trim() || undefined,
      password: password || undefined,
      tlsEnabled,
      caCertificate: caCertificate.trim() || undefined,
      deploymentType: 'self_hosted',
    }
  }

  /** Client-side pre-check so we never fire a request that cannot succeed. */
  function validate(): string | null {
    if (mode === 'cloud') {
      if (!connectionUrl.trim()) return 'Paste your FalkorDB Cloud connection string first.'
      if (!/^(falkors?|rediss?):\/\//i.test(connectionUrl.trim())) {
        return 'Connection string must start with falkor://, falkors://, redis:// or rediss://'
      }
    } else if (!host.trim()) {
      return 'Enter the host name or IP of your FalkorDB server.'
    }
    if (!graphName.trim()) return 'A graph name is required — there is no default graph.'
    return null
  }

  /** Test/Save are auth-gated; send a signed-out visitor to sign in first. */
  function requireAuth(): boolean {
    if (isAuthenticated) return true
    void loginWithRedirect()
    return false
  }

  async function handleTest() {
    const problem = validate()
    if (problem) {
      toast({ title: 'Check the form', description: problem, variant: 'destructive' })
      return
    }
    if (!requireAuth()) return

    setTesting(true)
    setResult(null)
    try {
      setResult(await testFalkorDbConnection(buildInput()))
    } catch (e) {
      setResult({
        success: false,
        steps: [],
        durationMs: 0,
        error: {
          code: 'UNKNOWN',
          message: e instanceof Error ? e.message : 'The test could not be run.',
          hints: [],
        },
      })
    } finally {
      setTesting(false)
    }
  }

  async function handleSave() {
    const problem = validate()
    if (problem) {
      toast({ title: 'Check the form', description: problem, variant: 'destructive' })
      return
    }
    if (!requireAuth()) return

    setSaving(true)
    try {
      const created = await createFalkorDbConnection(buildInput())
      toast({
        title: 'Database connected',
        description: `${created.name} is now your ConFuse knowledge store.`,
      })
      // Clear only the secrets — keep host/URL so the user can add another graph.
      setPassword('')
      setCaCertificate('')
      setName('')
      setResult(null)
      await loadConnections()
    } catch (e) {
      toast({
        title: 'Could not save the connection',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleRetest(id: string) {
    setBusyId(id)
    try {
      const testResult = await testSavedFalkorDbConnection(id)
      setResult(testResult)
      toast({
        title: testResult.success ? 'Connection verified' : 'Connection failed',
        description: testResult.success
          ? 'Your database answered every check.'
          : testResult.error?.message,
        variant: testResult.success ? 'default' : 'destructive',
      })
      await loadConnections()
    } catch (e) {
      toast({
        title: 'Could not re-test the connection',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id)
    try {
      await deleteFalkorDbConnection(id)
      toast({ title: 'Database disconnected', description: 'Its stored credentials were purged.' })
      await loadConnections()
    } catch (e) {
      toast({
        title: 'Could not disconnect',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Navbar showUserMenu={isAuthenticated} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 border border-border px-3 py-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            BYODB
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              Bring your own <br /> database.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Point ConFuse at a FalkorDB you own. Use your own FalkorDB Cloud account, or any
              self-hosted server — your data and vectors stay in a database under your control.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 pt-2">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium">Your credentials, encrypted</div>
                <div className="text-sm text-muted-foreground">
                  Passwords and certificates are AES-256-GCM encrypted and never shown again.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium">Verified before saving</div>
                <div className="text-sm text-muted-foreground">
                  We connect, authenticate and open your graph before anything is stored.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Network className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium">One model, any deployment</div>
                <div className="text-sm text-muted-foreground">
                  Cloud, self-hosted and BYOC are all plain FalkorDB endpoints to us.
                </div>
              </div>
            </div>
          </div>
        </header>

        {!isLoading && !isAuthenticated && (
          <Card className="border-border bg-muted/20">
            <CardContent className="py-5 flex flex-wrap items-center gap-4">
              <LogIn className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
              <p className="flex-1 min-w-[16rem] text-sm text-muted-foreground">
                Fill in the details below, then sign in to test and save the connection. Your
                entries stay on this page while you sign in.
              </p>
              <Button onClick={() => void loginWithRedirect()} className="rounded-none">
                Sign in to continue
                <LogIn className="h-4 w-4 ml-2" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="cloud">
              <Cloud className="h-4 w-4 mr-2" aria-hidden="true" />
              FalkorDB Cloud
            </TabsTrigger>
            <TabsTrigger value="self_hosted">
              <Database className="h-4 w-4 mr-2" aria-hidden="true" />
              Self-hosted
            </TabsTrigger>
          </TabsList>

          {/* ---------------- FalkorDB Cloud (their own account) ---------------- */}
          <TabsContent value="cloud" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>FalkorDB Cloud — your own account</CardTitle>
                <CardDescription>
                  Paste the connection string from your FalkorDB Cloud dashboard. This is a normal
                  FalkorDB endpoint that happens to be billed to and controlled by you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="connectionUrl">Connection string</Label>
                  <Input
                    id="connectionUrl"
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="rediss://default:YOUR_PASSWORD@host:port"
                    value={connectionUrl}
                    onChange={(e) => setConnectionUrl(e.target.value)}
                    className="font-mono rounded-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted schemes: <span className="font-mono">falkor://</span>,{' '}
                    <span className="font-mono">falkors://</span>,{' '}
                    <span className="font-mono">redis://</span>,{' '}
                    <span className="font-mono">rediss://</span>. Credentials embedded in the string
                    are extracted and encrypted — the string itself is never stored. Do not include
                    a database path; put the graph name in the shared field below.
                  </p>
                </div>

                <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Where to find it:</span> FalkorDB
                  Cloud dashboard → your database → <span className="font-mono">Connect</span> →
                  copy the TLS connection URL.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- Self-hosted ---------------- */}
          <TabsContent value="self_hosted" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Self-hosted FalkorDB</CardTitle>
                <CardDescription>
                  Any FalkorDB you run yourself — Docker, a VM, Kubernetes, on-prem. Nothing leaves
                  your network except the verification probes we run when you press Test.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      placeholder="falkordb.internal.example.com"
                      autoComplete="off"
                      spellCheck={false}
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      className="font-mono rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={65535}
                      placeholder="6379"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      className="font-mono rounded-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (optional)</Label>
                    <Input
                      id="username"
                      placeholder="default"
                      autoComplete="off"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="tls" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Use TLS
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Turn on if your server terminates TLS (typical for anything exposed to the
                      internet).
                    </p>
                  </div>
                  <Switch id="tls" checked={tlsEnabled} onCheckedChange={setTlsEnabled} />
                </div>

                {tlsEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="caCertificate">CA certificate (optional)</Label>
                    <Textarea
                      id="caCertificate"
                      placeholder={'-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'}
                      value={caCertificate}
                      onChange={(e) => setCaCertificate(e.target.value)}
                      rows={5}
                      spellCheck={false}
                      className="font-mono text-xs rounded-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      PEM only. Needed for self-signed or private-CA servers. Leave blank to use the
                      system trust store.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ---------------------------------------------------------------- */}
        {/* Shared fields — required for every deployment type                */}
        {/* ---------------------------------------------------------------- */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base">Target graph</CardTitle>
              <Badge variant="outline">Required</Badge>
            </div>
            <CardDescription>
              ConFuse never writes to an implicit default graph. The name below is created on first
              write if it does not exist yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="graphName">Graph name</Label>
              <Input
                id="graphName"
                placeholder="confuse"
                autoComplete="off"
                spellCheck={false}
                value={graphName}
                onChange={(e) => setGraphName(e.target.value)}
                className="font-mono rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display name (optional)</Label>
              <Input
                id="name"
                placeholder="My production FalkorDB"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* Actions                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="h-12 px-8 rounded-none font-medium"
            onClick={() => void handleTest()}
            disabled={testing || saving}
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                Testing…
              </>
            ) : (
              'Test connection'
            )}
          </Button>
          <Button
            className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium"
            onClick={() => void handleSave()}
            disabled={testing || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                Connecting…
              </>
            ) : (
              'Connect database'
            )}
          </Button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Verification readout                                              */}
        {/* ---------------------------------------------------------------- */}
        {result && <TestResultPanel result={result} />}

        {/* ---------------------------------------------------------------- */}
        {/* Saved connections                                                 */}
        {/* ---------------------------------------------------------------- */}
        {!loadingList && (
          <ConnectionList
            connections={connections}
            busyId={busyId}
            onRetest={(id) => void handleRetest(id)}
            onDelete={(id) => void handleDelete(id)}
          />
        )}
      </main>
    </div>
  )
}