import { NextResponse } from "next/server";
import { SEOManagerService } from "@/lib/services/seo-manager.service";

export async function GET(
  request: Request,
  { params }: { params: { domainOrSlug: string } }
) {
  const host = params.domainOrSlug;
  const baseUrl = host.includes(".")
    ? `https://${host}`
    : `https://${host}.securesite.io`;

  const robots = SEOManagerService.generateRobotsTxt(baseUrl);

  return new NextResponse(robots, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
