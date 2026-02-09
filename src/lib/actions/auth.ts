"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const inviteToken = (formData.get("invite_token") as string) || null;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email verification is required, session will be null
  // and user.identities may be empty (if email already exists)
  if (data.user && !data.session) {
    // Check if this email is already registered
    if (data.user.identities && data.user.identities.length === 0) {
      return { error: "An account with this email already exists. Try signing in instead." };
    }
    // Email verification required — show check-email page
    redirect(`/check-email?email=${encodeURIComponent(email)}`);
  }

  if (inviteToken) {
    redirect(`/invite/${inviteToken}`);
  }

  redirect("/onboarding");
}

export async function resendVerificationEmail(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
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

  const { data: orgs, error: orgError } = await adminClient
    .from("organizations")
    .insert({ name })
    .select();

  if (orgError) {
    console.error("Org creation error:", orgError);
    return { error: orgError.message };
  }

  const org = orgs?.[0];
  if (!org) {
    return { error: "Failed to create organization. Please try again." };
  }

  // Ensure profile exists (trigger may not have fired for OAuth users)
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    const { error: insertError } = await adminClient
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        organization_id: org.id,
      });

    if (insertError) {
      console.error("Profile insert error:", insertError);
      return { error: insertError.message };
    }
  } else {
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ organization_id: org.id })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return { error: profileError.message };
    }
  }

  redirect("/today");
}
