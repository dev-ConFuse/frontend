'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, GitBranch, FileText, MessageSquare, Terminal } from "lucide-react";
import { useAuth } from '@/contexts/auth';
import { DemoModal } from "./DemoModal";

const SOURCE_TAGS = [
  { icon: GitBranch, label: "Repositories" },
  { icon: FileText, label: "Documentation" },
  { icon: MessageSquare, label: "Conversations" },
  { icon: Terminal, label: "Logs" },
];

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth/login';
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-border">
      {/* soft floating orbs + grid: motion without noise */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/40 blur-3xl animate-[pulse-soft_9s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl animate-[float-slow_11s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-white/30 blur-3xl animate-[float-slower_13s_ease-in-out_infinite]" />
        <div className="absolute inset-0 grid grid-cols-[100px_1fr_100px] grid-rows-[100px_1fr_100px] opacity-[0.12]">
          <div className="border-r border-b border-foreground"></div>
          <div className="border-b border-foreground"></div>
          <div className="border-l border-b border-foreground"></div>
          <div className="border-r border-foreground"></div>
          <div></div>
          <div className="border-l border-foreground"></div>
          <div className="border-r border-t border-foreground"></div>
          <div className="border-t border-foreground"></div>
          <div className="border-l border-t border-foreground"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10 w-full">
        <div className="space-y-10">
          <div
            className="inline-flex items-center gap-2 border border-border px-3 py-1 text-sm font-medium uppercase tracking-wider text-muted-foreground bg-background/70 animate-[fade-in-up_0.6s_ease-out_both]"
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-[pulse-soft_2.5s_ease-in-out_infinite]" />
            v1.0.0-beta · Context unification is here
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] animate-[fade-in-up_0.7s_ease-out_0.1s_both]">
              ConFuse: AI-powered{" "}
              <span className="bg-gradient-to-r from-primary via-purple-700 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient-x_6s_ease_infinite]">
                context unification
              </span>
              .
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground/90 animate-[fade-in-up_0.7s_ease-out_0.25s_both]">
              Stop hunting for context. Start shipping with it.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-[fade-in-up_0.7s_ease-out_0.4s_both]">
              Your repositories, documentation, conversations, and logs — connected
              in one living context layer. Every answer, for every teammate and every
              AI agent, is grounded in what your team actually knows.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-[fade-in-up_0.7s_ease-out_0.55s_both]">
            <Button
              className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-none font-medium text-base group"
              onClick={handleGetStarted}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 border-border hover:bg-muted transition-colors rounded-none font-medium text-base"
              onClick={() => setIsDemoOpen(true)}
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* source-type strip: what ConFuse unifies */}
          <div className="flex flex-wrap gap-3 pt-4 animate-[fade-in-up_0.7s_ease-out_0.7s_both]">
            {SOURCE_TAGS.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-2 border border-border bg-background/60 px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-background transition-colors"
              >
                <tag.icon className="w-4 h-4 text-primary" />
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />
    </section>
  );
}
