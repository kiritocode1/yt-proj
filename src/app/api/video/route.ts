import { getServerSession } from "next-auth";
import { authOptions, type SessionWithTokens } from "@/lib/auth";
import { getYouTubeClient } from "@/lib/google";
import { z } from "zod";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const videoId = searchParams.get("id");
	if (!videoId) return new Response("Missing id", { status: 400 });

	const session = (await getServerSession(authOptions)) as SessionWithTokens | null;
	if (!session) return new Response("Unauthorized", { status: 401 });

	const youtube = getYouTubeClient(session);
	const res = await youtube.videos.list({ id: [videoId], part: ["snippet", "statistics"] });
	return Response.json(res.data);
}

const updateSchema = z.object({
	id: z.string(),
	title: z.string().min(1),
	description: z.string().optional().default(""),
});

export async function PATCH(request: Request) {
	const body = await request.json();
	const { id, title, description } = updateSchema.parse(body);

	const session = (await getServerSession(authOptions)) as SessionWithTokens | null;
	if (!session) return new Response("Unauthorized", { status: 401 });

	const youtube = getYouTubeClient(session);
	const list = await youtube.videos.list({ id: [id], part: ["snippet"] });
	const snippet = list.data.items?.[0]?.snippet;
	if (!snippet) return new Response("Not found", { status: 404 });

	const update = await youtube.videos.update({
		part: ["snippet"],
		requestBody: {
			id,
			snippet: {
				...snippet,
				title,
				description: description ?? "",
				categoryId: snippet.categoryId,
			},
		},
	});

	return Response.json(update.data);
}
