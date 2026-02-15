import { join } from "node:path";
import sharp from "sharp";

const ASSETS_DIR = join(import.meta.dir, "..", "assets");
const BG_COLOR = "#7C4DFF";
const SYMBOL_COLOR = "#FFFFFF";

// Geometric symbol builders (path-based, no fonts)
// All coordinates relative to a 1024×1024 canvas

function multiplySymbol(cx: number, cy: number, size: number): string {
	const half = size / 2;
	const t = size * 0.12; // stroke thickness
	// Two diagonal bars crossing at center
	return `
		<rect x="${cx - t}" y="${cy - half}" width="${t * 2}" height="${size}" rx="${t}"
			transform="rotate(45 ${cx} ${cy})" fill="${SYMBOL_COLOR}" />
		<rect x="${cx - t}" y="${cy - half}" width="${t * 2}" height="${size}" rx="${t}"
			transform="rotate(-45 ${cx} ${cy})" fill="${SYMBOL_COLOR}" />
	`;
}

function divideSymbol(cx: number, cy: number, size: number): string {
	const barW = size * 0.8;
	const barH = size * 0.18;
	const dotR = size * 0.13;
	const dotOffset = size * 0.38;
	return `
		<rect x="${cx - barW / 2}" y="${cy - barH / 2}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="${SYMBOL_COLOR}" />
		<circle cx="${cx}" cy="${cy - dotOffset}" r="${dotR}" fill="${SYMBOL_COLOR}" />
		<circle cx="${cx}" cy="${cy + dotOffset}" r="${dotR}" fill="${SYMBOL_COLOR}" />
	`;
}

function plusSymbol(cx: number, cy: number, size: number): string {
	const half = size / 2;
	const t = size * 0.12;
	return `
		<rect x="${cx - t}" y="${cy - half}" width="${t * 2}" height="${size}" rx="${t}" fill="${SYMBOL_COLOR}" />
		<rect x="${cx - half}" y="${cy - t}" width="${size}" height="${t * 2}" rx="${t}" fill="${SYMBOL_COLOR}" />
	`;
}

function minusSymbol(cx: number, cy: number, size: number): string {
	const barW = size * 0.8;
	const barH = size * 0.22;
	return `
		<rect x="${cx - barW / 2}" y="${cy - barH / 2}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="${SYMBOL_COLOR}" />
	`;
}

function buildIconSvg(canvasSize: number, withBackground: boolean): string {
	// 2x2 grid: + × on top, − ÷ on bottom — tight padding, big symbols
	const symbolSize = canvasSize * 0.32;
	const gapX = canvasSize * 0.2;
	const gapY = canvasSize * 0.2;
	const cx = canvasSize / 2;
	const cy = canvasSize / 2;

	const bg = withBackground
		? `<rect width="${canvasSize}" height="${canvasSize}" fill="${BG_COLOR}" />`
		: "";

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">
		${bg}
		${plusSymbol(cx - gapX, cy - gapY, symbolSize)}
		${multiplySymbol(cx + gapX, cy - gapY, symbolSize)}
		${minusSymbol(cx - gapX, cy + gapY, symbolSize)}
		${divideSymbol(cx + gapX, cy + gapY, symbolSize)}
	</svg>`;
}

function buildFaviconSvg(): string {
	// 2x2 grid: + × on top, − ÷ on bottom
	const size = 48;
	const symbolSize = 15;
	const gapX = 10;
	const gapY = 10;
	const cx = size / 2;
	const cy = size / 2;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
		<rect width="${size}" height="${size}" fill="${BG_COLOR}" />
		${plusSymbol(cx - gapX, cy - gapY, symbolSize)}
		${multiplySymbol(cx + gapX, cy - gapY, symbolSize)}
		${minusSymbol(cx - gapX, cy + gapY, symbolSize)}
		${divideSymbol(cx + gapX, cy + gapY, symbolSize)}
	</svg>`;
}

function buildAdaptiveSvg(): string {
	// Foreground only, transparent bg, 2x2 grid within center 66% safe zone
	const canvasSize = 1024;
	const safeZone = canvasSize * 0.66;
	const symbolSize = safeZone * 0.36;
	const gapX = safeZone * 0.24;
	const gapY = safeZone * 0.24;
	const cx = canvasSize / 2;
	const cy = canvasSize / 2;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">
		${plusSymbol(cx - gapX, cy - gapY, symbolSize)}
		${multiplySymbol(cx + gapX, cy - gapY, symbolSize)}
		${minusSymbol(cx - gapX, cy + gapY, symbolSize)}
		${divideSymbol(cx + gapX, cy + gapY, symbolSize)}
	</svg>`;
}

interface IconSpec {
	filename: string;
	size: number;
	svg: string;
}

const icons: IconSpec[] = [
	{ filename: "icon.png", size: 1024, svg: buildIconSvg(1024, true) },
	{ filename: "icon-512.png", size: 512, svg: buildIconSvg(1024, true) },
	{ filename: "icon-192.png", size: 192, svg: buildIconSvg(1024, true) },
	{
		filename: "adaptive-icon.png",
		size: 1024,
		svg: buildAdaptiveSvg(),
	},
	{
		filename: "splash-icon.png",
		size: 1024,
		svg: buildAdaptiveSvg(),
	},
	{ filename: "favicon.png", size: 48, svg: buildFaviconSvg() },
];

async function generate() {
	for (const icon of icons) {
		const outputPath = join(ASSETS_DIR, icon.filename);
		const svgBuffer = Buffer.from(icon.svg);

		await sharp(svgBuffer)
			.resize(icon.size, icon.size)
			.png()
			.toFile(outputPath);

		console.log(`Generated ${icon.filename} (${icon.size}×${icon.size})`);
	}
}

generate().catch((err) => {
	console.error("Failed to generate icons:", err);
	process.exit(1);
});
