import { prismaClient } from "@/services/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ code: 'MISSING_RESOURCE_ID' }, { status: 400 });
  }

  const languages = await prismaClient.language.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return NextResponse.json(languages, { status: 200 });
}