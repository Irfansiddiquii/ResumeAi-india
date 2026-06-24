import { NextRequest, NextResponse } from "next/server";
import { getSharedResult } from "@/lib/analysis/share";
import type { ApiError, AnalyzeApiResponse } from "@/types/analysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fetch a previously shared analysis by its share token.
 * (The `[id]` segment carries the share token for shared result URLs.)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id.length > 64) {
    return NextResponse.json<ApiError>(
      { ok: false, error: { code: "BAD_REQUEST", message: "Invalid id." } },
      { status: 400 }
    );
  }

  const result = await getSharedResult(id);
  if (!result) {
    return NextResponse.json<ApiError>(
      {
        ok: false,
        error: { code: "NOT_FOUND", message: "Shared analysis not found or expired." },
      },
      { status: 404 }
    );
  }

  return NextResponse.json<AnalyzeApiResponse>({ ok: true, result });
}
