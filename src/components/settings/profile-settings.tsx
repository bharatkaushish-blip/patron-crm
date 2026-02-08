"use client";

import { useTransition } from "react";
import { updateProfile } from "@/lib/actions/settings";

interface ProfileSettingsProps {
  fullName: string;
  email: string;
  timezone: string;
  reminderTime: string;
}

export function ProfileSettings({
  fullName,
  email,
  timezone,
  reminderTime,
}: ProfileSettingsProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateProfile(formData);
    });
  }

  return (
    <section>
      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
        Profile
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Full name
          </label>
          <input
            name="full_name"
            type="text"
            defaultValue={fullName}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Timezone
            </label>
            <select
              name="timezone"
              defaultValue={timezone}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="America/New_York">US Eastern</option>
              <option value="America/Chicago">US Central</option>
              <option value="America/Los_Angeles">US Pacific</option>
              <option value="Europe/London">UK (GMT)</option>
              <option value="Europe/Paris">Central Europe</option>
              <option value="Asia/Dubai">Dubai (GST)</option>
              <option value="Asia/Singapore">Singapore</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Reminder time
            </label>
            <input
              name="reminder_time"
              type="time"
              defaultValue={reminderTime}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save profile"}
        </button>
      </form>
    </section>
  );
}
