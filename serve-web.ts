import { join } from "node:path";

const webDir = join(import.meta.dir, "src/web");
const port = Number(process.env.PORT) || 3000;

Bun.serve({
	port,
	fetch(req) {
		const url = new URL(req.url);
		const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
		const filePath = join(webDir, pathname);

		try {
			const file = Bun.file(filePath);
			return new Response(file);
		} catch {
			return new Response("Not Found", { status: 404 });
		}
	},
});

console.log(`Serving Math Facts Quiz at http://localhost:${port}`);
