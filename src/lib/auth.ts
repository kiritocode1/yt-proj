import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
	session: { strategy: "jwt" },
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			authorization: {
				params: {
					scope: "openid email profile https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl",
					access_type: "offline",
					prompt: "consent",
				},
			},
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			const t = token as JWT & { accessToken?: string; refreshToken?: string; expiresAt?: number };
			if (account) {
				t.accessToken = account.access_token;
				t.refreshToken = account.refresh_token ?? t.refreshToken;
				t.expiresAt = account.expires_at ? account.expires_at * 1000 : Date.now() + 60 * 60 * 1000;
			}
			return t;
		},
		async session({ session, token }) {
			const s = session as Session & { accessToken?: string; refreshToken?: string; expiresAt?: number };
			const t = token as JWT & { accessToken?: string; refreshToken?: string; expiresAt?: number };
			s.accessToken = t.accessToken;
			s.refreshToken = t.refreshToken;
			s.expiresAt = t.expiresAt;
			return s;
		},
	},
	secret: process.env.NEXTAUTH_SECRET!,
};

export type SessionWithTokens = {
	user?: { name?: string | null; email?: string | null; image?: string | null };
	expires: string;
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: number;
};
