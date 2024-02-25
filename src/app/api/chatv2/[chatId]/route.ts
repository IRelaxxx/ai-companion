import { LangChainStream, StreamingTextResponse } from 'ai';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { env } from '@/env.mjs';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { companions, messages } from '@/lib/db/schema/app';
import { Replicate } from '@/lib/llm/replicate';
import { MemoryManager } from '@/lib/memory';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const requestBodySchema = z
  .object({
    prompt: z.string().min(1),
  })
  .strict();

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } },
) {
  try {
    const parseResult = await requestBodySchema.safeParseAsync(
      await request.json(),
    );
    if (!parseResult.success) {
      console.error('Error parsing body', parseResult.error);
      return new NextResponse('Bad Request', { status: 400 });
    }
    const prompt = parseResult.data.prompt;

    const session = await auth();
    if (!session?.user?.name || !session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const identifier = `${request.url}-${session.user.id}`;
    const { success } = await rateLimit(identifier);
    if (!success) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    const companion = await db.query.companions.findFirst({
      where: eq(companions.id, params.chatId),
    });
    const message = await db.insert(messages).values({
      content: prompt,
      role: 'user',
      userId: session.user.id,
      companionId: params.chatId,
    });

    if (message.rowsAffected === 0 || !companion) {
      return new NextResponse('Companion not found', { status: 404 });
    }

    const name = params.chatId;
    const companionKey = {
      companionName: name,
      userId: session.user.id,
      modelName: 'llama-2-13b-chat',
    };

    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(companionKey);
    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, '\n\n', companionKey);
    }

    await memoryManager.writeToHistory(`User: ${prompt}\n`, companionKey);

    const recentChatHistory =
      await memoryManager.readLatestHistory(companionKey);

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      name,
    );

    let relevantHistory = '';
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join('\n');
    }

    const replicatePrompt = `ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix.
${companion.instructions}
Below are relevant details about ${companion.name}'s past and the conversation you are in.
${relevantHistory}

${recentChatHistory}\n${companion.name}:`;

    const { handlers, stream } = LangChainStream();

    const replicate = new Replicate({
      apiKey: env.REPLICATE_API_TOKEN,
      streaming: true,
      input: {
        max_length: 4096, //8192,
      },
      model:
        'a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5',
    });
    replicate.verbose = true;

    void replicate
      .generate([replicatePrompt], {}, [handlers])
      .then(async (result) => {
        const output = result.generations[0][0].text;
        let cleaned = output.replaceAll(',', '');
        if(cleaned.endsWith("{}")) {
          cleaned = cleaned.substring(0, cleaned.length - 2)
        }
        const chunks = cleaned.split('\n');
        const response = chunks[0];

        await memoryManager.writeToHistory('' + response.trim(), companionKey);
        await db.insert(messages).values({
          role: 'system',
          content: response.trim(),
          userId: session.user!.id!,
          companionId: params.chatId,
        });
      })
      .catch(console.error);

    return new StreamingTextResponse(stream);
  } catch (e) {
    console.error('[CHAT_POST]', e);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
