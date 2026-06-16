import { eq } from "drizzle-orm";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 2; // 2 days
const sessionMaxAgeSecondsEnv = Number(
  process.env.NEXTAUTH_SESSION_MAX_AGE_SECONDS,
);
const sessionMaxAgeSeconds =
  Number.isFinite(sessionMaxAgeSecondsEnv) &&
  sessionMaxAgeSecondsEnv > 0 &&
  Number.isSafeInteger(sessionMaxAgeSecondsEnv)
    ? sessionMaxAgeSecondsEnv
    : DEFAULT_SESSION_MAX_AGE_SECONDS;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    // Idle timeout: if the user isn't making requests for longer than this,
    // NextAuth will treat the session as expired and require re-login.
    maxAge: sessionMaxAgeSeconds,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email))
          .limit(1);

        if (!user) {
          return null;
        }

        const isValidPassword = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },
};

export function getCurrentSession() {
  return getServerSession(authOptions);
}
