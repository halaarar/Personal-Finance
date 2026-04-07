"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Step1Welcome } from "@/components/onboarding/steps/Step1Welcome";
import { Step2Placeholder } from "@/components/onboarding/steps/Step2Placeholder";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

const steps: Record<number, React.ReactNode> = {
  1: <Step1Welcome />,
  2: <Step2Placeholder />,
};

function FallbackStep() {
  const { currentStep, next } = useOnboardingStore();
  return (
    <OnboardingLayout canSkip={true} canGoBack={true} onContinue={next}>
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
        Step {currentStep}
      </h1>
      <p className="mt-3 text-text-secondary">Not built yet</p>
    </OnboardingLayout>
  );
}

function OnboardingFlow() {
  const router = useRouter();
  const { currentStep, totalSteps } = useOnboardingStore();

  useEffect(() => {
    if (currentStep > totalSteps) {
      router.push("/dashboard");
    }
  }, [currentStep, totalSteps, router]);

  if (currentStep > totalSteps) return null;

  const content = steps[currentStep] ?? <FallbackStep />;

  return (
    <div key={currentStep} className="animate-[fadeIn_300ms_ease-out]">
      {content}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingFlow />
    </AuthGuard>
  );
}
