import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const invite = searchParams.get("invite");

  if (code) {
    // Default redirect destination
    let redirectTo = `${origin}/onboarding`;

    // Create a redirect response first — cookies will be set on it directly
    const response = NextResponse.redirect(redirectTo);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers.get("cookie")
              ? request.headers
                  .get("cookie")!
                  .split("; ")
                  .map((c) => {
                    const [name, ...rest] = c.split("=");
                    return { name, value: rest.join("=") };
                  })
              : [];
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (invite) {
        response.headers.set("Location", `${origin}/invite/${invite}`);
        return response;
      }

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
          response.headers.set("Location", `${origin}/today`);
        } else {
          response.headers.set("Location", `${origin}/onboarding`);
        }
        return response;
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
