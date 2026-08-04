import { readFileSync, writeFileSync } from "node:fs";

for (const path of process.argv.slice(2)) {
	const src = readFileSync(path, "utf8");
	const lines = src.split("\n").map((l) => (l.trim() === "" ? "" : l));
	const out = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line === "") {
			const prev = out[out.length - 1];
			const next = lines.slice(i + 1).find((l) => l !== "") ?? "";
			// blanc en tête de bloc, en fin de bloc, ou doublon
			if (prev === undefined) continue;
			if (prev.trimEnd().endsWith("{")) continue;
			if (prev.trimEnd().endsWith("(")) continue;
			if (prev.trimEnd().endsWith("[")) continue;
			if (/^\s*[)}\]]/.test(next)) continue;
			if (prev === "") continue;
		}
		out.push(line);
	}

	while (out.length && out[out.length - 1] === "") out.pop();
	writeFileSync(path, out.join("\n") + "\n");
}
console.log("nettoyage terminé");
