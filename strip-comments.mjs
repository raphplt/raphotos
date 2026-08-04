import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const files = process.argv.slice(2);

function stripFile(path) {
	const source = readFileSync(path, "utf8");
	const sf = ts.createSourceFile(
		path,
		source,
		ts.ScriptTarget.Latest,
		true,
		path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);

	const ranges = [];

	// 1. Expressions JSX ne contenant qu'un commentaire : {/* ... */}
	//    On supprime le noeud entier, sinon il resterait "{}".
	const visit = (node) => {
		if (ts.isJsxExpression(node) && !node.expression) {
			ranges.push([node.getFullStart(), node.getEnd()]);
			return;
		}
		ts.forEachChild(node, visit);
	};
	visit(sf);

	// 2. Tous les autres commentaires, via les trivia attachées aux tokens.
	const seen = new Set();
	const collect = (node) => {
		const full = node.getFullStart();
		const start = node.getStart(sf);
		for (const r of ts.getLeadingCommentRanges(source, full) ?? []) {
			const key = `${r.pos}:${r.end}`;
			if (!seen.has(key)) {
				seen.add(key);
				ranges.push([r.pos, r.end, true]);
			}
		}
		for (const r of ts.getTrailingCommentRanges(source, start) ?? []) {
			const key = `${r.pos}:${r.end}`;
			if (!seen.has(key)) {
				seen.add(key);
				ranges.push([r.pos, r.end, true]);
			}
		}
		ts.forEachChild(node, collect);
	};
	collect(sf);
	for (const r of ts.getTrailingCommentRanges(source, sf.getEnd()) ?? []) {
		ranges.push([r.pos, r.end, true]);
	}

	if (ranges.length === 0) return false;

	// Suppression de la fin vers le début pour ne pas décaler les index.
	ranges.sort((a, b) => b[0] - a[0]);
	let out = source;
	for (const [pos, end] of ranges) {
		out = out.slice(0, pos) + out.slice(end);
	}

	// Nettoyage : lignes devenues vides, et accumulations de lignes blanches.
	out = out
		.split("\n")
		.filter((line, i, arr) => {
			if (line.trim() !== "") return true;
			// conserve une seule ligne vide consécutive
			return i === 0 || arr[i - 1].trim() !== "";
		})
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.replace(/\{\n\n/g, "{\n")
		.replace(/\n\n(\s*[)}\]])/g, "\n$1");

	writeFileSync(path, out);
	return true;
}

let changed = 0;
for (const f of files) {
	try {
		if (stripFile(f)) changed++;
	} catch (e) {
		console.error(`✗ ${f}: ${e.message}`);
	}
}
console.log(`${changed} fichier(s) nettoyé(s)`);
