"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp, signInWithGoogle } from "@/lib/actions/auth";

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SignUpForm() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") || "";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
    setGoogleLoading(true);
    setError(null);
    const result = await signInWithGoogle(inviteToken || undefined);
    if (result?.error) {
      setError(result.error);
      setGoogleLoading(false);
    }
  }

  const anyLoading = isLoading || googleLoading;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Patron
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {inviteToken
            ? "Create your account to join"
            : "Start your 14-day free trial"}
        </p>
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={handleGoogle}
        disabled={anyLoading}
        isLoading={googleLoading}
      >
        {!googleLoading && <GoogleIcon />}
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-neutral-50 px-2 text-neutral-400">
            or continue with email
          </span>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {inviteToken && (
          <input type="hidden" name="invite_token" value={inviteToken} />
        )}
        <Input
          name="full_name"
          type="text"
          label="Full name"
          placeholder="Your name"
          required
          autoComplete="name"
          disabled={anyLoading}
        />
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          disabled={anyLoading}
        />
        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="At least 6 characters"
          required
          minLength={6}
          autoComplete="new-password"
          disabled={anyLoading}
        />

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={anyLoading}
        >
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href={inviteToken ? `/login?invite=${inviteToken}` : "/login"}
          className="font-medium text-neutral-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
