import "next-auth";
import "next-auth/jwt";

type AppRole = "STUDENT" | "TEACHER" | "ADMIN";

declare module "next-auth" {
  interface User {
    role: AppRole;
    username: string;
  }

  interface Session {
    user: {
      id: string;
      role: AppRole;
      username: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
    username?: string;
  }
}
