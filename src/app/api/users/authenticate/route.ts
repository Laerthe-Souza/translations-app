import { prismaClient } from "@/services/prisma";
import { compareSync } from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const authRequest = await request.json();

  const authSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  const { email, password } = authSchema.parse(authRequest)

  const user = await prismaClient.user.findUnique({
    where: {
      email,
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
    return NextResponse.json({ code: 'INVALID_CREDENTIALS' }, { status: 400 })
  }

  const matchedPassword = compareSync(password, user.password);

  if (!matchedPassword) {
    return NextResponse.json({ code: 'INVALID_CREDENTIALS' }, { status: 400 })
  }

  return NextResponse.json(user, { status: 200 })
}