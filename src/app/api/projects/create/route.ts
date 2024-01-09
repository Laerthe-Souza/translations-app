import { prismaClient } from "@/services/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const projectBody = await request.json();

    const projectSchema = z.object({
      name: z.string().min(3, 'Insira no mínimo 3 caracteres'),
      teamId: z.string().uuid('ID da equipe inválido'),
    });
  
    const { name, teamId } = projectSchema.parse(projectBody);
  
    await prismaClient.project.create({
      data: {
        name,
        teamId,
      }
    });
  
    return NextResponse.json({ code: 'CREATED' }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ code: 'DUPLICATE_VALUES' }, { status: 409 });
    }

    return NextResponse.json({ code: 'UNKNOWN_ERROR' }, { status: 500 });
  }
}