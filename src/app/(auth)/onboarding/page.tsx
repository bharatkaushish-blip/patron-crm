"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrganization } from "@/lib/actions/auth";

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await createOrganization(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Welcome to Patron
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          What&apos;s your gallery or business called?
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <Input
          name="name"
          type="text"
          label="Gallery name"
          placeholder="e.g. The Art House"
          required
          autoFocus
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Get started
        </Button>
      </form>
    </div>
  );
}
