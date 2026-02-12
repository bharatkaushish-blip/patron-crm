"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { ImageUpload } from "@/components/ui/image-upload";
import { ContactsPicker } from "@/components/clients/contacts-picker";
import { createClientAction, updateClientAction } from "@/lib/actions/clients";

interface ClientData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  country: string | null;
  age_range: string | null;
  tags: string[];
  photo_url: string | null;
}

interface ClientFormProps {
  client?: ClientData;
  existingTags?: string[];
}

export function ClientForm({ client, existingTags = [] }: ClientFormProps) {
  const [tags, setTags] = useState<string[]>(client?.tags ?? []);
  const [photoUrl, setPhotoUrl] = useState<string | null>(client?.photo_url ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Controlled fields for contacts picker autofill
  const [contactName, setContactName] = useState(client?.name ?? "");
  const [contactEmail, setContactEmail] = useState(client?.email ?? "");
  const [contactPhone, setContactPhone] = useState(client?.phone ?? "");

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

  function handleContactSelect(contact: {
    name: string;
    phone: string;
    email: string;
  }) {
    if (contact.name) setContactName(contact.name);
    if (contact.email) setContactEmail(contact.email);
    if (contact.phone) setContactPhone(contact.phone);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {client ? <input type="hidden" name="id" value={client.id} /> : null}
      <input type="hidden" name="photo_url" value={photoUrl ?? ""} />

      <ImageUpload
        currentUrl={photoUrl}
        onUploaded={(url) => setPhotoUrl(url)}
        onRemoved={() => setPhotoUrl(null)}
        endpoint="clientPhoto"
        label="Photo"
      />

      {/* Contacts picker - only show on new client form */}
      {!isEdit ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            Fill in manually or import from your phone
          </p>
          <ContactsPicker onSelect={handleContactSelect} />
        </div>
      ) : null}

      <Input
        name="name"
        label="Name"
        placeholder="Client name"
        required
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        autoFocus
      />

      <PhoneInput
        name="phone"
        label="Phone"
        defaultValue={contactPhone}
        key={contactPhone} // re-mount when contacts picker fills
      />

      <Input
        name="email"
        label="Email"
        type="email"
        placeholder="Email address"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
      />

      <Input
        name="location"
        label="City / Location"
        placeholder="e.g. Mumbai"
        defaultValue={client?.location ?? ""}
      />

      <Input
        name="country"
        label="Country"
        placeholder="e.g. India"
        defaultValue={client?.country ?? ""}
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
