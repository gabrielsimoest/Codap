/**
 * Versões do app são três números separados por ponto (`1.0.10`). Comparar como
 * texto erra (`"1.0.10" < "1.0.9"`), então tudo passa por aqui.
 */

/** `[major, minor, patch]`, ou `null` se a string não for um `X.Y.Z` numérico. */
export function parseVersion(version: string): [number, number, number] | null {
	const match = /^([0-9]+)[.]([0-9]+)[.]([0-9]+)$/.exec(version.trim());
	if (match === null) {
		return null;
	}
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Negativo se `a < b`, 0 se iguais (ou ilegíveis), positivo se `a > b`. */
export function compareVersions(a: string, b: string): number {
	const pa = parseVersion(a);
	const pb = parseVersion(b);
	if (pa === null || pb === null) {
		return 0;
	}
	for (let i = 0; i < 3; i++) {
		if (pa[i] !== pb[i]) {
			return pa[i] - pb[i];
		}
	}
	return 0;
}

/** `candidate` é estritamente mais nova que `installed`? Versão ilegível nunca é "mais nova". */
export function isNewerVersion(candidate: string, installed: string): boolean {
	return compareVersions(candidate, installed) > 0;
}
