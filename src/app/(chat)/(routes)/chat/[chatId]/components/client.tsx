import ChatHeader from '@/components/chat-header';
import type { Companion, Message } from '@/lib/db/schema/app';

type ChatClientProps = {
  companion: Companion;
  messages: Message[];
  messageCount: number;
};

export default function ChatClient({
  companion,
  messages,
  messageCount,
}: ChatClientProps) {
  return (
    <div className="flex h-full flex-col space-y-2 p-4">
      <ChatHeader companion={companion} messagesCount={messageCount} />
    </div>
  );
}
