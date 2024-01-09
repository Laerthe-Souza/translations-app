import { prismaClient } from "@/services/prisma";
import { Word } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const projectId = searchParams.get('projectId');
  const namespaceId = searchParams.get('namespaceId');

  if (!projectId && !namespaceId) {
    return NextResponse.json({ code: 'MISSING_RESOURCE_ID' }, { status: 400 });
  }

  if (projectId && namespaceId) {
    return NextResponse.json({ code: 'DUPLICATE_RESOURCE_ID' }, { status: 400 });
  }

  if (projectId) {
    const namespaces = await prismaClient.namespace.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        words: {
          include: {
            language: true,
          }
        }
      }
    });
  
    return NextResponse.json(namespaces, { status: 200 });
  }

  if (namespaceId) {
    const namespace = await prismaClient.namespace.findUnique({
      where: {
        id: namespaceId,
      },
      include: {
        words: {
          include: {
            language: true,
          },
          orderBy: {
            language: {
              createdAt: 'asc'
            }
          }
        },
      }
    });

    if (!namespace) {
      return NextResponse.json({ code: 'NAMESPACE_NOT_FOUND' }, { status: 404 });
    }

    const formattedWords = namespace?.words.reduce((acc, word) => {
      if (acc[word.key]) {
        acc[word.key].push(word)
      } else {
        acc[word.key] = [word]
      }

      return acc;
    }, {} as Record<string, Word[]>)

    return NextResponse.json({ ...namespace, words: formattedWords }, { status: 200 });
  }
}