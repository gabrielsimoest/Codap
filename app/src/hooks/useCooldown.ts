import { useCallback, useEffect, useState } from "react";

/**
 * Contagem regressiva para um botão que não pode ser repetido de imediato (o
 * reenvio de e-mail, que o servidor limita a um por minuto). Devolve os segundos
 * que faltam e `start`. O relógio só corre enquanto há tempo a contar.
 */
const useCooldown = () => {
	const [until, setUntil] = useState(0);
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (until <= Date.now()) {
			return;
		}
		const id = setInterval(() => {
			const current = Date.now();
			setNow(current);
			if (current >= until) {
				clearInterval(id);
			}
		}, 500);
		return () => clearInterval(id);
	}, [until]);

	const start = useCallback((seconds: number) => {
		const current = Date.now();
		setNow(current);
		setUntil(current + seconds * 1000);
	}, []);

	return { remaining: Math.max(0, Math.ceil((until - now) / 1000)), start };
};

export default useCooldown;
