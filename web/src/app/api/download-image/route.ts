import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");
    const fileName = searchParams.get("fileName");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 404 }
      );
    }

    const imageBuffer = await response.arrayBuffer();

    const contentType = response.headers.get("content-type") || "image/jpeg";

    const downloadResponse = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName || "image.jpg"}"`,
        "Cache-Control": "no-cache"
      }
    });

    return downloadResponse;
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
