import NextAuth from "next-auth";
import GitHub from "@auth/core/providers/github";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [GitHub],
});
