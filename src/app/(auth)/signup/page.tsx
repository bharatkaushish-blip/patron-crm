"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp, signInWithGoogle } from "@/lib/actions/auth";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  async function handleGoogle() {
    setIsLoading(true);
    const result = await signInWithGoogle();
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Patron
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Start your 14-day free trial
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <Input
          name="full_name"
          type="text"
          label="Full name"
          placeholder="Your name"
          required
          autoComplete="name"
        />
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="At least 6 characters"
          required
          minLength={6}
          autoComplete="new-password"
        />

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-neutral-50 px-2 text-neutral-400">or</span>
        </div>
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={handleGoogle}
        disabled={isLoading}
      >
        Continue with Google
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-neutral-900 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
