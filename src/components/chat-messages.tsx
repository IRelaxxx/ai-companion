import { type ElementRef, useEffect, useRef, useState } from 'react';

import ChatMessage, { type ChatMessageProps } from '@/components/chat-message';
import type { Companion } from '@/lib/db/schema/app';

type ChatMessagesProps = {
  isLoading: boolean;
  companion: Companion;
  messages: ChatMessageProps[];
};

export default function ChatMessages({
  isLoading,
  companion,
  messages,
}: ChatMessagesProps) {
  const scrollRef = useRef<ElementRef<'div'>>(null);
  const [fakeLoading, setFakeLoading] = useState(messages.length === 0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        src={companion.src}
        role="system"
        content={`Hello, I am ${companion.name}, ${companion.description}`}
        isLoading={fakeLoading}
      />
      {messages.map((message) => (
        <ChatMessage
          key={message.id ?? message.content}
          role={message.role}
          content={message.content}
          src={companion.src}
        />
      ))}
      {isLoading && <ChatMessage role="system" src={companion.src} isLoading />}
      <div ref={scrollRef} />
    </div>
  );
}
