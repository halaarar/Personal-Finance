"use client";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingStore } from "@/lib/onboarding-store";

export function Step2Placeholder() {
  const { next } = useOnboardingStore();

  return (
    <OnboardingLayout
      canSkip={true}
      canGoBack={true}
      onContinue={next}
    >
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
        Placeholder question 2
      </h1>
      <p className="mt-3 text-text-secondary">
        We&apos;ll replace this with the country picker next.
      </p>
    </OnboardingLayout>
  );
}
