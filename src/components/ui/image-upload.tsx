"use client";

import { useState, useRef, useCallback } from "react";
import { X, ImageIcon } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

interface ImageUploadProps {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  onRemoved?: () => void;
}

const MAX_SIZE = 4 * 1024 * 1024; // 4MB (matches UploadThing config)

export function ImageUpload({
  currentUrl,
  onUploaded,
  onRemoved,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("inventoryImage",
    {
      onClientUploadComplete: (res) => {
        setUploading(false);
        if (res?.[0]?.serverData?.url) {
          onUploaded(res[0].serverData.url);
        }
      },
      onUploadError: (err) => {
        setUploading(false);
        setPreviewUrl(null);
        setError(err.message);
      },
    }
  );

  const displayUrl = previewUrl || currentUrl;

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Image must be under 4 MB.");
        return;
      }

      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      setUploading(true);

      await startUpload([file]);
    },
    [startUpload]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove() {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onRemoved?.();
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-700">
        Image
      </label>

      {displayUrl ? (
        <div className="relative inline-block">
          <img
            src={displayUrl}
            alt="Artwork preview"
            className="h-40 w-40 rounded-lg object-cover border border-neutral-200"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-white border border-neutral-200 p-1 text-neutral-500 hover:text-neutral-700 shadow-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
            dragOver
              ? "border-neutral-500 bg-neutral-50"
              : "border-neutral-300 hover:border-neutral-400"
          }`}
        >
          {uploading ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-neutral-300" />
              <p className="mt-2 text-sm text-neutral-500">
                Click or drag to upload
              </p>
              <p className="text-xs text-neutral-400">Max 4 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
