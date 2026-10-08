import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supa/server";

export async function POST(req: Request) {
  await createSupabaseServer().auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
