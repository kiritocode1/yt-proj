import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notesStore } from "@/lib/db";
import { z } from "zod";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const q = searchParams.get("q");
	const email = (await getServerSession(authOptions))?.user?.email;
	if (!email) return new Response("Unauthorized", { status: 401 });
	if (q) return Response.json(notesStore.search(email, q));
	return Response.json(notesStore.listByUser(email));
}

const createSchema = z.object({ content: z.string().min(1), videoId: z.string().optional() });

export async function POST(request: Request) {
	const email = (await getServerSession(authOptions))?.user?.email;
	if (!email) return new Response("Unauthorized", { status: 401 });
	const { content, videoId } = createSchema.parse(await request.json());
	const id = notesStore.insert(email, videoId ?? null, content);
	return Response.json({ id });
}

export async function DELETE(request: Request) {
	const email = (await getServerSession(authOptions))?.user?.email;
	if (!email) return new Response("Unauthorized", { status: 401 });
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");
	if (!id) return new Response("Missing id", { status: 400 });
	notesStore.delete(Number(id), email);
	return new Response(null, { status: 204 });
}
