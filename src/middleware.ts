import { auth } from "./auth";
import { env } from "@/env.mjs";

export default auth((req) => {
  if (!req.auth?.user) {
    return Response.redirect(
      `${env.PROTOCOL}://${
        env.DOMAIN
      }/api/auth/signin?callbackUrl=${encodeURIComponent(
        `${env.PROTOCOL}://${env.DOMAIN}/${env.AFTER_SIGN_IN}`
      )}`
    );
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
