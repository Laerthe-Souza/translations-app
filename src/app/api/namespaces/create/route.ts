import { prismaClient } from "@/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const namespaceBody = await request.json();

    const namespaceSchema = z.object({
      name: z.string(),
      projectId: z.string(),
      words: z.array(z.object({
        key: z.string(),
        content: z.string(),
      })),
      code: z.string(),
      title: z.string(),
    });

    const { code, title, words, name, projectId } = namespaceSchema.parse(namespaceBody);

    await prismaClient.$transaction(async trx => {
      const namespace = await trx.namespace.create({
        data: {
          name,
          projectId,
        },
      });
    
      const language = await trx.language.create({
        data: {
          code,
          title,
          projectId,
        }
      }).catch(async (error: PrismaClientKnownRequestError) => {
        if (error.code === 'P2002') {
          return prismaClient.language.findFirst({
            where: {
              code,
              projectId,
            }
          });
        }
      });
  
      if (!language?.id) {
        return NextResponse.json({ code: 'LANGUAGE_ID_NOT_FOUND' }, { status: 404 });
      }

      await trx.word.createMany({
        data: words.map(word => ({
          key: word.key,
          content: word.content,
          languageId: language.id,
          namespaceId: namespace.id,
        }))
      })
    })
  
    return NextResponse.json({ code: 'CREATED' }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ code: 'DUPLICATE_VALUES' }, { status: 409 });
    }

    return NextResponse.json({ code: 'UNKNOWN_ERROR' }, { status: 500 });
  }
}