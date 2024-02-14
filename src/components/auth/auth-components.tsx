import { Button } from "../ui/button";
import { SignInAction, SignOutAction } from "./user-buttons.server";

export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form action={SignInAction}>
      <input type="hidden" value={provider} name="provider"></input>
      <Button {...props}>Sign In</Button>
    </form>
  );
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form action={SignOutAction} className="w-full">
      <Button variant="ghost" className="w-full p-0" {...props}>
        Sign Out
      </Button>
    </form>
  );
}
