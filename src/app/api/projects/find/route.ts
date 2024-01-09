import { prismaClient } from "@/services/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const teamId = searchParams.get('id');

  if (!teamId) {
    return NextResponse.json({ code: 'MISSING_TEAM_ID' }, { status: 400 })
  }

  const projects = await prismaClient.project.findMany({
    where: {
      teamId,
    }
  });

  return NextResponse.json(projects, { status: 200 })
}