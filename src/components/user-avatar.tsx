import { useSession } from 'next-auth/react';

import { Avatar, AvatarImage } from '@/components/ui/avatar';

export default function UserAvatar() {
  const { data: session } = useSession();

  return (
    <Avatar className="h-12 w-12">
      <AvatarImage src={session?.user?.image ?? undefined} />
    </Avatar>
  );
}
