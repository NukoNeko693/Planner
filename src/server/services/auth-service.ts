import { verifyPassword } from "@/features/auth/password";
import { findActiveUserByUsername } from "@/server/repositories/user-repository";

export async function authenticateUser(username: string, password: string) {
  const user = await findActiveUserByUsername(username);
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash))
    return null;
  return { id: user.id, name: user.name, role: user.role };
}
