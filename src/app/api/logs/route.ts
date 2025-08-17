import { logsStore } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const schema = z.object({ event: z.string().min(1), payload: z.any().optional() });

export async function POST(request: Request) {
	const email = (await getServerSession(authOptions))?.user?.email ?? null;
	const { event, payload } = schema.parse(await request.json());
	logsStore.insert(email, event, payload);
	return new Response(null, { status: 204 });
}
