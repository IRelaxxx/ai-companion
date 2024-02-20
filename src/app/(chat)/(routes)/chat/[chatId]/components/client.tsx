'use client';

import { useCompletion } from 'ai/react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import ChatForm from '@/components/chat-from';
import ChatHeader from '@/components/chat-header';
import type { ChatMessageProps } from '@/components/chat-message';
import ChatMessages from '@/components/chat-messages';
import type { Companion, Message } from '@/lib/db/schema/app';

type ChatClientProps = {
  companion: Companion;
  companionMessages: Message[];
  messageCount: number;
};

export default function ChatClient({
  companion,
  companionMessages,
  messageCount,
}: ChatClientProps) {
  const router = useRouter();
  const [messages, setMessages] =
    useState<ChatMessageProps[]>(companionMessages);

  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat/${companion.id}`,
      onFinish(_, completion) {
        const systemMessage = {
          role: 'system',
          content: completion,
          id: uuidv4(),
        } as const;

        setMessages((current) => [...current, systemMessage]);
        setInput('');

        router.refresh();
      },
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const userMessage = {
      role: 'user',
      content: input,
      id: uuidv4(),
    } as const;

    setMessages((current) => [...current, userMessage]);

    handleSubmit(e);
  };

  return (
    <div className="flex h-full flex-col space-y-2 p-4">
      <ChatHeader companion={companion} messagesCount={messageCount} />
      <ChatMessages
        companion={companion}
        isLoading={isLoading}
        messages={messages}
      />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      ></ChatForm>
    </div>
  );
}
