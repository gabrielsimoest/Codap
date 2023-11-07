import { name as appName } from './app.json';
import { AppRegistry } from 'react-native';
import { AppProvider } from './src/common/Contexts/AppContext';
import App from './src/App';

const AppWithContext = () => (
    <AppProvider>
        <App />
    </AppProvider>
)


AppRegistry.registerComponent(appName, () => AppWithContext);

