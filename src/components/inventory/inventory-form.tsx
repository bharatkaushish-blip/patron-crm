"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  createInventoryItem,
  updateInventoryItem,
} from "@/lib/actions/inventory";

interface InventoryData {
  id: string;
  title: string;
  artist: string | null;
  medium: string | null;
  dimensions: string | null;
  year: number | null;
  image_path: string | null;
  asking_price: number | null;
  reserve_price: number | null;
  status: string;
  source: string;
  consignor: string | null;
  notes: string | null;
}

interface InventoryFormProps {
  item?: InventoryData;
  artistSuggestions?: string[];
  mediumSuggestions?: string[];
  showPricing?: boolean;
}

export function InventoryForm({ item, artistSuggestions = [], mediumSuggestions = [], showPricing = true }: InventoryFormProps) {
  const [imagePath, setImagePath] = useState<string | null>(
    item?.image_path ?? null
  );
  const [source, setSource] = useState(item?.source ?? "owned");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!item;

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    if (imagePath) {
      formData.set("image_path", imagePath);
    }

    const result = isEdit
      ? await updateInventoryItem(formData)
      : await createInventoryItem(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <Input
        name="title"
        label="Title"
        placeholder="Artwork title"
        required
        defaultValue={item?.title ?? ""}
        autoFocus
      />

      <AutocompleteInput
        name="artist"
        label="Artist"
        placeholder="Artist name"
        defaultValue={item?.artist ?? ""}
        suggestions={artistSuggestions}
      />

      <div className="grid grid-cols-2 gap-4">
        <AutocompleteInput
          name="medium"
          label="Medium"
          placeholder="e.g. Oil on canvas"
          defaultValue={item?.medium ?? ""}
          suggestions={mediumSuggestions}
        />
        <Input
          name="dimensions"
          label="Dimensions"
          placeholder="e.g. 24 x 36 in"
          defaultValue={item?.dimensions ?? ""}
        />
      </div>

      <Input
        name="year"
        label="Year"
        type="number"
        placeholder="e.g. 2024"
        defaultValue={item?.year?.toString() ?? ""}
      />

      <ImageUpload
        currentUrl={item?.image_path}
        onUploaded={(url) => setImagePath(url)}
        onRemoved={() => setImagePath(null)}
      />

      {showPricing && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="asking_price"
            label="Asking price"
            type="number"
            step="0.01"
            placeholder="0.00"
            defaultValue={item?.asking_price?.toString() ?? ""}
          />
          <Input
            name="reserve_price"
            label="Reserve price"
            type="number"
            step="0.01"
            placeholder="0.00"
            defaultValue={item?.reserve_price?.toString() ?? ""}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-700">
            Status
          </label>
          <select
            name="status"
            defaultValue={item?.status ?? "available"}
            className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1"
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="not_for_sale">Not for sale</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-700">
            Source
          </label>
          <select
            name="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1"
          >
            <option value="owned">Owned</option>
            <option value="consignment">Consignment</option>
          </select>
        </div>
      </div>

      {source === "consignment" && (
        <Input
          name="consignor"
          label="Consignor"
          placeholder="Consignor name / contact"
          defaultValue={item?.consignor ?? ""}
        />
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-neutral-700">
          Notes
        </label>
        <textarea
          name="notes"
          placeholder="Additional notes"
          rows={3}
          defaultValue={item?.notes ?? ""}
          className="block w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        {isEdit ? "Save changes" : "Add artwork"}
      </Button>
    </form>
  );
}
