"use client";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingStore } from "@/lib/onboarding-store";

export function Step1Welcome() {
  const { next } = useOnboardingStore();

  return (
    <OnboardingLayout
      canSkip={false}
      canGoBack={false}
      onContinue={next}
    >
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
        Let&apos;s set up your finances
      </h1>
      <p className="mt-3 text-text-secondary">
        This takes about 3 minutes. We&apos;ll ask about your accounts, debts,
        income, and goals.
      </p>
    </OnboardingLayout>
  );
}
