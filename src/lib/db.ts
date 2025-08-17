import fs from "fs";
import path from "path";

type Note = { id: number; userEmail: string; videoId: string | null; content: string; createdAt: string };
type Log = { id: number; userEmail: string | null; event: string; payload?: unknown; createdAt: string };

const dataDir = path.join(process.cwd(), ".data");
const notesFile = path.join(dataDir, "notes.json");
const logsFile = path.join(dataDir, "logs.json");

function ensureFiles() {
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	if (!fs.existsSync(notesFile)) fs.writeFileSync(notesFile, "[]", "utf8");
	if (!fs.existsSync(logsFile)) fs.writeFileSync(logsFile, "[]", "utf8");
}

function readJson<T>(filePath: string): T {
	ensureFiles();
	const raw = fs.readFileSync(filePath, "utf8");
	return JSON.parse(raw) as T;
}

function writeJson<T>(filePath: string, data: T) {
	ensureFiles();
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export const notesStore = {
	listByUser(userEmail: string): Note[] {
		const all = readJson<Note[]>(notesFile);
		return all.filter((n) => n.userEmail === userEmail).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
	},
	search(userEmail: string, query: string): Note[] {
		const all = readJson<Note[]>(notesFile);
		const q = query.toLowerCase();
		return all.filter((n) => n.userEmail === userEmail && n.content.toLowerCase().includes(q)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
	},
	insert(userEmail: string, videoId: string | null, content: string) {
		const all = readJson<Note[]>(notesFile);
		const id = all.length ? Math.max(...all.map((n) => n.id)) + 1 : 1;
		const createdAt = new Date().toISOString();
		all.push({ id, userEmail, videoId, content, createdAt });
		writeJson(notesFile, all);
		return id;
	},
	delete(id: number, userEmail: string) {
		const all = readJson<Note[]>(notesFile);
		const next = all.filter((n) => !(n.id === id && n.userEmail === userEmail));
		writeJson(notesFile, next);
	},
};

export const logsStore = {
	insert(userEmail: string | null, event: string, payload?: unknown) {
		const all = readJson<Log[]>(logsFile);
		const id = all.length ? Math.max(...all.map((l) => l.id)) + 1 : 1;
		const createdAt = new Date().toISOString();
		all.push({ id, userEmail, event, payload, createdAt });
		writeJson(logsFile, all);
	},
};
