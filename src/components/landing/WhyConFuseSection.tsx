'use client'

import { Reveal } from "./Reveal";
import { Quote, RefreshCw, Bot, Lock, Zap, TrendingUp } from "lucide-react";

const REASONS = [
  {
    icon: Quote,
    title: "Grounded answers, with receipts",
    body: "Every answer points back to the exact source it came from — no guessing, no vibes, just citations you can click.",
  },
  {
    icon: RefreshCw,
    title: "Always current",
    body: "Change lands in your stack, context updates with it. What you ask today reflects what's true today.",
  },
  {
    icon: Bot,
    title: "Built for agents and humans",
    body: "The same trusted context serves your dashboard and the AI agents wired into your workflow — one truth, two audiences.",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "Your data stays yours: scoped access, row-level security, and explicit permissions for every agent and teammate.",
  },
  {
    icon: Zap,
    title: "Fast where it counts",
    body: "Complex, multi-hop questions answered in milliseconds — because insight that arrives late is insight that never arrived.",
  },
  {
    icon: TrendingUp,
    title: "Grows with you",
    body: "From your first repository to enterprise scale, quotas and controls flex with your team — never a re-platform.",
  },
];

export function WhyConFuseSection() {
  return (
    <section className="py-24 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              Why ConFuse
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
              Context you can trust.
              <br />
              Speed you can feel.
            </h2>
            <p className="text-lg text-muted-foreground">
              Teams reach for ConFuse when the cost of a wrong answer finally
              outweighs the cost of another tool.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {REASONS.map((reason, index) => (
            <Reveal key={reason.title} delay={(index % 3) * 120}>
              <div className="h-full bg-background p-8 hover:bg-card transition-colors duration-300 group">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary mb-5 transition-transform duration-300 group-hover:scale-110">
                  <reason.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{reason.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{reason.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
