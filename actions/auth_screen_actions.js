
import { ADD_EVENTS } from './types';
import { ADD_UID } from './types';

export const addEvents = (values) => dispatch => {
    const newState = {
        type: ADD_EVENTS,
        payload: values,
    }
    dispatch(newState);
};

export const addUID = (values) => dispatch => {
    const newState = {
        type: ADD_UID,
        payload: values,
    }
    dispatch(newState);
};