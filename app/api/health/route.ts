import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const configuration = {
    supabaseUrlConfigured: Boolean(url),
    supabasePublicKeyConfigured: Boolean(key),
  };

  if (!url || !key) {
    return NextResponse.json({
      status: "needs_configuration",
      message: "FoodLink is running, but its Supabase connection is not fully configured.",
      checks: {
        websiteServer: "ok",
        ...configuration,
        supabaseConnection: "not_checked",
      },
      nextStep: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the hosting environment, then redeploy.",
    }, { status: 503 });
  }

  try {
    const baseUrl = new URL(url);
    if (baseUrl.protocol !== "https:" && baseUrl.hostname !== "localhost") {
      return NextResponse.json({
        status: "invalid_configuration",
        message: "The Supabase project URL must use HTTPS.",
        checks: {
          websiteServer: "ok",
          ...configuration,
          supabaseConnection: "not_checked",
        },
      }, { status: 503 });
    }

    const response = await fetch(new URL("/auth/v1/settings", baseUrl), {
      method: "GET",
      headers: { apikey: key },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    return NextResponse.json({
      status: response.ok ? "connected" : "connection_error",
      message: response.ok
        ? "FoodLink can reach the Supabase Auth service."
        : "The website has Supabase values, but the Auth service did not accept the connection.",
      checks: {
        websiteServer: "ok",
        ...configuration,
        supabaseConnection: response.ok ? "ok" : "failed",
        supabaseAuthHttpStatus: response.status,
      },
      nextStep: response.ok
        ? "Test account creation, email confirmation, and sign-in from the website."
        : "Check that the project URL and publishable/anon key belong to the same Supabase project.",
    }, { status: response.ok ? 200 : 503 });
  } catch {
    return NextResponse.json({
      status: "connection_error",
      message: "FoodLink could not reach Supabase. The project URL may be incorrect or the service may be unavailable.",
      checks: {
        websiteServer: "ok",
        ...configuration,
        supabaseConnection: "failed",
      },
      nextStep: "Check the Supabase project URL and project status, then redeploy if you changed environment variables.",
    }, { status: 503 });
  }
}
