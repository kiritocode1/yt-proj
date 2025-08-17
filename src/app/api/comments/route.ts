import { getServerSession } from "next-auth";
import { authOptions, type SessionWithTokens } from "@/lib/auth";
import { getYouTubeClient } from "@/lib/google";
import { z } from "zod";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const videoId = searchParams.get("videoId");
	if (!videoId) return new Response("Missing videoId", { status: 400 });
	const session = (await getServerSession(authOptions)) as SessionWithTokens | null;
	if (!session) return new Response("Unauthorized", { status: 401 });
	const youtube = getYouTubeClient(session);
	const res = await youtube.commentThreads.list({ part: ["snippet"], videoId });
	return Response.json(res.data);
}

const postSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("top"), videoId: z.string(), text: z.string().min(1) }),
	z.object({ type: z.literal("reply"), parentId: z.string(), text: z.string().min(1) }),
]);

export async function POST(request: Request) {
	const body = postSchema.parse(await request.json());
	const session = (await getServerSession(authOptions)) as SessionWithTokens | null;
	if (!session) return new Response("Unauthorized", { status: 401 });
	const youtube = getYouTubeClient(session);

	if (body.type === "top") {
		const res = await youtube.commentThreads.insert({
			part: ["snippet"],
			requestBody: {
				snippet: {
					videoId: body.videoId,
					topLevelComment: { snippet: { textOriginal: body.text } },
				},
			},
		});
		return Response.json(res.data);
	} else {
		const res = await youtube.comments.insert({
			part: ["snippet"],
			requestBody: { snippet: { parentId: body.parentId, textOriginal: body.text } },
		});
		return Response.json(res.data);
	}
}

// const delSchema = z.object({ id: z.string() });

export async function DELETE(request: Request) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");
	if (!id) return new Response("Missing id", { status: 400 });
	const session = (await getServerSession(authOptions)) as SessionWithTokens | null;
	if (!session) return new Response("Unauthorized", { status: 401 });
	const youtube = getYouTubeClient(session);
	await youtube.comments.delete({ id });
	return new Response(null, { status: 204 });
}
