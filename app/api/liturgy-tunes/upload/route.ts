import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "audio/webm",
          "audio/wav",
          "audio/mpeg",
          "audio/mp4",
          "audio/ogg",
          "audio/x-m4a",
        ],
        maximumSizeInBytes: 25 * 1024 * 1024,
        tokenPayload: JSON.stringify({ userId: session.user.id }),
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("Liturgy tune recording uploaded:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
