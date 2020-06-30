
import { ADD_EVENTS } from './types';
import { ADD_UID } from './types';
import { ADD_PROFILE_PICTURE } from './types';
import { ADD_CURR_USER_NAME } from './types';

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

export const addProfilePicture = (values) => dispatch => {
    const newState = {
        type: ADD_PROFILE_PICTURE,
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