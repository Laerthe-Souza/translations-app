import { prismaClient } from "@/services/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const projectBody = await request.json();

  const projectSchema = z.object({
    code: z.string().min(1, 'O código da linguagem é obrigatório'),
    title: z.string().min(1, 'O título da linguagem é obrigatório'),
    projectId: z.string(),
  });

  const { title, code, projectId } = projectSchema.parse(projectBody);

  await prismaClient.language.create({
    data: {
      title,
      code,
      projectId,
    }
  });

  return NextResponse.json({ code: 'CREATED' }, { status: 201 });
}