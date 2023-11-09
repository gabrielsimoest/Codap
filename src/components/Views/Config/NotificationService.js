import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import i18n from '../../../Translations/i18n/i18n';

class NotifService {
    constructor(onRegister, onNotification) {
        this.configure(onRegister, onNotification);

        this.lastId = 0;
    }

    configure(onRegister, onNotification) {
        PushNotification.configure({
            onRegister: onRegister,
            onNotification: onNotification,
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        });
    }

    scheduleNotif() {
        this.lastId++;
        PushNotification.localNotificationSchedule({
            date: new Date(Date.now() + (60 * 1000)), // 60 seconds later
            id: '' + this.lastId,
            title: i18n.t("notificationService.title"),
            message: i18n.t("notificationService.message"),
            vibrate: true,
            vibration: 500,
            playSound: true,
            soundName: 'default',
            repeatType: 'day', // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
        });
    }

    cancelAll() {
        PushNotification.cancelAllLocalNotifications();
    }
}

export default new NotifService();