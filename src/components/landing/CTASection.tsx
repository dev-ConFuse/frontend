'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function CTASection() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-16 left-1/3 h-72 w-72 rounded-full bg-white/40 blur-3xl animate-[float-slow_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/15 blur-3xl animate-[float-slower_12s_ease-in-out_infinite]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
            Ready to unify your context?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Start free, invite your team when it clicks, and scale when you&apos;re
            ready. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/billing">
              <Button className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium text-base group">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
        </Reveal>
      </div>
    </section>
  );
}
