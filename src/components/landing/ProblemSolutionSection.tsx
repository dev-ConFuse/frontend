'use client'

import { Reveal } from "./Reveal";
import { SearchX, BrainCircuit, Users, RefreshCw, Plug, Layers, MessageCircleQuestion } from "lucide-react";

const PROBLEMS = [
  {
    icon: SearchX,
    title: "Knowledge is scattered",
    body: "A bit in the repos. A bit in the docs. The rest buried in chat threads and log streams. Nobody has the whole picture.",
  },
  {
    icon: BrainCircuit,
    title: "AI that guesses",
    body: "Assistants answer without your context — confidently, and often wrong. Trust erodes with every made-up detail.",
  },
  {
    icon: Users,
    title: "Onboarding takes weeks",
    body: "The 'why' behind the code lives in people's heads. New teammates re-ask the same questions in every channel.",
  },
  {
    icon: RefreshCw,
    title: "Answers go stale",
    body: "The moment code changes, every doc and every cached answer drifts out of date. Nobody knows what's still true.",
  },
];

const SOLUTIONS = [
  {
    icon: Plug,
    step: "01",
    title: "Connect",
    body: "Bring your repositories, documentation, conversations, and logs together in minutes — no migration, no busywork.",
  },
  {
    icon: Layers,
    step: "02",
    title: "Unify",
    body: "ConFuse weaves them into one living context layer that understands how your work fits together and keeps itself current.",
  },
  {
    icon: MessageCircleQuestion,
    step: "03",
    title: "Ask",
    body: "Get grounded answers with sources — in your browser, or inside the AI agents your team already uses.",
  },
];

export function ProblemSolutionSection() {
  return (
    <>
      {/* ── The problem ── */}
      <section className="py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                The problem
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
                Your knowledge is everywhere.
                <br />
                And that means it&apos;s nowhere.
              </h2>
              <p className="text-lg text-muted-foreground">
                Teams don&apos;t lack information — they lack a way to hold it all
                at once. The cost shows up as wrong answers, slow ramps, and
                decisions made on stale context.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {PROBLEMS.map((problem, index) => (
              <Reveal key={problem.title} delay={index * 120}>
                <div className="h-full bg-background p-8 hover:bg-card transition-colors duration-300">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-destructive/10 text-destructive mb-5">
                    <problem.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{problem.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── The solution ── */}
      <section className="py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                The solution
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
                One place that actually
                <br />
                knows your stack.
              </h2>
              <p className="text-lg text-muted-foreground">
                ConFuse turns the sprawl into a single, always-current context
                layer — and delivers it wherever questions get asked.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {SOLUTIONS.map((solution, index) => (
              <Reveal key={solution.step} delay={index * 150}>
                <div className="relative h-full border border-border bg-card p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground">
                      <solution.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-mono font-semibold text-primary">
                      {solution.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{solution.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{solution.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
