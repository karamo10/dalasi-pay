import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

/**
 * Fetches all active services ordered by category.
 *
 * @returns JSON array of active services, or an error response with status 500.
 */
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { category: "asc" },
    });
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}