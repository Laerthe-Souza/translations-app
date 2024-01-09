import { z } from "zod";
import { NextResponse, type NextRequest } from 'next/server'
import { prismaClient } from "@/services/prisma";



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ code: 'MISSING_RESOURCE_ID' }, { status: 400 });
    }

    const bodySchema = z.object({
      id: z.string().uuid(),
    });
  
    const { id } = bodySchema.parse({ id: userId });
  
    const user = await prismaClient.user.findUnique({
      where: {
        id,
      },
      include: {
        teams: {
          select: {
            teamId: true,
            team: true
          }
        },
      }
    });

    if (!user) {
      return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    }
  
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    return NextResponse.json({ code: 'UNKNOWN_ERROR' }, { status: 400 })
  }
}