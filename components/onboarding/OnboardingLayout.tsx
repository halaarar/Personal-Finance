"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useOnboardingStore } from "@/lib/onboarding-store";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  canSkip?: boolean;
  canGoBack?: boolean;
  onContinue: () => void;
  continueDisabled?: boolean;
}

export function OnboardingLayout({
  children,
  canSkip = false,
  canGoBack = true,
  onContinue,
  continueDisabled = false,
}: OnboardingLayoutProps) {
  const { currentStep, totalSteps, skip, back } = useOnboardingStore();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-base">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-4 p-4">
        <ProgressBar value={progress} className="flex-1" />
        <Button variant="ghost" size="md" onClick={skip} className={canSkip ? "" : "invisible"}>
          Skip
        </Button>
      </div>

      {/* Center content */}
      <div className="flex flex-1 items-center justify-center px-6 pb-8">
        <div className="w-full max-w-[560px] -mt-12">{children}</div>
      </div>

      {/* Bottom actions */}
      <div className="mx-auto w-full max-w-[560px] p-6">
        <Button
          size="lg"
          className="w-full"
          onClick={onContinue}
          disabled={continueDisabled}
        >
          Continue
        </Button>
        {canGoBack && currentStep > 1 && (
          <Button
            variant="ghost"
            size="md"
            className="mt-3 w-full"
            onClick={back}
          >
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
