import AsyncStorage from '@react-native-async-storage/async-storage';
import {name as appName} from './app.json';
import {AppRegistry} from 'react-native';
import App from './src/App';

global.textAppSize = 16;
global.currentAppTheme = true;

AppRegistry.registerComponent(appName, () => App);

