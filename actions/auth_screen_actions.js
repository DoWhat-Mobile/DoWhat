
import { ADD_EVENTS } from './types';
import { ADD_UID } from './types';
import { ADD_CURR_USER_NAME } from './types';
import { ADD_CURR_USER_GMAIL } from './types';

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

export const addCurrUserName = (values) => dispatch => {
    const newState = {
        type: ADD_CURR_USER_NAME,
        payload: values,
    }
    dispatch(newState);
};

export const addCurrUserGmail = (values) => dispatch => {
    const newState = {
        type: ADD_CURR_USER_GMAIL,
        payload: values,
    }
    dispatch(newState);
};