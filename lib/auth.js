import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getDb } from "./mongodb";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const db = await getDb();
        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No account found with this email");
        }

        if (user.isBanned) {
          throw new Error("Your account has been banned");
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          tier: user.tier,
          avatar: user.avatar,
          bio: user.bio || "",
          city: user.city || "",
          niche: user.niche || "",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.tier = user.tier;
        token.avatar = user.avatar;
        token.bio = user.bio;
        token.city = user.city;
        token.niche = user.niche;
      }

      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.avatar !== undefined) token.avatar = session.avatar;
        if (session.bio !== undefined) token.bio = session.bio;
        if (session.city !== undefined) token.city = session.city;
        if (session.niche !== undefined) token.niche = session.niche;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.tier = token.tier;
        session.user.avatar = token.avatar;
        session.user.bio = token.bio || "";
        session.user.city = token.city || "";
        session.user.niche = token.niche || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
