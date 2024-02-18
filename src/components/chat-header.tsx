'use client';

import {
  ChevronLeft,
  Edit,
  MessagesSquare,
  MoreVertical,
  Trash,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import BotAvatar from '@/components/bot-avatar';
import { CompanionDeleteAction } from '@/components/chat-header.server';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import type { Companion } from '@/lib/db/schema/app';

type ChatHeaderProps = {
  companion: Companion;
  messagesCount: number;
};

export default function ChatHeader({
  companion,
  messagesCount,
}: ChatHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const onDelete = async () => {
    try {
      const result = await CompanionDeleteAction(companion.id);
      if (result.type === 'success') {
        toast({
          description: 'Sucess',
        });
        router.refresh();

        router.push('/');
      } else {
        toast({
          description: 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex w-full items-center justify-between border-b border-primary/10 pb-4">
      <div className="flex items-center gap-x-2">
        <Button size="icon" variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <BotAvatar src={companion.src} />
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <p className="font-bold">{companion.name}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <MessagesSquare className="mr-1 h-3 w-3" />
              {messagesCount}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Created by {companion.username}
          </p>
        </div>
      </div>
      {session?.user?.id === companion.userId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/companion/${companion.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
