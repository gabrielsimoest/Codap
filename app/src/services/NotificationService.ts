import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import i18n from "../translations/i18n/i18n";

type NotificationsModule = typeof import("expo-notifications");

// Dias de ausência em que cada lembrete dispara, contados a partir do último
// momento em que o app foi aberto/fechado (ver armInactivityReminders).
export const REMINDER_DAYS = [7, 14, 30];

const CHANNEL_ID = "reminders";
const IDENTIFIER_PREFIX = "inactivity-reminder-";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface ReminderMessage {
	title: string;
	body: string;
}

// O expo-notifications exige o módulo nativo `ExpoTopicSubscriptionModule` já
// no import (Android), e o Expo Go do Android (57.0.9, a versão mais nova para
// o SDK 57) não o tem — um `import` estático derrubaria o app inteiro ali. Por
// isso o pacote é carregado sob demanda, e só depois de checar que o módulo
// nativo existe: sem ele (Expo Go), o recurso fica inativo em vez de quebrar;
// num dev build ou no app de produção funciona normalmente.
//
// A checagem prévia é necessária — um try/catch em volta do `require` não
// basta: o Metro reporta a falha de carga de um módulo como erro fatal antes
// de a exceção chegar ao catch (tela de erro vermelha, e crash em release).
let cachedModule: NotificationsModule | null | undefined;
function loadNotifications(): NotificationsModule | null {
	if (cachedModule !== undefined) {
		return cachedModule;
	}
	if (
		Platform.OS === "android" &&
		!requireOptionalNativeModule("ExpoTopicSubscriptionModule")
	) {
		console.log(
			"expo-notifications indisponível neste app (Expo Go no Android): lembretes desativados."
		);
		cachedModule = null;
		return cachedModule;
	}
	try {
		const Notifications =
			require("expo-notifications") as NotificationsModule;
		// Os lembretes só fazem sentido com o app fechado — com ele aberto, a
		// pessoa já está de volta. Sem isso, o padrão do expo-notifications
		// mostraria o banner mesmo em primeiro plano.
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowBanner: false,
				shouldShowList: false,
				shouldPlaySound: false,
				shouldSetBadge: false,
			}),
		});
		cachedModule = Notifications;
	} catch (error) {
		console.log("expo-notifications indisponível neste app:", error);
		cachedModule = null;
	}
	return cachedModule;
}

export function areNotificationsAvailable(): boolean {
	return loadNotifications() !== null;
}

// Sorteia `count` mensagens distintas (Fisher-Yates sobre uma cópia — nunca
// muta o array que veio do i18n). Se o idioma tiver menos mensagens que
// `count`, devolve todas, e `armInactivityReminders` repete a partir do início.
export function pickReminderMessages(
	pool: ReminderMessage[],
	count: number
): ReminderMessage[] {
	const shuffled = [...pool];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled.slice(0, count);
}

// Cancelar e agendar não são atômicos. Sem fila, um "cancelar" (logout) e um
// "armar" (app voltou ao primeiro plano) disparados juntos poderiam intercalar
// e deixar lembretes agendados para uma conta já deslogada.
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
	const result = queue.then(task, task);
	queue = result.catch(() => undefined);
	return result;
}

// Pede a permissão do sistema só se ela ainda não foi decidida; se já foi
// negada, não insiste (o sistema nem mostraria o diálogo de novo). Sem o
// módulo nativo, devolve false.
export async function ensureNotificationPermission(): Promise<boolean> {
	const Notifications = loadNotifications();
	if (!Notifications) {
		return false;
	}
	const current = await Notifications.getPermissionsAsync();
	if (current.granted) {
		return true;
	}
	if (!current.canAskAgain) {
		return false;
	}
	const requested = await Notifications.requestPermissionsAsync();
	return requested.granted;
}

async function cancelAll(Notifications: NotificationsModule) {
	await Promise.all(
		REMINDER_DAYS.map((days) =>
			Notifications.cancelScheduledNotificationAsync(
				`${IDENTIFIER_PREFIX}${days}`
			)
		)
	);
}

// Não há "última atividade" gravada em lugar nenhum do app; em vez de criá-la,
// re-armamos: cada chamada cancela os lembretes anteriores e agenda de novo
// para daqui a 7/14/30 dias. Chamada ao abrir e ao sair do app, então se a
// pessoa não voltar, o último agendamento é o que dispara.
//
// O texto é sorteado aqui e fica fixo na notificação agendada — por isso o
// sorteio muda a cada re-armada, e trocar o idioma exige armar de novo.
export function armInactivityReminders(): Promise<void> {
	return enqueue(async () => {
		const Notifications = loadNotifications();
		if (!Notifications) {
			return;
		}
		await cancelAll(Notifications);

		// Sem permissão, não agenda. Nunca pede aqui: quem decide o momento do
		// pedido é useInactivityReminder / NotificationSwitcher.
		const permission = await Notifications.getPermissionsAsync();
		if (!permission.granted) {
			return;
		}

		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
				name: i18n.t("notifications"),
				importance: Notifications.AndroidImportance.DEFAULT,
			});
		}

		const pool = i18n.t("notificationService.reminders", {
			returnObjects: true,
		}) as unknown as ReminderMessage[];
		if (!Array.isArray(pool) || pool.length === 0) {
			return;
		}
		const messages = pickReminderMessages(pool, REMINDER_DAYS.length);

		const now = Date.now();
		await Promise.all(
			REMINDER_DAYS.map((days, index) => {
				const message = messages[index % messages.length];
				return Notifications.scheduleNotificationAsync({
					identifier: `${IDENTIFIER_PREFIX}${days}`,
					content: {
						title: message.title,
						body: message.body,
					},
					trigger: {
						type: Notifications.SchedulableTriggerInputTypes.DATE,
						date: new Date(now + days * DAY_IN_MS),
						channelId: CHANNEL_ID,
					},
				});
			})
		);
	});
}

export function cancelInactivityReminders(): Promise<void> {
	return enqueue(async () => {
		const Notifications = loadNotifications();
		if (Notifications) {
			await cancelAll(Notifications);
		}
	});
}
