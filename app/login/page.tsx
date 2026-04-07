"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (login(email, password)) {
      router.push("/onboarding");
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            finance<span className="text-accent">.</span>
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            Your money, clearly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
          />

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <Button type="submit" size="lg" className="w-full mt-2">
            Sign in
          </Button>
        </form>

        <p className="text-xs text-text-secondary text-center mt-6">
          Account creation coming soon
        </p>
      </Card>
    </div>
  );
}
