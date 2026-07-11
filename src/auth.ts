import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { loginSchema } from "@/features/auth/validation";
import { authenticateUser } from "@/server/services/auth-service";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "ユーザー名とパスワード",
    credentials: {
      username: { label: "ユーザー名", type: "text" },
      password: { label: "パスワード", type: "password" },
    },
    authorize: async (credentials) => {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;
      return authenticateUser(parsed.data.username, parsed.data.password);
    },
  }),
];

// 環境変数を設定すれば、DBなしのJWTセッションのままGoogleログインを有効化できる。
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const authConfig = {
  providers,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role;
      return session;
    },
    authorized({ auth, request }) {
      const isProtected = [
        "/dashboard",
        "/calendar",
        "/class",
        "/weekly",
        "/diaries",
      ].some((path) => request.nextUrl.pathname.startsWith(path));
      return !isProtected || Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
