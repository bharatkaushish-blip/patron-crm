"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/actions/auth";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resent, setResent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    if (!email) return;
    setIsLoading(true);
    setError(null);
    const result = await resendVerificationEmail(email);
    if (result?.error) {
      setError(result.error);
    } else {
      setResent(true);
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Patron
        </h1>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center space-y-4">
        {/* Mail icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <svg
            className="h-6 w-6 text-neutral-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Check your inbox
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            We sent a verification link to
          </p>
          {email && (
            <p className="mt-1 text-sm font-medium text-neutral-900">
              {email}
            </p>
          )}
        </div>

        <p className="text-sm text-neutral-500">
          Click the link in the email to verify your account and get started.
          It may take a minute to arrive.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {resent ? (
          <p className="text-sm text-green-600">
            Verification email resent. Check your inbox.
          </p>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleResend}
            isLoading={isLoading}
            disabled={!email}
          >
            Resend verification email
          </Button>
        )}
      </div>

      <p className="text-center text-sm text-neutral-500">
        Wrong email?{" "}
        <Link
          href="/signup"
          className="font-medium text-neutral-900 hover:underline"
        >
          Sign up again
        </Link>
      </p>
      <p className="text-center text-sm text-neutral-500">
        Already verified?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}
