"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signInWithGoogle } from "@/lib/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") || "";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  async function handleGoogle() {
    setIsLoading(true);
    const result = await signInWithGoogle(inviteToken || undefined);
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
          Sign in to your account
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {inviteToken && (
          <input type="hidden" name="invite_token" value={inviteToken} />
        )}
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
          placeholder="Your password"
          required
          autoComplete="current-password"
        />

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
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

      <div className="space-y-2 text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-neutral-500 hover:text-neutral-700"
        >
          Forgot password?
        </Link>
        <p className="text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link
            href={inviteToken ? `/signup?invite=${inviteToken}` : "/signup"}
            className="font-medium text-neutral-900 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
