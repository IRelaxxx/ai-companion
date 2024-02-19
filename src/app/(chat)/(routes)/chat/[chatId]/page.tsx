import { and, asc, count, eq } from 'drizzle-orm';
import { SessionProvider } from 'next-auth/react';
import { redirect } from 'next/navigation';

import ChatClient from './components/client';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { type Companion, companions, messages } from '@/lib/db/schema/app';

type ChatIdPageProps = {
  params: {
    chatId: string;
  };
};

export default async function ChatIdPage({ params }: ChatIdPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    // should already be handled by middleware
    return redirect('/');
  }
  const companion = (await db.query.companions.findFirst({
    where: eq(companions.id, params.chatId),
  })) satisfies Companion | undefined;
  if (!companion) {
    return redirect('/');
  }

  const companionMessages = await db.query.messages.findMany({
    where: and(
      eq(messages.companionId, companion.id),
      eq(messages.userId, session.user.id),
    ),
    orderBy: asc(messages.createdAt),
  });
  if (companionMessages.length === 0) {
    return redirect('/');
  }

  const messageCount = await db
    .select({
      messageCount: count(messages.id),
    })
    .from(messages)
    .where(eq(messages.companionId, companion.id));
  if (messageCount.length === 0) {
    return redirect('/');
  }

  return (
    <SessionProvider session={session}>
      <ChatClient
        companion={companion}
        companionMessages={companionMessages}
        messageCount={messageCount[0].messageCount}
      />
    </SessionProvider>
  );
}
