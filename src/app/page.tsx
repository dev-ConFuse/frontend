"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSolutionSection } from "@/components/landing/ProblemSolutionSection";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { WhyConFuseSection } from "@/components/landing/WhyConFuseSection";
import { CTASection } from "@/components/landing/CTASection";
import { useAuth } from '@/contexts/auth'

/**
 * Marketing landing ('/'). The ONE light-themed surface on the platform
 * (.landing scope in globals.css — #BAADD1) and the home of the feature
 * catalogue (the old /features route anchors here).
 */
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard in the background
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="landing min-h-screen bg-background text-foreground">
      <Navbar showUserMenu={false} />
      <main>
        <HeroSection />
        <ProblemSolutionSection />
        <LandingFeatures />
        <WhyConFuseSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
