import { hashSync } from 'bcrypt'
import { z, ZodError } from 'zod';
import { NextResponse } from "next/server";
import { prismaClient } from '@/services/prisma';

export async function POST(request: Request) {
  try {
    const userRequest = await request.json();

    const userSchema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
      password: z.string().transform(value => hashSync(value, 16)),
      teamName: z.string().min(3),
    })

    const { name, email, password, teamName } = userSchema.parse(userRequest)

    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        password,
        teams: {
          create: {
            role: "owner",
            team: {
              create: {
                name: teamName,
              }
            }
          }
        }
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

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(error.errors, { status: 400 });
    }

    return NextResponse.json({ status: 'error' }, { status: 400 });
  }
}
