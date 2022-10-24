import { legacy_createStore as createStore, combineReducers } from 'redux';
import countReducer from '../../ReduxRoot/Reducers/CountReducer';
const rootReducer = combineReducers(
{ count: countReducer }
);
const configureStore = () => {
return createStore(rootReducer);
}
export default configureStore;