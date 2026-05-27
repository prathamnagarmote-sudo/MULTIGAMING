import { NextResponse } from "next/server";

export const runtime = "edge"; // Run on Edge Runtime for ultra-low latency worldwide

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    // Stream the response body directly — zero buffering, instant time-to-first-byte
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse(`Failed to fetch: ${response.statusText}`, { status: response.status });
    }

    // Pass the ReadableStream body through directly without buffering
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/zip",
        "Content-Length": response.headers.get("Content-Length") || "",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("Proxy-zip API error:", err);
    return new NextResponse(err.message || "Internal Server Error", { status: 500 });
  }
}
