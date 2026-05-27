import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    console.log("Proxying ZIP URL:", url);
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse(`Failed to fetch from remote storage: ${response.statusText}`, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/zip",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("Proxy-zip API error:", err);
    return new NextResponse(err.message || "Internal Server Error", { status: 500 });
  }
}
