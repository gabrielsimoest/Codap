import { COUNTER_CHANGE } from '../../ReduxRoot/Constants/index';
export function changeCount(count) {
    return {
        type: COUNTER_CHANGE,
        payload: count
    }
}