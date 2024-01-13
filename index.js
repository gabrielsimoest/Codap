import { name as appName } from './app.json';
import { AppRegistry } from 'react-native';
import { AppProvider } from './src/common/Contexts/AppContext';
import App from './src/App';
import PushNotification from 'react-native-push-notification';

//Notification
PushNotification.configure({
        onNotification: function (notification) {
                console.log("NOTIFICATION:", notification);
        },
        requestPermissions: Platform.OS === 'ios',
});

const AppWithContext = () => (
        <AppProvider>
                <App />
        </AppProvider>
)

AppRegistry.registerComponent(appName, () => AppWithContext);