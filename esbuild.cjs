const { build } = require("esbuild");
const glob = require("tiny-glob");

const watch = process.argv.at(-1) === "--watch";

(async () => {
	let entryPoints = Object.fromEntries(
		(await glob("./src/**/*.ts")).map((e) => [
			e.replace(/\.ts$/, ""),
			e,
		])
	);
	build({
		entryPoints,
		sourcemap: true,
		outdir: "./lib",
		logLevel: "info",
		platform: "node",
		watch,
		target: "node16",
		format: "esm",
	});
})();