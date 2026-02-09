import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const invite = searchParams.get("invite");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If there's an invite token, redirect to invite page
      if (invite) {
        return NextResponse.redirect(`${origin}/invite/${invite}`);
      }

      // Check if user has an organization
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

        if (profile?.organization_id) {
          return NextResponse.redirect(`${origin}/today`);
        }
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  // Something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
