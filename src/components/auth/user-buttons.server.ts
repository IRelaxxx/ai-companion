'use server';

import { signIn, signOut } from '@/lib/auth';

export async function SignInAction(formData: FormData) {
  const provider = formData.get('provider')?.toString() ?? undefined;
  await signIn(provider, { redirectTo: '/' });
}

export async function SignOutAction() {
  await signOut();
}
