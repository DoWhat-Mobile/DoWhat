
import { ADD_EVENTS } from './types';

export const addEvents = (values) => dispatch => {
    const newState = {
        type: ADD_EVENTS,
        payload: values,
    }
    dispatch(newState);
};