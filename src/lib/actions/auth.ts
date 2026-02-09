"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const inviteToken = (formData.get("invite_token") as string) || null;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (inviteToken) {
    redirect(`/invite/${inviteToken}`);
  }

  redirect("/onboarding");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const inviteToken = (formData.get("invite_token") as string) || null;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (inviteToken) {
    redirect(`/invite/${inviteToken}`);
  }

  redirect("/today");
}

export async function signInWithGoogle(inviteToken?: string) {
  const supabase = await createClient();

  const redirectUrl = inviteToken
    ? `${process.env.NEXT_PUBLIC_APP_URL}/callback?invite=${inviteToken}`
    : `${process.env.NEXT_PUBLIC_APP_URL}/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for a reset link." };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/today");
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;

  // Use admin client to bypass RLS for org creation
  // (SELECT policy requires profile.organization_id which isn't set yet)
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminClient = createAdminClient();

  const { data: org, error: orgError } = await adminClient
    .from("organizations")
    .insert({ name })
    .select()
    .single();

  if (orgError) {
    return { error: orgError.message };
  }

  const { data: updatedProfile, error: profileError } = await adminClient
    .from("profiles")
    .update({ organization_id: org.id })
    .eq("id", user.id)
    .select("organization_id")
    .single();

  if (profileError) {
    console.error("Profile update error:", profileError);
    return { error: profileError.message };
  }

  if (!updatedProfile?.organization_id) {
    console.error("Profile update returned no data:", updatedProfile);
    return { error: "Failed to link organization to your profile." };
  }

  redirect("/today");
}
