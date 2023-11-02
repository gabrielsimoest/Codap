import PushNotification from 'react-native-push-notification';

class NotifService {
    constructor(onRegister, onNotification) {
        this.configure(onRegister, onNotification);

        this.lastId = 0;
    }

    configure(onRegister, onNotification, gcm = '') {
        PushNotification.configure({
            onRegister: onRegister,
            onNotification: onNotification,
            senderID: gcm,
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
        });
    }

    scheduleNotif() {
        this.lastId++;
        PushNotification.localNotificationSchedule({
            date: new Date(Date.now() + (60 * 1000)), // 60 seconds later
            id: '' + this.lastId,
            title: "Reminder",
            message: "My Reminder Message",
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