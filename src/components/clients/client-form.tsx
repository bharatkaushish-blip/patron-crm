"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { createClientAction, updateClientAction } from "@/lib/actions/clients";

interface ClientData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  age_range: string | null;
  tags: string[];
}

interface ClientFormProps {
  client?: ClientData;
  existingTags?: string[];
}

export function ClientForm({ client, existingTags = [] }: ClientFormProps) {
  const [tags, setTags] = useState<string[]>(client?.tags ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!client;

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    formData.set("tags", JSON.stringify(tags));
    const result = isEdit
      ? await updateClientAction(formData)
      : await createClientAction(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {client ? <input type="hidden" name="id" value={client.id} /> : null}

      <Input
        name="name"
        label="Name"
        placeholder="Client name"
        required
        defaultValue={client?.name}
        autoFocus
      />
      <Input
        name="phone"
        label="Phone"
        type="tel"
        placeholder="Phone number"
        defaultValue={client?.phone ?? ""}
      />
      <Input
        name="email"
        label="Email"
        type="email"
        placeholder="Email address"
        defaultValue={client?.email ?? ""}
      />
      <Input
        name="location"
        label="City / Location"
        placeholder="e.g. Mumbai"
        defaultValue={client?.location ?? ""}
      />
      <Input
        name="age_range"
        label="Age Range"
        placeholder="e.g. 30-40"
        defaultValue={client?.age_range ?? ""}
      />

      <TagInput
        value={tags}
        onChange={setTags}
        suggestions={existingTags}
        placeholder="e.g. abstract, Husain, large format"
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        {isEdit ? "Save changes" : "Add client"}
      </Button>
    </form>
  );
}
