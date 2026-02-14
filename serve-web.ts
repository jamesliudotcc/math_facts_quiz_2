import { join } from "node:path";

const webDir = join(import.meta.dir, "src/web");
const assetsDir = join(import.meta.dir, "assets");
const port = Number(process.env.PORT) || 3000;

Bun.serve({
	port,
	async fetch(req) {
		const url = new URL(req.url);
		const pathname = url.pathname === "/" ? "/index.html" : url.pathname;

		const webFile = Bun.file(join(webDir, pathname));
		if (await webFile.exists()) return new Response(webFile);

		const assetFile = Bun.file(join(assetsDir, pathname));
		if (await assetFile.exists()) return new Response(assetFile);

		return new Response("Not Found", { status: 404 });
	},
});

console.log(`Serving Math Facts Quiz at http://localhost:${port}`);
