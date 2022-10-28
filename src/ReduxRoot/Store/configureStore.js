import { legacy_createStore as createStore, combineReducers } from 'redux';
import countReducer from '../../ReduxRoot/Reducers/CountReducer';
import { themeReducer } from '../Reducers/ThemeReducer';
const rootReducer = combineReducers(
    {
        count: countReducer,
        myDarkMode: themeReducer
    }
);
const configureStore = () => {
    return createStore(rootReducer);
}
export default configureStore;