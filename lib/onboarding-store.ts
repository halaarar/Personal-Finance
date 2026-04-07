import { create } from "zustand";

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  data: Record<string, unknown>;
  next: () => void;
  back: () => void;
  skip: () => void;
  updateData: (key: string, value: unknown) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  totalSteps: 10,
  data: {},
  next: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  back: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) })),
  skip: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  updateData: (key, value) =>
    set((s) => ({ data: { ...s.data, [key]: value } })),
  reset: () => set({ currentStep: 1, data: {} }),
}));
