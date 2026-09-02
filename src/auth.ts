import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { loginSchema } from "@/features/auth/validation";
import { authenticateUser } from "@/server/services/auth-service";
import { findOrCreateGoogleUser } from "@/server/repositories/user-repository";

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
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email || profile.email_verified !== true) return false;

      const databaseUser = await findOrCreateGoogleUser(
        profile.email,
        profile.name ?? user.name ?? profile.email.split("@")[0],
      );
      user.id = databaseUser.id;
      user.name = databaseUser.name;
      user.username = databaseUser.username;
      user.role = databaseUser.role;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role;
      if (token.username) session.user.username = token.username;
      return session;
    },
    authorized({ auth, request }) {
      const isProtected = [
        "/dashboard",
        "/calendar",
        "/class",
        "/admin",
        "/weekly",
        "/diaries",
        "/users",
      ].some((path) => request.nextUrl.pathname.startsWith(path));
      return !isProtected || Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
