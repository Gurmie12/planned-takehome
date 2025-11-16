import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();

  try {
    const json = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({}),
        };
      },
    });

    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate upload token" },
      { status: 400 }
    );
  }
}


