import { prismaClient } from "@/services/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const namespaceBody = await request.json();
  
  const namespaceSchema = z.object({
    words: z.array(z.object({
      id: z.string().optional(),
      key: z.string(),
      content: z.string().nullable(),
      languageId: z.string(),
    })),
    namespaceId: z.string(),
  });
  
  const { namespaceId, words } = namespaceSchema.parse(namespaceBody);
  
  
  const wordsToCreate = words.filter(word => !word.id && word.content);

  await prismaClient.word.createMany({
    data: wordsToCreate.map(word => ({ ...word, content: word.content as string, namespaceId })),
    skipDuplicates: true,
  });

  await Promise.all(words.map(async word => {
    if (!word.content) {
      if (!word.id) {
        return;
      }

      return prismaClient.word.delete({
        where: {
          id: word.id,
        },
      });
    }

    if (word.id) {
      return prismaClient.word.update({
        data: {
          content: word.content
        },
        where: {
          id: word.id,
        }
      })
    }
  }))

  return NextResponse.json({ code: 'CREATED' }, { status: 201 });
}