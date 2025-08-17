import { google } from "googleapis";
import type { SessionWithTokens } from "@/lib/auth";

export function getYouTubeClient(session: SessionWithTokens) {
	const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.NEXTAUTH_URL);

	if (session.accessToken) {
		oauth2Client.setCredentials({
			access_token: session.accessToken,
			refresh_token: session.refreshToken,
		});
	}

	return google.youtube({ version: "v3", auth: oauth2Client });
}
